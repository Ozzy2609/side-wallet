import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

import services from '@/ui/services';
import { Pool, SwapRouteResult } from '@/ui/services/dex/type';
import { swapStore, useSwapStore } from '@/ui/stores/SwapStore';
import { toReadableAmount, toUnitAmount } from '@/ui/utils/formatter';
import { findAssetIcon } from '@/ui/utils/swap';
import {useGetSideBalanceList} from '@/ui/hooks/useGetBalance';
import {useCurrentAccount} from '@/ui/state/accounts/hooks';

export default function useSwapSimulation() {
  const { swapPair, mode, limitRate, rateModified, isRateExchanged, marketPrice } = useSwapStore();
  const currentAccount = useCurrentAccount();
  const { balanceList } = useGetSideBalanceList(currentAccount?.address);

  useEffect(() => {
    const assetIn = balanceList.find(item => item.denom === swapPair.native.denom);

    if (!rateModified) {
      swapStore.limitRate = isRateExchanged
        ? BigNumber(1)
          .div(marketPrice || '1')
          .toFixed(Number(assetIn?.asset.exponent || '6'), BigNumber.ROUND_DOWN)
          .replace(/\.?0+$/, '')
        : marketPrice;
    }
  }, [marketPrice]);

  const setData = (data: SwapRouteResult) => {
    const assetOut = balanceList.find(item => item.denom === swapPair.remote.denom);

    const curRemoteAmount = swapStore.swapPair.remote.amount;

    const outputAmount =
      mode === 'limit' && curRemoteAmount
        ? BigNumber(swapPair.native.amount || '0')
          .times(
            isRateExchanged
              ? BigNumber(1)
                .div(limitRate || '1')
                .toFixed(assetOut?.asset.precision || 6, BigNumber.ROUND_DOWN)
                .replace(/\.?0+$/, '')
              : limitRate,
          )
          .toFixed()
        : mode === 'limit' && !curRemoteAmount
          ? ''
          : BigNumber(data?.returnToken?.showAmount || '0')
          .toFixed(assetOut?.asset.precision || 6, BigNumber.ROUND_DOWN)
          .replace(/\.?0+$/, '') || '0';

    swapStore.swapPair['remote'] = {
      denom: swapPair.remote.denom,
      amount: outputAmount,
    };

    if (data.returnToken) {
      data.returnToken.showAmount =
        BigNumber(data?.returnToken?.showAmount || '0')
          .toFixed(assetOut?.asset.precision || 6, BigNumber.ROUND_DOWN)
          .replace(/\.?0+$/, '') || '0';
    }

    swapStore.swapRouteResult = data;
  };

  const setLoading = (loading: boolean) => {
    swapStore.responseLoading = loading;
  };

  const emptyResponse = {} as SwapRouteResult;

  const validPair =
    !!swapPair.native.denom &&
    !!swapPair.remote.denom &&
    BigNumber(swapPair.native?.amount || '0').gt(0) &&
    swapPair?.native.denom !== swapPair?.remote.denom;

  // &&
  // allPools.length > 0;

  // console.log({ allPools });

  useEffect(() => {
    if (!validPair) {
      setData(emptyResponse);

      setLoading(false);
      return;
    }
    getData();
  }, [validPair, swapPair.native.amount, swapPair.native.denom, swapPair.remote.denom, rateModified, mode]);

  const getData = async () => {
    try {
      setLoading(true);

      const assetIn = balanceList.find(item => item.denom === swapPair.native.denom);

      const assetOut = balanceList.find(item => item.denom === swapPair.remote.denom);

      const unitAmount = toUnitAmount(swapPair.native.amount, assetIn?.asset.exponent || '6');

      const resultQuote = await services.dex.getValidRoutes(swapPair.native.denom, unitAmount, swapPair.remote.denom);

      // const resultQuote = [];

      const transmuterPools = swapStore.allPools
        .filter(p => {
          const pAssetOut = p.assets.find(a => a.info.native_token.denom === swapPair.remote.denom);
          return (
            swapPair.native.denom in p.assetsMeta &&
            swapPair.remote.denom in p.assetsMeta &&
            p.pair.pair_type?.['custom'] === 'transmuter' &&
            BigNumber(pAssetOut?.amount || 0).gte(
              toUnitAmount(toReadableAmount(unitAmount, assetIn?.asset.exponent || 6), assetOut?.asset.exponent || 6),
            )
          );
        })
        .sort((a, b) => {
          const aOut = a.assets.find(a => a.info.native_token.denom === swapPair.remote.denom);

          const bOut = b.assets.find(a => a.info.native_token.denom === swapPair.remote.denom);

          if (!aOut || !bOut) return 0;
          if (BigNumber(aOut.amount).gt(bOut.amount)) return -1;
          return 1;
        });

      if (transmuterPools?.length > 0) {
        const selectedPool = transmuterPools[0];
        const offerToken = {
          ...selectedPool.assetsMeta[swapPair.native.denom],
          amount: unitAmount,
          showAmount: swapPair.native.amount,
          denom: swapPair.native.denom,
          price: assetIn?.denomPrice || '0',
          volume: '',
        };

        const remoteAmount = toUnitAmount(
          toReadableAmount(unitAmount, assetIn?.asset.exponent || 6),
          assetOut?.asset.exponent || 6,
        );

        const returnToken = {
          ...selectedPool.assetsMeta[swapPair.remote.denom],
          amount: remoteAmount,
          showAmount: swapPair.native.amount,
          denom: swapPair.remote.denom,
          price: assetOut?.denomPrice || '0',
          volume: '',
        };

        const formattedPool: Pool = {
          ...selectedPool,
          pairType: JSON.stringify(selectedPool.pair.pair_type),
          contractAddr: selectedPool.contract_addr,
          offerToken,
          returnToken,
          feeAmount: '0',
          feeRate: '0',
          marketPrice: '0',
          feeShowAmount: '0',
        };

        const result: SwapRouteResult = {
          offerToken: offerToken,
          returnToken: returnToken,
          feeRate: '0',
          feeShowAmount: '0',
          feeAmount: '0',
          exchangeRate: '1',
          exchangeRateVolume: BigNumber(returnToken.price)
            .times(returnToken.showAmount)
            .toFixed(4)
            .replace(/\.?0*$/, ''),
          pools: [formattedPool],
          priceImpact: '0',
          sort: 100,
        };

        if (resultQuote?.length > 0 && BigNumber(remoteAmount).gt(resultQuote?.[0]?.returnToken?.amount || '0')) {
          resultQuote.unshift(result);
        }

        if (resultQuote.length === 0) {
          resultQuote.push(result);
        }
      }

      if (resultQuote.length > 0) {
        setData(resultQuote[0]);
      } else {
        setData(emptyResponse);
      }
    } catch (err) {
      setData(emptyResponse);
    } finally {
      setLoading(false);
    }
  };
}

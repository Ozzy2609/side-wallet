// import { Box, ListItem } from "@mui/material";
import BigNumber from 'bignumber.js';
import React, { useState } from 'react';

import { Icon } from '@/ui/components/TokenCurrent/';
import { swapStore, useSwapStore } from '@/ui/stores/SwapStore';
// import Collapse from "@mui/material/Collapse";
import { findAssetIcon } from '@/ui/utils/swap';

// import SwapRoutes from "./SwapRoutes";

function SwapDetail() {
  const { swapPair, slippage, detailOpen, swapRouteResult } = useSwapStore();
  const [isCollapse, setIsCollapse] = useState(false);

  const priceImpact = BigNumber(swapRouteResult.priceImpact || '0').toFixed(2);

  const isPriceImpactOver = BigNumber(priceImpact).gt(10);

  const fee = swapRouteResult.feeRate + '%';

  const assetOut = findAssetIcon(swapPair.remote);

  const feePrice = swapRouteResult.feeShowAmount;

  const handleClick = () => {
    swapStore.detailOpen = !swapStore.detailOpen;
  };

  const swapRate = swapRouteResult.exchangeRate;

  const ratePrice = swapRouteResult.exchangeRateVolume;

  const minReceived0 = BigNumber(swapRouteResult?.returnToken?.showAmount || '')
    .times(BigNumber(1).minus(BigNumber(slippage).div(100)))
    .toFixed(assetOut?.precision || 6, BigNumber.ROUND_DOWN)
    .replace(/\.?0*$/, '');

  const minReceived =
    swapRouteResult?.pools?.length === 1 && swapRouteResult.pools[0].pairType.includes('transmuter')
      ? swapPair.remote.amount
      : minReceived0;

  console.log('priceImpact: ', priceImpact);
  console.log('priceImpact: minReceived: ', minReceived);
  const itemData: {
    id: string;
    text: string;
    value: string | JSX.Element;
  }[] = [
    {
      id: 'price_impact',
      text: 'Price impact',
      value: `${priceImpact}%`
    },

    {
      id: 'min_received',
      text: 'Minimum Received',
      value: `${minReceived} ${assetOut?.emoji || assetOut?.symbol}`
    },

    {
      id: 'fee',
      text: `Fee (${fee})`,
      value: `${feePrice} ${assetOut?.emoji || assetOut?.symbol}`
    }

    // {
    //   id: "order_routing",
    //   text: "Order routing",
    //   value: <RouteComponent />,
    // },
  ];

  function RenderItem({ text, value }: { text: string; value: string | JSX.Element }) {
    return (
      <div
        className={'pt-[12px]'}
        key={text + value}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px'
        }}
      >
        <div
          style={{
            color: '#7D7D7D'
          }}
        >
          {text}
        </div>

        <div
          style={{
            color: text !== 'Price impact' ? 'white' : 'rgb(246, 70, 93)'
          }}
        >
          {value}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex justify-between items-center ${
          isCollapse ? 'pb-[0px]' : 'pb-[10px] border-b-[1px] border-b-solid border-b-[#8E8E8F]/20'
        }`}
      >
        <div className="text-[14px]">
          1 {findAssetIcon(swapPair.native)?.symbol || swapPair.native?.denom || '-'} = {swapRate}{' '}
          {findAssetIcon(swapPair.remote)?.symbol || swapPair.remote?.denom || '-'} (${ratePrice})
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            setIsCollapse(!isCollapse);
          }}
        >
          <Icon
            style={{ fontSize: '14px', transform: isCollapse ? 'rotate(180deg)' : 'rotate(0deg)', transition: '.4s' }}
            type="side-down"
          />
        </div>
      </div>
      <div
        style={{
          height: isCollapse ? '0px' : 'max-content',
          overflow: 'hidden',
          transition: '.4s'
        }}
      >
        {itemData?.map((item) => {
          return RenderItem({
            text: item.text,
            value: item.value
          });
        })}
      </div>
    </>
  );
}

export default SwapDetail;

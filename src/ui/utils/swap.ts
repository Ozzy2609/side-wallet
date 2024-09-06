import BigNumber from 'bignumber.js';

import { SWAP_ASSETS } from '@/ui/constants';
import { LimitOrderConfig } from '@/ui/services/dex/type';
import { Coin } from '@cosmjs/stargate';

import { toReadableAmount } from './formatter';

export function findAssetIcon(coin: Coin) {
  return SWAP_ASSETS.assets.find((asset) => asset.base === coin.denom);
}

export function compute_swap(
  offer_pool: string,
  ask_pool: string,
  offer_amount: string,
  commisson_rate: string | number,
  assetOutExp: number | string
) {
  const cp = BigNumber(offer_pool).times(ask_pool);
  let return_amount = BigNumber(ask_pool).minus(BigNumber(cp).div(BigNumber(offer_pool).plus(offer_amount)));

  const spread_amount = BigNumber(offer_amount).times(BigNumber(ask_pool).div(offer_pool)).minus(return_amount);

  const commission_amount = BigNumber(return_amount).times(commisson_rate);

  return_amount = return_amount.minus(commission_amount);

  return {
    return_amount: toReadableAmount(return_amount.toFixed(0, BigNumber.ROUND_DOWN), assetOutExp),
    commission_amount: toReadableAmount(commission_amount.toFixed(0, BigNumber.ROUND_DOWN), assetOutExp),
    spread_amount: toReadableAmount(spread_amount.toFixed(0, BigNumber.ROUND_DOWN), assetOutExp)
  };
}

function get_creation_fee(qs: string, config: LimitOrderConfig) {
  const x1 = config.queue_size_left;
  const x2 = config.queue_size_right;
  const y1 = config.creation_fee_min;
  console.log('config.creation_fee_min: ', config.creation_fee_min);
  const y2 = config.creation_fee_max;

  const slope = (Number(y2) - Number(y1)) / (Number(x2) - Number(x1));

  if (BigNumber(qs).gte(x1) && BigNumber(qs).lt(x2)) {
    return BigNumber(slope).times(qs).plus(y1).minus(BigNumber(slope).times(x1)).toFixed(0);
  }

  if (BigNumber(qs).gte(x2)) {
    return y2;
  }

  return y1;
}

function get_maintainance_fee(dd: number, config: LimitOrderConfig) {
  const x1 = config.duration_days_min;
  const x2 = config.duration_days_max;

  const y1 = config.maintenance_fee_min;
  const y2 = config.maintenance_fee_max;

  const slope = (Number(y2) - Number(y1)) / (Number(x2) - Number(x1));

  if (BigNumber(dd).gte(x1) && BigNumber(dd).lt(x2)) {
    return BigNumber(slope).times(dd).plus(y1).minus(BigNumber(slope).times(x1)).toFixed(0);
  }

  if (BigNumber(dd).gte(x2)) {
    return y2;
  }

  return y1;
}

// export async function get_limit_order_fees(config: LimitOrderConfig, dd: number, client) {
//   const cosmWasmClient = await CosmWasmClient.connect(client?.rpcUrl);
//
//   const result: QueueStateType = await cosmWasmClient.queryContractSmart(DEX_LIMIR_ORDER_CONTRACT, {
//     query_state: {},
//   });
//
//   const queue_size = result.state.q || "";
//
//   const creation_fee = get_creation_fee(queue_size, config);
//
//   const maintenance_fee = get_maintainance_fee(dd, config);
//
//   const calculated_fee = BigNumber(config.minimum_reward).times(config.burn_fee_rate).div(100);
//
//   const burn_fee = BigNumber.max(calculated_fee, config.burn_fee_min).toFixed();
//
//   return {
//     creation_fee,
//     maintenance_fee,
//     burn_fee,
//     minimum_reward: config.minimum_reward,
//   };
// }

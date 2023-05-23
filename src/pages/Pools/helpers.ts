import { fromBinary, toBinary } from '@cosmjs/cosmwasm-stargate';
import { TokenItemType, tokenMap } from 'config/bridgeTokens';
import { ORAI, ORAIX_INFO, ORAI_INFO, SEC_PER_YEAR, STABLE_DENOM } from 'config/constants';
import { network } from 'config/networks';
import { Pairs } from 'config/pools';
import { parseAssetInfo } from 'helper';
import { CoinGeckoPrices } from 'hooks/useCoingecko';
import { MulticallReadOnlyInterface } from 'libs/contracts';
import { PoolResponse } from 'libs/contracts/OraiswapPair.types';
import { PoolInfoResponse, RewardsPerSecResponse } from 'libs/contracts/OraiswapStaking.types';
import { AggregateResult, PairInfo } from 'libs/contracts/types';
import { atomic, toDecimal, validateNumber } from 'libs/utils';
import isEqual from 'lodash/isEqual';
import sumBy from 'lodash/sumBy';
import {
  fetchAllRewardPerSecInfos,
  fetchAllTokenAssetPools,
  fetchPoolInfoAmount,
  fetchTokenInfos,
  getOraichainTokenItemTypeFromAssetInfo,
  getPairAmountInfo,
  parseTokenInfo
} from 'rest/api';
import { TokenInfo } from 'types/token';

interface PoolInfo {
  offerPoolAmount: bigint;
  askPoolAmount: bigint;
}
export type PairInfoData = {
  pair: PairInfo;
} & PairInfoDataRaw &
  PoolInfo;

export type PairInfoDataRaw = {
  amount: number;
  fromToken: TokenItemType;
  toToken: TokenItemType;
} & PoolInfo;

type PairDetails = {
  [key: string]: PoolResponse;
};

export const calculateAprResult = (
  pairs: PairInfo[],
  pairInfos: PairInfoData[],
  prices: CoinGeckoPrices<string>,
  allTokenInfo: TokenInfo[],
  allLpTokenAsset: PoolInfoResponse[],
  allRewardPerSec: RewardsPerSecResponse[]
) => {
  const aprResult = pairs.reduce((acc, pair, ind) => {
    const liquidityAmount = pairInfos.find((e) => e.pair.contract_addr === pair.contract_addr);
    const lpToken = allLpTokenAsset[ind];
    const tokenSupply = allTokenInfo[ind];
    const bondValue =
      (validateNumber(lpToken.total_bond_amount) * liquidityAmount.amount) / validateNumber(tokenSupply.total_supply);
    const rewardsPerSec = allRewardPerSec[ind].assets;
    let rewardsPerYearValue = 0;
    rewardsPerSec.forEach(({ amount, info }) => {
      if (isEqual(info, ORAI_INFO)) {
        rewardsPerYearValue += (SEC_PER_YEAR * validateNumber(amount) * prices['oraichain-token']) / atomic;
      } else if (isEqual(info, ORAIX_INFO))
        rewardsPerYearValue += (SEC_PER_YEAR * validateNumber(amount) * prices['oraidex']) / atomic;
    });
    return {
      ...acc,
      [pair.contract_addr]: (100 * rewardsPerYearValue) / bondValue || 0
    };
  }, {});
  return aprResult;
};

// Fetch APR
const fetchAprResult = async (pairs: PairInfo[], pairInfos: PairInfoData[], prices: CoinGeckoPrices<string>) => {
  const lpTokens = pairs.map((p) => ({ contractAddress: p.liquidity_token } as TokenItemType));
  const assetTokens = pairs.map((p) =>
    getOraichainTokenItemTypeFromAssetInfo(Pairs.getStakingAssetInfo(p.asset_infos))
  );
  try {
    const start = Date.now();
    const [allTokenInfo, allLpTokenAsset, allRewardPerSec] = await Promise.all([
      fetchTokenInfos(lpTokens),
      fetchAllTokenAssetPools(assetTokens),
      fetchAllRewardPerSecInfos(assetTokens)
    ]);
    const end = Date.now();
    console.log(`Execution time fetch apr result: ${end - start} ms`);
    return calculateAprResult(pairs, pairInfos, prices, allTokenInfo, allLpTokenAsset, allRewardPerSec);
  } catch (error) {
    console.log({ error });
  }
};

// Fetch Pair Info Data List
const fetchPoolListAndOraiPrice = async (pairs: PairInfo[], cachedPairs: PairDetails) => {
  if (!cachedPairs) {
    // wait for cached pair updated
    return;
  }
  let poolList: PairInfoData[] = await Promise.all(
    pairs.map(async (p: PairInfo) => {
      const pairInfoDataRaw = await fetchPairInfoData(p, cachedPairs);
      return {
        pair: p,
        ...pairInfoDataRaw
      } as PairInfoData;
    })
  );

  const oraiUsdtPool = poolList.find((pool) => pool.fromToken.denom === ORAI && pool.toToken.denom === STABLE_DENOM);
  if (!oraiUsdtPool) {
    // retry after 3 seconds
    setTimeout(fetchPoolListAndOraiPrice, 3000);
  } else {
    const oraiPrice = toDecimal(oraiUsdtPool.askPoolAmount, oraiUsdtPool.offerPoolAmount);
    try {
      const start = Date.now();
      const poolOraiUsdData = await fetchPoolInfoAmount(tokenMap[ORAI], tokenMap[STABLE_DENOM], cachedPairs);
      const pairAmounts = await Promise.all(
        poolList.map((pool) =>
          getPairAmountInfo(pool.fromToken, pool.toToken, cachedPairs, { ...pool }, poolOraiUsdData)
        )
      );
      const end = Date.now();
      console.log(`Execution time get pair amount info: ${end - start} ms`);
      poolList.forEach((pool, ind) => {
        pool.amount = pairAmounts[ind].tokenUsd;
      });
      poolList.sort((a, b) => b.amount - a.amount);
      return {
        pairInfo: poolList,
        oraiPrice
      };
    } catch (error) {
      console.log('error getPairAmountInfo', error);
    }
  }
};

export const fetchPairInfoData = async (pairInfo: PairInfo, cached: PairDetails): Promise<PairInfoDataRaw> => {
  const fromToken = getOraichainTokenItemTypeFromAssetInfo(pairInfo.asset_infos[0]);
  const toToken = getOraichainTokenItemTypeFromAssetInfo(pairInfo.asset_infos[1]);
  if (!fromToken || !toToken) return;

  try {
    const poolData = await fetchPoolInfoAmount(fromToken, toToken, cached, pairInfo);
    return {
      ...poolData,
      amount: 0,
      fromToken,
      toToken
    };
  } catch (ex) {
    console.log(ex);
  }
};

export const toPairDetails = (pairs: PairInfo[], res: AggregateResult): PairDetails => {
  const pairsData = Object.fromEntries(
    pairs.map((pair, ind) => {
      const data = res.return_data[ind];
      if (!data.success) {
        return [pair.contract_addr, {}];
      }
      return [pair.contract_addr, fromBinary(data.data)];
    })
  );
  return pairsData;
};

// Fetch all pair data
const fetchPairsData = async (pairs: PairInfo[], multicall: MulticallReadOnlyInterface) => {
  // TODO: remove hard code limit 100 fetching pairs
  const queries = pairs.map((pair) => ({
    address: pair.contract_addr,
    data: toBinary({
      pool: {}
    })
  }));

  const res = await multicall.aggregate({
    queries
  });
  return { pairs, pairDetails: toPairDetails(pairs, res) };
};

export const calculateReward = (pairs: PairInfo[], res: AggregateResult) => {
  const myPairData = Object.fromEntries(
    pairs.map((pair, ind) => {
      const data = res.return_data[ind];
      if (!data.success) {
        return [pair.contract_addr, {}];
      }
      const value = fromBinary(data.data);
      const bondPools = sumBy(Object.values(value.reward_infos));
      return [pair.contract_addr, !!bondPools];
    })
  );
  return myPairData;
};

const generateRewardInfoQueries = (pairs: PairInfo[], stakerAddress: string) => {
  const queries = pairs.map((pair) => {
    let assetToken = getOraichainTokenItemTypeFromAssetInfo(pair.asset_infos[0]);
    const firstParsedAssetInfo = parseAssetInfo(pair.asset_infos[0]);
    // we implicitly set asset info of the pool as non-ORAI token. If the first asset info in the pair list is ORAI then we get the other asset info
    if (firstParsedAssetInfo === ORAI) assetToken = getOraichainTokenItemTypeFromAssetInfo(pair.asset_infos[1]);
    const { info: assetInfo } = parseTokenInfo(assetToken);
    return {
      address: network.staking,
      data: toBinary({
        reward_info: {
          asset_info: assetInfo,
          staker_addr: stakerAddress
        }
      })
    };
  });
  return queries;
};

const fetchMyPairsData = async (pairs: PairInfo[], stakerAddress: string, multicall: MulticallReadOnlyInterface) => {
  const queries = generateRewardInfoQueries(pairs, stakerAddress);
  const res = await multicall.aggregate({
    queries
  });
  return calculateReward(pairs, res);
};

export { fetchAprResult, fetchPoolListAndOraiPrice, fetchPairsData, fetchMyPairsData };

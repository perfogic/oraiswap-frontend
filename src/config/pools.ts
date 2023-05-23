import { fromBinary, toBinary } from '@cosmjs/cosmwasm-stargate';
import { parseAssetInfo } from 'helper';
import { AssetInfo, MulticallReadOnlyInterface, PairInfo } from 'libs/contracts';
import { flatten, uniq } from 'lodash';
import { getOraichainTokenItemTypeFromAssetInfo, parseTokenInfo } from 'rest/api';
import { TokenItemType, cosmosTokens } from './bridgeTokens';
import { ORAI } from './constants';
import { Contract } from './contracts';

export type PairMapping = {
  asset_infos: [AssetInfo, AssetInfo];
};

export type TokensSwap = { [key: string]: TokenItemType };

export class Pairs {
  public static pairs: PairMapping[] = [
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_AIRI_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_ORAIX_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_SCORAI_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { native_token: { denom: process.env.REACT_APP_ATOM_ORAICHAIN_DENOM } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_USDT_CONTRACT } }
      ]
    },
    {
      asset_infos: [{ native_token: { denom: ORAI } }, { token: { contract_addr: process.env.REACT_APP_KWT_CONTRACT } }]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { native_token: { denom: process.env.REACT_APP_OSMOSIS_ORAICHAIN_DENOM } }
      ]
    },
    {
      asset_infos: [
        { token: { contract_addr: process.env.REACT_APP_MILKY_CONTRACT } },
        { token: { contract_addr: process.env.REACT_APP_USDT_CONTRACT } }
      ]
    },
    {
      asset_infos: [
        { native_token: { denom: ORAI } },
        { token: { contract_addr: process.env.REACT_APP_USDC_CONTRACT } }
      ]
    },
    {
      asset_infos: [{ native_token: { denom: ORAI } }, { token: { contract_addr: process.env.REACT_APP_TRX_CONTRACT } }]
    }
  ];

  static poolTokens = cosmosTokens.filter((token) =>
    uniq(flatten(this.pairs.map((pair) => pair.asset_infos))).includes(parseTokenInfo(token).info)
  );

  static getAllPairs = async (
    pairs: PairMapping[],
    factoryAddress: string,
    multicall: MulticallReadOnlyInterface
  ): Promise<PairInfo[]> => {
    const results = await multicall.aggregate({
      queries: pairs.map((pair) => {
        return {
          address: factoryAddress,
          data: toBinary({
            pair: {
              asset_infos: pair.asset_infos
            }
          })
        };
      })
    });
    console.dir(
      results.return_data.map((data) => fromBinary(data.data)),
      { depth: null }
    );
    return results.return_data.map((data) => fromBinary(data.data));
  };

  static getAllPairsFromTwoFactoryVersions = async (): Promise<PairInfo[]> => {
    const start = Date.now();
    const firstVersionWhiteListPairs = this.pairs.filter((pair) =>
      pair.asset_infos.some((info) => getOraichainTokenItemTypeFromAssetInfo(info)?.factoryV1)
    );
    const secondVersionWhiteListPairs = this.pairs.filter((pair) => !firstVersionWhiteListPairs.includes(pair));
    const [firstVersionAllPairs, secondVersionAllPairs] = await Promise.all([
      this.getAllPairs(firstVersionWhiteListPairs, Contract.factory.contractAddress, Contract.multicall),
      this.getAllPairs(secondVersionWhiteListPairs, Contract.factory_v2.contractAddress, Contract.multicall)
    ]);
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    return flatten([firstVersionAllPairs, secondVersionAllPairs]);
  };

  static getStakingAssetInfo = (assetInfos: AssetInfo[]): AssetInfo => {
    return parseAssetInfo(assetInfos[0]) === ORAI ? assetInfos[1] : assetInfos[0];
  };
}

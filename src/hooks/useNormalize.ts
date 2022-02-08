import { Dictionary } from 'ramda';
import { ORAI, UAIRI } from 'constants/constants';
import { plus, div, floor, gt } from 'libs/math';
import calc from 'helpers/calc';
// if use cycle import can make error: use before initilized
import { useContractsAddress } from 'hooks/useContractsAddress';
import { PriceKey, AssetInfoKey } from 'hooks/contractKeys';
import { BalanceKey, AccountInfoKey } from 'hooks/contractKeys';

export default () => {
  const { getListedItem, listed } = useContractsAddress();

  const price = {
    [PriceKey.PAIR]: (pairPool: Dictionary<PairPool>) =>
      dict(pairPool, calcPairPrice),
    [PriceKey.ORACLE]: (oraclePrice: Dictionary<Price>) =>
      dict(oraclePrice, ({ price }) => price)
  };

  const contractInfo = {
    [AssetInfoKey.COMMISSION]: (pairConfig: Dictionary<PairConfig>) =>
      dict(pairConfig, ({ lp_commission, owner_commission }) =>
        plus(lp_commission, owner_commission)
      ),
    [AssetInfoKey.LIQUIDITY]: (pairPool: Dictionary<PairPool>) =>
      dict(pairPool, (pool) => parsePairPool(pool).asset),
    [AssetInfoKey.MINCOLLATERALRATIO]: (mintInfo: Dictionary<MintInfo>) =>
      dict(mintInfo, ({ min_collateral_ratio }) => min_collateral_ratio),
    [AssetInfoKey.LPTOTALSTAKED]: (stakingPool: Dictionary<StakingPool>) =>
      dict(stakingPool, ({ total_bond_amount }) => total_bond_amount),
    [AssetInfoKey.LPTOTALSUPPLY]: (lpTokenInfo: Dictionary<TotalSupply>) =>
      dict(lpTokenInfo, ({ total_supply }) => total_supply)
  };

  const balance = {
    [BalanceKey.TOKEN]: (tokenBalance: Dictionary<Balance>) =>
      dict(tokenBalance, ({ balance }) => balance),
    [BalanceKey.LPTOTAL]: (
      lpTokenBalance: Dictionary<Balance>,
      stakingReward: StakingReward
    ) => reduceLP(listed, { lpTokenBalance, stakingReward }),
    [BalanceKey.LPSTAKABLE]: (lpTokenBalance: Dictionary<Balance>) =>
      dict(lpTokenBalance, ({ balance }) => balance),
    [BalanceKey.LPSTAKED]: (stakingReward: StakingReward) =>
      reduceBondAmount(stakingReward),
    [BalanceKey.MIRGOVSTAKED]: (govStake: Balance) => {
      const { token } = getListedItem(UAIRI);
      return { [token]: govStake.balance };
    },
    [BalanceKey.REWARD]: (
      stakingPool: Dictionary<StakingPool>,
      stakingReward: StakingReward
    ) =>
      dict(stakingPool, ({ reward_index: globalIndex }, token) => {
        const { reward_infos } = stakingReward;
        const info = reward_infos?.find((info) => info.asset_token === token);
        return floor(calc.reward(globalIndex, info));
      })
  };

  const accountInfo = {
    [AccountInfoKey.ORAI]: (bankBalance: BankBalance) =>
      findBalance(ORAI, bankBalance),
    [AccountInfoKey.MINTPOSITIONS]: (mintPosition: MintPositions) =>
      mintPosition.positions.filter(({ asset }) => gt(asset.amount, 0))
  };

  return { price, contractInfo, balance, accountInfo };
};

/* utils */
export const dict = <Data, Item = string>(
  dictionary: Dictionary<Data>,
  selector: (data: Data, token?: string) => Item
) =>
  Object.entries(dictionary).reduce<Dict<Item>>(
    (acc, [token, data]) => ({ ...acc, [token]: selector(data, token) }),
    {}
  );

/* helpers */
const calcPairPrice = (param: PairPool) => {
  const { orai, asset } = parsePairPool(param);
  return [orai, asset].every((v) => v && gt(v, 0)) ? div(orai, asset) : '0';
};

export const parsePairPool = ({ assets, total_share }: PairPool) => ({
  orai: assets.find(({ info }) => 'native_token' in info)?.amount ?? '0',
  asset: assets.find(({ info }) => 'token' in info)?.amount ?? '0',
  total: total_share
});

interface LPParams {
  lpTokenBalance: Dictionary<Balance>;
  stakingReward: StakingReward;
}

const reduceLP = (
  listed: ListedItem[],
  { lpTokenBalance, stakingReward }: LPParams
) =>
  listed.reduce<Dictionary<string>>(
    (acc, { token }) => ({
      ...acc,
      [token]: plus(
        lpTokenBalance[token].balance,
        stakingReward.reward_infos.find(
          ({ asset_token }) => asset_token === token
        )?.bond_amount
      )
    }),
    {}
  );

const reduceBondAmount = ({ reward_infos }: StakingReward) =>
  reward_infos.reduce<Dictionary<string>>(
    (acc, { asset_token, bond_amount }) => {
      return { ...acc, [asset_token]: bond_amount };
    },
    {}
  );

const findBalance = (denom: string, { BankBalancesAddress }: BankBalance) =>
  BankBalancesAddress?.Result.find(({ Denom }) => Denom === denom)?.Amount ??
  '0';

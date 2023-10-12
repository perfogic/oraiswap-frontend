import bg_claim_btn from 'assets/images/bg_claim_btn.png';
import bg_claim_btn_light from 'assets/images/bg_claim_btn_light.png';
import { Button } from 'components/Button';
import TokenBalance from 'components/TokenBalance';
import { CW20_DECIMALS, ORAI_INFO, USDT_CW20_INFO } from 'config/constants';
import useConfigReducer from 'hooks/useConfigReducer';
import useTheme from 'hooks/useTheme';
import { toDecimal, toDisplay } from 'libs/utils';
import { useGetMyStake, useGetPools } from 'pages/Pools/hookV3';
import { FC, useEffect, useState } from 'react';
import styles from './Header.module.scss';

export const useGetOraiPrice = () => {
  const pools = useGetPools();
  const [oraiPrice, setOraiPrice] = useState(0);

  useEffect(() => {
    if (pools.length === 0) return;
    const oraiUsdtPool = pools.find(
      (pool) =>
        pool.firstAssetInfo === JSON.stringify(ORAI_INFO) && pool.secondAssetInfo === JSON.stringify(USDT_CW20_INFO)
    );
    if (!oraiUsdtPool) return;
    const oraiPrice = toDecimal(BigInt(oraiUsdtPool.askPoolAmount), BigInt(oraiUsdtPool.offerPoolAmount));
    setOraiPrice(oraiPrice);
  }, [pools]);

  return oraiPrice;
};

export const Header: FC = () => {
  const theme = useTheme();
  const [address] = useConfigReducer('address');
  const { totalStaked, totalEarned } = useGetMyStake({
    stakerAddress: address
  });
  const oraiPrice = useGetOraiPrice();

  return (
    <div className={styles.header}>
      <div className={styles.header_data}>
        <div className={styles.header_data_item}>
          <span className={styles.header_data_name}>ORAI Price</span>
          <br />
          <span className={styles.header_data_value}>
            <TokenBalance balance={oraiPrice} className={styles.header_data_value} decimalScale={2} />
          </span>
        </div>
        <div className={styles.header_data_item}>
          <span className={styles.header_data_name}>Total Staked LP</span>
          <br />
          <TokenBalance
            balance={toDisplay(BigInt(Math.trunc(totalStaked)), CW20_DECIMALS)}
            prefix="$"
            className={styles.header_data_value}
            decimalScale={4}
          />
        </div>
        <div className={styles.header_data_item}>
          <span className={styles.header_data_name}>Total Earned</span>
          <br />
          <TokenBalance
            balance={toDisplay(BigInt(Math.trunc(totalEarned)), CW20_DECIMALS)}
            prefix="$"
            className={styles.header_data_value}
            decimalScale={4}
          />
        </div>
      </div>
      <div className={styles.header_claim_reward}>
        <div className={styles.claim_reward_bg}>
          <img src={theme === 'light' ? bg_claim_btn : bg_claim_btn_light} alt="bg-claim-reward" />
        </div>
        <Button type="primary-sm" onClick={() => console.log('ok')}>
          Claim All Rewards
        </Button>
      </div>
    </div>
  );
};

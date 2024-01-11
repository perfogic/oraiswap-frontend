import { toBinary } from '@cosmjs/cosmwasm-stargate';
import { ORAIX_CONTRACT, toAmount, toDisplay, BigDecimal } from '@oraichain/oraidex-common';
import { ReactComponent as UsdcIcon } from 'assets/icons/usd_coin.svg';
import { ReactComponent as OraiXIcon } from 'assets/icons/oraix.svg';
import { ReactComponent as OraiXLightIcon } from 'assets/icons/oraix_light.svg';
import { Button } from 'components/Button';
import Loader from 'components/Loader';
import { TToastType, displayToast } from 'components/Toasts/Toast';
import TokenBalance from 'components/TokenBalance';
import { flattenTokens, tokenMap } from 'config/bridgeTokens';
import { network } from 'config/networks';
import { getTransactionUrl, handleErrorTransaction } from 'helper';
import { useCoinGeckoPrices } from 'hooks/useCoingecko';
import useConfigReducer from 'hooks/useConfigReducer';
import { getUsd } from 'libs/utils';
import { INIT_AMOUNT_SIMULATE, TIMER } from 'pages/CoHarvest/constants';
import { useDebounce } from 'pages/CoHarvest/hooks/useDebounce';
import {
  useGetAllBidPoolInRound,
  useGetBidding,
  useGetHistoryBid,
  useGetPotentialReturn
} from 'pages/CoHarvest/hooks/useGetBidRound';
import { formatDisplayUsdt } from 'pages/Pools/helpers';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/configure';
import InputBalance from '../InputBalance';
import InputRange from '../InputRange';
import styles from './index.module.scss';
import { useSimulate } from 'pages/UniversalSwap/SwapV3/hooks';
import { OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';

const Bidding = ({ isEnd, round, isStarted }: { isEnd: boolean; round: number; isStarted: boolean }) => {
  const [range, setRange] = useState(1);
  const [amount, setAmount] = useState();
  const amounts = useSelector((state: RootState) => state.token.amounts);
  const { data: prices } = useCoinGeckoPrices();
  const balance = amounts['oraix'];
  const ORAIX_TOKEN_INFO = flattenTokens.find((e) => e.coinGeckoId === 'oraidex');
  const USDC_TOKEN_INFO = flattenTokens.find((e) => e.coinGeckoId === 'usd-coin');

  const originalFromToken = tokenMap['oraix'];
  const originalToToken = tokenMap['usdc'];
  const routerClient = new OraiswapRouterQueryClient(window.client, network.router);

  const amountUsd = getUsd(toAmount(amount), ORAIX_TOKEN_INFO, prices);
  const [address] = useConfigReducer('address');
  const rangeDebounce = useDebounce(range, TIMER.HAFT_MILLISECOND);
  const [loading, setLoading] = useState(false);
  const [theme] = useConfigReducer('theme');

  const { refetchAllBidPoolRound } = useGetAllBidPoolInRound(round);
  const { refetchHistoryBidPool } = useGetHistoryBid(round);
  const { refetchBiddingInfo } = useGetBidding(round);
  const { simulateData: averageRatio } = useSimulate(
    'simulate-average-data-co-harvest',
    ORAIX_TOKEN_INFO,
    USDC_TOKEN_INFO,
    originalFromToken,
    originalToToken,
    routerClient,
    INIT_AMOUNT_SIMULATE
  );

  const { potentialReturn, refetchPotentialReturn } = useGetPotentialReturn({
    bidAmount: toAmount(amount).toString(),
    exchangeRate: new BigDecimal(averageRatio?.displayAmount || 0).div(INIT_AMOUNT_SIMULATE).toString(),
    round: round,
    slot: range
  });

  useEffect(() => {
    refetchPotentialReturn();
  }, [rangeDebounce]);

  const estimateReceive = potentialReturn?.receive || '0';
  const estimateResidueBid = potentialReturn?.residue_bid || '0';

  const returnAmountUsd = getUsd(estimateReceive, USDC_TOKEN_INFO, prices);
  const residueBidAmountUsd = getUsd(estimateResidueBid, ORAIX_TOKEN_INFO, prices);

  const potentialReturnUSD = new BigDecimal(returnAmountUsd).add(residueBidAmountUsd).toNumber();

  return (
    <div className={styles.bidding}>
      <div className={styles.title}>Co-Harvest #{round}</div>
      <div className={styles.content}>
        <InputBalance balance={balance} amount={amount} onChangeAmount={setAmount} />
        <div className={styles.interest}>
          <div className={styles.interestTitle}>Interest</div>
          <InputRange className={styles.range} value={range} onChange={(value) => setRange(+value)} />
          <div className={styles.explain}>Get {range}% interest on your bid</div>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.bidValue}>
          <span>Bid value</span>
          <div className={styles.usd}>{formatDisplayUsdt(amountUsd)}</div>
        </div>

        <div className={styles.return}>
          <span>Potential return</span>
          <div className={styles.value}>
            <div className={styles.usdReturn}>{formatDisplayUsdt(potentialReturnUSD)}</div>
            <div className={styles.balance}>
              {/* <div className={styles.token}>{formatDisplayUsdt(amountUsd)}</div> */}
              <UsdcIcon />
              <span>{toDisplay(estimateReceive)} USDC</span>
            </div>
            <div className={styles.balance}>
              {theme === 'light' ? <OraiXLightIcon /> : <OraiXIcon />}
              <span>{toDisplay(estimateResidueBid)} ORAIX</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.button}>
        <Button
          type="primary"
          onClick={async () => {
            setLoading(true);
            try {
              const result = await window.client.execute(
                address,
                ORAIX_CONTRACT,
                {
                  send: {
                    contract: network.bid_pool,
                    amount: toAmount(amount).toString(),
                    msg: toBinary({
                      submit_bid: {
                        premium_slot: range,
                        round
                      }
                    })
                  }
                },
                'auto'
              );
              if (result && result.transactionHash) {
                displayToast(TToastType.TX_SUCCESSFUL, {
                  customLink: getTransactionUrl(network.chainId, result.transactionHash)
                });
                refetchAllBidPoolRound();
                refetchHistoryBidPool();
                refetchBiddingInfo();
                // setAmount(undefined);
                // setRange(1);
              }
            } catch (error) {
              console.log({ error });
              handleErrorTransaction(error, {
                tokenName: 'ORAIX',
                chainName: network.chainId
              });
            } finally {
              setLoading(false);
            }
          }}
          icon={null}
          disabled={!isStarted || isEnd || loading || !amount} // || !Number(estimateReceive)
        >
          {loading && <Loader width={22} height={22} />}&nbsp;Place a bid
        </Button>
      </div>
    </div>
  );
};

export default memo(Bidding);

import Layout from 'layouts/Layout';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { coin } from '@cosmjs/proto-signing';
import { IBCInfo } from 'types/ibc';
import styles from './Balance.module.scss';
import { ReactComponent as ToggleTransfer } from 'assets/icons/toggle_transfer.svg';
import { ReactComponent as ATOMCOSMOS } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as BNB } from 'assets/icons/bnb.svg';
import { ReactComponent as ETH } from 'assets/icons/eth.svg';
import { ReactComponent as ORAI } from 'assets/icons/oraichain.svg';
import { ReactComponent as OSMO } from 'assets/icons/osmosis.svg';
import { SigningStargateClient } from '@cosmjs/stargate';
import useLocalStorage from 'libs/useLocalStorage';
import { displayToast, TToastType } from 'components/Toasts/Toast';
import _ from 'lodash';
import { useCoinGeckoPrices } from '@sunnyag/react-coingecko';
import axios from 'axios';
import { DenomBalanceResponse } from 'rest/useAPI';
import TokenBalance from 'components/TokenBalance';
import NumberFormat from 'react-number-format';

interface IBCInfoMap {
  [key: string]: { [key: string]: IBCInfo };
}

const ibcInfos: IBCInfoMap = {
  'gravity-test': {
    'Oraichain-testnet': {
      source: 'transfer',
      channel: 'channel-0',
      timeout: 60
    }
  },
  'osmosis-1': {
    'Oraichain-testnet': {
      source: 'transfer',
      channel: 'channel-202',
      timeout: 60
    }
  },
  'Oraichain-testnet': {
    'gravity-test': {
      source: 'transfer',
      channel: 'channel-1',
      timeout: 60
    },
    'osmosis-1': {
      source: 'transfer',
      channel: 'channel-3',
      timeout: 60
    }
  }
};

interface BalanceProps {}

type TokenItemType = {
  name?: string;
  org?: string;
  denom: string;
  icon?: ReactElement;
  chainId: string;
  rpc: string;
  lcd?: string;
  decimals: number;
  coingeckoId: 'oraichain-token' | 'osmosis' | 'atom' | 'ethereum' | 'bnb';
  cosmosBased: Boolean;
};

type AmountDetail = {
  amount: number;
  usd: number;
};
interface TokenItemProps {
  token: TokenItemType;
  active: Boolean;
  className?: string;
  onClick?: Function;
  amountDetail?: AmountDetail;
}

const tokens: [TokenItemType[], TokenItemType[]] = [
  [
    {
      name: 'ORAI',
      org: 'Ethereum',
      denom: '0x7e2a35c746f2f7c240b664f1da4dd100141ae71f',
      coingeckoId: 'oraichain-token',
      decimals: 6,
      chainId: 'Oraichain-testnet',
      rpc: 'https://testnet.rpc.orai.io',
      lcd: 'https://testnet.lcd.orai.io',
      cosmosBased: false,
      icon: <ORAI className={styles.tokenIcon} />
    },
    {
      name: 'ATOM',
      org: 'Cosmos Hub',
      coingeckoId: 'atom',
      denom: 'atom',
      decimals: 6,
      chainId: 'cosmoshub-4',
      rpc: 'https://rpc-cosmoshub.blockapsis.com',
      lcd: 'https://lcd-cosmoshub.blockapsis.com',
      cosmosBased: true,
      icon: <ATOMCOSMOS className={styles.tokenIcon} />
    },
    {
      name: 'OSMO',
      org: 'Osmosis',
      denom: 'osmosis',
      chainId: 'osmosis-1',
      rpc: 'https://rpc-osmosis.blockapsis.com',
      lcd: 'https://lcd-osmosis.blockapsis.com',
      decimals: 6,
      coingeckoId: 'osmosis',
      cosmosBased: true,
      icon: <OSMO className={styles.tokenIcon} />
    },
    {
      name: 'ETH',
      org: 'Ethereum',
      coingeckoId: 'ethereum',
      denom: 'ethereum',
      decimals: 18,
      chainId: 'ethereum',
      rpc: 'http://125.212.192.225:26657',
      cosmosBased: false,
      icon: <ETH className={styles.tokenIcon} />
    },
    {
      name: 'BNB',
      org: 'BNB Chain',
      chainId: 'bsc',
      denom: 'bnb',
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      decimals: 18,
      coingeckoId: 'bnb',
      cosmosBased: false,
      icon: <BNB className={styles.tokenIcon} />
    }
  ],
  [
    {
      name: 'ORAI',
      org: 'Oraichain',
      denom: 'orai',
      coingeckoId: 'oraichain-token',
      decimals: 6,
      chainId: 'Oraichain-testnet',
      rpc: 'https://testnet.rpc.orai.io',
      lcd: 'https://testnet.lcd.orai.io',
      cosmosBased: true,
      icon: <ORAI className={styles.tokenIcon} />
    },
    {
      name: 'ATOM',
      org: 'Oraichain',
      coingeckoId: 'atom',
      denom: 'ibc/atom',
      decimals: 6,
      chainId: 'Oraichain-testnet',
      rpc: 'https://testnet.rpc.orai.io',
      lcd: 'https://testnet.lcd.orai.io',
      cosmosBased: true,
      icon: <ATOMCOSMOS className={styles.tokenIcon} />
    },
    {
      name: 'OSMO',
      org: 'Oraichain',
      denom: 'ibc/osmosis',
      chainId: 'Oraichain-testnet',
      rpc: 'https://testnet.rpc.orai.io',
      lcd: 'https://testnet.lcd.orai.io',
      decimals: 6,
      coingeckoId: 'osmosis',
      cosmosBased: true,
      icon: <OSMO className={styles.tokenIcon} />
    },
    {
      name: 'ETH',
      org: 'Oraichain',
      coingeckoId: 'ethereum',
      denom: 'ibc/ethereum',
      decimals: 18,
      chainId: 'Oraichain-testnet',
      rpc: 'http://125.212.192.225:26657',
      cosmosBased: false,
      icon: <ETH className={styles.tokenIcon} />
    },
    {
      name: 'BNB',
      org: 'Oraichain',
      chainId: 'Oraichain-testnet',
      denom: 'bnb',
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      decimals: 18,
      coingeckoId: 'bnb',
      cosmosBased: false,
      icon: <BNB className={styles.tokenIcon} />
    }
  ]
];

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  amountDetail,
  active,
  className,
  onClick
}) => {
  return (
    <div
      className={classNames(
        styles.tokenWrapper,
        { [styles.active]: active },
        className
      )}
      onClick={() => onClick?.(token)}
    >
      <div className={styles.token}>
        {token.icon ?? <ATOMCOSMOS className={styles.tokenIcon} />}
        <div className={styles.tokenInfo}>
          <div className={styles.tokenName}>{token.name}</div>
          <div className={styles.tokenOrg}>
            <span className={styles.tokenOrgTxt}>{token.org}</span>
          </div>
        </div>
      </div>
      <div className={styles.tokenBalance}>
        <TokenBalance
          balance={{
            amount: amountDetail ? amountDetail.amount.toString() : '0',
            denom: ''
          }}
          className={styles.tokenAmount}
          decimalScale={2}
        />
        <TokenBalance
          balance={amountDetail ? amountDetail.usd : 0}
          className={styles.subLabel}
          decimalScale={2}
        />
      </div>
    </div>
  );
};

type AmountDetails = { [key: string]: AmountDetail };

const Balance: React.FC<BalanceProps> = () => {
  const [keplrAddress] = useLocalStorage<string>('address');
  const [from, setFrom] = useState<TokenItemType>();
  const [to, setTo] = useState<TokenItemType>();
  const [[fromAmount, fromUsd], setFromAmount] = useState<[number, number]>([
    0, 0
  ]);
  const [amounts, setAmounts] = useState<AmountDetails>({});
  const [[fromTokens, toTokens], setTokens] = useState(tokens);
  const { prices } = useCoinGeckoPrices([
    'oraichain-token',
    'osmosis',
    'atom',
    'bnb',
    'ethereum'
  ]);

  const getUsd = (amount: number, token: TokenItemType) => {
    if (!amount) return 0;
    const price = prices[token.coingeckoId].price;
    if (!price) return 0;
    return price.multiply(amount).divide(10 ** token.decimals).asNumber;
  };

  const toggleTransfer = () => {
    setTokens([toTokens, fromTokens]);
    setFrom(to);
    setTo(from);
    setFromAmount([0, 0]);
  };

  const loadTokenAmounts = async () => {
    const amountDetails: AmountDetails = {};

    const filteredTokens = _.uniqBy(
      [...fromTokens, ...toTokens].filter(
        (token) => token.cosmosBased && token.coingeckoId in prices
      ),
      (c) => c.coingeckoId
    );

    for (const token of filteredTokens) {
      // switch address
      const address = (await window.keplr.getKey(token.chainId)).bech32Address;

      const url = `${token.lcd}/cosmos/bank/v1beta1/balances/${address}`;
      const res: DenomBalanceResponse = (await axios.get(url)).data;
      const amount = parseInt(
        res.balances.find((balance) => balance.denom === token.denom)?.amount ??
          '0'
      );

      const amountDetail: AmountDetail = {
        amount,
        usd: getUsd(amount, token)
      };
      amountDetails[token.denom] = amountDetail;
    }
    setAmounts(amountDetails);
  };

  useEffect(() => {
    const amountDetails: AmountDetails = {};
    loadTokenAmounts();
  }, [prices]);

  // console.log(prices['oraichain-token'].price);

  const onClickToken = useCallback((type: string, token: TokenItemType) => {
    if (!token.cosmosBased) {
      displayToast(TToastType.TX_INFO, {
        message: `Token ${token.name} on ${token.org} is currently not supported`
      });
      return;
    }

    if (type === 'to') {
      setTo(token);
    } else {
      setFrom(token);
    }
  }, []);

  const onClickTokenFrom = useCallback(
    (token: TokenItemType) => {
      onClickToken('from', token);
    },
    [onClickToken]
  );

  const onClickTokenTo = useCallback(
    (token: TokenItemType) => {
      onClickToken('to', token);
    },
    [onClickToken]
  );

  const transferIBC = async () => {
    if (!from || !to) {
      displayToast(TToastType.TX_FAILED, {
        message: 'Please choose both from and to tokens'
      });
      return;
    }
    try {
      const fromAddress = (await window.keplr.getKey(from.chainId))
        .bech32Address;
      const toAddress = (await window.keplr.getKey(to.chainId)).bech32Address;
      await window.keplr.enable(from.chainId);
      const amount = coin(
        Math.round(fromAmount * 10 ** from.decimals),
        from.denom
      );
      const offlineSigner = window.keplr.getOfflineSigner(from.chainId);
      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      const client = await SigningStargateClient.connectWithSigner(
        from.rpc,
        offlineSigner
      );
      const ibcInfo: IBCInfo = ibcInfos[from.chainId][to.chainId];

      const result = await client.sendIbcTokens(
        fromAddress,
        toAddress,
        amount,
        ibcInfo.source,
        ibcInfo.channel,
        undefined,
        Math.floor(Date.now() / 1000) + ibcInfo.timeout,
        {
          gas: '200000',
          amount: []
        }
      );

      console.log(result);
      displayToast(TToastType.TX_SUCCESSFUL);
    } catch (ex: any) {
      displayToast(TToastType.TX_FAILED, {
        message: ex.message
      });
    }
  };

  const totalUsd = _.sumBy(Object.values(amounts), (c) => c.usd);

  return (
    <Layout>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.totalAssets}>Total Assets</span>
          <TokenBalance
            balance={totalUsd}
            className={styles.balance}
            decimalScale={2}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.transferTab}>
          {/* From Tab */}
          <div className={styles.border_gradient}>
            <div className={styles.balance_block}>
              <div className={styles.tableHeader}>
                <span className={styles.label}>From</span>
                <div className={styles.fromBalanceDes}>
                  <div className={styles.balanceFromGroup}>
                    <TokenBalance
                      balance={{
                        amount:
                          from && amounts[from.denom]
                            ? amounts[from.denom].amount / 10 ** from.decimals
                            : 0,
                        denom: from?.denom ?? ''
                      }}
                      className={styles.balanceDescription}
                      prefix="Balance: "
                      decimalScale={2}
                    />

                    <button
                      className={styles.balanceBtn}
                      onClick={() => {
                        setFromAmount(
                          from
                            ? [
                                amounts[from.denom].amount /
                                  10 ** from.decimals,
                                amounts[from.denom].usd
                              ]
                            : [0, 0]
                        );
                      }}
                    >
                      MAX
                    </button>
                    <button
                      className={styles.balanceBtn}
                      onClick={() => {
                        setFromAmount(
                          from
                            ? [
                                amounts[from.denom].amount /
                                  (2 * 10 ** from.decimals),
                                amounts[from.denom].usd / 2
                              ]
                            : [0, 0]
                        );
                      }}
                    >
                      HALF
                    </button>
                  </div>
                  <TokenBalance
                    balance={fromUsd}
                    className={styles.balanceDescription}
                    prefix="~$"
                    decimalScale={2}
                  />
                </div>
                {from?.name ? (
                  <div className={styles.tokenFromGroup}>
                    <div className={styles.token}>
                      {from.icon}
                      <div className={styles.tokenInfo}>
                        <div className={styles.tokenName}>{from.name}</div>
                        <div className={styles.tokenOrg}>
                          <span className={styles.tokenOrgTxt}>{from.org}</span>
                        </div>
                      </div>
                    </div>

                    <NumberFormat
                      thousandSeparator
                      decimalScale={2}
                      customInput={Input}
                      value={fromAmount}
                      onValueChange={({ floatValue }) => {
                        setFromAmount([
                          floatValue ?? 0,
                          getUsd((floatValue ?? 0) * 10 ** from.decimals, from)
                        ]);
                      }}
                      className={styles.amount}
                    />
                  </div>
                ) : null}
              </div>
              <div className={styles.table}>
                <div className={styles.tableDes}>
                  <span className={styles.subLabel}>Available assets</span>
                  <span className={styles.subLabel}>Balance</span>
                </div>
                <div className={styles.tableContent}>
                  {fromTokens.map((t: TokenItemType) => {
                    return (
                      <TokenItem
                        key={t.denom}
                        amountDetail={amounts[t.denom]}
                        className={styles.token_from}
                        active={from?.name === t.name}
                        token={t}
                        onClick={onClickTokenFrom}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* End from tab */}
          {/* Transfer button */}

          <div className={styles.transferBtn}>
            <button onClick={toggleTransfer}>
              <ToggleTransfer
                style={{
                  width: 44,
                  height: 44,
                  alignSelf: 'center',
                  cursor: 'pointer'
                }}
              />
            </button>
            <button className={styles.tfBtn} onClick={transferIBC}>
              <span className={styles.tfTxt}>Transfer</span>
            </button>
          </div>
          {/* End Transfer button */}
          {/* To Tab */}
          <div className={styles.border_gradient}>
            <div className={styles.balance_block}>
              <div className={styles.tableHeader}>
                <span className={styles.label}>To</span>

                <TokenBalance
                  balance={{
                    amount:
                      to && amounts[to.denom]
                        ? amounts[to.denom].amount / 10 ** to.decimals
                        : 0,
                    denom: to?.denom ?? ''
                  }}
                  className={styles.balanceDescription}
                  prefix="Balance: "
                  decimalScale={2}
                />

                {to ? (
                  <div className={styles.token}>
                    {to.icon}
                    <div className={styles.tokenInfo}>
                      <div className={styles.tokenName}>{to.name}</div>
                      <div className={styles.tokenOrg}>
                        <span className={styles.tokenOrgTxt}>{to.org}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className={styles.table}>
                <div className={styles.tableDes}>
                  <span className={styles.subLabel}>Available assets</span>
                  <span className={styles.subLabel}>Balance</span>
                </div>
                <div className={styles.tableContent}>
                  {toTokens.map((t: TokenItemType) => {
                    return (
                      <TokenItem
                        key={t.denom}
                        amountDetail={amounts[t.denom]}
                        active={to?.name === t.name}
                        token={t}
                        onClick={onClickTokenTo}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* End To Tab  */}
        </div>
      </div>
    </Layout>
  );
};

export default Balance;
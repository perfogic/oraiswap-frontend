import { Button, Typography } from 'antd';
import { ReactComponent as LogoFull } from 'assets/images/OraiDEX_full_light.svg';
import { ReactComponent as MenuIcon } from 'assets/icons/menu.svg';
import { ReactComponent as Swap } from 'assets/icons/swap.svg';
import { ReactComponent as BuyFiat } from 'assets/icons/buyfiat.svg';
import { ReactComponent as Wallet } from 'assets/icons/wallet.svg';
import { ReactComponent as Pools } from 'assets/icons/pool.svg';
import { ReactComponent as Dark } from 'assets/icons/dark.svg';
import { ReactComponent as Light } from 'assets/icons/light.svg';
import { ReactComponent as BNBIcon } from 'assets/icons/bnb.svg';
import { ReactComponent as ORAIIcon } from 'assets/icons/oraichain.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import { ReactComponent as InfoIcon } from 'assets/icons/oraidex_info.svg';
import { ReactComponent as KwtIcon } from 'assets/icons/kwt.svg';
import { ReactComponent as AtomCosmosIcon } from 'assets/icons/atom_cosmos.svg';
import { ReactComponent as OsmosisIcon } from 'assets/icons/osmosis.svg';
import ethIcon from 'assets/icons/eth.svg';

import { ThemeContext, Themes } from 'context/theme-context';

import React, {
  memo,
  useContext,
  useEffect,
  useState,
  ReactElement
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Menu.module.scss';
import RequireAuthButton from 'components/connect-wallet/RequireAuthButton';
import CenterEllipsis from 'components/CenterEllipsis';
import AvatarPlaceholder from 'components/AvatarPlaceholder/AvatarPlaceholder';
import TokenBalance from 'components/TokenBalance';
import {
  BEP20_ORAI,
  BSC_CHAIN_ID,
  COSMOS_CHAIN_ID,
  ERC20_ORAI,
  ETHEREUM_CHAIN_ID,
  KWT_SUBNETWORK_CHAIN_ID,
  KWT_SUBNETWORK_EVM_CHAIN_ID,
  ORAI,
  ORAICHAIN_ID,
  OSMOSIS_CHAIN_ID
} from 'config/constants';
import { isMobile } from '@walletconnect/browser-utils';

import classNames from 'classnames';
import useConfigReducer from 'hooks/useConfigReducer';
import { handleCheckChain, getDenomEvm, getRpcEvm } from 'helper';
import { useSelector } from 'react-redux';
import { RootState } from 'store/configure';
const { Text } = Typography;

const Menu: React.FC<{}> = React.memo((props) => {
  const location = useLocation();
  const [link, setLink] = useState('/');
  const { theme, setTheme } = useContext(ThemeContext);
  const [address, setAddress] = useConfigReducer('address');
  const [infoCosmos] = useConfigReducer('infoCosmos');
  const amounts = useSelector((state: RootState) => state.token.amounts);
  const [metamaskAddress] = useConfigReducer('metamaskAddress');
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const balance = amounts[ORAI]?.amount || 0;
  const metamaskBalance =
    amounts[window.Metamask.isEth() ? ERC20_ORAI : BEP20_ORAI]?.amount || 0;

  useEffect(() => {
    setLink(location.pathname);
  }, []);

  const renderLink = (
    to: string,
    title: string,
    onClick: any,
    icon: ReactElement,
    externalLink = false
  ) => {
    if (externalLink)
      return (
        <a
          target="_blank"
          href={to}
          className={
            styles.menu_item + (link === to ? ` ${styles.active}` : '')
          }
          onClick={() => {
            setOpen(!open);
            onClick(to);
          }}
          rel="noreferrer"
        >
          {icon}
          <Text className={styles.menu_item_text}>{title}</Text>
        </a>
      );
    return (
      <Link
        to={to}
        onClick={() => {
          setOpen(!open);
          onClick(to);
        }}
        className={styles.menu_item + (link === to ? ` ${styles.active}` : '')}
      >
        {icon}
        <Text className={styles.menu_item_text}>{title}</Text>
      </Link>
    );
  };

  const mobileMode = isMobile();

  const ToggleIcon = open ? CloseIcon : MenuIcon;

  return (
    <>
      {mobileMode && (
        <div className={styles.logo}>
          <Link to={'/'} onClick={() => setLink('/')}>
            <LogoFull />
          </Link>
          <ToggleIcon onClick={handleToggle} />
        </div>
      )}
      <div className={classNames(styles.menu, { [styles.open]: open })}>
        <div>
          {!mobileMode && (
            <Link to={'/'} onClick={() => setLink('/')} className={styles.logo}>
              <LogoFull />
            </Link>
          )}
          <div className={styles.menu_items}>
            <RequireAuthButton address={address} setAddress={setAddress}>
              {address && (
                <div className={styles.token_info}>
                  {/* <AvatarPlaceholder
                    address={address}
                    className={styles.token_avatar}
                  /> */}
                  {handleCheckChain(KWT_SUBNETWORK_CHAIN_ID, infoCosmos) && (
                    <KwtIcon className={styles.token_avatar} />
                  )}
                  {handleCheckChain(COSMOS_CHAIN_ID, infoCosmos) && (
                    <AtomCosmosIcon className={styles.token_avatar} />
                  )}
                  {handleCheckChain(OSMOSIS_CHAIN_ID, infoCosmos) && (
                    <OsmosisIcon className={styles.token_avatar} />
                  )}
                  {handleCheckChain(ORAICHAIN_ID, infoCosmos) && (
                    <ORAIIcon className={styles.token_avatar} />
                  )}
                  <div className={styles.token_info_balance}>
                    <CenterEllipsis
                      size={6}
                      text={address}
                      className={styles.token_address}
                    />
                    {
                      <TokenBalance
                        balance={{
                          amount: balance,
                          decimals: 6,
                          denom: ORAI
                        }}
                        className={styles.token_balance}
                        decimalScale={6}
                      />
                    }
                  </div>
                </div>
              )}
              {!!metamaskAddress && (
                <div className={styles.token_info}>
                  {handleCheckChain(BSC_CHAIN_ID) && (
                    <BNBIcon className={styles.token_avatar} />
                  )}
                  {handleCheckChain(ETHEREUM_CHAIN_ID) && (
                    <img src={ethIcon} className={styles.token_avatar} />
                  )}
                  {handleCheckChain(KWT_SUBNETWORK_EVM_CHAIN_ID) && (
                    <KwtIcon className={styles.token_avatar} />
                  )}
                  <div className={styles.token_info_balance}>
                    <CenterEllipsis
                      size={6}
                      text={metamaskAddress}
                      className={styles.token_address}
                    />
                    {!!metamaskBalance && (
                      <TokenBalance
                        balance={{
                          amount: metamaskBalance,
                          decimals: 18,
                          denom: ORAI
                        }}
                        className={styles.token_balance}
                        decimalScale={6}
                      />
                    )}
                  </div>
                </div>
              )}

              {!address && !metamaskAddress && (
                <Text className={styles.connect}>Connect wallet</Text>
              )}
            </RequireAuthButton>
            {renderLink(
              '/bridge',
              'Bridge',
              setLink,
              <Wallet style={{ width: 30, height: 30 }} />
            )}
            {renderLink(
              '/swap',
              'Swap',
              setLink,
              <Swap style={{ width: 30, height: 30 }} />
            )}
            {renderLink(
              '/pools',
              'Pools',
              setLink,
              <Pools style={{ width: 30, height: 30 }} />
            )}
            {renderLink(
              'https://info.oraidex.io/',
              'Info',
              () => {},
              <InfoIcon style={{ width: 30, height: 30 }} />,
              true
            )}
            {renderLink(
              'https://payment.orai.io/',
              'Buy ORAI (Fiat)',
              () => {},
              <BuyFiat style={{ width: 30, height: 30 }} />,
              true
            )}
          </div>
        </div>

        <div>
          <div className={styles.menu_themes}>
            <Button
              className={classNames(styles.menu_theme, {
                [styles.active]: theme === 'dark'
              })}
              onClick={() => {
                setTheme('dark');
              }}
            >
              <Dark style={{ width: 15, height: 15 }} />
              <Text className={styles.menu_theme_text}>Dark</Text>
            </Button>
            <Button
              className={classNames(styles.menu_theme, {
                [styles.active]: theme === 'light'
              })}
              onClick={() => {
                setTheme('light');
              }}
            >
              <Light style={{ width: 15, height: 15 }} />
              <Text className={styles.menu_theme_text}>Light</Text>
            </Button>
          </div>

          <div className={styles.menu_footer}>
            © 2020 - 2023 Oraichain Foundation
          </div>
        </div>
      </div>
    </>
  );
});

export default memo(Menu);

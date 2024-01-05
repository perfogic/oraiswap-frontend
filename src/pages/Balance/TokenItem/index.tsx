import classNames from 'classnames';
import styles from './index.module.scss';
import TokenBalance from 'components/TokenBalance';
import TransferConvertToken from '../TransferConvertToken';
import { TokenItemType } from '@oraichain/oraidex-common';
import { tokensIcon } from 'config/chainInfos';
interface TokenItemProps {
  token: TokenItemType;
  amountDetail?: { amount: string; usd: number };
  name?: string;
  onClickTransfer: any;
  active: Boolean;
  className?: string;
  onClick?: Function;
  onBlur?: Function;
  convertKwt?: any;
  subAmounts?: AmountDetails;
  theme?: string;
}

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  amountDetail,
  active,
  className,
  onClick,
  onClickTransfer,
  convertKwt,
  subAmounts,
  theme
}) => {
  const tokenIcon = tokensIcon.find((tokenIcon) => tokenIcon.coinGeckoId === token.coinGeckoId);
  return (
    <div
      className={classNames(styles.tokenWrapper, styles[theme], { [styles.active]: active }, className)}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <div className={styles.balanceAmountInfo}>
        <div className={styles.token}>
          {theme === 'light' ? (
            <tokenIcon.IconLight className={styles.tokenIcon} />
          ) : (
            <tokenIcon.Icon className={styles.tokenIcon} />
          )}
          <div className={styles.tokenInfo}>
            <div className={classNames(styles.tokenName, styles[theme])}>{token.name}</div>
          </div>
        </div>
        <div className={styles.tokenBalance}>
          <div className={styles.row}>
            <TokenBalance
              balance={{
                amount: amountDetail.amount ?? '0',
                denom: '',
                decimals: token.decimals
              }}
              className={classNames(styles.tokenAmount, styles[theme])}
              decimalScale={Math.min(6, token.decimals)}
            />
          </div>
          <TokenBalance balance={amountDetail.usd} className={styles.subLabel} decimalScale={2} />
        </div>
      </div>
      <div>
        {active && (
          <TransferConvertToken
            token={token}
            subAmounts={subAmounts}
            amountDetail={amountDetail}
            onClickTransfer={onClickTransfer}
            convertKwt={convertKwt}
          />
        )}
      </div>
    </div>
  );
};

export default TokenItem;

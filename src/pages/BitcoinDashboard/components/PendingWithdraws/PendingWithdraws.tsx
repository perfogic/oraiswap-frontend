import { toDisplay } from '@oraichain/oraidex-common';
import { FallbackEmptyData } from 'components/FallbackEmptyData';
import { Table, TableHeaderProps } from 'components/Table';
import useConfigReducer from 'hooks/useConfigReducer';
import styles from './PendingWithdraw.module.scss';
import { ReactComponent as DefaultIcon } from 'assets/icons/tokens.svg';
import { ReactComponent as BitcoinIcon } from 'assets/icons/bitcoin.svg';
import { ReactComponent as OraiDarkIcon } from 'assets/icons/oraichain.svg';
import { ReactComponent as OraiLightIcon } from 'assets/icons/oraichain_light.svg';
import { TransactionParsedOutput } from 'pages/BitcoinDashboard/@types';
import { useGetCheckpointData, useGetCheckpointQueue } from 'pages/BitcoinDashboard/hooks';

type Icons = {
  Light: any;
  Dark: any;
};

const tokens = {
  bitcoin: {
    Light: BitcoinIcon,
    Dark: BitcoinIcon
  } as Icons,
  oraichain: {
    Light: OraiLightIcon,
    Dark: OraiDarkIcon
  } as Icons
};

export const PendingWithdraws: React.FC<{}> = ({}) => {
  const [theme] = useConfigReducer('theme');
  const btcAddress = useConfigReducer('btcAddress');
  const checkpointQueue = useGetCheckpointQueue();
  const checkpointData = useGetCheckpointData(checkpointQueue?.index);
  const allOutputs = checkpointData?.transaction.data.output || [];
  const data = allOutputs.filter((item) => item.address == btcAddress[0]);

  const generateIcon = (baseToken: Icons, quoteToken: Icons): JSX.Element => {
    let [BaseTokenIcon, QuoteTokenIcon] = [DefaultIcon, DefaultIcon];

    if (baseToken) BaseTokenIcon = theme === 'light' ? baseToken.Light : baseToken.Dark;
    if (quoteToken) QuoteTokenIcon = theme === 'light' ? quoteToken.Light : quoteToken.Dark;

    return (
      <div className={styles.symbols}>
        <BaseTokenIcon className={styles.symbols_logo_left} />
        <QuoteTokenIcon className={styles.symbols_logo_right} />
      </div>
    );
  };

  const handleNavigate = (txid: String) => {
    window.open(`https://blockstream.info/address/${txid}`, '_blank');
  };

  const headers: TableHeaderProps<TransactionParsedOutput> = {
    flow: {
      name: 'Flow',
      accessor: (_) => (
        <div className={styles.symbols}>
          <div className={styles.symbols_logo}>{generateIcon(tokens.oraichain, tokens.bitcoin)}</div>
        </div>
      ),
      width: '12%',
      align: 'left'
    },
    address: {
      name: 'Address',
      width: '60%',
      accessor: (data) => (
        <div onClick={() => handleNavigate(data.address)}>
          <span>{`${data.address}`}</span>
        </div>
      ),
      sortField: 'address',
      align: 'left'
    },
    amount: {
      name: 'Amount',
      width: '21%',
      align: 'right',
      sortField: 'value',
      accessor: (data) => <span>{toDisplay(BigInt(data.value || 0), 8)} BTC</span>
    }
  };

  return (
    <div className={styles.pending_withdraws}>
      <h2 className={styles.pending_withdraws_title}>Pending Withdraws:</h2>
      <div className={styles.pending_withdraws_list}>
        {(data?.length || 0) > 0 ? (
          <Table headers={headers} data={data} defaultSorted="address" />
        ) : (
          <FallbackEmptyData />
        )}
      </div>
    </div>
  );
};
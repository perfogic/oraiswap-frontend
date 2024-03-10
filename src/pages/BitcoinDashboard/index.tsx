import React from 'react';
import { Header } from './components/Header';
import Content from 'layouts/Content';
import styles from './index.module.scss';
import Checkpoint from './components/Checkpoint/Checkpoint';

const BitcoinDashboard: React.FC<{}> = () => {
  return (
    <Content nonBackground otherBackground>
      <div className={styles.container}>
        <Header />
        <Checkpoint />
      </div>
    </Content>
  );
};

export default BitcoinDashboard;

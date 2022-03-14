//@ts-nocheck
import { Button } from 'antd';
import React, { useState } from 'react';
import ConnectWalletModal from './ConnectWalletModal';

const RequireAuthButton: React.FC<any> = ({
  address,
  setAddress,
  ...props
}) => {
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const onClick = () => {
    if (address) return;
    setOpenConnectWalletModal(true);
    // if (!isLoggedIn()) setOpenConnectWalletModal(true);
    // else props.onClick && props.onClick();
  };

  return (
    <React.Fragment>
      <Button {...props} onClick={onClick}>
        {props.children}
      </Button>
      {openConnectWalletModal && (
        <ConnectWalletModal
          setAddress={setAddress}
          isOpen={openConnectWalletModal}
          close={() => {
            setOpenConnectWalletModal(false);
          }}
          open={() => {
            setOpenConnectWalletModal(true);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default RequireAuthButton;
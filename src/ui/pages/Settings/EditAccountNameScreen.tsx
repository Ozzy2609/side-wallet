import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Account } from '@/shared/types';
import { Button, Column, Header, Input, Layout, Text } from '@/ui/components';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useWallet } from '@/ui/utils';

export default function EditAccountNameScreen() {
  const { t } = useTranslation();

  const { state } = useLocation();
  const { account } = state as {
    account: Account;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState('');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newAccount = await wallet.setAccountAlianName(account, alianName);
    dispatch(keyringsActions.updateAccountName(newAccount));
    dispatch(accountActions.updateAccountName(newAccount));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  const validName = useMemo(() => {
    if (alianName.length == 0) {
      return false;
    }
    return true;
  }, [alianName]);
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Change Account Name"
      />
      <Column
        style={{
          flex: 1,
          padding: '0 16px 24px',
          marginTop: '16px'
        }}
      >
        <Column style={{ flex: 1, gap: '8px' }}>
          <Text
            text="New Account Name"
            color="white"
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '24px'
            }}
          />
          <Input
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e)}
            autoFocus={true}
          />
        </Column>
        <Button
          disabled={!validName}
          text="Save"
          preset="primary"
          onClick={(e) => {
            handleOnClick();
          }}
        />
      </Column>
    </Layout>
  );
}

import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { CHAINS_ENUM } from '@/shared/constant';
import { BalanceItem } from '@/shared/types';
import { Column, Content, Header, Icon, Image, Input, Layout, Row, Text } from '@/ui/components';
import ImageIcon from '@/ui/components/ImageIcon';
import useGetBitcoinBalanceList from '@/ui/hooks/useGetBitcoinBalanceList';
import { useGetSideBalanceList } from '@/ui/hooks/useGetSideBalanceList';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useResetUiTxCreateScreen } from '@/ui/state/ui/hooks';

import { useNavigate } from '../MainRoute';

function BtcItem({ token }: { token: BalanceItem }) {
  return (
    <>
      <Row>
        <Image className={'rounded-full'} src={token.asset.logo} size={38}></Image>
        <Column
          style={{
            gap: '0px'
          }}>
          <Text preset="regular" text={token.asset.symbol}></Text>
          <Text preset="sub" text={token.asset.name}></Text>
        </Column>
      </Row>

      <Column
        style={{
          gap: '0px'
        }}>
        <Text preset="regular" textEnd text={token.formatAmount}></Text>
        <Text preset="sub" textEnd text={`$${token.totalValue}`}></Text>
      </Column>
    </>
  );
}

function BitAndRuneCrypto({ searchTerm }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { chain, type } = state as {
    chain: CHAINS_ENUM;
    type: 'receive' | 'send';
  };
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();

  const currentAccount = useCurrentAccount();
  let { balanceList } = useGetBitcoinBalanceList(currentAccount?.address);
  balanceList = balanceList.filter((item) => {
    return (
      item.asset.symbol.toLocaleLowerCase().includes(searchTerm.trim()) ||
      item.asset.name.toLocaleLowerCase().includes(searchTerm.trim())
    );
  });

  return (
    <>
      {balanceList.map((token, index) => {
        return (
          <Row
            classname={'bg-item-hover'}
            onClick={() => {
              if (type === 'receive') {
                navigate('SelectAddressScreen', { ...state, token });
              } else {
                resetUiTxCreateScreen();
                navigate('TxCreateScreen', { ...state, token });
              }
            }}
            full
            key={token?.asset.symbol + index}
            justifyBetween
            style={{
              cursor: 'pointer',
              margin: '0 16px',
              padding: '10px 16px',
              height: '44px'
            }}>
            <BtcItem token={token} />
          </Row>
        );
      })}
    </>
  );
}

function SideCryptoItem({ token }: { token: BalanceItem }) {
  return (
    <>
      <Row classname={'bg-item-hover'}>
        <ImageIcon
          url={token?.asset?.logo}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%'
          }}
        />
        <Column
          style={{
            gap: '0px'
          }}>
          <Text preset="regular" text={token?.asset?.symbol}></Text>
          <Text preset="sub" text={token?.asset?.name}></Text>
        </Column>
      </Row>

      <Column
        style={{
          gap: '0px'
        }}>
        <Text preset="regular" textEnd text={token?.formatAmount}></Text>
        <Text preset="sub" textEnd text={`$${token?.totalValue}`}></Text>
      </Column>
    </>
  );
}

function SideCrypto({ searchTerm }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { chain, type } = state as {
    chain: CHAINS_ENUM;
    type: 'receive' | 'send';
  };
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();
  const currentAccount = useCurrentAccount();
  let { balanceList } = useGetSideBalanceList(currentAccount?.address);
  balanceList = balanceList.filter((item) => {
    return (
      item.asset.symbol.toLocaleLowerCase().includes(searchTerm.trim()) ||
      item.asset.name.toLocaleLowerCase().includes(searchTerm.trim())
    );
  });

  return (
    <>
      {balanceList.map((token) => {
        return (
          <Row
            classname={'bg-item-hover'}
            onClick={() => {
              if (type === 'receive') {
                navigate('SelectAddressScreen', { chain, token });
              } else {
                resetUiTxCreateScreen();
                navigate('TxCreateScreen', { chain, token });
              }
            }}
            full
            key={token.asset.symbol + token.asset.name}
            justifyBetween
            style={{
              margin: '0 16px',
              cursor: 'pointer',
              padding: '10px 16px',
              height: '44px'
            }}>
            <SideCryptoItem token={token} />
          </Row>
        );
      })}
    </>
  );
}

export default function SelecCryptoScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const { state } = useLocation();
  const { chain } = state as {
    chain: CHAINS_ENUM;
  };
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Select crypto"
      />
      <Content
        style={{
          backgroundColor: '#09090A',
          padding: 0,
          marginTop: '16px'
        }}>
        <Column
          style={{
            padding: '0 16px'
            // margin: '0 16px'
          }}>
          <div
            className={`border-[1px] border-solid px-[10px] flex items-center rounded-[10px] bg-[#1E1E1F] relative gap-[8px] ${
              isFocus ? 'border-white' : ' border-[#ffffff20] hover:border-[#ffffff50]'
            }`}>
            <Icon icon="search" color={'search_icon'} size={20}></Icon>
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value.trim());
              }}
              onFocus={() => {
                setIsFocus(true);
              }}
              onBlur={() => {
                setIsFocus(false);
              }}
              containerStyle={{
                width: '100%',
                border: 'none',
                padding: '0'
              }}
              placeholder="Search crypto"
            />
            <div
              onClick={() => {
                setSearchTerm('');
              }}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                display: searchTerm ? 'block' : 'none'
              }}>
              <Icon icon="clear" color={isHover ? 'white' : 'search_icon'} size={20}></Icon>
            </div>
          </div>
        </Column>

        <Column>
          {chain === CHAINS_ENUM.SIDE ? (
            <SideCrypto searchTerm={searchTerm} />
          ) : (
            <BitAndRuneCrypto searchTerm={searchTerm} />
          )}
        </Column>
      </Content>
    </Layout>
  );
}

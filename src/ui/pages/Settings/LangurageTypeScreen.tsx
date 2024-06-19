import { Card, Column, Content, Header, Icon, Layout, Row, Text } from '@/ui/components';

export default function LanguageTypeScreen() {
  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="Language"
      />
      <Content>
        <Column>
          <Card preset="styleChecked">
            <Row full justifyBetween itemsCenter>
              <Row itemsCenter>
                <Text text={'Automatic (Browser default)'} preset="regular-bold" />
              </Row>
              <Column>
                <Icon icon="check-box" />
              </Column>
            </Row>
          </Card>

          <Card preset="styleNotCheck">
            <Row full justifyBetween itemsCenter>
              <Row itemsCenter>
                <Text text={'English'} preset="regular-bold" />
              </Row>
            </Row>
          </Card>
        </Column>
      </Content>
    </Layout>
  );
}

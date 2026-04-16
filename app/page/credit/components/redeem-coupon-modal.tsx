import { Button, Card, Col, Flex, Form, Input, Modal, Row, Space, Tabs, Typography } from "antd";
import type { FormInstance } from "antd";
import { CreditCard, History, Sparkles, Ticket } from "lucide-react";
import { FC, useState } from "react";
import { RiseOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import useResponsive from "@/app/hooks/useResponsive";
import TransactionHistory from "./transaction-history";

interface ColorModalProps {
  open: boolean;
  form: FormInstance;
  handleOk: () => void;
  handleFinish: (values: { couponCode: string }) => Promise<void> | void;
  confirmLoading: boolean;
  handleCancel: () => void;
}


const RedeemCouponModal: FC<ColorModalProps> = ({
  open,
  form,
  handleOk,
  handleFinish,
  confirmLoading,
  handleCancel,
}) => {
const { Text } = Typography;
const { mode } = useThemeMode();
const semantic = getThemeConfig(mode).token ?? {};
const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("1");
  const ItemTab = [{ label: "Redeem Coupon", icon: <Ticket size={16} /> }, { label: "Credit History", icon: <History size={16} /> }];

  const tabItems = ItemTab.map((tab, i) => {
    const id = String(i + 1);
    return {
      key: id,
      label: (
        <Space size={6}>
          {tab.icon}
          <span>{tab.label}</span>
        </Space>
      ),
      children: id === "1" ? (
        <Space direction="vertical" style={{width: "100%"}}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
  <Form.Item
    label="Coupon Code"
    name="couponCode"
    rules={[{ required: true, message: "Please enter a coupon code!" }]}
  >
    <Flex gap={8}>
      <Input
        prefix={<Ticket size={16} />}
        placeholder="ENTER-CODE-HERE"
      />
      <Button loading={confirmLoading} icon={<Sparkles size={16}/>} type="primary" htmlType="submit">
        Redeem
      </Button>
    </Flex>
  </Form.Item>
</Form>
        <Card>
          <Space direction="vertical" size={12}>
            <Text type="secondary">How to get coupon codes</Text>
            <Text type="secondary">📧 Check your email for promotional offers</Text>
            <Text type="secondary">👥 Ask your organization admin for an internal code</Text>
            <Text type="secondary">🤝 Partnership codes from our reseller partners</Text>
          </Space>
          </Card>
          </Space>
      ) : (
        <TransactionHistory size="compact" />
      ),
    };
  });
  
    return (
     
       <Modal
        title={<Space><CreditCard />Credit Management</Space>}  
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Text>Redeem coupons or view your credit history</Text>
      
          <Card>
            <Row gutter={16} justify={"space-between"} align={"middle"}>
              <Col>
                <Space direction="vertical" size={0}>
                <Text>Current Balance</Text>
                <Text color={semantic.colorPrimary} style={{fontSize: isMobile ? 24 : 32,}}>5,090</Text>
                <Text>credits</Text></Space>
              </Col>
              <Col>
                <Space direction="vertical" size={8} align="end" >
                <Text   style={{
                  color: semantic.colorSuccess,
                  fontSize: 12,
                }}>
                <RiseOutlined
                  />
                  +3000 earned
                </Text>
                <Text>
                  -635 spent
                </Text>
                <Text style={{ color: semantic.colorError}}>
                  Expires 2026-06-30
                  </Text>
                </Space>
              </Col>
            </Row>
        </Card>
         <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Modal>
     
    );
}
export default RedeemCouponModal;
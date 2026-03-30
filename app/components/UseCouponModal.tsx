import { Form, Input, Modal } from "antd";
interface props {
  isCouponModalOpen: boolean;
  setIsCouponModalOpen: (isOpen: boolean) => void;
  handleCouponSubmit: (values: { code: string }) => void;
  couponLoading: boolean;
}
export default function UseCouponModal({
  isCouponModalOpen,
  setIsCouponModalOpen,
  handleCouponSubmit,
  couponLoading,
}: props) {
  const [form] = Form.useForm();
  return (
    <Modal
      title="Use Coupon"
      open={isCouponModalOpen}
      onCancel={() => {
        form.resetFields();
        setIsCouponModalOpen(false);
      }}
      onOk={() => form.submit()}
      confirmLoading={couponLoading}
      destroyOnHidden
    >
      <Form form={form} onFinish={handleCouponSubmit} layout="vertical">
        <Form.Item
          name="code"
          label="Coupon Code"
          rules={[{ required: true, message: "Please input coupon code!" }]}
        >
          <Input placeholder="Enter your coupon code here" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

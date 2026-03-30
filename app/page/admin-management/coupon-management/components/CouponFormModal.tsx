import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Flex,
  Button,
  Space,
} from "antd";
import { ICouponCode } from "@/app/common/coupon.type";
import dayjs from "dayjs";
import { Dices } from "lucide-react";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (values: any) => void;
  initialValues?: ICouponCode;
  loading: boolean;
  isEdit?: boolean;
}

const CouponFormModal: React.FC<Props> = ({
  visible,
  onCancel,
  onConfirm,
  initialValues,
  loading,
  isEdit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          expiresAt: initialValues.expiresAt
            ? dayjs(initialValues.expiresAt)
            : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onConfirm(values);
    });
  };

  return (
    <Modal
      title={isEdit ? "Edit Coupon" : "Create Coupon"}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      centered
      width={600}
    >
      <Form form={form} layout="vertical" disabled={loading}>
        <div  className=" grid grid-cols-2 gap-4">
          <Space>
            <Form.Item
              name="code"
              label="Coupon Code"
              rules={[{ required: true, message: "Please input coupon code!" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Enter coupon code" disabled={isEdit} />
            </Form.Item>
            <Button size="small"
              onClick={() => {
                const code = crypto.randomUUID();
                form.setFieldValue("code", code.toUpperCase());
              }}
            >
              <Dices size={14} />
            </Button>
          </Space>

          <Form.Item
            name="onTopCredit"
            label="OnTop Credit"
            rules={[{ required: true, message: "Please input credit!" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Enter credit"
              min={0}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <Flex gap={16}>
          <Form.Item
            name="expiresAt"
            label="Expiration Date"
            rules={[
              { required: true, message: "Please select expiration date!" },
            ]}
            style={{ flex: 1 }}
          >
            <DatePicker  style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="usageLimit"
            label="Usage Limit"
            rules={[{ required: true, message: "Please input usage limit!" }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="Enter limit"
              min={1}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Flex>

        <Form.Item
          name="fixOrganizationId"
          label="Fixed Organization ID (Optional)"
        >
          <Input placeholder="Enter organization ID" />
        </Form.Item>

        {isEdit && (
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
              <Select.Option value="EXPIRED">EXPIRED</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CouponFormModal;

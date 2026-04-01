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
  loading: boolean;
}

const CouponGroupFormModal: React.FC<Props> = ({
  visible,
  onCancel,
  onConfirm,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onConfirm(values);
    });
  };

  return (
    <Modal
      title={"Create Coupon Group"}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      centered
      width={600}
    >
      <Form form={form} layout="vertical" disabled={loading}>
        <div className=" grid grid-cols-2 gap-4">
          <Form.Item
            name="referenceTag"
            label="Tag"
            rules={[{ required: true, message: "Please input Tag" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Enter tag" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please input amount" }]}
            style={{ flex: 1 }}
          >
            <InputNumber placeholder="Enter amount" style={{ width: "100%" }} />
          </Form.Item>
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
          <Form.Item
            name="expiresAt"
            label="Expiration Date"
            rules={[
              { required: true, message: "Please select expiration date!" },
            ]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: "100%" }} />
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
          </Form.Item>{" "}
          <Form.Item
            name="fixOrganizationId"
            label="Fixed Organization ID (Optional)"
          >
            <Input placeholder="Enter organization ID" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CouponGroupFormModal;

import React, { useState } from "react";
import { Modal, Form, Input, Select, Space } from "antd";

interface TypoModalProps {
  open: boolean;
  form: any;
  onOk: () => void;
  onCancel: () => void;
}

const TypoModal: React.FC<TypoModalProps> = ({ open, form, onOk, onCancel }) => {
  return (
    <Modal
      title="Add Font"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Add"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Font Name"
          name="name"
          rules={[{ required: true, message: 'Please input font name!' }]}
        >
          <Input placeholder="Poppins" />
        </Form.Item>
        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select type!' }]}
        >
          <Select placeholder="Select type">
            <Select.Option value="heading">Heading</Select.Option>
            <Select.Option value="body">Body</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Weight"
          name="weight"
          rules={[{ required: true, message: 'Please input weight!' }]}
        >
          <Input type="number" placeholder="700" min={100} max={900} step={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TypoModal;

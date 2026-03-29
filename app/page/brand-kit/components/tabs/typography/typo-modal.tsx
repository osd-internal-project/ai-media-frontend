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
            <Select.Option value="heading1">Heading1</Select.Option>
            <Select.Option value="heading2">Heading2</Select.Option>
            <Select.Option value="heading3">Heading3</Select.Option>
            <Select.Option value="heading4">Heading4</Select.Option>
            <Select.Option value="heading5">Heading5</Select.Option>
            <Select.Option value="heading6">Heading6</Select.Option>
            <Select.Option value="body">Body</Select.Option>
            <Select.Option value="caption">Caption</Select.Option>
            <Select.Option value="paragraph">Paragraph</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Weight"
          name="weight"
          rules={[{ required: true, message: 'Please input weight!' }]}
        >
          <Input type="number" placeholder="700" min={100} max={900} step={100} />
        </Form.Item>
        {/* Preview is auto-generated, not user input */}
      </Form>
    </Modal>
  );
};

export default TypoModal;

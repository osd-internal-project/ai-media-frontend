import React, { useState } from "react";
import { Modal, Form, Input, Select, Space } from "antd";

interface ColorModalProps {
  open: boolean;
  form: any;
  onOk: () => void;
  onCancel: () => void;
}


const ColorModal: React.FC<ColorModalProps> = ({ open, form, onOk, onCancel }) => {
  const [hexValue, setHexValue] = useState<string>("");

  // Sync with form value when modal opens or form resets
  React.useEffect(() => {
    if (open) {
      setHexValue(form.getFieldValue("hex") || "");
    }
  }, [open, form]);

  return (
    <Modal
      title="Add Color"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Add"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
       
<Form.Item
  label="Hex Value"
  required
  style={{ marginBottom: 16 }}
>
  <div style={{ display: "flex", flexDirection: "column" }}>
    
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Preview */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          border: "1px solid #2b3442",
          background:
            hexValue && /^#([0-9A-Fa-f]{6})$/.test(hexValue)
              ? hexValue
              : "#1e293b",
          flexShrink: 0,
        }}
      />

      {/* Input */}
      <Form.Item
        name="hex"
        noStyle
        rules={[{ required: true, message: "Please input hex value!" }]}
      >
        <Input
          placeholder="#6F6ADE"
          maxLength={7}
          value={hexValue}
          onChange={(e) => {
            setHexValue(e.target.value);
            form.setFieldsValue({ hex: e.target.value });
          }}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 10,
          }}
        />
      </Form.Item>
    </div>

  </div>
</Form.Item>
        <Form.Item
          label="Color Name"
          name="name"
          rules={[{ required: true, message: 'Please input color name!' }]}
        >
          <Input placeholder="Color Name" />
        </Form.Item>
        <Form.Item
          label="Category"
          name="type"
          rules={[{ required: true, message: 'Please select category!' }]}
        >
          <Select placeholder="Select category">
            <Select.Option value="primary">Primary</Select.Option>
            <Select.Option value="secondary">Secondary</Select.Option>
            <Select.Option value="accent">Accent</Select.Option>
            <Select.Option value="neutral">Neutral</Select.Option>
            <Select.Option value="background">Background</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ColorModal;

"use client";

import React from "react";
import { Form, Input } from "antd";

const { TextArea } = Input;

interface WorkflowPromptProps {
  semantic: Record<string, unknown>;
  fieldName?: string;
  placeholder?: string;
  requiredMessage?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

/**
 * Minimal prompt field for the workflow edit form — a plain form-bound
 * textarea with no title bar, AI-assist button, or character counter.
 */
const WorkflowPrompt: React.FC<WorkflowPromptProps> = ({
  semantic,
  fieldName = "prompt",
  placeholder = "Describe what you want to create...",
  requiredMessage = "Please enter your prompt",
  required = true,
  rows = 3,
  maxLength = 2000,
}) => {
  const colorBgElevated = semantic.colorBgElevated as string;
  const colorTextBase = semantic.colorTextBase as string;
  const colorBorder = semantic.colorBorder as string;

  return (
    <Form.Item
      name={fieldName}
      style={{ margin: 0 }}
      rules={[{ required, message: requiredMessage }]}
    >
      <TextArea
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        style={{
          width: "100%",
          resize: "none",
          backgroundColor: colorBgElevated,
          color: colorTextBase,
          padding: 10,
          borderRadius: 8,
          borderColor: colorBorder,
        }}
      />
    </Form.Item>
  );
};

export default WorkflowPrompt;

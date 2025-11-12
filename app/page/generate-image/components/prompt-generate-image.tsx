import type { ITFromGenerate } from "@/app/common";
import { Form, Input, type FormInstance } from "antd";
import React, { type FC, type ReactElement } from "react";

export interface props {
  formcreateImage: FormInstance;
  onFinish: (values: ITFromGenerate) => void;
}

const PromptGenerateImage: FC<props> = ({ formcreateImage, onFinish }): ReactElement => {
  return (
    <div>
      <Form
        form={formcreateImage}
        name="form-generate"
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ type: "image" }}
        className="space-y-6">
        <Form.Item<ITFromGenerate> name={`type`} hidden>
          <Input />
        </Form.Item>

        <Form.Item></Form.Item>
        <Form.Item></Form.Item>
      </Form>
    </div>
  );
};

export default PromptGenerateImage;

"use client";

import React, { type FC } from "react";
import { Breadcrumb, Form } from "antd";
import PromptGenerateImage from "./components/prompt-generate-image";
import type { ITFromGenerate } from "@/app/common";

const GenerateImagePage: FC = () => {
  const [formcreateImage] = Form.useForm();

  const onFinish = (values: ITFromGenerate) => {};

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: "Home",
            href: "/page/dashboard",
          },
          {
            title: "Generate Image",
            href: "/page/generate-image",
          },
        ]}
      />
      <div>{`AI Image Generator`}</div>
      <span>{`เขียน Prompt เพื่อสร้างรูปภาพในรูปแบบของคุณด้วยพลังของ AI`}</span>
      <div>
        <PromptGenerateImage formcreateImage={formcreateImage} onFinish={onFinish} />
      </div>
    </div>
  );
};
export default GenerateImagePage;

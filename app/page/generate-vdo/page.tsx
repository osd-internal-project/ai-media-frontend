"use client";

import React, { useState, type FC } from "react";
import { Form, message, type UploadFile } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import type { ITFromGenerate } from "@/app/common";
import type { RcFile, UploadProps } from "antd/es/upload";
import PromptGenerateVdo from "./components/prompt-generate-vdo";

const GenerateImagePage: FC = () => {
  const [formcreateImage] = Form.useForm();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const onFinish = (values: ITFromGenerate) => {};

  const beforeUploadFiles = (file: RcFile) => {
    if (files.find((oneFile) => oneFile.name === file.name)) {
      message.warning(`ชื่อไฟล์ ${file.name} ซ้ำ`);
      return false;
    }
    return false;
  };

  const handleChangeFiles: UploadProps["onChange"] = async ({ fileList: newFileList }) => {
    return setFiles(newFileList);
  };

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 top-0 -right-20"></div>
        <div className="absolute w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 bottom-0 left-1/2"></div>
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 px-4 md:px-20 py-8">
        <nav className="flex items-center space-x-2 text-purple-300 mb-8">
          <a href="/page/dashboard" className="flex items-center hover:text-purple-400 transition-colors">
            <HomeOutlined className="mr-1" />
            {`Home`}
          </a>
          <span className="text-purple-500">/</span>
          <a href="/page/generate-vdo" className="hover:text-purple-400 transition-colors">
            {`Generate VDO`}
          </a>
        </nav>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            {`AI Video Generator`}
          </h1>
          <p className="text-lg text-purple-300">{`เขียน Prompt เพื่อสร้างวีดีโอในรูปแบบของคุณด้วยพลังของ AI`}</p>
        </div>
        <>
          <PromptGenerateVdo
            formcreateImage={formcreateImage}
            onFinish={onFinish}
            handleChangeFiles={handleChangeFiles}
            beforeUploadFiles={beforeUploadFiles}
            files={files}
          />
        </>
      </div>
    </div>
  );
};
export default GenerateImagePage;

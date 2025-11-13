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

      {/* <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 10px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .ant-input-textarea,
        .ant-input {
          background: rgba(109, 40, 217, 0.2) !important;
          border-color: rgba(192, 132, 252, 0.5) !important;
          color: white !important;
        }

        .ant-input-textarea::placeholder,
        .ant-input::placeholder {
          color: rgba(192, 132, 252, 0.5) !important;
        }

        .ant-input-textarea:hover,
        .ant-input:hover,
        .ant-input-textarea:focus,
        .ant-input:focus,
        .ant-input-textarea-focused,
        .ant-input-focused {
          border-color: rgba(192, 132, 252, 1) !important;
          box-shadow: 0 0 0 2px rgba(192, 132, 252, 0.2) !important;
          background: rgba(109, 40, 217, 0.3) !important;
        }

        .ant-form-item-label > label {
          color: rgba(216, 180, 254, 1) !important;
        }

        .upload-dark .ant-upload-select {
          background: rgba(109, 40, 217, 0.2) !important;
          border: 2px dashed rgba(192, 132, 252, 0.5) !important;
          border-radius: 12px !important;
          transition: all 0.3s !important;
          height: 150px !important;
        }

        .upload-dark .ant-upload-select:hover {
          border-color: rgba(192, 132, 252, 1) !important;
          background: rgba(109, 40, 217, 0.3) !important;
        }

        .upload-dark .ant-upload-list-item {
          background: rgba(109, 40, 217, 0.2) !important;
          border: 1px solid rgba(192, 132, 252, 0.3) !important;
          border-radius: 12px !important;
        }

        .upload-dark .ant-upload-list-item:hover {
          background: rgba(109, 40, 217, 0.3) !important;
        }

        .upload-dark .ant-upload-list-item-name {
          color: white !important;
        }

        .upload-dark .ant-upload-list-item-card-actions {
          opacity: 1 !important;
        }

        .upload-dark .ant-upload-list-item-thumbnail img {
          object-fit: cover !important;
        }

        .ant-form-item-explain-error {
          color: rgba(248, 113, 113, 1) !important;
        }

        .ant-btn-primary {
          background: linear-gradient(to right, rgb(168, 85, 247), rgb(99, 102, 241)) !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.3) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(to right, rgb(147, 51, 234), rgb(79, 70, 229)) !important;
          box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.5) !important;
          transform: translateY(-2px);
        }
      `}</style> */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 10px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .ant-input-textarea,
        .ant-input {
          background: rgba(109, 40, 217, 0.2) !important;
          border-color: rgba(192, 132, 252, 0.5) !important;
          color: white !important;
        }

        .ant-input-textarea::placeholder,
        .ant-input::placeholder {
          color: rgba(192, 132, 252, 0.5) !important;
        }

        .ant-input-textarea:hover,
        .ant-input:hover,
        .ant-input-textarea:focus,
        .ant-input:focus,
        .ant-input-textarea-focused,
        .ant-input-focused {
          border-color: rgba(192, 132, 252, 1) !important;
          box-shadow: 0 0 0 2px rgba(192, 132, 252, 0.2) !important;
          background: rgba(109, 40, 217, 0.3) !important;
        }

        .ant-form-item-label > label {
          color: rgba(216, 180, 254, 1) !important;
        }

        .upload-dark .ant-upload-select {
          background: rgba(109, 40, 217, 0.2) !important;
          border: 2px dashed rgba(192, 132, 252, 0.5) !important;
          border-radius: 12px !important;
          transition: all 0.3s !important;
          height: 150px !important;
        }

        .upload-dark .ant-upload-select:hover {
          border-color: rgba(192, 132, 252, 1) !important;
          background: rgba(109, 40, 217, 0.3) !important;
        }

        .upload-dark .ant-upload-list-item {
          background: rgba(109, 40, 217, 0.2) !important;
          border: 1px solid rgba(192, 132, 252, 0.3) !important;
          border-radius: 12px !important;
        }

        .upload-dark .ant-upload-list-item:hover {
          background: rgba(109, 40, 217, 0.3) !important;
        }

        .upload-dark .ant-upload-list-item-name {
          color: white !important;
        }

        .upload-dark .ant-upload-list-item-card-actions {
          opacity: 1 !important;
        }

        .upload-dark .ant-upload-list-item-thumbnail img {
          object-fit: cover !important;
        }

        .ant-form-item-explain-error {
          color: rgba(248, 113, 113, 1) !important;
        }

        .ant-btn-primary {
          background: linear-gradient(to right, rgb(168, 85, 247), rgb(99, 102, 241)) !important;
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.3) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(to right, rgb(147, 51, 234), rgb(79, 70, 229)) !important;
          box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.5) !important;
          transform: translateY(-2px);
        }

        /* Custom Radio Button Styles */
        .resolution-option,
        .duration-option,
        .ratio-option {
          background: rgba(109, 40, 217, 0.2);
          border: 2px solid rgba(192, 132, 252, 0.3);
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          color: rgba(216, 180, 254, 1);
          font-weight: 500;
          transition: all 0.3s;
        }

        .resolution-option:hover,
        .duration-option:hover,
        .ratio-option:hover {
          border-color: rgba(192, 132, 252, 0.6);
          background: rgba(109, 40, 217, 0.3);
        }

        input:checked + .resolution-option,
        input:checked + .duration-option,
        input:checked + .ratio-option {
          background: linear-gradient(to right, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.4));
          border-color: rgba(168, 85, 247, 1);
          color: white;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
        }
      `}</style>
    </div>
  );
};
export default GenerateImagePage;

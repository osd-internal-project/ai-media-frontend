"use client";

import React, { useState, type FC } from "react";
import { Form, message, Tabs, type UploadFile } from "antd";
import PromptGenerateImage from "./components/prompt-generate-image";
import { AppstoreOutlined, PictureOutlined } from "@ant-design/icons";
import type { ITFromGenerate } from "@/app/common";
import type { RcFile, UploadProps } from "antd/es/upload";
import GenerateImageServices from "@/app/services/generate-image.service";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";

const GenerateImagePage: FC = () => {
  const [formcreateImage] = Form.useForm();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [getdata, setData] = useState<any>([]);
  const [clicksubmit, setClickSubmit] = useState<boolean>(false);

  const onFinish = async (values: ITFromGenerate) => {
    let base: ITFromGenerate = values;
    setClickSubmit(true);
    setLoading(true);
    if (files.length > 0) {
      const formData: any = new FormData();
      formData.append("type", "create-attend");
      formData.append("files", files[0].originFileObj);
      const upload = await GenerateImageServices(axiosCore).upload(formData);
      base = { ...values, image: upload.fileName };
    }
    try {
      const response = await GenerateImageServices(axiosCore).create(base);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setData(response);
        message.success("สร้างคำขอสำเร็จ");
        formcreateImage.resetFields();
        setFiles([]);
      } else {
        message.error("ไม่มีข้อมูลที่ได้กลับมา");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

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

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <div>
        <HeaderGenerateImagePage />
      </div>
      <Tabs
        className="custom-tabs"
        type="card"
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: (
              <span>
                <PictureOutlined />
                Generator
              </span>
            ),
            children: (
              <PromptGenerateImage
                formcreateImage={formcreateImage}
                onFinish={onFinish}
                handleChangeFiles={handleChangeFiles}
                beforeUploadFiles={beforeUploadFiles}
                files={files}
                loading={loading}
                getdata={getdata}
                setData={setData}
                clicksubmit={clicksubmit}
              />
            ),
          },
          {
            key: "2",
            label: (
              <span>
                <AppstoreOutlined />
                Gallery
              </span>
            ),
            // children: {},
          },
        ]}
        onChange={onChange}
      />
      <style>{`
        .custom-tabs .ant-tabs-nav {
          margin-bottom: 0;
        }

        .custom-tabs .ant-tabs-nav::before {
          border-bottom: none;
        }

        .custom-tabs .ant-tabs-nav-wrap {
          background: #000000;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          padding: 8px 12px;
          display: inline-block;
        }

        .custom-tabs .ant-tabs-tab {
          background: transparent;
          border: none;
          color: #6b7280;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #9ca3af;
        }

        .custom-tabs .ant-tabs-tab-active {
          background: transparent;
        }

        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ffffff;
        }

        .custom-tabs .ant-tabs-ink-bar {
          background: #6366f1;
          height: 3px;
          border-radius: 3px 3px 0 0;
        }

        .custom-tabs .ant-tabs-tab .anticon {
          margin-right: 8px;
        }

        .custom-tabs .ant-tabs-content-holder {
          padding-top: 40px;
        }
      `}</style>
    </div>
  );
};
export default GenerateImagePage;

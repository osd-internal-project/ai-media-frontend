"use client";

import React, { useEffect, useState, type FC } from "react";
import { Tabs } from "antd";
import PromptGenerateImage from "./components/prompt-generate-image";
import { AppstoreOutlined, PictureOutlined } from "@ant-design/icons";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
import type { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { useParams } from "next/navigation";
import PromptGenerateVdo from "./components/prompt-generate-vdo";
import PromptLibrary from "./components/prompt-library";
import PromptActivity from "./components/prompt-activity";
import { useSession } from "next-auth/react";
const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const projectService = ProjectService(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const { id } = params as { id: string };

  useEffect(() => {
    if (loadingData) {
      fecthdata();
    }
  }, [loadingData]);

  const fecthdata = async () => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) {
      setLoadingData(false);
      return;
    }
    try {
      const response = await projectService.findById(id);
      setProject(response);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoadingData(false);
    }
  };
  const onChangeTab = (key: string) => {};

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <div>
        <HeaderGenerateImagePage getProject={getProject} />
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
                Image Gen.
              </span>
            ),
            children: <PromptGenerateImage projectId={id} userId={session?.user?.id} />,
          },
          {
            key: "2",
            label: (
              <span>
                <AppstoreOutlined />
                VDO Gen.
              </span>
            ),
            children: <PromptGenerateVdo projectId={id} userId={session?.user?.id} />,
          },
          {
            key: "4",
            label: (
              <span>
                <AppstoreOutlined />
                Library.
              </span>
            ),
            children: <PromptLibrary />,
          },
          {
            key: "5",
            label: (
              <span>
                <AppstoreOutlined />
                All Activity.
              </span>
            ),
            children: <PromptActivity />,
          },
        ]}
        onChange={onChangeTab}
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

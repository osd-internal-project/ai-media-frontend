"use client";
import React, { useEffect, useState, type FC } from "react";
import { Tabs } from "antd";
import PromptGenerateImage from "./components/prompt-generate-image";
import { axiosCore } from "@/app/lib/axios/axios";
import HeaderGenerateImagePage from "./components/header-generate-image";
import type { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import { useParams } from "next/navigation";
import PromptGenerateVdo from "./components/prompt-generate-vdo";
import { useSession } from "next-auth/react";
import { Image, Video, Folder, Folders } from "lucide-react";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";
import { TPromptGuideType } from "@/app/common/prompt-guide.type";
import ImageChat from "./components/image-chat";

const GenerateImagePage: FC = () => {
  const { data: session } = useSession();
  const params = useParams();
  const promptguideTypeService = PromptGuideTypeServices(axiosCore);
  const projectService = ProjectService(axiosCore);
  const [getProject, setProject] = useState<IProject>();
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [activeKey, setActiveKey] = useState<"image" | "vdo" | "test">("image");
  const [promptGuideTypes, setPromptGuideTypes] = useState<TPromptGuideType[]>(
    []
  );
  const { id } = params as { id: string };

  useEffect(() => {
    if (loadingData) {
      fecthdata();
      masterdata();
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

  const masterdata = async () => {
    const res = await promptguideTypeService.findAll();
    setPromptGuideTypes(res || []);
  };


  const onChangeTab = (key: "image" | "vdo") => {
    setActiveKey(key);
  };

  return (
    <div>
      <div>
        <HeaderGenerateImagePage getProject={getProject} />
      </div>
      <Tabs
        className="custom-tabs"
        type="card"
        activeKey={activeKey}
        onChange={(key) => onChangeTab(key as "image" | "vdo")}
        items={[
          {
            key: "image",
            label: (
              <span className="flex justify-center gap-2">
                <Image />
                <div>{`Image Gen`}</div>
              </span>
            ),
            children: <ImageChat key={`image`} activeKey={activeKey} projectId={id} userId={session?.user?.id} />,
          },
          {
            key: "vdo",
            label: (
              <span className="flex justify-center gap-2">
                <Video />
                <div>{`VDO Gen`}</div>
              </span>
            ),
            children: <PromptGenerateVdo key={`vdo`} activeKey={activeKey} promptGuideTypes={promptGuideTypes} projectId={id} userId={session?.user?.id} />,
          }
          // {
          //   key: "4",
          //   label: (
          //     <span className="flex justify-center gap-2">
          //       <Folder />
          //       <div>{`Library`}</div>
          //     </span>
          //   ),
          //   children: <PromptLibrary key={`library-${activeKey}`} />,
          // },
          // {
          //   key: "5",
          //   label: (
          //     <span className="flex justify-center gap-2">
          //       <Folders />
          //       <div>{`All Activity`}</div>
          //     </span>
          //   ),
          //   children: <PromptActivity key={`activity-${activeKey}`} />,
          // },
        ]}
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

      `}</style>
    </div>
  );
};

export default GenerateImagePage;

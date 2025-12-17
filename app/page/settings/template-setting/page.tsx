"use client";
import { TPromptGuideType } from "@/app/common/prompt-guide.type";
import { Form, Modal, Tabs } from "antd";
import React, { useEffect, useState, type FC, type ReactElement } from "react";

import PromptGuideComponent from "./components/prompt-guide";
import { axiosCore } from "@/app/lib/axios/axios";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";

const TemplateSettingPage: FC = (): ReactElement => {
  const [modal, contextHolder] = Modal.useModal();
  const promptguideServices = PromptGuideServices(axiosCore);
  const promptguideTypeServices = PromptGuideTypeServices(axiosCore);

  const [promptGuideForm] = Form.useForm();
  const [selectedPromptGuide, setSelectedPromptGuide] =
    useState<TPromptGuideType | null>(null);
  const [promptGuideTypes, setPromptGuideTypes] = useState<TPromptGuideType[]>(
    []
  );
  useEffect(() => {
    fetchPromptGuideTypes();
  }, []);

  const fetchPromptGuideTypes = async () => {
    const promptGuideTypes = await promptguideTypeServices.findAll();
    setPromptGuideTypes(promptGuideTypes);
  };

  const onSelectPromptGuide = async (id: number) => {
    const promptGuide = await promptguideServices.findById(String(id));
    setSelectedPromptGuide(promptGuide);
    promptGuideForm.setFieldsValue(promptGuide);
  };
  const onUpdatePromptGuide = async (
    values: TPromptGuideType
  ): Promise<void> => {
    const updatePromptGuide = await promptguideServices.update(
      values.id!,
      values
    );
    if (updatePromptGuide) {
      modal.success({
        title: "Success",
        content: "Update prompt guide successfully",
      });
    }
  };

  const tabItems = [
    {
      key: "prompt-templates",
      label: "Prompt Templates",
      children: (
        <PromptGuideComponent
          promptGuideTypes={promptGuideTypes}
          promptGuideForm={promptGuideForm}
          onSelectPromptGuide={onSelectPromptGuide}
          selectedPromptGuide={selectedPromptGuide}
          onUpdatePromptGuide={onUpdatePromptGuide}
        />
      ),
    },
  ];
  const onChangeTab = (key: string) => {
    if (key === "prompt-templates") {
      fetchPromptGuideTypes();
    }
  };

  return (
    <>
      {contextHolder}
      <Tabs
        defaultActiveKey="prompt-templates"
        items={tabItems}
        onChange={onChangeTab}
      />
    </>
  );
};

export default TemplateSettingPage;

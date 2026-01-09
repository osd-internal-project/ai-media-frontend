"use client";
import { TPromptGuideType } from "@/app/common/prompt-guide.type";
import { Form, Modal, Tabs } from "antd";
import React, { useEffect, useState, type FC, type ReactElement } from "react";

import PromptGuideComponent from "./components/prompt-guide";
import { axiosCore } from "@/app/lib/axios/axios";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import PromptGuideTypeServices from "@/app/services/prompt-guide-type.service";

import { useOrganization } from "@/app/context/OrganizationContext";
import { canManageTemplates } from "@/app/utils/permissions";

const TemplateSettingPage: FC = (): ReactElement => {
  const [modal, contextHolder] = Modal.useModal();
  const promptguideServices = PromptGuideServices(axiosCore);
  const promptguideTypeServices = PromptGuideTypeServices(axiosCore);
  const { organizationId, organizationRole } = useOrganization();
  
  const canManage = canManageTemplates(organizationRole || "");

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
    fetchPromptGuideTypes();
  };

  const onCreatePromptGuideType = async (values: any) => {
    if (!organizationId) return;
    try {
      await promptguideTypeServices.create({
        ...values,
        organizationId,
        status: true,
      });
      modal.success({ title: "Success", content: "Created prompt type" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const onDeletePromptGuideType = async (id: number) => {
    if (!organizationId) return;
    try {
      await promptguideTypeServices.del(id);
      modal.success({ title: "Success", content: "Deleted prompt type" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const onCreatePromptGuide = async (values: any) => {
    if (!organizationId) return;
    try {
      await promptguideServices.create({
        ...values,
        organizationId,
        status: true,
      });
      modal.success({ title: "Success", content: "Created prompt guide" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const onDeletePromptGuide = async (id: number) => {
    try {
      await promptguideServices.del(id);
      setSelectedPromptGuide(null);
      modal.success({ title: "Success", content: "Deleted prompt guide" });
      fetchPromptGuideTypes();
    } catch (e) {
      console.error(e);
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
          onCreatePromptGuideType={onCreatePromptGuideType}
          onDeletePromptGuideType={onDeletePromptGuideType}
          onCreatePromptGuide={onCreatePromptGuide}
          onDeletePromptGuide={onDeletePromptGuide}
          canManage={canManage}
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

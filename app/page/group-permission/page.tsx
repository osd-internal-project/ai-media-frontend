"use client";
import React, { useEffect, useState } from "react";
import ManageGroups from "./components/manage-groups";
import { axiosUser } from "@/app/lib/axios/axios";
import GroupsServices from "@/app/services/groups.service";
import { Form } from "antd";
import type { TGroup } from "@/app/common/groups.type";

const GroupPermissionPage = () => {
  const groupsServices = GroupsServices(axiosUser);
  const [open, setOpen] = useState<boolean>(false);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(true);
  const [dataGroups, setDataGroups] = useState<TGroup[]>([]);

  const [formmanage] = Form.useForm();

  useEffect(() => {
    if (loadingGroup) {
      fecthdataGroup();
    }
  }, [loadingGroup]);

  const fecthdataGroup = async () => {
    const response = await groupsServices.findAll();
    console.log(response);
    setDataGroups(response);
    setLoadingGroup(false);
  };
  const onFinish = async (values: TGroup) => {
    const response = await groupsServices.create(values);
    if (response) {
      formmanage.resetFields();
      setLoadingGroup(true);
      setOpen(false);
    }
  };
  return (
    <div>
      <div>{`Group List`}</div>
      <div>{`A group provided access to predefined menus and features so that depending on assigned role an administrator can have access to what he need`}</div>
      <ManageGroups setOpen={setOpen} open={open} formmanage={formmanage} onFinish={onFinish} dataGroups={dataGroups} />
    </div>
  );
};

export default GroupPermissionPage;

import { Card } from "antd";
import React, { type FC, type ReactElement } from "react";
import { FieldTimeOutlined, UserDeleteOutlined, UsergroupAddOutlined } from "@ant-design/icons";

export interface props {
  getSummary: { total: number; active: number; unabled: number; userGroup: number };
}

export const UsersSummaryPage: FC<props> = ({ getSummary }): ReactElement => {
  return (
    <div className="grid grid-cols-4 gap-8">
      <Card styles={{body:{padding: "8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[#9B9C9E]">{`Total Users`}</div>
          <div className="col col-span-1 flex justify-end text-[#9B9C9E]">
            <UsergroupAddOutlined className="text-[24px] " />
          </div>
        </div>
        <div className="text-[28px]">{`${getSummary.total}`}</div>
      </Card>
      <Card styles={{body:{padding: "8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[#9B9C9E]">{`Active Users`}</div>
          <div className="col col-span-1 flex justify-end text-[#9B9C9E]">
            <FieldTimeOutlined className="text-[24px] text-[#9B9C9E]" />
          </div>
        </div>
        <div className="text-[28px] text-[#4AC97E]">{`${getSummary.active}`}</div>
      </Card>
      <Card styles={{body:{padding: "8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[#9B9C9E]">{`Unabled`}</div>
          <div className="col col-span-1 flex justify-end text-[#9B9C9E] ">
            <UserDeleteOutlined className="text-[24px] " />
          </div>
        </div>
        <div className="text-[28px] text-[#D0302F]">{`${getSummary.unabled}`}</div>
      </Card>
      <Card styles={{body:{padding:"8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[#9B9C9E]">{`User group`}</div>
          <div className="col col-span-1 flex justify-end text-[#9B9C9E]">
            <UsergroupAddOutlined className="text-[24px] " />
          </div>
        </div>
        <div className="text-[28px]">{`${getSummary.userGroup}`}</div>
      </Card>
    </div>
  );
};

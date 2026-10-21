import { Card } from "antd";
import React, { type FC, type ReactElement } from "react";
import { FieldTimeOutlined, UserDeleteOutlined, UsergroupAddOutlined } from "@ant-design/icons";

export interface props {
  getSummary: { total: number; active: number; unabled: number; userGroup: number };
}

export const UsersSummaryPage: FC<props> = ({ getSummary }): ReactElement => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card styles={{body:{padding: "8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[var(--legacy-9b9c9e)]">{`Total Users`}</div>
          <div className="col col-span-1 flex justify-end text-[var(--legacy-9b9c9e)]">
            <UsergroupAddOutlined className="text-[24px] " />
          </div>
        </div>
        <div className="text-[28px]">{`${getSummary.total}`}</div>
      </Card>
      <Card styles={{body:{padding: "8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[var(--legacy-9b9c9e)]">{`Active Users`}</div>
          <div className="col col-span-1 flex justify-end text-[var(--legacy-9b9c9e)]">
            <FieldTimeOutlined className="text-[24px] text-[var(--legacy-9b9c9e)]" />
          </div>
        </div>
        <div className="text-[28px] text-[#4AC97E]">{`${getSummary.active}`}</div>
      </Card>
      <Card styles={{body:{padding: "8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[var(--legacy-9b9c9e)]">{`Unabled`}</div>
          <div className="col col-span-1 flex justify-end text-[var(--legacy-9b9c9e)] ">
            <UserDeleteOutlined className="text-[24px] " />
          </div>
        </div>
        <div className="text-[28px] text-[#D0302F]">{`${getSummary.unabled}`}</div>
      </Card>
      <Card styles={{body:{padding:"8px 16px"}}}>
        <div className="grid grid-cols-2 justify-between">
          <div className="col col-span-1 text-[16px] text-[var(--legacy-9b9c9e)]">{`User group`}</div>
          <div className="col col-span-1 flex justify-end text-[var(--legacy-9b9c9e)]">
            <UsergroupAddOutlined className="text-[24px] " />
          </div>
        </div>
        <div className="text-[28px]">{`${getSummary.userGroup}`}</div>
      </Card>
    </div>
  );
};

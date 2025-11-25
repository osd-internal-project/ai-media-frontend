"use client";
import React, { useEffect, useState, type FC } from "react";
import SummaryFilterComponent from "./components/summary-filter";
import { useForm } from "antd/es/form/Form";
import SummaryCardComponent from "./components/summary-card";
import { Col, ConfigProvider, Row } from "antd";
import TableFilterComponent from "./components/table-filter";
import TableComponent from "./components/table";
import { axiosCore } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import { useSession } from "next-auth/react";
const dataSource = Array.from({ length: 20 }, (_, i) => ({
  key: i + 1,
  owner: `Owner ${i + 1}`,
  product: `Product ${Math.ceil(Math.random() * 10)}`,
  usage: `${Math.ceil(Math.random() * 100)} units`,
  amount: `$${(Math.random() * 1000).toFixed(2)}`,
}));
const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const dashboardServices = DashboardServices(axiosCore);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchForm] = useForm();
  const [agentSearchForm] = useForm();

  useEffect(() => {
    if (loading) fecthdata();
  }, [loading]);

  const fecthdata = async () => {
    // const response = await dashboardServices.findAll(session?.user?.id);
    // console.log(response);
    setLoading(false);
  };

  function onSearch(value: Date): void {
    throw new Error("Function not implemented.");
  }

  function onSearchAgent(value: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <ConfigProvider
      theme={{
        token: { colorText: "#99a1af", colorBgContainer: "#2a2a2a" },
        components: {
          Card: {
            colorBorderSecondary: "none",
            colorBgContainer: "#000",
          },
        },
      }}
    >
      <div className=" w-full">
        <Row gutter={[8, 8]} className="">
          <Col span={24}>
            <SummaryFilterComponent searchForm={searchForm} onSearch={onSearch} />
          </Col>
          <Col span={24}>
            <SummaryCardComponent data={[]} />
          </Col>
          <Col span={24} className=" mt-5">
            <TableFilterComponent agentSearchForm={agentSearchForm} onSearchAgent={onSearchAgent} />
          </Col>
          <TableComponent data={dataSource} />
        </Row>
      </div>
    </ConfigProvider>
  );
};
export default DashboardPage;

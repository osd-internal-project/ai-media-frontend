"use client";
import React, { useEffect, useState, type FC } from "react";
import SummaryFilterComponent from "./components/summary-filter";
import { useForm } from "antd/es/form/Form";
import SummaryCardComponent from "./components/summary-card";
import { Col, ConfigProvider, Row, Tabs, type TabsProps } from "antd";
// import TableFilterComponent from "./components/table-filter";
import TableOwnerComponent from "./components/table-owner";
import { axiosCore } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import { useSession } from "next-auth/react";
import type { ITDashboard, ITDashboardOwner, ProductSummary } from "@/app/common/dashbaord";
import TableProductComponent from "./components/table-product";
const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const dashboardServices = DashboardServices(axiosCore);
  const [getdata, setData] = useState<ITDashboard>();
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryByOwner, setSummaryByOwner] = useState<ITDashboardOwner[]>([]);
  const [summaryByProduct, setSummaryByProduct] = useState<ProductSummary[]>([]);

  const [searchForm] = useForm();
  const [agentSearchForm] = useForm();

  useEffect(() => {
    if (loading) fecthdata();
  }, [loading, session]);

  const fecthdata = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummary(session?.user.id as string);
      setData(response);
      fectdataTableOwner();
      fectdataTableProduct();
      setLoading(false);
    }
  };
  const fectdataTableOwner = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummaryOwner(session?.user.id as string);
      setSummaryByOwner(response);
      setLoading(false);
    }
  };

  const fectdataTableProduct = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummaryProduct(session?.user.id as string);
      setSummaryByProduct(response);
      setLoading(false);
    }
  };

  function onSearch(value: Date): void {
    throw new Error("Function not implemented.");
  }

  function onSearchAgent(value: any): void {
    throw new Error("Function not implemented.");
  }

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Owner",
      children: (
        <>
          <TableOwnerComponent data={summaryByOwner} />
        </>
      ),
    },
    {
      key: "2",
      label: "Product",
      children: (
        <>
          <TableProductComponent data={summaryByProduct} />
        </>
      ),
    },
  ];

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
            <SummaryCardComponent getdata={getdata} session={session} />
          </Col>
          <Col span={24}>
            <Tabs defaultActiveKey="1" items={items} />
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};
export default DashboardPage;

"use client";
import React, { useEffect, useState, type FC } from "react";
import SummaryFilterComponent from "./components/summary-filter";
import { useForm } from "antd/es/form/Form";
import SummaryCardComponent from "./components/summary-card";
import { Button, Col, ConfigProvider, message, Row, Tabs, type TabsProps } from "antd";
import TableOwnerComponent from "./components/table-owner";
import { axiosCore, axiosReport } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import { useSession } from "next-auth/react";
import type { ITDashboard, ITDashboardOwner, ProductSummary } from "@/app/common/dashbaord";
import TableProductComponent from "./components/table-product";
import ProjectService from "@/app/services/project.service";
import type { IProject } from "@/app/common/project.type";
import ReportServices from "@/app/services/report.service";
const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const dashboardServices = DashboardServices(axiosCore);
  const projectServices = ProjectService(axiosCore);
  const [getdata, setData] = useState<ITDashboard>();
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryByOwner, setSummaryByOwner] = useState<ITDashboardOwner[]>([]);
  const [summaryByProduct, setSummaryByProduct] = useState<ProductSummary[]>([]);
  const [projectName, setProjectName] = useState<{ value: string; label: string }[]>([]);
  const [params, setParams] = useState<{ projectId: string; createdAt: Date | string }>({ projectId: "", createdAt: "" });

  const [searchForm] = useForm();

  useEffect(() => {
    if (loading) fecthdata();
  }, [loading, session, params]);

  const fecthdata = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummary(session?.user.id as string, params);
      setData(response);
      fectdataTableOwner();
      fectdataTableProduct();
      setLoading(false);
    }
  };
  const fectdataTableOwner = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummaryOwner(session?.user.id as string, params);
      setSummaryByOwner(response);
      setLoading(false);
    }
  };

  const fectdataTableProduct = async () => {
    if (session?.user) {
      const response = await dashboardServices.findDashboardSummaryProduct(session?.user.id as string, params);
      setSummaryByProduct(response);
      setLoading(false);
    }
  };

  useEffect(() => {
    masterData();
  }, [session]);

  const masterData = async () => {
    if (session?.user) {
      const response = await projectServices.findOneUserId(session?.user.id as string);
      const mapOptions = await response.map((events: IProject) => {
        return { value: events.id, label: events.name };
      });
      setProjectName(mapOptions);
    }
  };

  function onSearch(value: { projectId: ""; createdAt: "" }): void {
    if (value) {
      setParams(value);
      setLoading(true);
    } else {
      setParams({ projectId: "", createdAt: "" });
      setLoading(true);
    }
  }

  const exportcsv = async () => {
    try {
      const blob = await ReportServices(axiosReport).reportcsvDashboard(session?.user.id as string, params);
      if (!blob) {
        alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString();
      link.download = `report_test_${date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log("ดาวน์โหลดสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
  };

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
      <div className=" w-full pt-6">
        <Row gutter={[8, 8]} className="">
          <Col span={24}>
            <SummaryFilterComponent searchForm={searchForm} onSearch={onSearch} projectName={projectName} />
          </Col>
          <Col span={24}>
            <SummaryCardComponent getdata={getdata} session={session} />
          </Col>
          <Col span={24}>
            <Tabs
              defaultActiveKey="1"
              items={items}
              tabBarExtraContent={
                <Button className="!border-[#6366F1] !text-[#6366F1]" onClick={exportcsv}>
                  Export CSV
                </Button>
              }
            />
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};
export default DashboardPage;

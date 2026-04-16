"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  message,
  Typography,
  Breadcrumb,
  Space,
  ConfigProvider,
  theme,
} from "antd";
import CouponService from "@/app/services/coupon.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { ICouponCode, ICouponCodeGroupCreate } from "@/app/common/coupon.type";
import CouponTable from "./components/CouponTable";
import CouponFormModal from "./components/CouponFormModal";
import UsageTableModal from "./components/UsageTableModal";
import CouponGroupFormModal from "./components/CouponGroupFormModal";

import Link from "next/link";
import dayjs from "dayjs";

const { Title } = Typography;

export default function CouponManagementPage() {
  const couponService = CouponService(axiosUser);
  const [messageApi, contextHolder] = message.useMessage();

  const [data, setData] = useState<ICouponCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [filters, setFilters] = useState<any>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICouponCode | null>(
    null,
  );
  const [isEdit, setIsEdit] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (pagination.page - 1) * pagination.pageSize;
      const take = pagination.pageSize;

      const response = await couponService.findAll({
        skip,
        take,
        ...filters,
      });

      // response is now { data, total }
      setData(response?.data || []);
      setTotal(response?.total || 0);
    } catch (error) {
      messageApi.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }, [pagination, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setSelectedCoupon(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };
  const onAddGroup = () => {
    setIsGroupModalOpen(true);
  };
  const handleEdit = (record: ICouponCode) => {
    setSelectedCoupon(record);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleViewUsage = (record: ICouponCode) => {
    setSelectedCoupon(record);
    setIsUsageModalOpen(true);
  };

  const handleModalConfirm = async (values: Partial<ICouponCode>) => {
    setModalLoading(true);
    try {
      if (isEdit && selectedCoupon) {
        await couponService.update(selectedCoupon.id, values);
        messageApi.success("Coupon updated successfully");
      } else {
        await couponService.create(values);
        messageApi.success("Coupon created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      messageApi.error("Operation failed");
    } finally {
      setModalLoading(false);
    }
  };
  const handleGroupModalConfirm = async (values: ICouponCodeGroupCreate) => {
    setModalLoading(true);
    try {
      await couponService.createGroup({
        ...values,
        referenceTag: `${values.referenceTag}-${dayjs().format("YYYYMMDDHHmmss")}`,
      });
      messageApi.success("Coupon group created successfully");
      setIsGroupModalOpen(false);
      fetchData();
    } catch (error) {
      messageApi.error("Operation failed");
    } finally {
      setModalLoading(false);
    }
  };
  const handleExport = async (filters: any) => {
    setLoading(true);
    try {
      const blob = await couponService.exportCsv(filters);

      const filename = `coupons_${dayjs().format("YYYYMMDDHHmmss")}.csv`;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      messageApi.success("Coupons exported successfully");
    } catch (error) {
      console.error(error);
      messageApi.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        {contextHolder}
        {/* <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link href="/page/admin-management">Admin Management</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Coupon Management</Breadcrumb.Item>
        </Breadcrumb> */}

        <Title level={2}>Coupon Management</Title>

        <CouponTable
          data={data}
          loading={loading}
          total={total}
          onPageChange={(page, pageSize) => setPagination({ page, pageSize })}
          onSearch={(vals) => {
            setFilters(vals);
            setPagination({ ...pagination, page: 1 });
          }}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onViewUsage={handleViewUsage}
          onAddGroup={onAddGroup}
          onExport={handleExport}
        />

        <CouponFormModal
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          initialValues={selectedCoupon || undefined}
          loading={modalLoading}
          isEdit={isEdit}
        />
        <CouponGroupFormModal
          visible={isGroupModalOpen}
          onCancel={() => setIsGroupModalOpen(false)}
          onConfirm={handleGroupModalConfirm}
          loading={modalLoading}
        />
        <UsageTableModal
          visible={isUsageModalOpen}
          onCancel={() => setIsUsageModalOpen(false)}
          coupon={selectedCoupon}
        />
      </ConfigProvider>
    </div>
  );
}

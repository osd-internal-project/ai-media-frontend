"use client";
import React, { useEffect, useState, useCallback } from "react";
import { message, Typography, Breadcrumb, Space, ConfigProvider, theme } from "antd";
import CouponService from "@/app/services/coupon.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { ICouponCode } from "@/app/common/coupon.type";
import CouponTable from "./components/CouponTable";
import CouponFormModal from "./components/CouponFormModal";
import UsageTableModal from "./components/UsageTableModal";
import Link from "next/link";

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

      // Construct Prisma filter
      const where: any = {};
      if (filters.code) {
        where.code = { contains: filters.code, mode: "insensitive" };
      }
      if (filters.status) {
        where.status = filters.status;
      }

      const response = await couponService.findAll({
        skip,
        take,
        where,
        orderBy: { createdAt: "desc" },
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

  const handleEdit = (record: ICouponCode) => {
    setSelectedCoupon(record);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleViewUsage = (record: ICouponCode) => {
    setSelectedCoupon(record);
    setIsUsageModalOpen(true);
  };

  const handleModalConfirm = async (values: any) => {
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

  return (
    <div style={{ padding: "24px 48px" }}>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        {contextHolder}
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link href="/page/admin-management">Admin Management</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Coupon Management</Breadcrumb.Item>
        </Breadcrumb>

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
        />

        <CouponFormModal
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          initialValues={selectedCoupon || undefined}
          loading={modalLoading}
          isEdit={isEdit}
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

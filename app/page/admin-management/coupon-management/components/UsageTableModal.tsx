import React, { useEffect, useState } from "react";
import { Modal, Table, Tag } from "antd";
import { ICouponCode, ICouponCodeUsage } from "@/app/common/coupon.type";
import dayjs from "dayjs";
import CouponService from "@/app/services/coupon.service";
import { axiosUser } from "@/app/lib/axios/axios";

interface Props {
    visible: boolean;
    onCancel: () => void;
    coupon: ICouponCode | null;
}

const UsageTableModal: React.FC<Props> = ({ visible, onCancel, coupon }) => {
    const couponService = CouponService(axiosUser);
    const [usageData, setUsageData] = useState<ICouponCodeUsage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && coupon?.id) {
            setLoading(true);
            couponService.findUsageByCouponCodeId(coupon.id)
                .then((res) => {
                    setUsageData(res || []);
                })
                .finally(() => setLoading(false));
        }
    }, [visible, coupon, couponService]);

    const columns = [
        {
            title: "Used By",
            dataIndex: "usedByName",
            key: "usedByName",
            render: (text: string, record: ICouponCodeUsage) => (
                <div>
                   <strong>{text}</strong><br/>
                   <small>{record.usedById}</small>
                </div>
            ),
        },
        {
            title: "Organization",
            dataIndex: "organizationName",
            key: "organizationName",
            render: (text: string, record: ICouponCodeUsage) => (
                <div>
                   <strong>{text}</strong><br/>
                   <small>{record.organizationCode}</small>
                </div>
            ),
        },
        {
            title: "Credit Received",
            dataIndex: "onTopCredit",
            key: "onTopCredit",
            render: (val: number) => <Tag color="blue">{val}</Tag>,
        },
        {
            title: "Used At",
            dataIndex: "usedAt",
            key: "usedAt",
            render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
        },
    ];

    return (
        <Modal
            title={`Usage History - ${coupon?.code || ""}`}
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
        >
            <Table
                columns={columns}
                dataSource={usageData}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />
        </Modal>
    );
};

export default UsageTableModal;

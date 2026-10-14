"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Result,
  Select,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { axiosUser } from "@/app/lib/axios/axios";
import WhtRequestServices from "@/app/services/wht-request.service";
import { IInvoice } from "@/app/common/invoice.type";
import { ICreateWhtRequest } from "@/app/common/wht-request.type";

/** Thai notice shown after submitting a WHT refund request. */
const WHT_NOTICE =
  "กรุณาส่งเอกสารหัก ณ ที่จ่ายต้นฉบับมาที่ บริษัท โอ เอส ดี จำกัด เลขที่ 24 ซอยรามอินทรา 20 ถนนรามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพมหานคร 10230 (ถึงแผนกบัญชี)\nบริษัทจะโอนเงินคืนทุกวันที่ 5 และ 20 ของเดือน";

const WhtRequestPage: React.FC = () => {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const service = useMemo(() => WhtRequestServices(axiosUser), []);
  const organizationId = session?.user?.organizationId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [selected, setSelected] = useState<IInvoice | null>(null);
  const [whtPercent, setWhtPercent] = useState<1 | 3>(3);
  const [submitted, setSubmitted] = useState(false);

  const fetchEligible = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await service.eligibleInvoices(organizationId);
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  }, [service, organizationId]);

  useEffect(() => {
    fetchEligible();
  }, [fetchEligible]);

  const preVatAmount = selected?.receipt
    ? Number(selected.receipt.preVatAmount)
    : 0;
  const whtAmount = Number(((preVatAmount * whtPercent) / 100).toFixed(2));

  const onSelectInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId) ?? null;
    setSelected(inv);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const payload: ICreateWhtRequest = {
        invoiceId: selected.id,
        whtPercent,
        docRefNo: values.docRefNo as string,
        docRefDate: (values.docRefDate as dayjs.Dayjs).toISOString(),
        bankAccountName: values.bankAccountName as string,
        bankName: values.bankName as string,
        bankAccountNumber: values.bankAccountNumber as string,
        bankBranchCode: values.bankBranchCode as string,
      };
      await service.create(payload);
      setSubmitted(true);
    } catch {
      messageApi.error("Failed to submit WHT request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {contextHolder}
        <Result
          status="success"
          title="WHT Request Submitted"
          subTitle={
            <pre className="whitespace-pre-wrap text-left text-sm text-gray-300">
              {WHT_NOTICE}
            </pre>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {contextHolder}
      <h1 className="text-2xl font-bold text-white">
        Withholding Tax Refund Request
      </h1>
      <p className="text-gray-400">For juristic (company) customers only.</p>

      {invoices.length === 0 ? (
        <Alert
          type="info"
          showIcon
          message="No eligible invoices"
          description="Only paid invoices issued to a juristic customer can be used for a WHT refund request."
        />
      ) : (
        <Card size="small">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Select a paid invoice" required>
              <Select
                placeholder="Choose an invoice"
                onChange={onSelectInvoice}
                options={invoices.map((i) => ({
                  label: `${i.invoiceNo} — ${i.planName}`,
                  value: i.id,
                }))}
              />
            </Form.Item>

            {selected && selected.receipt && (
              <>
                {/* Auto-filled, locked */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Form.Item label="Receipt No.">
                    <Input value={selected.receipt.receiptNo} readOnly />
                  </Form.Item>
                  <Form.Item label="Receipt Date">
                    <Input
                      value={dayjs(selected.receipt.issuedAt).format(
                        "DD/MM/YYYY",
                      )}
                      readOnly
                    />
                  </Form.Item>
                  <Form.Item label="Pre-VAT Amount">
                    <Input value={preVatAmount.toFixed(2)} readOnly />
                  </Form.Item>
                </div>

                <Form.Item label="WHT Percentage" required>
                  <Radio.Group
                    value={whtPercent}
                    onChange={(e) => setWhtPercent(e.target.value)}
                  >
                    <Radio.Button value={1}>1%</Radio.Button>
                    <Radio.Button value={3}>3%</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="WHT Amount (calculated)">
                  <InputNumber
                    value={whtAmount}
                    readOnly
                    className="w-full"
                    formatter={(v) => `฿ ${v}`}
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    label="WHT Document Reference No."
                    name="docRefNo"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Document ref. number" />
                  </Form.Item>
                  <Form.Item
                    label="WHT Document Date"
                    name="docRefDate"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <DatePicker className="w-full" format="DD/MM/YYYY" />
                  </Form.Item>
                </div>

                <p className="text-white font-semibold mt-2 mb-1">
                  Bank account for refund
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    label="Account Name"
                    name="bankAccountName"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Account holder name" />
                  </Form.Item>
                  <Form.Item
                    label="Bank Name"
                    name="bankName"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Bank name" />
                  </Form.Item>
                  <Form.Item
                    label="Account Number"
                    name="bankAccountNumber"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Account number" />
                  </Form.Item>
                  <Form.Item
                    label="Branch Code"
                    name="bankBranchCode"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Branch code" />
                  </Form.Item>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                  >
                    Submit Request
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Card>
      )}
    </div>
  );
};

export default WhtRequestPage;

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Image,
  Radio,
  Result,
  Select,
  Spin,
  Steps,
  message,
} from "antd";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosUser, axiosCore } from "@/app/lib/axios/axios";
import BillingProfileServices from "@/app/services/billing-profile.service";
import InvoiceServices from "@/app/services/invoice.service";
import PlanServices from "@/app/services/plan.service";
import CardPaymentForm from "@/app/payment/components/CardPaymentForm";
import { useOmiseToken, type CardData } from "@/app/payment/hooks/useOmiseToken";
import { IBillingProfile } from "@/app/common/billing-profile.type";
import {
  IInvoice,
  InternetBank,
  PaymentMethod,
} from "@/app/common/invoice.type";
import { TPlanPrice } from "@/app/common/plan.type";

const BANKS: { label: string; value: InternetBank }[] = [
  { label: "Bank of Ayudhya (BAY)", value: "bay" },
  { label: "Bangkok Bank (BBL)", value: "bbl" },
  { label: "Kasikornbank (KBANK)", value: "kbank" },
  { label: "Krungthai Bank (KTB)", value: "ktb" },
  { label: "Siam Commercial Bank (SCB)", value: "scb" },
];

const formatTHB = (value: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(value));

/** Multi-step checkout: billing profile → method → pay → done. */
export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { tokenize } = useOmiseToken();
  const [messageApi, contextHolder] = message.useMessage();

  const priceId = searchParams.get("priceId") ?? "";
  const resumeInvoiceId = searchParams.get("invoiceId");

  const billingService = useMemo(() => BillingProfileServices(axiosUser), []);
  const invoiceService = useMemo(() => InvoiceServices(axiosUser), []);
  const planService = useMemo(() => PlanServices(axiosCore), []);

  const userId = session?.user?.id;
  const organizationId = session?.user?.organizationId;

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<IBillingProfile[]>([]);
  const [planPrice, setPlanPrice] = useState<TPlanPrice | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>();
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [bank, setBank] = useState<InternetBank>("kbank");
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load: billing profiles + plan price. Redirect if no profile.
  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [profileList, price] = await Promise.all([
          billingService.findByUserId(userId),
          priceId ? planService.findPlanWithPrice(priceId) : Promise.resolve(null),
        ]);
        setProfiles(profileList);
        setPlanPrice(price);
        if (profileList.length === 0 && !resumeInvoiceId) {
          messageApi.warning(
            "Please add a billing profile before purchasing a package.",
          );
          router.push("/page/profile/billing");
          return;
        }
        const def = profileList.find((p) => p.isDefault) ?? profileList[0];
        setSelectedProfileId(def?.id);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, priceId]);

  // Polling helper for source-based payments (PromptPay / internet banking)
  const startPolling = useCallback(
    (invoiceId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const res = await invoiceService.getStatus(invoiceId);
        if (res.status === "PAID") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (res.invoice) setInvoice(res.invoice);
          setCurrent(3);
        } else if (res.status === "FAILED" || res.status === "EXPIRED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMessage("Payment failed or expired. Please try again.");
        }
      }, 3000);
    },
    [invoiceService],
  );

  // Resume after an internet-banking redirect back to this page
  useEffect(() => {
    const resume = async () => {
      if (!resumeInvoiceId) return;
      setLoading(true);
      const res = await invoiceService.getStatus(resumeInvoiceId);
      if (res.status === "PAID" && res.invoice) {
        setInvoice(res.invoice);
        setCurrent(3);
      } else {
        const inv = await invoiceService.findOne(resumeInvoiceId);
        if (inv) {
          setInvoice(inv);
          setCurrent(2);
          startPolling(resumeInvoiceId);
        }
      }
      setLoading(false);
    };
    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeInvoiceId]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleCreateInvoice = async () => {
    if (!userId || !organizationId || !selectedProfileId || !priceId) {
      messageApi.error("Missing required information");
      return;
    }
    setCreating(true);
    setErrorMessage(null);
    try {
      const inv = await invoiceService.create({
        organizationId,
        userId,
        billingProfileId: selectedProfileId,
        planPriceId: priceId,
        paymentMethod: method,
      });
      setInvoice(inv);
      setCurrent(2);
    } catch {
      messageApi.error("Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  const handleCardSubmit = async (cardData: CardData) => {
    if (!invoice) return;
    setPaying(true);
    setErrorMessage(null);
    try {
      const token = await tokenize(cardData);
      const paid = await invoiceService.payCard(invoice.id, token);
      setInvoice(paid);
      setCurrent(3);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Payment was declined.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleSourcePay = async () => {
    if (!invoice) return;
    setPaying(true);
    setErrorMessage(null);
    try {
      if (method === "PROMPTPAY") {
        const res = await invoiceService.paySource(invoice.id, "PROMPTPAY");
        setQrUri(res.qrImageUri ?? null);
        startPolling(invoice.id);
      } else {
        const returnUri = `${window.location.origin}/page/payment/checkout?invoiceId=${invoice.id}`;
        const res = await invoiceService.paySource(
          invoice.id,
          "INTERNET_BANKING",
          { bank, returnUri },
        );
        if (res.authorizeUri) {
          window.location.href = res.authorizeUri;
        } else {
          setErrorMessage("Could not start internet banking payment.");
        }
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not start payment.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  const amount = invoice?.totalAmount ?? planPrice?.price ?? 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Script src="https://cdn.omise.co/omise.js" strategy="afterInteractive" />
      {contextHolder}

      <h1 className="text-2xl font-bold text-white">Checkout</h1>

      <Steps
        current={current}
        items={[
          { title: "Billing Profile" },
          { title: "Payment Method" },
          { title: "Pay" },
          { title: "Done" },
        ]}
      />

      {/* Step 0: choose billing profile */}
      {current === 0 && (
        <Card title="Select a billing profile" size="small">
          <Radio.Group
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="flex flex-col gap-3 w-full"
          >
            {profiles.map((p) => (
              <Radio key={p.id} value={p.id} className="!flex">
                <span className="text-white">
                  {p.companyName || p.fullName}{" "}
                  {p.type === "JURISTIC" && p.taxId
                    ? `(Tax ${p.taxId}/${p.branchCode})`
                    : ""}
                </span>
              </Radio>
            ))}
          </Radio.Group>
          <div className="flex justify-between mt-4">
            <Button onClick={() => router.push("/page/profile/billing")}>
              Manage profiles
            </Button>
            <Button
              type="primary"
              disabled={!selectedProfileId}
              onClick={() => setCurrent(1)}
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: payment method */}
      {current === 1 && (
        <Card title="Choose a payment method" size="small">
          <Radio.Group
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="flex flex-col gap-3"
          >
            <Radio value="CARD">Credit / Debit Card</Radio>
            <Radio value="PROMPTPAY">PromptPay QR</Radio>
            <Radio value="INTERNET_BANKING">Internet Banking</Radio>
          </Radio.Group>

          {method === "INTERNET_BANKING" && (
            <Select
              className="mt-3 w-full max-w-sm"
              value={bank}
              onChange={(v) => setBank(v)}
              options={BANKS}
            />
          )}

          {planPrice && (
            <div className="mt-4 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatTHB(planPrice.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT 7%</span>
                <span>{formatTHB(Number(planPrice.price) * 0.07)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white">
                <span>Total</span>
                <span>{formatTHB(Number(planPrice.price) * 1.07)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button onClick={() => setCurrent(0)}>Back</Button>
            <Button
              type="primary"
              loading={creating}
              onClick={handleCreateInvoice}
            >
              Create Invoice & Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: pay */}
      {current === 2 && invoice && (
        <Card
          title={`Pay invoice ${invoice.invoiceNo} — ${formatTHB(amount)}`}
          size="small"
        >
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              className="mb-4"
            />
          )}

          {method === "CARD" && (
            <CardPaymentForm
              onSubmit={handleCardSubmit}
              loading={paying}
              errorMessage={errorMessage}
            />
          )}

          {method === "PROMPTPAY" && (
            <div className="flex flex-col items-center gap-4">
              {qrUri ? (
                <>
                  <Image src={qrUri} alt="PromptPay QR" width={240} preview={false} />
                  <p className="text-gray-400">
                    Scan with your banking app. Waiting for payment…
                  </p>
                  <Spin />
                </>
              ) : (
                <Button type="primary" loading={paying} onClick={handleSourcePay}>
                  Generate PromptPay QR
                </Button>
              )}
            </div>
          )}

          {method === "INTERNET_BANKING" && (
            <div className="flex flex-col gap-3">
              <p className="text-gray-400">
                You will be redirected to your bank to authorize the payment.
              </p>
              <Button type="primary" loading={paying} onClick={handleSourcePay}>
                Continue to bank
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: done */}
      {current === 3 && invoice && (
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={`Invoice ${invoice.invoiceNo} has been paid. Your credits are now active.`}
          extra={[
            <Button
              key="dashboard"
              type="primary"
              onClick={() => router.push("/page/dashboard")}
            >
              Go to Dashboard
            </Button>,
            <Button
              key="invoices"
              onClick={() => router.push("/page/organization")}
            >
              View Organization
            </Button>,
          ]}
        />
      )}
    </div>
  );
}

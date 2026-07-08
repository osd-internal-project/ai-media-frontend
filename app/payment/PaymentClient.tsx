"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Image, Radio, Result, Select, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosUser } from "@/app/lib/axios/axios";
import PurchaseServices from "@/app/services/purchase.service";
import CardPaymentForm from "./components/CardPaymentForm";
import { useOmiseToken, type CardData } from "./hooks/useOmiseToken";
import { IPendingPurchase, InternetBank } from "@/app/common/purchase.type";

type PaymentMethod = "CARD" | "PROMPTPAY" | "INTERNET_BANKING";

const BANKS: { label: string; value: InternetBank }[] = [
  { label: "Bank of Ayudhya (BAY)", value: "bay" },
  { label: "Bangkok Bank (BBL)", value: "bbl" },
  { label: "Kasikornbank (KBANK)", value: "kbank" },
  { label: "Krungthai Bank (KTB)", value: "ktb" },
  { label: "Siam Commercial Bank (SCB)", value: "scb" },
];

const formatTHB = (v: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(v));

/**
 * Order-driven payment step for the onboarding flow. Loads a PendingPurchase by
 * `?orderId=`, charges it via Omise (Card / PromptPay / Internet Banking), and
 * on success the backend creates the organization. Then refreshes the session.
 */
export default function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const { tokenize } = useOmiseToken();

  const orderId = searchParams.get("orderId") ?? "";
  const service = useMemo(() => PurchaseServices(axiosUser), []);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<IPendingPurchase | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [bank, setBank] = useState<InternetBank>("kbank");
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(
    async (organizationId?: string | null) => {
      if (pollRef.current) clearInterval(pollRef.current);
      setDone(true);
      // Refresh the JWT so session.user.organizationId reflects the new org.
      if (organizationId) {
        try {
          await update({ user: { organizationId } });
        } catch {
          /* non-fatal: session will refresh on next navigation */
        }
      }
    },
    [update],
  );

  const startPolling = useCallback(
    (id: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const res = await service.getStatus(id);
        if (res.status === "PAID") {
          finish(res.organizationId);
        } else if (res.status === "FAILED" || res.status === "EXPIRED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMessage("Payment failed or expired. Please try again.");
        }
      }, 3000);
    },
    [service, finish],
  );

  useEffect(() => {
    const load = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      const data = await service.findOne(orderId);
      setOrder(data);
      if (data?.status === "PAID") {
        finish(data.createdOrganizationId);
      } else if (data?.omiseChargeId) {
        // Returning from an internet-banking redirect: resume polling.
        startPolling(orderId);
      }
      setLoading(false);
    };
    load();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCardSubmit = async (cardData: CardData) => {
    if (!order) return;
    setPaying(true);
    setErrorMessage(null);
    try {
      const token = await tokenize(cardData);
      const res = await service.payCard(order.id, token);
      if (res.status === "PAID") finish(res.organizationId);
      else setErrorMessage("Payment was declined.");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Payment was declined.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleSourcePay = async () => {
    if (!order) return;
    setPaying(true);
    setErrorMessage(null);
    try {
      if (method === "PROMPTPAY") {
        const res = await service.paySource(order.id, "PROMPTPAY");
        setQrUri(res.qrImageUri ?? null);
        startPolling(order.id);
      } else {
        const returnUri = `${window.location.origin}/payment?orderId=${order.id}`;
        const res = await service.paySource(order.id, "INTERNET_BANKING", {
          bank,
          returnUri,
        });
        if (res.authorizeUri) window.location.href = res.authorizeUri;
        else setErrorMessage("Could not start internet banking payment.");
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
      <div className="min-h-screen flex items-center justify-center bg-[#191C20]">
        <Spin size="large" />
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191C20] p-6">
        <Card>
          <p className="text-gray-300">No order found.</p>
          <Button
            type="primary"
            className="mt-4"
            onClick={() => router.push("/package")}
          >
            Back to packages
          </Button>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191C20] p-6">
        <Result
          status="success"
          title="Payment Successful!"
          subTitle="Your organization has been created and your credits are active."
          extra={[
            <Button
              key="go"
              type="primary"
              onClick={() => router.push("/page/project")}
            >
              Go to Dashboard
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191C20] p-6">
      <div className="w-full max-w-xl space-y-4">
        <Card title={`Pay for ${order.planName}`} size="small">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>{formatTHB(order.subTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>VAT 7%</span>
            <span>{formatTHB(order.vatAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-white">
            <span>Total</span>
            <span>{formatTHB(order.totalAmount)}</span>
          </div>
        </Card>

        <Card title="Payment method" size="small">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              className="mb-4"
            />
          )}

          <Radio.Group
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as PaymentMethod);
              setQrUri(null);
            }}
            className="flex flex-col gap-2 mb-4"
          >
            <Radio value="CARD">Credit / Debit Card</Radio>
            <Radio value="PROMPTPAY">PromptPay QR</Radio>
            <Radio value="INTERNET_BANKING">Internet Banking</Radio>
          </Radio.Group>

          {method === "CARD" && (
            <CardPaymentForm
              onSubmit={handleCardSubmit}
              loading={paying}
              errorMessage={errorMessage}
              setCurrent={() => {}}
            />
          )}

          {method === "PROMPTPAY" && (
            <div className="flex flex-col items-center gap-4">
              {qrUri ? (
                <>
                  <Image
                    src={qrUri}
                    alt="PromptPay QR"
                    width={240}
                    preview={false}
                  />
                  <p className="text-gray-400">
                    Scan with your banking app. Waiting for payment…
                  </p>
                  <Spin />
                </>
              ) : (
                <Button
                  type="primary"
                  loading={paying}
                  onClick={handleSourcePay}
                >
                  Generate PromptPay QR
                </Button>
              )}
            </div>
          )}

          {method === "INTERNET_BANKING" && (
            <div className="flex flex-col gap-3">
              <Select
                value={bank}
                onChange={(v) => setBank(v)}
                options={BANKS}
                className="max-w-sm"
              />
              <p className="text-gray-400">
                You will be redirected to your bank to authorize the payment.
              </p>
              <Button type="primary" loading={paying} onClick={handleSourcePay}>
                Continue to bank
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

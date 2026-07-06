"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Image,
  Input,
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
import {
  useOmiseToken,
  type CardData,
} from "@/app/payment/hooks/useOmiseToken";
import {
  BillingProfileType,
  IBillingProfile,
} from "@/app/common/billing-profile.type";
import {
  IInvoice,
  InternetBank,
  PaymentMethod,
} from "@/app/common/invoice.type";
import { TPlanPrice } from "@/app/common/plan.type";
import { OrgBillingFormValues } from "./components/OrgBillingForm";
import TaxInvoiceFields from "./components/TaxInvoiceFields";

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
  const { data: session, update } = useSession();
  const { tokenize } = useOmiseToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [orgForm] = Form.useForm();

  const priceId = searchParams.get("priceId") ?? "";
  const resumeInvoiceId = searchParams.get("invoiceId");
  // newOrg mode: collect org details and create a brand-new org after payment
  const newOrg = searchParams.get("newOrg") === "1";

  const billingService = useMemo(() => BillingProfileServices(axiosUser), []);
  const invoiceService = useMemo(() => InvoiceServices(axiosUser), []);
  const planService = useMemo(() => PlanServices(axiosCore), []);

  const userId = session?.user?.id;
  // The real users.userId (session.user.id is the Keycloak `sub`). Required for
  // the new-org flow because OrganizationMember.userId FKs to users.userId.
  const purchaserUserId = session?.user?.userId ?? undefined;
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
  // New-org mode: captured org + billing form values, and the billing type toggle
  const [billingType, setBillingType] =
    useState<BillingProfileType>("INDIVIDUAL");
  const [orgValues, setOrgValues] = useState<OrgBillingFormValues | null>(null);
  // New-org mode: reuse a saved billing profile or enter fresh tax info
  const [billingSource, setBillingSource] = useState<"saved" | "new">("new");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load: plan price + the user's billing profiles. New-org mode fetches
  // them too (the buyer may already have a default profile to reuse), but never
  // redirects to /billing when none exist — a brand-new customer just fills the
  // tax form. Profiles are keyed by the token id (session.user.id), as elsewhere.
  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [profileList, price] = await Promise.all([
          billingService.findByUserId(userId),
          priceId
            ? planService.findPlanWithPrice(priceId)
            : Promise.resolve(null),
        ]);
        setProfiles(profileList);
        setPlanPrice(price);
        if (!newOrg && profileList.length === 0 && !resumeInvoiceId) {
          messageApi.warning(
            "Please add a billing profile before purchasing a package.",
          );
          router.push("/page/profile/billing");
          return;
        }
        const def = profileList.find((p) => p.isDefault) ?? profileList[0];
        setSelectedProfileId(def?.id);
        // New-org: default to reusing a saved profile when one exists.
        setBillingSource(newOrg && profileList.length > 0 ? "saved" : "new");
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

  // New-org: once payment is done (step 3), switch the user's active org to the
  // freshly created org (backend already persisted recentOrganizationId) so the
  // project page loads the new workspace. Runs once.
  const switchedRef = useRef(false);
  useEffect(() => {
    if (
      newOrg &&
      current === 3 &&
      invoice?.organizationId &&
      !switchedRef.current
    ) {
      switchedRef.current = true;
      update({ user: { organizationId: invoice.organizationId } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrg, current, invoice?.organizationId]);

  // Step 0 (new-org): capture the org + tax info, advance to payment-method
  // selection. Invoice is created later, in handleCreateInvoice. Tax info comes
  // from a chosen saved profile OR the freshly-entered fields.
  const handleOrgFormFinish = (values: OrgBillingFormValues) => {
    if (billingSource === "saved") {
      const p = profiles.find((x) => x.id === selectedProfileId);
      if (!p) {
        messageApi.error("Please select a billing profile");
        return;
      }
      setBillingType(p.type);
      setOrgValues({
        orgName: values.orgName,
        orgDescription: values.orgDescription,
        address: p.address,
        fullName: p.fullName ?? undefined,
        nationalId: p.nationalId ?? undefined,
        companyName: p.companyName ?? undefined,
        taxId: p.taxId ?? undefined,
        branchCode: p.branchCode ?? undefined,
        branchName: p.branchName ?? undefined,
        contactName: p.contactName ?? undefined,
        phone: p.phone ?? undefined,
        email: p.email ?? undefined,
      });
    } else {
      // New tax info: values already carries the tax fields from the form.
      setOrgValues(values);
    }
    setCurrent(1);
  };

  const handleCreateInvoice = async () => {
    if (!userId || !priceId) {
      messageApi.error("Missing required information");
      return;
    }
    // Validate the two modes have what they need before hitting the API.
    if (newOrg) {
      if (!purchaserUserId) {
        messageApi.error("Missing user information");
        return;
      }
      if (!orgValues) {
        messageApi.error("Please complete the organization details");
        setCurrent(0);
        return;
      }
    } else if (!organizationId || !selectedProfileId || !purchaserUserId) {
      messageApi.error("Missing required information");
      return;
    }

    setCreating(true);
    setErrorMessage(null);
    try {
      // Payment always identifies the buyer by the real users.userId
      // (OrganizationMember.userId FKs to it), never the Keycloak token id.
      const inv = await invoiceService.create(
        newOrg && orgValues && purchaserUserId
          ? {
              userId: purchaserUserId,
              planPriceId: priceId,
              paymentMethod: method,
              createNewOrganization: true,
              orgName: orgValues.orgName,
              orgType: "team",
              orgDescription: orgValues.orgDescription,
              billing: {
                type: billingType,
                address: orgValues.address,
                fullName: orgValues.fullName,
                nationalId: orgValues.nationalId,
                companyName: orgValues.companyName,
                taxId: orgValues.taxId,
                branchCode: orgValues.branchCode,
                branchName: orgValues.branchName,
                contactName: orgValues.contactName,
                phone: orgValues.phone,
                email: orgValues.email,
              },
            }
          : {
              organizationId: organizationId ?? undefined,
              userId: purchaserUserId,
              billingProfileId: selectedProfileId,
              planPriceId: priceId,
              paymentMethod: method,
            },
      );
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
        const returnUri = `${window.location.origin}/page/payment/checkout?invoiceId=${invoice.id}${newOrg ? "&newOrg=1" : ""}`;
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
      <div className="bg-transparent pb-5">
        <Steps
          size="small"
          current={current}
          items={[
            { title: newOrg ? "Organization" : "Billing Profile" },
            { title: "Payment Method" },
            { title: "Pay" },
            { title: "Done" },
          ]}
        />
      </div>

      {/* Step 0 (new-org): organization + tax-invoice details */}
      {current === 0 && newOrg && (
        <Card title="Organization details" size="small">
          <p className="text-gray-400 mb-3">
            Enter your organization details. Your organization is created after
            payment is confirmed.
          </p>
          <Form
            form={orgForm}
            layout="vertical"
            onFinish={(v) => handleOrgFormFinish(v as OrgBillingFormValues)}
          >
            <p className="text-white font-semibold mb-2">Organization</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Organization Name"
                name="orgName"
                rules={[
                  { required: true, message: "Organization name is required" },
                ]}
              >
                <Input placeholder="My Company" />
              </Form.Item>
              <Form.Item label="Description" name="orgDescription">
                <Input placeholder="Optional" />
              </Form.Item>
            </div>

            <p className="text-white font-semibold mt-2 mb-2">
              Tax Invoice Information
            </p>
            {profiles.length > 0 && (
              <Radio.Group
                value={billingSource}
                onChange={(e) => setBillingSource(e.target.value)}
                className="mb-3 flex flex-col gap-2"
              >
                <Radio value="saved">Use a saved billing profile</Radio>
                <Radio value="new">Enter new tax info</Radio>
              </Radio.Group>
            )}

            {billingSource === "saved" && profiles.length > 0 ? (
              <Form.Item label="Billing profile">
                <Select
                  value={selectedProfileId}
                  onChange={(v) => setSelectedProfileId(v)}
                  options={profiles.map((p) => ({
                    value: p.id,
                    label: `${p.companyName || p.fullName || "Profile"}${
                      p.type === "JURISTIC" && p.taxId
                        ? ` (Tax ${p.taxId}/${p.branchCode})`
                        : ""
                    }${p.isDefault ? " · default" : ""}`,
                  }))}
                />
              </Form.Item>
            ) : (
              <TaxInvoiceFields type={billingType} setType={setBillingType} />
            )}

            <div className="flex justify-end">
              <Button type="primary" htmlType="submit">
                Continue
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Step 0 (existing-org): choose billing profile */}
      {current === 0 && !newOrg && (
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
          {purchaserUserId}
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
              setCurrent={setCurrent}
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
                <div>
                  {" "}
                  <Button onClick={() => setCurrent(1)}>Back</Button>
                  <Button
                    type="primary"
                    loading={paying}
                    onClick={handleSourcePay}
                  >
                    Generate PromptPay QR
                  </Button>
                </div>
              )}
            </div>
          )}

          {method === "INTERNET_BANKING" && (
            <div className="flex flex-col gap-3">
              <p className="text-gray-400">
                You will be redirected to your bank to authorize the payment.
              </p>
              <Button onClick={() => setCurrent(1)}>Back</Button>
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
          subTitle={
            newOrg
              ? `Invoice ${invoice.invoiceNo} has been paid. Your organization is ready.`
              : `Invoice ${invoice.invoiceNo} has been paid. Your credits are now active.`
          }
          extra={
            newOrg
              ? [
                  <Button
                    key="project"
                    type="primary"
                    onClick={() => router.push("/page/project")}
                  >
                    Go to Project
                  </Button>,
                ]
              : [
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
                ]
          }
        />
      )}
    </div>
  );
}

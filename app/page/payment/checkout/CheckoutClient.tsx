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
  Divider,
  Form,
  Image,
  Input,
  Result,
  Segmented,
  Select,
  Spin,
  Tag,
  message,
} from "antd";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  QrCode,
  Check,
  Trash2,
} from "lucide-react";
import { axiosUser, axiosCore } from "@/app/lib/axios/axios";
import BillingProfileServices from "@/app/services/billing-profile.service";
import InvoiceServices from "@/app/services/invoice.service";
import PlanServices from "@/app/services/plan.service";
import PaymentMethodServices from "@/app/services/payment-method.service";
import OrganizationServices from "@/app/services/organization.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
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
  ChangeType,
  IInvoice,
  ISavedCard,
  InternetBank,
  PaymentMethod,
} from "@/app/common/invoice.type";
import { TPlan, TPlanPrice } from "@/app/common/plan.type";
import { OrgBillingFormValues } from "./components/OrgBillingForm";
import TaxInvoiceFields from "./components/TaxInvoiceFields";
import Title from "antd/es/typography/Title";

const BANKS: { label: string; value: InternetBank }[] = [
  { label: "Bank of Ayudhya (BAY)", value: "bay" },
  { label: "Bangkok Bank (BBL)", value: "bbl" },
  { label: "Kasikornbank (KBANK)", value: "kbank" },
  { label: "Krungthai Bank (KTB)", value: "ktb" },
  { label: "Siam Commercial Bank (SCB)", value: "scb" },
];

const METHOD_OPTIONS: {
  label: string;
  value: PaymentMethod;
  icon: React.ReactNode;
}[] = [
  {
    label: "Credit / Debit Card",
    value: "CARD",
    icon: <CreditCard size={16} />,
  },
  { label: "PromptPay QR", value: "PROMPTPAY", icon: <QrCode size={16} /> },
  {
    label: "Internet Banking",
    value: "INTERNET_BANKING",
    icon: <Landmark size={16} />,
  },
];

/** Purchase mode drives the copy, the org form (editable vs readonly) and the payment logic. */
type CheckoutMode = "CREATE" | "RENEWAL" | "UPGRADE" | "DOWNGRADE";

const formatTHB = (value: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(value));

/** Theme accents (aligns checkout with the app's dark theme). */
const ACCENT = "#6966FF";
const CARD_CLASS = "!rounded-xl !border !border-[#3a3a40]";
const CARD_STYLES = {
  header: { borderBottom: "1px solid #3a3a40", fontWeight: 600 },
  body: { paddingTop: 16 },
} as const;

/** A selectable "tile" style (payment method / saved card): accent when active. */
const tileClass = (active: boolean) =>
  `flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
    active
      ? "border-[#6966FF] bg-[#6966FF]/10 text-white"
      : "border-[#3a3a40] text-gray-300 hover:border-[#55555f]"
  }`;

const MODE_LABEL: Record<CheckoutMode, string> = {
  CREATE: "Create organization",
  RENEWAL: "Renew plan",
  UPGRADE: "Upgrade plan",
  DOWNGRADE: "Downgrade plan",
};

/**
 * Split-screen checkout: left = package (org details / price / plan features),
 * right = payment (tax invoice + Omise card/PromptPay/banking, with saved cards).
 * Handles new-org creation, renewal, prorated upgrade, and (free, scheduled)
 * downgrade.
 */
export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const { tokenize } = useOmiseToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [orgForm] = Form.useForm();
  const [taxForm] = Form.useForm();

  const priceId = searchParams.get("priceId") ?? "";
  const resumeInvoiceId = searchParams.get("invoiceId");
  const newOrg = searchParams.get("newOrg") === "1";

  const billingService = useMemo(() => BillingProfileServices(axiosUser), []);
  const invoiceService = useMemo(() => InvoiceServices(axiosUser), []);
  const planService = useMemo(() => PlanServices(axiosCore), []);
  const cardService = useMemo(() => PaymentMethodServices(axiosUser), []);
  const orgService = useMemo(() => OrganizationServices(axiosUser), []);
  const subscriptionService = useMemo(
    () => OrganizationSubscriptionServices(axiosUser),
    [],
  );

  // session.user.id = Keycloak sub (used for billing-profile lookup, as elsewhere);
  // session.user.userId = real users.userId (required for payment / FKs).
  const tokenUserId = session?.user?.id;
  const purchaserUserId = session?.user?.userId ?? undefined;
  const organizationId = session?.user?.organizationId;

  // ── data ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [planPrice, setPlanPrice] = useState<TPlanPrice | null>(null);
  const [plan, setPlan] = useState<TPlan | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [mode, setMode] = useState<CheckoutMode>(newOrg ? "CREATE" : "RENEWAL");

  // ── tax invoice (billing profile) ───────────────────────────
  const [profiles, setProfiles] = useState<IBillingProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>();
  const [billingType, setBillingType] =
    useState<BillingProfileType>("INDIVIDUAL");
  const [billingSource, setBillingSource] = useState<"saved" | "new">("new");

  // ── payment ─────────────────────────────────────────────────
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [bank, setBank] = useState<InternetBank>("kbank");
  const [savedCards, setSavedCards] = useState<ISavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [cardMode, setCardMode] = useState<"saved" | "new">("new");
  const [saveNewCard, setSaveNewCard] = useState(true);

  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isExisting = !newOrg;

  // Initial load: plan (+ price + features), and — for an existing org — the
  // current subscription (to decide upgrade/downgrade), the org name, saved
  // cards, and billing profiles.
  useEffect(() => {
    const init = async () => {
      if (!tokenUserId) return;
      setLoading(true);
      try {
        const price = priceId
          ? await planService.findPlanWithPrice(priceId)
          : null;
        setPlanPrice(price);
        if (price?.planId) {
          setPlan(await planService.findById(price.planId));
        }

        const profileList = await billingService.findByUserId(tokenUserId);
        setProfiles(profileList);
        const def = profileList.find((p) => p.isDefault) ?? profileList[0];
        setSelectedProfileId(def?.id);
        setBillingSource(newOrg && profileList.length > 0 ? "saved" : "new");

        if (isExisting && organizationId) {
          const [org, sub, cards] = await Promise.all([
            orgService.findById(organizationId),
            subscriptionService.findByOrganizationId(organizationId),
            cardService.listCards(organizationId),
          ]);
          setOrgName(org?.name ?? "");
          setSavedCards(cards);
          setSelectedCardId(cards[0]?.id);
          setCardMode(cards.length > 0 ? "saved" : "new");
          // Decide mode by comparing the selected price to the current plan price.
          if (sub && price) {
            const current = Number(sub.price ?? 0);
            const next = Number(price.price ?? 0);
            setMode(
              next > current
                ? "UPGRADE"
                : next < current
                  ? "DOWNGRADE"
                  : "RENEWAL",
            );
          } else {
            setMode("RENEWAL");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenUserId, priceId]);

  // Poll source-based payments (PromptPay / internet banking) until resolved.
  const startPolling = useCallback(
    (invoiceId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const res = await invoiceService.getStatus(invoiceId);
        if (res.status === "PAID") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (res.invoice) setInvoice(res.invoice);
          setDone(true);
        } else if (res.status === "FAILED" || res.status === "EXPIRED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMessage("Payment failed or expired. Please try again.");
        }
      }, 3000);
    },
    [invoiceService],
  );

  // Resume after an internet-banking redirect back to this page.
  useEffect(() => {
    const resume = async () => {
      if (!resumeInvoiceId) return;
      setLoading(true);
      const res = await invoiceService.getStatus(resumeInvoiceId);
      if (res.status === "PAID" && res.invoice) {
        setInvoice(res.invoice);
        setDone(true);
      } else {
        const inv = await invoiceService.findOne(resumeInvoiceId);
        if (inv) {
          setInvoice(inv);
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

  // New-org: on success, switch the active org to the freshly created one.
  const switchedRef = useRef(false);
  useEffect(() => {
    if (newOrg && done && invoice?.organizationId && !switchedRef.current) {
      switchedRef.current = true;
      update({ user: { organizationId: invoice.organizationId } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrg, done, invoice?.organizationId]);

  /** Collect org + billing fields for a new-org purchase (from form + saved/new tax). */
  const buildNewOrgPayload = async (): Promise<OrgBillingFormValues | null> => {
    const values = (await orgForm.validateFields()) as OrgBillingFormValues;
    if (billingSource === "saved") {
      const p = profiles.find((x) => x.id === selectedProfileId);
      if (!p) {
        messageApi.error("Please select a billing profile");
        return null;
      }
      setBillingType(p.type);
      return {
        orgName: values.orgName,
        orgDescription: values.orgDescription,
        address: p.address ?? "",
        fullName: p.fullName ?? undefined,
        nationalId: p.nationalId ?? undefined,
        companyName: p.companyName ?? undefined,
        taxId: p.taxId ?? undefined,
        branchCode: p.branchCode ?? undefined,
        branchName: p.branchName ?? undefined,
        contactName: p.contactName ?? undefined,
        phone: p.phone ?? undefined,
        email: p.email ?? undefined,
      };
    }
    // New tax info lives in the separate taxForm.
    const tax = (await taxForm.validateFields()) as OrgBillingFormValues;
    return {
      ...tax,
      orgName: values.orgName,
      orgDescription: values.orgDescription,
    };
  };

  /** Create the invoice for the current mode (CREATE / RENEWAL / UPGRADE). */
  const createInvoice = async (): Promise<IInvoice | null> => {
    if (invoice) return invoice;
    if (!priceId || !purchaserUserId) {
      messageApi.error("Missing required information");
      return null;
    }
    if (newOrg) {
      const org = await buildNewOrgPayload();
      if (!org) return null;
      const billingProfileType =
        billingSource === "saved"
          ? (profiles.find((x) => x.id === selectedProfileId)?.type ??
            billingType)
          : billingType;
      const inv = await invoiceService.create({
        userId: purchaserUserId,
        planPriceId: priceId,
        paymentMethod: method,
        createNewOrganization: true,
        orgName: org.orgName,
        orgType: "team",
        orgDescription: org.orgDescription,
        billing: {
          type: billingProfileType,
          address: org.address,
          fullName: org.fullName,
          nationalId: org.nationalId,
          companyName: org.companyName,
          taxId: org.taxId,
          branchCode: org.branchCode,
          branchName: org.branchName,
          contactName: org.contactName,
          phone: org.phone,
          email: org.email,
        },
      });
      setInvoice(inv);
      return inv;
    }
    // existing org
    if (!organizationId || !selectedProfileId) {
      messageApi.error("Please select a billing profile");
      return null;
    }
    const changeType: ChangeType = mode === "UPGRADE" ? "UPGRADE" : "RENEWAL";
    const inv = await invoiceService.create({
      organizationId,
      userId: purchaserUserId,
      billingProfileId: selectedProfileId,
      planPriceId: priceId,
      paymentMethod: method,
      changeType,
    });
    setInvoice(inv);
    return inv;
  };

  /** Prefer the backend error message (e.g. the free-plan guard) over axios's. */
  const apiErr = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? (err instanceof Error ? err.message : fallback);

  /** Pay with a new card (tokenize → charge, optionally saving it). */
  const handleNewCard = async (cardData: CardData) => {
    setPaying(true);
    setErrorMessage(null);
    try {
      const inv = await createInvoice();
      if (!inv) return;
      // Free plan (฿0) is auto-confirmed by the backend → skip payment.
      if (inv.status === "PAID") {
        setDone(true);
        return;
      }
      const token = await tokenize(cardData);
      const paid = await invoiceService.payCard(inv.id, {
        token,
        saveCard: saveNewCard,
      });
      setInvoice(paid);
      setDone(true);
    } catch (err) {
      setErrorMessage(apiErr(err, "Payment was declined."));
    } finally {
      setPaying(false);
    }
  };

  /** Pay with a previously-saved card. */
  const handleSavedCard = async () => {
    if (!selectedCardId) {
      messageApi.error("Please select a card");
      return;
    }
    setPaying(true);
    setErrorMessage(null);
    try {
      const inv = await createInvoice();
      if (!inv) return;
      if (inv.status === "PAID") {
        setDone(true);
        return;
      }
      const paid = await invoiceService.payCard(inv.id, {
        cardId: selectedCardId,
      });
      setInvoice(paid);
      setDone(true);
    } catch (err) {
      setErrorMessage(apiErr(err, "Payment was declined."));
    } finally {
      setPaying(false);
    }
  };

  /** Pay with PromptPay QR or internet banking (source-based). */
  const handleSourcePay = async () => {
    setPaying(true);
    setErrorMessage(null);
    try {
      const inv = await createInvoice();
      if (!inv) return;
      if (inv.status === "PAID") {
        setDone(true);
        return;
      }
      if (method === "PROMPTPAY") {
        const res = await invoiceService.paySource(inv.id, "PROMPTPAY");
        setQrUri(res.qrImageUri ?? null);
        startPolling(inv.id);
      } else {
        const returnUri = `${window.location.origin}/page/payment/checkout?invoiceId=${inv.id}${newOrg ? "&newOrg=1" : ""}`;
        const res = await invoiceService.paySource(inv.id, "INTERNET_BANKING", {
          bank,
          returnUri,
        });
        if (res.authorizeUri) {
          window.location.href = res.authorizeUri;
        } else {
          setErrorMessage("Could not start internet banking payment.");
        }
      }
    } catch (err) {
      setErrorMessage(apiErr(err, "Could not start payment."));
    } finally {
      setPaying(false);
    }
  };

  /** Downgrade is free and scheduled for the next cycle (no Omise charge). */
  const handleConfirmDowngrade = async () => {
    if (!organizationId || !priceId) return;
    setPaying(true);
    setErrorMessage(null);
    try {
      await axiosUser.post(
        `/organization-subscription/downgrade/${organizationId}`,
        {
          priceId,
        },
      );
      setDone(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not schedule downgrade.",
      );
    } finally {
      setPaying(false);
    }
  };

  /** Delete a saved card. */
  const handleDeleteCard = async (cardId: string) => {
    if (!organizationId) return;
    try {
      const cards = await cardService.deleteCard(organizationId, cardId);
      setSavedCards(cards);
      if (selectedCardId === cardId) setSelectedCardId(cards[0]?.id);
      if (cards.length === 0) setCardMode("new");
    } catch {
      messageApi.error("Could not delete card");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  const subTotal = Number(planPrice?.price ?? 0);
  const total = subTotal * 1.07;

  // ── success ─────────────────────────────────────────────────
  if (done) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        {contextHolder}
        <Result
          status="success"
          title={
            mode === "DOWNGRADE" ? "Downgrade scheduled" : "Payment successful!"
          }
          subTitle={
            mode === "DOWNGRADE"
              ? "Your plan will change at the start of the next billing cycle."
              : newOrg
                ? `Invoice ${invoice?.invoiceNo ?? ""} paid. Your organization is ready.`
                : `Invoice ${invoice?.invoiceNo ?? ""} paid. Your subscription is active.`
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
                    key="org"
                    type="primary"
                    onClick={() => router.push("/page/organization")}
                  >
                    View Organization
                  </Button>,
                  <Button
                    key="dash"
                    onClick={() => router.push("/page/dashboard")}
                  >
                    Go to Dashboard
                  </Button>,
                ]
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Script src="https://cdn.omise.co/omise.js" strategy="afterInteractive" />
      {contextHolder}

      {/* <div className="flex items-center gap-3  h-10">
        <Button
          // type="text"
          // size="small"
          icon={<ArrowLeft size={18} />}
          onClick={() => router.push("/page/plans")}
          className="!px-1 !text-gray-300 hover:!text-white"
        ></Button>
        <h1 className="text-2xl font-bold text-white leading-none flex items-center h-full">
          Checkout
        </h1>
        <Tag
          color={mode === "DOWNGRADE" ? "orange" : "blue"}
          className="h-full flex items-center justify-center m-0 text-sm"
        >
          {MODE_LABEL[mode]}
        </Tag>
      </div> */}

      <div className="flex items-center gap-3 h-[16px]">
        {" "}
        {/* 1. กำหนดความสูงให้ Container กลาง เช่น h-10 (40px) หรือ h-8 */}
        <button
          onClick={() => router.push("/page/plans")}
          // 2. ใช้ h-full เพื่อให้สูงเท่า Container และ flex justify-center items-center เพื่อให้ Icon อยู่ตรงกลางปุ่ม
          className=" cursor-pointer !px-1 !text-gray-300 hover:!text-white h-full flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        {/* 3. ใช้ leading-none หรือ leading-normal เพื่อเคลียร์พื้นที่ของตัวอักษร h1 */}
        <h1 className="text-2xl font-bold text-white leading-none h-full">
          Checkout
        </h1>
        <Tag
          color={mode === "DOWNGRADE" ? "orange" : "blue"}
          // 4. ใช้ h-full และ flex items-center เพื่อให้ Tag ยืดสูงเท่าเพื่อน และข้อความข้างในอยู่ตรงกลาง
          className="h-full flex items-center justify-center m-0 text-sm"
        >
          {MODE_LABEL[mode]}
        </Tag>
      </div>
      {/* <Card size="small"> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── LEFT: Package ─────────────────────────────────── */}
          <div>
            {/* <Title level={4}  >Package</Title> */}
            {/* <Card
            size="small"
            title="Package"
            className={CARD_CLASS}
            styles={CARD_STYLES}
          > */}
            {/* 1.1 Organization */}
            <p className="text-white font-semibold mb-2" >
              Organization
            </p>
            {newOrg ? (
              <Form form={orgForm} layout="vertical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    label="Organization Name"
                    name="orgName"
                    rules={[
                      {
                        required: true,
                        message: "Organization name is required",
                      },
                    ]}
                  >
                    <Input placeholder="My Company" />
                  </Form.Item>
                  <Form.Item label="Description" name="orgDescription">
                    <Input placeholder="Optional" />
                  </Form.Item>
                </div>
              </Form>
            ) : (
              <div className="text-gray-300 mb-2">
                <span className="text-white font-medium">{orgName || "—"}</span>
                {/* <span className="text-gray-500 text-sm ml-2">(read-only)</span> */}
              </div>
            )}

            <Divider className="!my-3" />

            {/* 1.2 Price */}
            <p className="text-white font-semibold mb-2">Price</p>
            <div className="text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>
                  {plan?.name ?? planPrice?.plan?.name ?? "Plan"} ·{" "}
                  {planPrice?.interval}
                </span>
                <span>{formatTHB(subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT 7%</span>
                <span>{formatTHB(subTotal * 0.07)}</span>
              </div>
              <div className="mt-2 flex justify-between items-center border-t border-[#3a3a40] pt-2 font-semibold text-white">
                <span>Total</span>
                <span className="text-lg" style={{ color: ACCENT }}>
                  {formatTHB(total)}
                </span>
              </div>
            </div>

            <Divider className="!my-3" />

            {/* 1.3 Plan details + features */}
            <p className="text-white font-semibold mb-2">
              {plan?.name ?? "Plan"} includes
            </p>
            {plan?.description && (
              <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
            )}
            <div className="space-y-2">
              {(plan?.features ?? []).map((f, i) => (
                <div key={f.id ?? i} className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      f.isHighlight
                        ? "text-green-400 font-semibold"
                        : "text-gray-300"
                    }`}
                  >
                    {f.label ? `${f.label}: ` : ""}
                    {f.text}
                  </span>
                </div>
              ))}
              {(!plan || (plan.features ?? []).length === 0) && (
                <span className="text-gray-500 text-sm">
                  No feature details available.
                </span>
              )}
            </div>
            {/* </Card> */}
          </div>
          {/* ── RIGHT: Payment ────────────────────────────────── */}
          <Card
            size="small"
            // title="Payment"
            className={CARD_CLASS}
            styles={CARD_STYLES}
          >
            {/* <Title level={4}>Payment</Title> */}
            {errorMessage && (
              <Alert
                type="error"
                message={errorMessage}
                showIcon
                className="mb-4"
              />
            )}
<Title level={4}>Payment</Title>
            {/* 2.1 Tax Invoice Information */}
            <p className="text-white font-semibold mb-2">
              Tax Invoice Information
            </p>
            {newOrg && profiles.length > 0 && (
              <div className="mb-3">
                <Segmented<"saved" | "new">
                  value={billingSource}
                  onChange={(v) => setBillingSource(v)}
                  options={[
                    { value: "saved", label: "Use a saved profile" },
                    { value: "new", label: "Enter new tax info" },
                  ]}
                  block
                />
              </div>
            )}

            {(!newOrg || billingSource === "saved") && profiles.length > 0 ? (
              <div className="mb-3">
                <Select
                  className="w-full"
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
              </div>
            ) : newOrg ? (
              <Form form={taxForm} layout="vertical">
                <TaxInvoiceFields type={billingType} setType={setBillingType} />
              </Form>
            ) : (
              <Alert
                type="warning"
                showIcon
                message="No billing profile found."
                action={
                  <Button
                    size="small"
                    onClick={() => router.push("/page/profile/billing")}
                  >
                    Add one
                  </Button>
                }
                className="mb-3"
              />
            )}

            <Divider className="!my-3" />

            {/* 2.2 Payment (Omise) — hidden for downgrade (free) */}
            {mode === "DOWNGRADE" ? (
              <div className="space-y-3">
                <Alert
                  type="info"
                  showIcon
                  message="No payment required"
                  description="Downgrades are free and take effect at the start of your next billing cycle."
                />
                <Button
                  type="primary"
                  block
                  loading={paying}
                  onClick={handleConfirmDowngrade}
                >
                  Confirm downgrade
                </Button>
              </div>
            ) : (
              <>
                <p className="text-white font-semibold mb-2">Payment method</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {METHOD_OPTIONS.map((o) => (
                    <div
                      key={o.value}
                      role="button"
                      onClick={() => setMethod(o.value)}
                      className={tileClass(method === o.value)}
                    >
                      {o.icon}
                      <span className="text-sm">{o.label}</span>
                    </div>
                  ))}
                </div>

                {method === "CARD" && (
                  <div className="space-y-3">
                    {savedCards.length > 0 && (
                      <Segmented<"saved" | "new">
                        value={cardMode}
                        onChange={(v) => setCardMode(v)}
                        options={[
                          { value: "saved", label: "Saved card" },
                          { value: "new", label: "New card" },
                        ]}
                        block
                      />
                    )}

                    {cardMode === "saved" && savedCards.length > 0 ? (
                      <>
                        <div className="flex flex-col gap-2 w-full">
                          {savedCards.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => setSelectedCardId(c.id)}
                              className={`${tileClass(
                                selectedCardId === c.id,
                              )} justify-between`}
                            >
                              <span className="flex items-center gap-2 text-sm">
                                <CreditCard size={16} />
                                {c.brand ?? "Card"} •••• {c.last_digits}
                                <span className="text-gray-500">
                                  {c.expiration_month}/{c.expiration_year}
                                </span>
                              </span>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<Trash2 size={14} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCard(c.id);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <Button
                          type="primary"
                          block
                          loading={paying}
                          onClick={handleSavedCard}
                        >
                          Pay {formatTHB(total)}
                        </Button>
                      </>
                    ) : (
                      <>
                        <CardPaymentForm
                          onSubmit={handleNewCard}
                          loading={paying}
                          errorMessage={errorMessage}
                          setCurrent={() => {}}
                        />
                        <label className="flex items-center gap-2 text-gray-400 text-sm">
                          <input
                            type="checkbox"
                            checked={saveNewCard}
                            onChange={(e) => setSaveNewCard(e.target.checked)}
                          />
                          Save this card for future payments
                        </label>
                      </>
                    )}
                  </div>
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
                        block
                        loading={paying}
                        onClick={handleSourcePay}
                      >
                        Generate PromptPay QR — {formatTHB(total)}
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
                    />
                    <p className="text-gray-400 text-sm">
                      You will be redirected to your bank to authorize the
                      payment.
                    </p>
                    <Button
                      type="primary"
                      block
                      loading={paying}
                      onClick={handleSourcePay}
                    >
                      Continue to bank — {formatTHB(total)}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      {/* </Card> */}
    </div>
  );
}

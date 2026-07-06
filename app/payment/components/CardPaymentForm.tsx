"use client";

import { Alert, Button, Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import CardBrandIcon, { detectBrand } from "./CardBrandIcon";
import CardNumberInput from "./CardNumberInput";
import type { CardData } from "../hooks/useOmiseToken";

interface CardPaymentFormProps {
  onSubmit: (cardData: CardData) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  setCurrent: (step: number) => void;
}

const inputStyle = {
  background: "#2A3038",
  border: "1px solid #3A434F",
  color: "#F2F4F5",
  borderRadius: 8,
  fontSize: 15,
};

const labelStyle = {
  color: "#8C99A9",
  fontSize: 13,
  fontWeight: 600 as const,
};

/** Card payment form with Ant Design fields, brand detection, and error shake. */
export default function CardPaymentForm({
  onSubmit,
  loading,
  errorMessage,
  setCurrent,
}: CardPaymentFormProps) {
  const [form] = Form.useForm();
  const [cardNumber, setCardNumber] = useState("");
  const [brand, setBrand] = useState<"visa" | "mastercard" | "jcb" | null>(
    null,
  );
  const [shaking, setShaking] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Trigger shake animation whenever a new error arrives
  useEffect(() => {
    if (!errorMessage) return;
    setShaking(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShaking(true));
    });
    const t = setTimeout(() => setShaking(false), 600);
    return () => clearTimeout(t);
  }, [errorMessage]);

  const handleCardNumberChange = (formatted: string) => {
    setCardNumber(formatted);
    setBrand(detectBrand(formatted));
    form.setFieldValue("cardNumber", formatted);
  };

  const handleFinish = async (values: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) => {
    const [month = "", year = ""] = (values.expiry ?? "")
      .split("/")
      .map((s) => s.trim());
    await onSubmit({
      name: values.cardName,
      number: values.cardNumber,
      expiryMonth: month,
      expiryYear: year,
      cvv: values.cvv,
    });
  };

  return (
    <div
      style={{
        padding: "48px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* Header */}
      <div>
        <h2
          style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#F2F4F5" }}
        >
          Card Details
        </h2>
        <p style={{ margin: "4px 0 0", color: "#8C99A9", fontSize: 14 }}>
          Your payment is secured and encrypted.
        </p>
      </div>

      {/* Error alert with shake */}
      {errorMessage && (
        <div
          ref={errorRef}
          className={shaking ? "animate-shake" : ""}
          style={{ borderRadius: 8, overflow: "hidden" }}
        >
          <Alert
            type="error"
            message={errorMessage}
            showIcon
            style={{
              background: "rgba(255, 60, 56, 0.12)",
              border: "1px solid rgba(255, 60, 56, 0.35)",
              color: "#FF3C38",
            }}
          />
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        {/* Cardholder name */}
        <Form.Item
          name="cardName"
          label={<span style={labelStyle}>Cardholder Name</span>}
          rules={[
            { required: true, message: "Please enter the cardholder name." },
          ]}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="Full name on card"
            size="large"
            disabled={loading}
            autoComplete="cc-name"
            style={inputStyle}
          />
        </Form.Item>

        {/* Card number with brand icon */}
        <Form.Item
          name="cardNumber"
          label={<span style={labelStyle}>Card Number</span>}
          rules={[
            { required: true, message: "Please enter your card number." },
            {
              validator: (_, val) => {
                const digits = (val ?? "").replace(/\s/g, "");
                return digits.length === 16
                  ? Promise.resolve()
                  : Promise.reject("Card number must be 16 digits.");
              },
            },
          ]}
          style={{ marginBottom: 16 }}
        >
          <div style={{ position: "relative" }}>
            <CardNumberInput
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={loading}
            />
            {brand && (
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <CardBrandIcon
                  brand={brand}
                  className={brand === "visa" ? undefined : undefined}
                  // inline size via style since Tailwind classes may not apply to SVGs in all cases
                />
                <style>{`
                  [aria-label="Visa"] { width: 38px; height: 13px; }
                  [aria-label="Mastercard"] { width: 32px; height: 20px; }
                  [aria-label="JCB"] { width: 32px; height: 20px; }
                `}</style>
              </div>
            )}
          </div>
        </Form.Item>

        {/* Expiry + CVV row */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <Form.Item
            name="expiry"
            label={<span style={labelStyle}>Expiry Date</span>}
            rules={[
              { required: true, message: "Required." },
              {
                pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                message: "Use MM/YY format.",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input
              placeholder="MM / YY"
              size="large"
              maxLength={5}
              disabled={loading}
              autoComplete="cc-exp"
              inputMode="numeric"
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                form.setFieldValue("expiry", val);
              }}
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            name="cvv"
            label={<span style={labelStyle}>CVV</span>}
            rules={[
              { required: true, message: "Required." },
              { pattern: /^\d{3,4}$/, message: "3–4 digits." },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input
              placeholder="•••"
              size="large"
              maxLength={4}
              disabled={loading}
              autoComplete="cc-csc"
              inputMode="numeric"
              type="password"
              style={inputStyle}
            />
          </Form.Item>
        </div>

        {/* Submit */}
        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Button onClick={() => setCurrent(1)}>Back</Button>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
            style={{
              height: 52,
              background: loading
                ? "#4B49A1"
                : "linear-gradient(135deg, #6F6ADE 0%, #4B49A1 100%)",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {loading ? "Processing…" : "Pay ฿990"}
          </Button>
        </Form.Item>
      </Form>

      {/* Fine print */}
      <p
        style={{
          margin: 0,
          color: "#3A434F",
          fontSize: 12,
          textAlign: "center",
        }}
      >
    
      </p>
    </div>
  );
}

"use client";

import { Input } from "antd";
import type { InputRef } from "antd";
import { forwardRef } from "react";
import type { ChangeEvent } from "react";

interface CardNumberInputProps {
  value?: string;
  onChange?: (formatted: string) => void;
  status?: "" | "error" | "warning";
  disabled?: boolean;
}

/** Formats raw digits into XXXX XXXX XXXX XXXX as the user types. */
const CardNumberInput = forwardRef<InputRef, CardNumberInputProps>(
  ({ value = "", onChange, status, disabled }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      onChange?.(formatted);
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="1234 5678 9012 3456"
        maxLength={19}
        status={status}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="cc-number"
        size="large"
        style={{
          background: "#2A3038",
          border: "1px solid #3A434F",
          color: "#F2F4F5",
          borderRadius: 8,
          fontSize: 16,
          letterSpacing: "0.1em",
        }}
      />
    );
  },
);

CardNumberInput.displayName = "CardNumberInput";

export default CardNumberInput;

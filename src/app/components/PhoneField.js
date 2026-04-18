"use client";

/**
 * PhoneField — wraps react-phone-number-input with styling that matches our
 * existing form inputs. Renders a flag + dial-code country selector and a
 * formatted number input in a single row.
 *
 * Props:
 *   id         — links the label's htmlFor
 *   value      — E.164 string or ""  (controlled)
 *   onChange   — (value: string) => void
 *   hasError   — boolean — applies red border/bg when true
 *   ariaDescribedBy — string (optional)
 */

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function PhoneField({ id, value, onChange, hasError, ariaDescribedBy }) {
  return (
    <div
      className={`phone-field-wrapper flex items-center rounded-lg border bg-white transition
        focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary
        ${hasError
          ? "border-red-400 bg-red-50/30"
          : "border-gray-300 hover:border-gray-400"
        }`}
    >
      <PhoneInput
        id={id}
        international
        defaultCountry="PK"
        countryCallingCodeEditable={false}
        value={value}
        onChange={onChange}
        placeholder="+92 300 0000000"
        aria-describedby={ariaDescribedBy}
        aria-invalid={hasError}
        smartCaret
      />
    </div>
  );
}

// src/components/BtnLong.jsx
import React from "react";

export default function BtnLong({
  label = "로그인",
  variant = "primary", // "primary" | "disabled"
  className = "",
  ...props
}) {
  const base =
    "w-full h-12 rounded-md flex items-center justify-center text-body-semibold-16 font-pretendard";

  // variant별 스타일을 확실한 색상(hex)으로 지정
  const variantClass =
    variant === "primary"
      ? "bg-[#FC7E2A] text-white"
      : "bg-[#D6D6D6] text-[#444444]";

  const isDisabled = variant === "disabled" || props.disabled;

  return (
    <button
      type="button"
      className={`${base} ${variantClass} ${
        isDisabled ? "cursor-not-allowed" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {label}
    </button>
  );
}

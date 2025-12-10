// src/components/BtnShort.jsx
import React from "react";

export default function BtnShort({
  label = "같이 타기",
  variant = "primary", // "primary" | "disabled"
  className = "",
  ...props
}) {
  // 공통 스타일 : 높이 48px, 가운데 정렬, 16px Bold
  const base =
    "h-12 rounded-md flex items-center justify-center text-body-semibold-16 font-pretendard";

  // 기본 폭: 피그마 기준 176.5px
  const widthClass = "w-[176.5px]";

  // 상태별 색상 (BtnLong과 동일한 팔레트)
  const variantClass =
    variant === "primary"
      ? "bg-[#FC7E2A] text-white"
      : "bg-[#D6D6D6] text-[#444444]";

  const isDisabled = variant === "disabled" || props.disabled;

  return (
    <button
      type="button"
      className={`${base} ${widthClass} ${variantClass} ${
        isDisabled ? "cursor-not-allowed" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {label}
    </button>
  );
}

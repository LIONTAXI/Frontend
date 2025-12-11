import React from "react";

export default function BtnShort({
  label = "같이 타기",
  variant = "primary", 
  className = "",
  ...props
}) {
  const base =
    "h-12 rounded-md flex items-center justify-center text-body-semibold-16 font-pretendard";

  const widthClass = "w-[176.5px]";

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

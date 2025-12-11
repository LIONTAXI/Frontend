import React from "react";
import IconPin2 from "../assets/icon/icon_pin2.svg";

export default function TaxiPotCard({
  destination,
  exitInfo,
  deadline,
  currentCount,
  maxCount,
  price,
  emoji,
  highlighted,
  variant = "small",    
  fullWidth = false,
  onClick,
}) {
  const isBig = variant === "big";

  const widthClass = isBig
    ? "w-full"
    : fullWidth
    ? "w-full"
    : "w-[155px]";

  const borderClass = highlighted ? "border-orange-main" : "border-black-20";

  const exitTextClass = isBig
    ? "text-[16px] font-medium text-black-50"
    : "text-[14px] font-semibold text-black-50";

  const priceTextClass = isBig
    ? "text-[16px] font-bold text-black-70"
    : "text-[14px] font-semibold text-black-70";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${widthClass} shrink-0
        bg-white rounded-[4px]
        border ${borderClass}
        p-2 flex flex-col gap-2
        text-left
        outline-none
      `}
    >
      <div className="flex items-center gap-1">
        <img src={IconPin2} alt="목적지" className="w-5 h-5" />
        <span className="text-[16px] font-semibold text-black-90">
          {destination}
        </span>
      </div>

      <p className={exitTextClass}>
        {emoji} {exitInfo}
      </p>

      <div className="flex items-center justify-between text-[14px] font-semibold">
        <div className="flex items-center gap-1">
          <span className="text-black-40">마감</span>
          <span className="text-black-70">{deadline}</span>
        </div>
        <span className="text-black-40">
          <span className="text-orange-main">{currentCount}</span>/{maxCount}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-black-40 text-[14px] font-semibold">예상</span>
        <span className={priceTextClass}>{price}</span>
      </div>
    </button>
  );
}

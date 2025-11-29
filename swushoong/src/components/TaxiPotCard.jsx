// src/components/TaxiPotCard.jsx
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

  // width: small은 155px, big은 그리드 칼럼 너비를 꽉 채우게
  const widthClass = isBig
    ? "w-full"
    : fullWidth
    ? "w-full"
    : "w-[155px]";

  const borderClass = highlighted ? "border-orange-main" : "border-black-20";

  // 피그마 big 카드에서 출구/예상금액 폰트가 더 큼
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
      {/* 상단 목적지 */}
      <div className="flex items-center gap-1">
        <img src={IconPin2} alt="목적지" className="w-5 h-5" />
        <span className="text-[16px] font-semibold text-black-90">
          {destination}
        </span>
      </div>

      {/* 출구 + 이모지 */}
      <p className={exitTextClass}>
        {emoji} {exitInfo}
      </p>

      {/* 마감 시간 + 인원 */}
      <div className="flex items-center justify-between text-[14px] font-semibold">
        <div className="flex items-center gap-1">
          <span className="text-black-40">마감</span>
          <span className="text-black-70">{deadline}</span>
        </div>
        <span className="text-black-40">
          <span className="text-orange-main">{currentCount}</span>/{maxCount}
        </span>
      </div>

      {/* 예상 금액 */}
      <div className="flex items-center gap-1">
        <span className="text-black-40 text-[14px] font-semibold">예상</span>
        <span className={priceTextClass}>{price}</span>
      </div>
    </button>
  );
}

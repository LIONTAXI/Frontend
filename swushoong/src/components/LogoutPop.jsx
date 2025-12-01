// src/components/LogoutPop.jsx
import React from "react";
import BtnShort from "./BtnShort";

export default function LogoutPop({
  open,
  title = "로그아웃할까요?",
  description = "초기 로그인 화면으로 돌아가요.",
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    // 🔹 MyScreen 루트(div)가 relative 이기 때문에
    //    absolute + inset-0 로 ‘폰 화면 전체’에 오버레이 깔림
    <div
      className="absolute inset-0 z-[1000] bg-[rgba(0,0,0,0.7)] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      {/* 팝업 카드 */}
      <div
        className="w-[361px] bg-white rounded-[8px] pt-8 pb-4 px-4 flex flex-col items-center gap-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 + 설명 */}
        <div className="w-full flex flex-col items-center gap-2">
          <h2 className="w-full text-center text-[20px] font-bold text-[#222222]">
            {title}
          </h2>
          <p className="w-full text-center text-[16px] font-medium leading-[22.4px] text-[#222222]">
            {description}
          </p>
        </div>

        {/* 버튼 영역 (취소 / 확인) */}
        <div className="w-full flex items-center gap-2">
          {/* 취소: 회색 버튼 (BtnShort 사용, 색상은 style로 강제) */}
          <BtnShort
            label={cancelText}
            variant="primary"
            onClick={onCancel}
            className="w-full rounded-[4px]"
            style={{
              backgroundColor: "#D6D6D6",
              color: "#444444",
            }}
          />

          {/* 확인: 주황 버튼 */}
          <BtnShort
            label={confirmText}
            variant="primary"
            onClick={onConfirm}
            className="w-full rounded-[4px]"
          />
        </div>
      </div>
    </div>
  );
}

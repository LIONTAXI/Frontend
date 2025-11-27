// src/components/Header.jsx
import React from "react";
import LeftIcon from "../assets/icon/icon_left.svg";

export default function Header({
  title = "회원가입",
  onBack,
  className = "",
}) {
  return (
    <header
      className={`w-full h-14 flex items-center px-4 bg-white ${className}`}
    >
      {/* 왼쪽 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={onBack}
        className="w-6 h-6 flex items-center justify-center"
      >
        <img
          src={LeftIcon}
          alt="뒤로가기"
          className="w-4 h-4"
        />
      </button>

      {/* 가운데 타이틀 */}
      <h1 className="flex-1 text-center text-head-regular-20 text-black-90">
        {title}
      </h1>

      {/* 오른쪽 정렬용 더미 영역 (아이콘 넓이만큼) */}
      <div className="w-6" />
    </header>
  );
}

// src/components/Header.jsx
import React from "react";
import LeftIcon from "../assets/icon/icon_left.svg";

export default function Header({
  title = "회원가입",
  onBack,
  className = "",
  rightIcon,         
  onRightClick,       
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
          className="w-6 h-6"
        />
      </button>

      {/* 가운데 타이틀 */}
      <h1 className="flex-1 text-center text-head-regular-20 text-black-90">
        {title}
      </h1>

      {/* 오른쪽: 메뉴 아이콘이 있으면 버튼, 아니면 더미 영역 */}
      {rightIcon ? (
        <button
          type="button"
          onClick={onRightClick}
          className="w-6 h-6 flex items-center justify-center"
        >
          <img src={rightIcon} alt="메뉴" className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-6" />
      )}
    </header>
  );
}

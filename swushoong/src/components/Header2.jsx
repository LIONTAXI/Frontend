// src/components/Header.jsx
import React from "react";
import LeftIcon from "../assets/icon/icon_left.svg";
import MenuIcon from "../assets/icon/icon_menu.svg";

export default function Header2({
  title = "회원가입",
  onBack,
  onMenu,
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

      {/* 더보기 아이콘 */}
      {onMenu ? (
        <button
          type="button"
          onClick={onMenu}
          className="w-6 h-6 flex items-center justify-end p-1" // 크기와 패딩 조정
        >
          <img
            src={MenuIcon}
            alt="더보기"
            className="w-4 h-4"
          />
        </button>
      ) : (
        // onMenu prop이 없을 경우, 타이틀을 중앙에 오게 하기 위한 빈 공간 (자리만 차지)
        <div className="w-6 h-6" />
      )}
    </header>
  );
}

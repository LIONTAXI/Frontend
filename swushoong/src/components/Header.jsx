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

      <h1 className="flex-1 text-center text-head-regular-20 text-black-90">
        {title}
      </h1>

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

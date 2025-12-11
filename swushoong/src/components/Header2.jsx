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

      <h1 className="flex-1 text-center text-head-regular-20 text-black-90">
        {title}
      </h1>

      {onMenu ? (
        <button
          type="button"
          onClick={onMenu}
          className="w-6 h-6 flex items-center justify-end p-1" 
        >
          <img
            src={MenuIcon}
            alt="더보기"
            className="w-4 h-4"
          />
        </button>
      ) : (
        <div className="w-6 h-6" />
      )}
    </header>
  );
}

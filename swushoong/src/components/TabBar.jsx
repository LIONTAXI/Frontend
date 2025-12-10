// src/components/TabBar.jsx
import React from "react";

import HomeActiv from "../assets/icon/HomeActiv.svg";
import HomeNone from "../assets/icon/HomeNone.svg";
import ChatActiv from "../assets/icon/ChatActiv.svg";
import ChatNone from "../assets/icon/ChatNone.svg";
import MypageActiv from "../assets/icon/MypageActiv.svg";
import MypageNone from "../assets/icon/MyPageNone.svg";

export default function TabBar({
  active = "home",            // "home" | "chat-list" | "my"
  onChange = () => {},        // (key) => void
  className = "",
}) {
  const tabs = [
    {
      key: "home",
      label: "홈",
      activeIcon: HomeActiv,
      inactiveIcon: HomeNone,
    },
    {
      key: "chat-list", // ✅ 경로에 맞게, chat -> chat-list로 수정 
      label: "채팅",
      activeIcon: ChatActiv,
      inactiveIcon: ChatNone,
    },
    {
      key: "my",
      label: "MY",
      activeIcon: MypageActiv,
      inactiveIcon: MypageNone,
    },
  ];

  return (
    <nav
      className={`w-full h-16 bg-white border-t border-black-10 flex items-center ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const iconSrc = isActive ? tab.activeIcon : tab.inactiveIcon;
        const textColor = isActive ? "text-[#FC7E2A]" : "text-[#AAAAAA]";

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center justify-center gap-1"
          >
            <img
              src={iconSrc}
              alt={tab.label}
              className="w-6 h-6"
            />
            <span
              className={`${textColor} text-[14px] font-semibold leading-[19.6px] font-pretendard`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

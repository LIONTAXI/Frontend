// src/screens/NotificationScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MenuIcon from "../assets/icon/icon_menu.svg";

export default function NotificationScreen() {
  const navigate = useNavigate();

  // 임시 알림 데이터
  const notifications = [
    {
      id: 1,
      emoji: "💸",
      title: "정산요청이 들어왔어요.",
      message: "빠른 시일 내에 정산해 주세요.",
      time: "11:44",
      unread: true,
    },
    {
      id: 2,
      emoji: "🚨",
      title: "김슈니님이 정산을 재촉했어요.",
      message: "프로필에 미정산 이력이 남아요. 정산을 서둘러 주세요.",
      time: "9:40",
      unread: true,
    },
    {
      id: 3,
      emoji: "💌",
      title: "후기가 도착했어요.",
      message: "어떤 후기가 도착했는지 확인해 보세요.",
      time: "9:40",
      unread: false,
    },
    {
      id: 4,
      emoji: "🚕",
      title: "총대슈니가 택시팟 참여를 수락했어요.",
      message: "어서 채팅으로 소통해 보세요.",
      time: "10/31",
      unread: false,
    },
    {
      id: 5,
      emoji: "💸",
      title: "정산요청이 들어왔어요.",
      message: "빠른 시일 내에 정산해 주세요.",
      time: "10/30",
      unread: false,
    },
  ];

  const handleClickNotification = (item) => {
    // TODO: 알림 타입에 따라 상세 페이지/채팅 등으로 이동
    console.log("알림 클릭", item);
  };

  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <Header
        title="알림"
        onBack={() => navigate(-1)}
        rightIcon={MenuIcon}                 // 🔹 여기서만 메뉴 아이콘 사용
        onRightClick={() => console.log("알림 메뉴 클릭")}
      />

      {/* 알림 리스트 */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClickNotification(item)}
              className={`
                w-full text-left
                px-4 py-6
                border-b border-black-15
                flex flex-row gap-2
                ${item.unread ? "bg-orange-sub" : "bg-white"}
              `}
            >
              {/* 이모지 */}
              <div className="text-[20px] leading-none text-black-70">
                {item.emoji}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-start gap-1">
                  <p className="text-body-semibold-16 text-black-70">
                    {item.title}
                  </p>
                  {item.unread && (
                    <span className="mt-[6px] w-2 h-2 rounded-full bg-orange-main" />
                  )}
                </div>

                <div className="flex items-end justify-between gap-2">
                  <p className="text-body-regular-14 text-black-70">
                    {item.message}
                  </p>
                  <span className="text-body-regular-14 text-black-70">
                    {item.time}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

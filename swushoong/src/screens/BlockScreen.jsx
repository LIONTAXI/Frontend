// src/screens/BlockScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProfileImg from "../assets/img/profileIMG.svg";

export default function BlockScreen() {
  const navigate = useNavigate();

  // 🔹 차단 사용자 리스트를 상태로 관리
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 1, name: "박슈니 · 23", status: "blocked" },
    { id: 2, name: "이슈니 · 23", status: "blocked" },
    { id: 3, name: "김슈니 · 21", status: "released" }, // 해제 완료 상태
  ]);

  const handleUnblock = (id) => {
    // TODO: 나중에 여기서 차단 해제 API 호출
    console.log("unblock", id);

    // 클릭한 유저의 status 를 released 로 변경
    setBlockedUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: "released" } : user
      )
    );
  };

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <Header title="차단한 사용자" onBack={() => navigate(-1)} />

      {/* 콘텐츠 */}
      <main className="flex-1 px-4 pt-6 pb-6">
        {/* 화면 타이틀 */}
        <h2 className="text-head-bold-20 text-black-90 mb-4">
          차단한 사용자
        </h2>

        {/* 차단 리스트 */}
        <div className="space-y-4">
          {blockedUsers.map((user) => {
            const isReleased = user.status === "released";
            const btnLabel = isReleased ? "해제 완료" : "차단 해제";

            return (
              <div
                key={user.id}
                className="flex items-center justify-between"
              >
                {/* 프로필 + 이름 */}
                <div className="flex items-center gap-[9px]">
                  <img
                    src={ProfileImg}
                    alt={user.name}
                    className="w-11 h-11 rounded-full border border-[#D6D6D6] bg-[#D6D6D6] object-cover"
                  />
                  <span className="text-[16px] font-semibold text-[#444444]">
                    {user.name}
                  </span>
                </div>

                {/* 버튼 (차단 해제 / 해제 완료) */}
                <button
                  type="button"
                  disabled={isReleased}
                  onClick={() => !isReleased && handleUnblock(user.id)}
                  className={`px-3 py-[6px] rounded-[4px] text-[14px] font-semibold leading-[19.6px] ${
                    isReleased
                      ? "bg-[#D6D6D6] text-[#444444] cursor-default"
                      : "bg-[#FC7E2A] text-white"
                  }`}
                >
                  {btnLabel}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

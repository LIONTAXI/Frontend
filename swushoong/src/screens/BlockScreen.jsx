// src/screens/BlockScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProfileImg from "../assets/img/profileIMG.svg";
import { getBlockedUsers, unblockUser } from "../api/my";

export default function BlockScreen() {
  const navigate = useNavigate();

  // 로그인한 유저 ID (blockerId)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // 차단 사용자 리스트
  const [blockedUsers, setBlockedUsers] = useState([]);

  // 차단 목록 조회
  useEffect(() => {
    if (!USER_ID) return;

    (async () => {
      try {
        const list = await getBlockedUsers(USER_ID);

        const mapped = Array.isArray(list)
          ? list.map((item) => ({
              blockId: item.blockId,
              blockedUserId: item.blockedUserId,
              name: `${item.blockedUserName} · ${item.blockedUserShortStudentId}`,
              imgUrl: item.blockedUserImgUrl,
              status: "blocked", // 처음에는 모두 차단 상태
            }))
          : [];

        setBlockedUsers(mapped);
      } catch (err) {
        console.error("[BlockScreen] 차단 목록 조회 실패:", err);
        setBlockedUsers([]);
      }
    })();
  }, [USER_ID]);

  const handleUnblock = async (user) => {
    if (!USER_ID) return;

    try {
      await unblockUser(USER_ID, user.blockedUserId);
      console.log("[BlockScreen] 차단 해제 완료:", user);

      // 해당 유저만 status를 released로 변경
      setBlockedUsers((prev) =>
        prev.map((u) =>
          u.blockId === user.blockId ? { ...u, status: "released" } : u
        )
      );
    } catch (err) {
      console.error("[BlockScreen] 차단 해제 실패:", err);
    }
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
                key={user.blockId}
                className="flex items-center justify-between"
              >
                {/* 프로필 + 이름 */}
                <div className="flex items-center gap-[9px]">
                  <img
                    src={user.imgUrl || ProfileImg}
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
                  onClick={() => !isReleased && handleUnblock(user)}
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

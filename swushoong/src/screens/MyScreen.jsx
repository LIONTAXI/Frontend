// src/screens/MyScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../components/TabBar";
import ProfileImg from "../assets/img/profileIMG.svg";
import LogoutPop from "../components/LogoutPop";
import { getMyInfo } from "../api/my";

export default function MyScreen() {
  const navigate = useNavigate();

  const [logoutOpen, setLogoutOpen] = useState(false);

  // 로그인한 유저 ID (로그인 여부 체크용)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // 프로필 정보
  const [profile, setProfile] = useState({
    imgUrl: null,
    name: "",
    shortStudentId: "",
    email: "",
  });

  useEffect(() => {
    if (!USER_ID) return;

    (async () => {
      try {
        const data = await getMyInfo();

        const imgFromServer =
          data.profileImageUrl || data.imgUrl || data.imageUrl || null;

        setProfile({
          imgUrl: imgFromServer,
          name: data.name ?? "",
          shortStudentId: data.shortStudentId ?? "",
          email: data.email ?? "",
        });
      } catch (err) {
        console.error("[MyScreen] 프로필 정보 조회 실패:", err);
      }
    })();
  }, [USER_ID]);

  const handleChangeTab = (key) => {
    if (key === "home") {
      navigate("/home");
    } else if (key === "my") {
      navigate("/my");
    } else if (key === "chat-list") {
      navigate("/chat-list");
    }
  };

  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutOpen(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleCancelLogout = () => {
    setLogoutOpen(false);
  };

  const displayName =
    profile.name && profile.shortStudentId
      ? `${profile.name} · ${profile.shortStudentId}`
      : "이름 · 학번";

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col relative overflow-hidden">
      {/* 상단 타이틀 */}
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-head-bold-24 text-black-70">MY</h1>
      </header>

      {/* 스크롤 영역 */}
      <main className="flex-1 overflow-y-auto px-4 pb-[96px]">
        {/* 프로필 영역 */}
        <section className="flex items-center gap-3 mt-4">
          <img
            src={profile.imgUrl || ProfileImg}
            alt="프로필 이미지"
            className="w-[70px] h-[70px] rounded-full border border-black-20 object-cover"
          />
          <div className="flex flex-col gap-1">
            <p className="text-head-bold-20 text-black-70">
              {displayName}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-body-regular-14 text-black-70">
                  재매칭 희망률
                </span>
                <span className="text-body-semibold-14 text-orange-main">
                  97%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-body-regular-14 text-black-70">
                  미정산이력
                </span>
                <span className="text-body-semibold-14 text-black-70">
                  0
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 받은 매너 평가 (아직 더미 데이터) */}
        <section className="mt-8 space-y-3">
          <h2 className="text-head-bold-20 text-black-90">
            받은 매너 평가
          </h2>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-sub rounded">
                <span className="text-body-semibold-14 text-black-70">
                  약속을 잘 지켜요
                </span>
                <span className="text-body-semibold-14 text-orange-main">
                  21
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-sub rounded">
                <span className="text-body-semibold-14 text-black-70">
                  정산이 빨라요
                </span>
                <span className="text-body-semibold-14 text-orange-main">
                  13
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-sub rounded">
              <span className="text-body-semibold-14 text-black-70">
                친절해요
              </span>
              <span className="text-body-semibold-14 text-orange-main">
                12
              </span>
            </div>
          </div>
        </section>

        {/* 받은 비매너 평가 */}
        <section className="mt-8 space-y-3">
          <h2 className="text-head-bold-20 text-black-90">
            받은 비매너 평가
          </h2>

          <div className="inline-flex items-center gap-2 px-3 py-2 bg-black-10 rounded">
            <span className="text-body-semibold-14 text-black-70">
              정산이 느려요
            </span>
            <span className="text-body-semibold-14 text-oryu">
              1
            </span>
          </div>
        </section>

        {/* 설정 메뉴 리스트 */}
        <section className="mt-8 border-t-[8px] border-black-10">
          <button
            type="button"
            className="w-full flex items-center px-4 py-3 border-b border-black-15 text-left"
            onClick={() => navigate("/edit-profile")}
          >
            <span className="text-body-regular-16 text-black-90">
              프로필 수정
            </span>
          </button>

          <button
            type="button"
            className="w-full flex items-center px-4 py-3 border-b border-black-15 text-left"
            onClick={() => navigate("/set-pw1")}
          >
            <span className="text-body-regular-16 text-black-90">
              비밀번호 변경
            </span>
          </button>

          <button
            type="button"
            className="w-full flex items-center px-4 py-3 border-b border-black-15 text-left"
            onClick={() => navigate("/block")}
          >
            <span className="text-body-regular-16 text-black-90">
              차단한 사용자
            </span>
          </button>

          <button
            type="button"
            className="w-full flex items-center px-4 py-3 border-b border-black-15 text-left"
            onClick={handleLogoutClick}
          >
            <span className="text-body-regular-16 text-black-90">
              로그아웃
            </span>
          </button>
        </section>
      </main>

      {/* 하단 탭바 */}
      <div className="mt-auto">
        <TabBar active="my" onChange={handleChangeTab} />
      </div>

      <LogoutPop
        open={logoutOpen}
        title="로그아웃 하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../components/TabBar";
import ProfileImg from "../assets/img/profileIMG.svg";
import LogoutPop from "../components/LogoutPop";
import {
  getMyInfo,
  fetchProfileImageWithAuth,
  getProfileReviewSummary,
} from "../api/my";

// 긍정/부정 태그 한글 라벨 매핑
const POSITIVE_TAG_LABEL_MAP = {
  PROMISE_ON_TIME: "약속을 잘 지켜요",
  RESPONSE_FAST: "응답이 빨라요",
  GOOD_MANNER: "매너가 좋아요",
  SETTLEMENT_FAST: "정산이 빨라요",
  KIND: "친절해요",
  INFO_NOTICE_FAST: "정보 공지가 빨라요",
  INFO_ACCURATE: "정산 정보가 정확해요",
};

const NEGATIVE_TAG_LABEL_MAP = {
  PROMISE_NOT_KEPT: "약속시간을 지키지 않았어요",
  COMMUNICATION_HARD: "소통이 어려웠어요",
  MANNER_BAD: "매너가 좋지 않았어요",
  SETTLEMENT_LATE: "정산이 느렸어요",
  INFO_INACCURATE: "정산 정보가 정확하지 않았어요",
};

export default function MyScreen() {
  const navigate = useNavigate();

  const [logoutOpen, setLogoutOpen] = useState(false);

  // 로그인한 유저 ID (로그인 여부 체크용)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // 프로필 기본 정보
  const [profile, setProfile] = useState({
    imgUrl: null,
    name: "",
    shortStudentId: "",
    email: "",
  });

  // 실제로 <img src>에 넣을 URL (blob 또는 절대경로)
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  // 리뷰 요약 정보
  const [reviewSummary, setReviewSummary] = useState({
    matchPreferenceRate: null,
    unpaidCount: null,
    positiveTagCounts: [],
    negativeTagCounts: [],
  });

  useEffect(() => {
    if (!USER_ID) return;

    (async () => {
      try {
        // 내 기본 정보
        const info = await getMyInfo();

        const imgFromServer =
          info.profileImageUrl || info.imgUrl || info.imageUrl || null;

        setProfile({
          imgUrl: imgFromServer,
          name: info.name ?? "",
          shortStudentId: info.shortStudentId ?? "",
          email: info.email ?? "",
        });

        // 프로필 이미지 처리 (보호된 경로는 blob, 정적 URL은 그대로)
        if (imgFromServer) {
          const url = await fetchProfileImageWithAuth(imgFromServer);
          setProfileImageUrl(url || null);
        } else {
          setProfileImageUrl(null);
        }
      } catch (err) {
        console.error("[MyScreen] 프로필 정보 조회 실패:", err);
      }

      try {
        // 리뷰 요약 정보
        const summary = await getProfileReviewSummary(USER_ID);

        setReviewSummary({
          matchPreferenceRate: summary.matchPreferenceRate ?? null,
          unpaidCount: summary.unpaidCount ?? null,
          positiveTagCounts: summary.positiveTagCounts || [],
          negativeTagCounts: summary.negativeTagCounts || [],
        });
      } catch (err) {
        console.error("[MyScreen] 리뷰 요약 정보 조회 실패:", err);
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

  // 재매칭 희망률 / 미정산 이력 표시값
  const matchRateText =
    reviewSummary.matchPreferenceRate != null
      ? `${reviewSummary.matchPreferenceRate}%`
      : "-";

  const unpaidCountText =
    reviewSummary.unpaidCount != null
      ? String(reviewSummary.unpaidCount)
      : "-";

  // 0개인 태그는 안 보여주도록 필터링
  const positiveTags = (reviewSummary.positiveTagCounts || []).filter(
    (item) => item && item.count > 0
  );
  const negativeTags = (reviewSummary.negativeTagCounts || []).filter(
    (item) => item && item.count > 0
  );

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
            src={profileImageUrl || ProfileImg}
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
                  {matchRateText}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-body-regular-14 text-black-70">
                  미정산이력
                </span>
                <span className="text-body-semibold-14 text-black-70">
                  {unpaidCountText}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 받은 매너 평가 */}
        <section className="mt-8 space-y-3">
          <h2 className="text-head-bold-20 text-black-90">
            받은 매너 평가
          </h2>

          {positiveTags.length === 0 ? (
            <p className="text-body-regular-14 text-black-50">
              아직 받은 매너 평가가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {positiveTags.map((item) => {
                  const label =
                    POSITIVE_TAG_LABEL_MAP[item.tag] || item.tag;
                  return (
                    <div
                      key={item.tag}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-orange-sub rounded"
                    >
                      <span className="text-body-semibold-14 text-black-70">
                        {label}
                      </span>
                      <span className="text-body-semibold-14 text-orange-main">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 받은 비매너 평가 */}
        <section className="mt-8 space-y-3">
          <h2 className="text-head-bold-20 text-black-90">
            받은 비매너 평가
          </h2>

          {negativeTags.length === 0 ? (
            <p className="text-body-regular-14 text-black-50">
              아직 받은 비매너 평가가 없습니다.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {negativeTags.map((item) => {
                const label =
                  NEGATIVE_TAG_LABEL_MAP[item.tag] || item.tag;
                return (
                  <div
                    key={item.tag}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-black-10 rounded"
                  >
                    <span className="text-body-semibold-14 text-black-70">
                      {label}
                    </span>
                    <span className="text-body-semibold-14 text-oryu">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
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

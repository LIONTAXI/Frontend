// src/screens/TaxiDetailScreen.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import BtnShort from "../components/BtnShort";
import IconPin2 from "../assets/icon/icon_pin2.svg";
import IconPeople2 from "../assets/icon/icon_people2.svg";
import IconRight from "../assets/icon/icon_right.svg";
import MenuIcon from "../assets/icon/icon_menu.svg";
import KakaoMap from "../components/KakaoMap";

export default function TaxiDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isOwner = false } = location.state || {};

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [requestState, setRequestState] = useState("idle"); // idle | requested | accepted

  const detail = {
    destination: "서울여대 누리관",
    exitInfo: "태릉입구 7번출구",
    deadline: "14:50",
    currentCount: 2,
    maxCount: 4,
    price: "5,000원",
    emoji: "🍄",
    description:
      "7출 앞에서 네이비 맨투맨에 베이지색 바지입고 있습니다. 50주년 기념관까지만 갑니다. 참고해주세요!!",
  };

  const primaryLabel =
    requestState === "idle"
      ? "같이 타기"
      : requestState === "requested"
      ? "요청 완료"
      : "채팅하기";

  const primaryVariant =
    requestState === "requested" ? "disabled" : "primary";

  const handlePrimaryClick = () => {
    if (isOwner) return;

    if (requestState === "idle") {
      setRequestState("requested");
    } else if (requestState === "requested") {
      setRequestState("accepted");
    } else if (requestState === "accepted") {
      console.log("채팅 화면으로 이동 (추후 연동)");
    }
  };

  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      <Header
        title="택시팟 정보"
        onBack={() => navigate(-1)}
        rightIcon={isOwner ? MenuIcon : undefined}
        onRightClick={isOwner ? () => setIsMenuOpen(true) : undefined}
      />

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto pb-[96px]">
        {/* 지도 영역 */}
        <div className="px-0">
          <KakaoMap />
        </div>

        <section className="px-4 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <img src={IconPin2} alt="목적지" className="w-6 h-6" />
              <h2 className="text-head-bold-20 text-black-90">
                {detail.destination}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <img src={IconPeople2} alt="인원" className="w-5 h-5" />
              <span className="text-body-bold-16">
                <span className="text-orange-main">{detail.currentCount}</span>
                <span className="text-black-40">/{detail.maxCount}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-body-bold-18 text-black-50">
              {detail.emoji} {detail.exitInfo}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-body-regular-16 text-black-40">마감</span>
              <span className="text-body-bold-16 text-black-70">
                {detail.deadline}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <span className="text-body-bold-16 text-black-40">예상</span>
                <span className="text-body-bold-18 text-black-70">
                  {detail.price}
                </span>
              </div>

              <button
                type="button"
                className="flex items-center gap-1"
                onClick={() => console.log("총대슈니 프로필로 이동")}
              >
                <span className="text-body-semibold-14 text-black-50">
                  총대슈니 프로필 보러가기
                </span>
                <img
                  src={IconRight}
                  alt="프로필 보러가기"
                  className="w-3 h-3"
                />
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 pt-4">
          <p className="text-body-regular-16 text-black-90 whitespace-pre-line">
            {detail.description}
          </p>
        </section>
      </main>

      {/* 하단 버튼 */}
      <div className="px-4 pb-6">
        {isOwner ? (
          <div className="flex justify-between gap-2">
            <BtnShort label="매칭 종료" variant="disabled" />
            <BtnShort 
              label="참여 요청 (3)" 
              variant="primary" 
              onClick={() => navigate("/join-taxi")}
              />
          </div>
        ) : (
          <BtnLong
            label={primaryLabel}
            variant={primaryVariant}
            onClick={handlePrimaryClick}
          />
        )}
      </div>

      {/* 메뉴 바텀시트 */}
      {isOwner && isMenuOpen && (
        <div
          className="absolute inset-0 z-50 flex justify-center items-end bg-black-90 bg-opacity-70"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="w-full max-w-[393px] mx-auto bg-white rounded-t-[20px] pt-3 pb-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-[5px] bg-[rgba(60,60,67,0.3)] rounded-full mx-auto mb-5" />

            <h2 className="px-4 text-head-semibold-20 text-black-90 mt-4 mb-4">
              메뉴
            </h2>

            <div className="flex flex-col">
              {/* 게시글 수정 */}
              <button
                type="button"
                className="w-full text-left px-4 py-3 border-b border-black-15 text-body-regular-16 text-black-90"
                onClick={() => {
                  const initialForm = {
                    // AddTaxiScreen 의 필드 이름에 맞춰 매핑
                    boarding: detail.exitInfo, // 승차지: 태릉입구 7번출구
                    alighting: detail.destination, // 하차지: 서울여대 누리관
                    deadline: detail.deadline,
                    recruitCount: String(detail.maxCount),
                    price: detail.price.replace(/[^0-9]/g, ""),
                    description: detail.description,
                  };
                  setIsMenuOpen(false);
                  navigate("/add-taxi", {
                    state: { mode: "edit", initialForm },
                  });
                }}
              >
                게시글 수정
              </button>

              {/* 게시글 삭제 */}
              <button
                type="button"
                className="w-full text-left px-4 py-3 border-b border-black-15 text-body-regular-16 text-black-90"
                onClick={() => {
                  console.log("게시글 삭제 클릭");
                  setIsMenuOpen(false);
                }}
              >
                게시글 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

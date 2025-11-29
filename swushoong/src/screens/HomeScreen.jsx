// src/screens/HomeScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../components/TabBar";
import TaxiPotCard from "../components/TaxiPotCard";
import BellIcon from "../assets/icon/icon_bell.svg";
import BellOnIcon from "../assets/icon/icon_bellOn.svg";
import AddIcon from "../assets/icon/icon_add.svg";
import ExpandIcon from "../assets/icon/icon_expend.svg";
import ContractIcon from "../assets/icon/icon_contraction.svg";
import IconPin2 from "../assets/icon/icon_pin2.svg";
import KakaoMap from "../components/KakaoMap";

export default function HomeScreen() {
  const navigate = useNavigate();

  const hasNotification = false;
  const [viewMode, setViewMode] = useState("compact"); // compact | expanded

  // 임시 더미 데이터
  const taxiPots = [
    {
      id: 1,
      destination: "서울여대 누리관",
      exitInfo: "태릉입구 2번출구",
      deadline: "14:50",
      currentCount: 2,
      maxCount: 4,
      price: "5,000원",
      emoji: "🐰",
    },
    {
      id: 2,
      destination: "서울여대 누리관",
      exitInfo: "태릉입구 7번출구",
      deadline: "14:50",
      currentCount: 2,
      maxCount: 4,
      price: "5,000원",
      emoji: "🍄",
    },
    {
      id: 3,
      destination: "서울여대 누리관",
      exitInfo: "태릉입구 7번출구",
      deadline: "14:50",
      currentCount: 2,
      maxCount: 4,
      price: "5,000원",
      emoji: "🐹",
    },
    {
      id: 4,
      destination: "서울여대 누리관",
      exitInfo: "태릉입구 7번출구",
      deadline: "14:50",
      currentCount: 1,
      maxCount: 4,
      price: "5,000원",
      emoji: "👤",
    },
  ];

  const [selectedPotId, setSelectedPotId] = useState(
    taxiPots[0]?.id ?? null
  );

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "compact" ? "expanded" : "compact"));
  };

  const handleCreateTaxiPot = () => {
    navigate("/add-taxi");
  };

  const handleClickCard = (pot) => {
    setSelectedPotId(pot.id);

    //frist card(my post)
    if (pot.id === 1) {
        navigate("/taxi-detail", {state: {isOwner: true}});
    } else if (pot.id === 2) {
        navigate("/taxi-detail", {state: {isOwner:false}});
    } else {
        navigate("/taxi-detail", {state: {isOwner:false}});
    }
  };

  const handleTabChange = (key) => {
    if (key === "home") {
      navigate("/home");      // 이미 이 화면이지만 명시적으로
    } else if (key === "my") {
      navigate("/my");    // 마이페이지로 이동
    } else if (key === "chat") {
      navigate("/chat");  // 나중에 채팅 화면 만들면 연결
    }
  };

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard flex flex-col relative mx-auto overflow-hidden">
      {/* ===== 상단 헤더 ===== */}
      <header className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="flex items-center justify-center">
              <img src={IconPin2} alt="헤더 핀" className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[20px] font-semibold text-black-70">
            태릉입구역 7호선
          </span>
        </div>

        <button
          type="button"
          className="w-6 h-6"
          onClick={() => navigate("/notifications")}
        >
          <img
            src={hasNotification ? BellOnIcon : BellIcon}
            alt="알림"
            className="w-full h-full"
          />
        </button>
      </header>

      {/* ===== 지도 영역 (카카오맵 자리) ===== */}
      <div className="px-0">
        <KakaoMap />
      </div>

      {/* ===== 실시간 택시팟 섹션 ===== */}
      <section className="flex-1 px-4 pt-4 pb-2 overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-semibold text-black-90">
            실시간 택시팟
          </h2>
          <button
            type="button"
            className="w-4 h-4"
            onClick={toggleViewMode}
          >
            <img
              src={viewMode === "compact" ? ExpandIcon : ContractIcon}
              alt="보기 방식 전환"
              className="w-full h-full"
            />
          </button>
        </div>

        {/* 카드 리스트 */}
        <div
          className={
            viewMode === "compact"
              ? "flex flex-row gap-2 overflow-x-auto pb-1 no-scrollbar"
              : "grid grid-cols-2 gap-x-2 gap-y-3"
          }
        >
          {taxiPots.map((pot) => (
            <TaxiPotCard
              key={pot.id}
              destination={pot.destination}
              exitInfo={pot.exitInfo}
              deadline={pot.deadline}
              currentCount={pot.currentCount}
              maxCount={pot.maxCount}
              price={pot.price}
              emoji={pot.emoji}
              highlighted={selectedPotId === pot.id}
              variant={viewMode === "compact" ? "small" : "big"}
              fullWidth={viewMode === "expanded"}
              onClick={() => handleClickCard(pot)}
            />
          ))}
        </div>
      </section>

      {/* ===== 플로팅 택시팟 생성 버튼 ===== */}
      <button
        type="button"
        onClick={handleCreateTaxiPot}
        className="absolute right-6 bottom-[110px] p-0 border-none bg-transparent"
      >
        <img
          src={AddIcon}
          alt="택시팟 생성"
          className="block w-[74px] h-[74px]"
        />
      </button>

      {/* ===== 탭바 ===== */}
      <div className="mt-auto">
        <TabBar active="home" onChange={handleTabChange} />
      </div>
    </div>
  );
}

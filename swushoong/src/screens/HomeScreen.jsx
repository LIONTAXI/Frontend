// src/screens/HomeScreen.jsx
import React, { useState, useEffect } from "react";
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

import { getTaxiPotList, updateUserStatus } from "../api/taxi";

export default function HomeScreen() {
  const navigate = useNavigate();

  const hasNotification = false;
  const [viewMode, setViewMode] = useState("compact"); // compact | expanded

  // 헤더에 표시할 위치 문구
  const [stationLabel, setStationLabel] = useState("내 위치 불러오는 중...");
  // 실시간 내 위치
  const [userLocation, setUserLocation] = useState(null);

  // 택시팟 목록
  const [taxiPots, setTaxiPots] = useState([]);
  const [selectedPotId, setSelectedPotId] = useState(null);

  useEffect(() => {
    // TODO: 실제 로그인 유저 ID 로 교체
    const USER_ID = 1;

    // ---- 1) 실시간 위치 추적 ----
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ latitude, longitude });

          // 위치값으로 상태 업데이트 API 호출
          updateUserStatus({
            userId: USER_ID,
            latitude,
            longitude,
          }).catch((err) => {
            console.error("[HomeScreen] 유저 상태 업데이트 실패:", err);
          });
        },
        (error) => {
          console.error("[HomeScreen] 위치 정보 가져오기 실패:", error);
          setStationLabel("위치 정보를 가져올 수 없어요");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );

      // 언마운트 시 watch 해제
      return () => {
        if (watchId != null) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    } else {
      setStationLabel("위치 서비스 미지원");
    }
  }, []);

  // ---- 2) 택시팟 목록 조회 ----
  useEffect(() => {
    const USER_ID = 1;
    getTaxiPotList(USER_ID)
      .then((list) => {
        if (!Array.isArray(list)) return;

        const mapped = list.map((item) => ({
          id: item.id,
          destination: item.destination,
          exitInfo: item.departure,
          deadline: item.meetingTime,
          currentCount: item.currentParticipants,
          maxCount: item.maxParticipants,
          price:
            item.expectedPrice != null
              ? `${Number(item.expectedPrice).toLocaleString()}원`
              : "",
          // 서버에서 내려주는 이모지만 사용 (하드코딩 제거)
          emoji: item.emoji,
          isOwner:
            typeof item.isOwner === "boolean" ? item.isOwner : false,
          // 총대 픽커용 위치
          latitude: item.latitude,
          longitude: item.longitude,
        }));

        setTaxiPots(mapped);
        if (mapped.length > 0) {
          setSelectedPotId(mapped[0].id);
        }
      })
      .catch((err) => {
        console.error("[HomeScreen] 택시팟 목록 조회 실패:", err);
      });
  }, []);

  const toggleViewMode = () => {
    setViewMode((prev) =>
      prev === "compact" ? "expanded" : "compact"
    );
  };

  const handleCreateTaxiPot = () => {
  navigate("/add-taxi", {
    state: {
      // 지금 watchPosition으로 추적하고 있는 내 위치
      hostLocation: userLocation,
    },
  });
};

  const handleClickCard = (pot) => {
    setSelectedPotId(pot.id);
    const isOwner =
      typeof pot.isOwner === "boolean" ? pot.isOwner : false;

    navigate("/taxi-detail", {
      state: {
        isOwner,
        taxiPotId: pot.id,
        taxiPot: pot,
      },
    });
  };

  // 내가 올린 택시팟이 하나라도 있는지
  const isHostMe = taxiPots.some((pot) => pot.isOwner === true);

  const handleSelectTaxiPotFromMap = (partyId) => {
    setSelectedPotId(partyId);
  };

  const handleTabChange = (key) => {
    if (key === "home") {
      navigate("/home");
    } else if (key === "my") {
      navigate("/my");
    } else if (key === "chat-list") {
      navigate("/chat-list");
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
            {stationLabel}
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
        <KakaoMap
          userLocation={userLocation}
          taxiHosts={taxiPots}              // 총대 위치들
          selectedTaxiPotId={selectedPotId} // 선택된 택시팟
          onSelectTaxiPot={handleSelectTaxiPotFromMap}
          onAddressChange={setStationLabel}
          isHostMe={isHostMe}
        />
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
              emoji={pot.emoji} // ← 서버 이모지 그대로
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

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
  // 지도에 찍을 마커(택시팟 기준)
  const [hostMarkers, setHostMarkers] = useState([]);

  // ---- 1) 내 위치 추적 + /api/map/user-map-update ----
  useEffect(() => {
    // TODO: 실제 로그인 유저 ID 로 교체
    const USER_ID = 1;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ latitude, longitude });

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

  // ---- 2) 택시팟 목록 조회 → 카드 + 마커 생성 ----
  useEffect(() => {
    async function fetchData() {
      try {
        const potsRes = await getTaxiPotList();
        const pots = Array.isArray(potsRes) ? potsRes : [];

        // 카드용 택시팟 정보 + 위치 추출
        const mappedPots = pots.map((item) => {
          // 백엔드에서 어떤 이름으로 보내는지 모르니 여러 후보 다 체크
          const lat =
            item.latitude ??
            item.lat ??
            item.meetingLatitude ??
            item.boardingLatitude ??
            null;
          const lng =
            item.longitude ??
            item.lng ??
            item.meetingLongitude ??
            item.boardingLongitude ??
            null;

          const hostId =
            item.hostId ??
            item.hostUserId ??
            item.host?.userId ??
            item.host?.id ??
            item.userId ??
            null;

          return {
            id: item.id,
            hostId,
            destination: item.destination,
            exitInfo: item.departure,
            deadline: item.meetingTime,
            currentCount: item.currentParticipants,
            maxCount: item.maxParticipants,
            price:
              item.expectedPrice != null
                ? `${Number(item.expectedPrice).toLocaleString()}원`
                : "",
            emoji: item.emoji,
            isOwner: item.isOwner === true,
            latitude: lat,
            longitude: lng,
          };
        });

        // 지도에 찍을 마커 (택시팟 meeting 위치 기준)
        const markers = mappedPots
          .filter(
            (pot) =>
              pot.latitude != null &&
              pot.longitude != null &&
              !Number.isNaN(pot.latitude) &&
              !Number.isNaN(pot.longitude)
          )
          .map((pot) => ({
            id: pot.id, // 선택 기준
            latitude: pot.latitude,
            longitude: pot.longitude,
            emoji: pot.emoji || "🟠",
          }));

        console.log("[HomeScreen] mappedPots:", mappedPots);
        console.log("[HomeScreen] hostMarkers:", markers);

        setTaxiPots(mappedPots);
        setHostMarkers(markers);

        // 기본 선택: 첫 번째 택시팟
        if (mappedPots.length > 0) {
          setSelectedPotId(mappedPots[0].id);
        }
      } catch (err) {
        console.error("[HomeScreen] 택시팟 목록 조회 실패:", err);
      }
    }

    fetchData();
  }, []);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "compact" ? "expanded" : "compact"));
  };

  const handleCreateTaxiPot = () => {
    navigate("/add-taxi", {
      state: {
        // 지금 watchPosition 으로 추적하고 있는 내 위치
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

  // 내가 올린 택시팟이 하나라도 있는지 (내 위치 픽커 색상 결정용)
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

      {/* ===== 지도 영역 ===== */}
      <div className="px-0">
        <KakaoMap
          userLocation={userLocation}
          taxiHosts={hostMarkers}
          selectedTaxiPotId={selectedPotId}
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

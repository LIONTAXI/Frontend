import React, { useState, useEffect, useRef } from "react"; 
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
import { getUnreadNotificationCount } from "../api/notification";

import {
  getTaxiPotList,
  getTaxiPotDetail,
  updateUserStatus,
  getCurrentUsers,
} from "../api/taxi";

export default function HomeScreen() {
  const navigate = useNavigate();

  const [hasNotification, setHasNotification] = useState(false);
  const [viewMode, setViewMode] = useState("compact");

  // 헤더에 표시할 위치 문구
  const [stationLabel, setStationLabel] = useState("내 위치 불러오는 중...");
  // 실시간 내 위치
  const [userLocation, setUserLocation] = useState(null);

  // 택시팟 목록
  const [taxiPots, setTaxiPots] = useState([]);
  const [selectedPotId, setSelectedPotId] = useState(null);

  // 지도에 찍을 총대 마커
  const [hostMarkers, setHostMarkers] = useState([]);

  // 로그인 유저 id (총대 여부 판별용)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // 선택된 카드로 스크롤하기 위한 ref들
  const listContainerRef = useRef(null);
  const cardRefs = useRef({}); // pot.id -> HTMLElement

  
  //  미확인 알림 개수 조회
  useEffect(() => {
    if (!USER_ID) return;

    let isMounted = true;

    async function fetchUnread() {
      try {
        const count = await getUnreadNotificationCount(USER_ID);
        if (isMounted) {
          setHasNotification(count > 0);
        }
      } catch (err) {
        console.error("[HomeScreen] 미확인 알림 개수 조회 실패:", err);
      }
    }

    fetchUnread();

    return () => {
      isMounted = false;
    };
  }, [USER_ID]);

 
   // 내 위치 추적
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStationLabel("위치 서비스 미지원");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });

        // 백엔드에 현재 위치 전송 (토큰으로 유저 구분)
        updateUserStatus({
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

    return () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);


   // 택시팟 + 현재 접속 유저 + 각 택시팟 상세

  useEffect(() => {
    async function fetchData() {
      try {
        // 목록 & 현재 접속 유저
        const [potsRes, usersRes] = await Promise.all([
          getTaxiPotList(),
          getCurrentUsers(),
        ]);

        const pots = Array.isArray(potsRes) ? potsRes : [];
        const users = Array.isArray(usersRes) ? usersRes : [];

        // 각 택시팟 상세 정보 가져와서 hostId / 좌표 채우기
        const detailList = await Promise.all(
          pots.map((p) =>
            getTaxiPotDetail(p.id).catch((err) => {
              console.error(
                "[HomeScreen] getTaxiPotDetail 실패 - id:",
                p.id,
                err
              );
              return null;
            })
          )
        );

        // 카드에 쓸 정보 + hostId/좌표/이모지 정리
        const mappedPots = pots.map((item, index) => {
          const detail = detailList[index];

          // hostId 후보 (목록 → 상세 순으로 채우기)
          const hostId =
            item.hostId ??
            item.hostUserId ??
            (typeof item.host === "object"
              ? item.host.userId ?? item.host.id
              : item.host) ??
            item.userId ??
            detail?.hostId ??
            detail?.hostUserId ??
            (typeof detail?.host === "object"
              ? detail.host.userId ?? detail.host.id
              : detail?.host) ??
            null;

          const latitude =
            item.latitude ?? detail?.latitude ?? detail?.lat ?? null;
          const longitude =
            item.longitude ?? detail?.longitude ?? detail?.lng ?? null;

          const emoji = item.emoji ?? detail?.emoji ?? null;

          const isOwner =
            item.isOwner === true ||
            (USER_ID != null && hostId != null && hostId === USER_ID);

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
            emoji,
            isOwner,
            latitude,
            longitude,
          };
        });

        // 지도에 찍을 총대 마커
        const markers = mappedPots
          .map((pot) => {
            let lat = null;
            let lng = null;
            let emoji = pot.emoji;

            // hostId와 /api/map 유저가 매칭되면, 그 위치 + markerEmoji 사용
            if (pot.hostId != null) {
              const u = users.find((user) => {
                const uid = user.userId ?? user.id ?? user.user?.id;
                return uid === pot.hostId;
              });
              if (u) {
                lat = u.latitude ?? u.lat ?? null;
                lng = u.longitude ?? u.lng ?? null;
                emoji = u.markerEmoji ?? u.emoji ?? emoji;
              }
            }

            // 그래도 없으면, 택시팟에 저장된 좌표 사용
            if (lat == null || lng == null) {
              if (pot.latitude != null && pot.longitude != null) {
                lat = pot.latitude;
                lng = pot.longitude;
              }
            }

            if (lat == null || lng == null) return null;

            return {
              id: pot.id,
              latitude: lat,
              longitude: lng,
              emoji,
            };
          })
          .filter(Boolean);

        console.log("[HomeScreen] mappedPots:", mappedPots);
        console.log("[HomeScreen] users(/api/map):", users);
        console.log("[HomeScreen] hostMarkers:", markers);

        setTaxiPots(mappedPots);
        setHostMarkers(markers);
        setSelectedPotId(null);
      } catch (err) {
        console.error(
          "[HomeScreen] 택시팟 목록 / 현재 접속 유저 조회 실패:",
          err
        );
      }
    }

    fetchData();
  }, [USER_ID]);

 
   // 선택된 카드로 스크롤

  useEffect(() => {
    if (!selectedPotId) return;
    const el = cardRefs.current[selectedPotId];
    if (el && typeof el.scrollIntoView === "function") {
      // compact(가로 스크롤) / expanded(세로 스크롤) 모두 대응
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedPotId, viewMode]);

   // UI 핸들러들
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "compact" ? "expanded" : "compact"));
  };

  const handleCreateTaxiPot = () => {
    navigate("/add-taxi", {
      state: {
        hostLocation: userLocation,
      },
    });
  };

  const handleClickCard = (pot) => {
    const isOwner = typeof pot.isOwner === "boolean" ? pot.isOwner : false;

    navigate("/taxi-detail", {
      state: {
        isOwner,
        taxiPotId: pot.id,
        taxiPot: pot,
      },
    });
  };

  const isHostMe = taxiPots.some((pot) => pot.isOwner === true);

  const handleSelectTaxiPotFromMap = (partyId) => {
    // 같은 마커 재클릭 시 선택 해제
    setSelectedPotId((prev) => (prev === partyId ? null : partyId));
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
      <section className="flex-1 px-4 pt-4 pb-2 overflow-y-auto overflow-x-hidden no-scrollbar">
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

        <div
          ref={listContainerRef} 
          className={
            viewMode === "compact"
              ? "flex flex-row gap-2 overflow-x-auto pb-1 no-scrollbar"
              : "grid grid-cols-2 gap-x-2 gap-y-3"
          }
        >
          {taxiPots.map((pot) => (
            <div
              key={pot.id}
              ref={(el) => {
                if (el) cardRefs.current[pot.id] = el; 
              }}
              className={viewMode === "compact" ? "shrink-0" : ""}
            >
              <TaxiPotCard
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
            </div>
          ))}
        </div>
      </section>

      {/* ===== 플로팅 버튼 ===== */}
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

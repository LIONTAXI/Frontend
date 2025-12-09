// src/screens/TaxiDetailScreen.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import BtnShort from "../components/BtnShort";
import IconPin2 from "../assets/icon/icon_pin2.svg";
import IconPeople2 from "../assets/icon/icon_people2.svg";
import IconRight from "../assets/icon/icon_right.svg";
import MenuIcon from "../assets/icon/icon_menu.svg";
import KakaoMap from "../components/KakaoMap";

import {
  getTaxiPotDetail,
  joinTaxiPot,
  deleteTaxiPot,
  getJoinRequests,
} from "../api/taxi";

export default function TaxiDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isOwner = false, taxiPotId } = location.state || {};

  // 로그인 시 저장해 둔 userId 사용
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;
  console.log("[TaxiDetailScreen] USER_ID:", USER_ID);

  const [userLocation, setUserLocation] = useState(null);

  // 내 현재 위치 (픽커용)
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => {
        console.error("[TaxiDetailScreen] 위치 정보 가져오기 실패:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 라우터에서 넘어온 isOwner를 초기값으로, 이후 hostId로 확정
  const [isMyPost, setIsMyPost] = useState(isOwner);
  // idle | requested | accepted
  const [requestState, setRequestState] = useState("idle");
  // 참여 요청 개수
  const [joinRequestCount, setJoinRequestCount] = useState(0);

  const [detail, setDetail] = useState({
    id: taxiPotId ?? null,
    destination: "",
    exitInfo: "",
    deadline: "",
    currentCount: 0,
    maxCount: 0,
    price: "",
    emoji: "",
    description: "",
    latitude: null,
    longitude: null,
  });

  // 택시팟 정보 조회
  useEffect(() => {
  if (!taxiPotId || USER_ID == null) return;

  getTaxiPotDetail(taxiPotId, USER_ID)
    .then((data) => {
      console.log("[TaxiDetailScreen] detail data:", data);

      // hostId를 숫자로 변환해서 비교
      const hostId = data.hostId != null ? Number(data.hostId) : null;
      const isMine =
        hostId != null && USER_ID != null && hostId === USER_ID;

      console.log("[TaxiDetailScreen] hostId:", hostId, "USER_ID:", USER_ID, "isMine:", isMine);
      setIsMyPost(isMine);

      // 동승 상태 → 버튼 상태
      if (data.participationStatus === "WAITING") {
        setRequestState("requested");
      } else if (data.participationStatus === "ACCEPTED") {
        setRequestState("accepted");
      } else {
        setRequestState("idle");
      }

      setDetail({
        id: data.id ?? taxiPotId,
        destination: data.destination ?? "",
        exitInfo: data.departure ?? "",
        deadline: data.meetingTime ?? "",
        currentCount: data.currentParticipants ?? 0,
        maxCount: data.maxParticipants ?? 0,
        price:
          data.expectedPrice != null
            ? `${Number(data.expectedPrice).toLocaleString()}원`
            : "",
        emoji: data.emoji || "🍊",
        description: data.content ?? "",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      });
    })
    .catch((err) => {
      console.error("[TaxiDetailScreen] 택시팟 정보 조회 실패:", err);
    });
}, [taxiPotId, USER_ID]);

  // 총대 화면일 때만 참여 요청 개수 조회
  useEffect(() => {
    if (!isMyPost) return;

    const id = detail.id ?? taxiPotId;
    if (!id) return;

    getJoinRequests(id, USER_ID)
      .then((list) => {
        const count = Array.isArray(list) ? list.length : 0;
        setJoinRequestCount(count);
      })
      .catch((err) => {
        console.error("[TaxiDetailScreen] 참여 요청 목록 조회 실패:", err);
        setJoinRequestCount(0);
      });
  }, [isMyPost, detail.id, taxiPotId, USER_ID]);

  const primaryLabel =
    requestState === "idle"
      ? "같이 타기"
      : requestState === "requested"
      ? "요청 완료"
      : "채팅하기";

  const primaryVariant =
    requestState === "requested" ? "disabled" : "primary";

  const handlePrimaryClick = async () => {
    // 내가 쓴 글이면 같이 타기 버튼 동작 X
    if (isMyPost) return;
    if (!taxiPotId || USER_ID == null) return;

    if (requestState === "idle") {
      try {
        await joinTaxiPot(taxiPotId, USER_ID);
        setRequestState("requested");
      } catch (err) {
        console.error("[TaxiDetailScreen] 같이 타기 요청 실패:", err);
      }
    } else if (requestState === "requested") {
      setRequestState("accepted");
    } else if (requestState === "accepted") {
      console.log("채팅 화면으로 이동 (추후 연동)");
    }
  };

  const handleDelete = async () => {
    if (!detail.id && !taxiPotId) return;
    const id = detail.id ?? taxiPotId;

    try {
      await deleteTaxiPot(id, USER_ID);
      navigate(-1);
    } catch (err) {
      console.error("[TaxiDetailScreen] 택시팟 삭제 실패:", err);
    }
  };

  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      <Header
        title="택시팟 정보"
        onBack={() => navigate(-1)}
        rightIcon={isMyPost ? MenuIcon : undefined}
        onRightClick={isMyPost ? () => setIsMenuOpen(true) : undefined}
      />

      <main className="flex-1 overflow-y-auto pb-[96px]">
        {/* 상세 페이지 지도: 내 위치 + 이 택시팟 위치 표시 */}
        <div className="px-0">
          <KakaoMap
            userLocation={userLocation}
            taxiHosts={
              detail.latitude && detail.longitude
                ? [
                    {
                      id: detail.id,
                      latitude: detail.latitude,
                      longitude: detail.longitude,
                      emoji: detail.emoji,
                    },
                  ]
                : []
            }
            selectedTaxiPotId={detail.id}
            isHostMe={isMyPost}
            centerOn="host"
          />
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
                <span className="text-orange-main">
                  {detail.currentCount}
                </span>
                <span className="text-black-40">
                  /{detail.maxCount}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-body-bold-18 text-black-50">
              {detail.emoji} {detail.exitInfo}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-body-regular-16 text-black-40">
                마감
              </span>
              <span className="text-body-bold-16 text-black-70">
                {detail.deadline}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <span className="text-body-bold-16 text-black-40">
                  예상
                </span>
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

      <div className="px-4 pb-6">
        {isMyPost ? (
          <div className="flex justify-between gap-2">
            <BtnShort label="매칭 종료" variant="disabled" />
            <BtnShort
              label={`참여 요청 (${joinRequestCount})`}
              variant="primary"
              onClick={() =>
                navigate("/join-taxi", {
                  state: { taxiPotId: detail.id ?? taxiPotId },
                })
              }
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

      {isMyPost && isMenuOpen && (
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
              <button
                type="button"
                className="w-full text-left px-4 py-3 border-b border-black-15 text-body-regular-16 text-black-90"
                onClick={() => {
                  const initialForm = {
                    boarding: detail.exitInfo,
                    alighting: detail.destination,
                    deadline: detail.deadline,
                    recruitCount: String(detail.maxCount || ""),
                    price: detail.price.replace(/[^0-9]/g, ""),
                    description: detail.description,
                    id: detail.id ?? taxiPotId,
                  };
                  setIsMenuOpen(false);
                  navigate("/add-taxi", {
                    state: { mode: "edit", initialForm },
                  });
                }}
              >
                게시글 수정
              </button>

              <button
                type="button"
                className="w-full text-left px-4 py-3 border-b border-black-15 text-body-regular-16 text-black-90"
                onClick={handleDelete}
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

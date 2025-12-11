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
  getCurrentUsers, // /api/map 호출
} from "../api/taxi";
import { getTaxiPartyInfo, enterOrCreateChatRoom } from "../api/chat";

export default function TaxiDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // 홈에서 넘어온 값들
  const { isOwner = false, taxiPotId, taxiPot } = location.state || {};

  // 로그인 시 저장해 둔 userId 사용
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;
  console.log("[TaxiDetailScreen] USER_ID:", USER_ID);

  const [userLocation, setUserLocation] = useState(null);

  // 총대(호스트) userId
  const [hostUserId, setHostUserId] = useState(null);

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

  // 초기값을 홈에서 넘어온 taxiPot 으로 채움 (좌표, 이모지 포함)
  const [detail, setDetail] = useState({
    id: taxiPot?.id ?? taxiPotId ?? null,
    destination: taxiPot?.destination ?? "",
    exitInfo: taxiPot?.exitInfo ?? "",
    deadline: taxiPot?.deadline ?? "",
    currentCount: taxiPot?.currentCount ?? 0,
    maxCount: taxiPot?.maxCount ?? 0,
    price: taxiPot?.price ?? "",
    emoji: taxiPot?.emoji ?? "",
    description: taxiPot?.description ?? "",
    latitude:
      taxiPot?.latitude != null ? Number(taxiPot.latitude) : null,
    longitude:
      taxiPot?.longitude != null ? Number(taxiPot.longitude) : null,
    chatRoomId: taxiPot?.chatRoomId ?? null,
  });


   // 택시팟 상세 + 호스트 위치/이모지 가져오기

  useEffect(() => {
    if (!taxiPotId) return;

    async function fetchDetail() {
      try {
        // 택시팟 상세 + 현재 지도에 표시 가능한 유저들
        const [data, mapUsers] = await Promise.all([
          getTaxiPotDetail(taxiPotId),
          getCurrentUsers(),
        ]);

        console.log("[TaxiDetailScreen] detail data:", data);
        console.log("[TaxiDetailScreen] map users:", mapUsers);

        // hostId 파싱
        const hostId =
          data.hostId != null
            ? Number(data.hostId)
            : data.hostUserId != null
            ? Number(data.hostUserId)
            : null;

        // host userId를 state에 저장 → 프로필 보기 버튼에서 사용
        setHostUserId(hostId);

        // 이 글이 내 글인지 여부
        const isMine =
          hostId != null && USER_ID != null && hostId === USER_ID;
        setIsMyPost(isMine);

        // 동승 상태 → 버튼 상태
        if (data.participationStatus === "WAITING") {
          setRequestState("requested");
        } else if (data.participationStatus === "ACCEPTED") {
          setRequestState("accepted");
        } else {
          setRequestState("idle");
        }

        // 기본 좌표/이모지: 홈에서 넘어온 값 (있다면)
        let lat =
          taxiPot?.latitude != null ? Number(taxiPot.latitude) : null;
        let lng =
          taxiPot?.longitude != null ? Number(taxiPot.longitude) : null;
        let emoji = data.markerEmoji ?? taxiPot?.emoji ?? "";

        // /api/map 에서 hostId와 일치하는 유저 찾기
        if (hostId != null && Array.isArray(mapUsers)) {
          const hostUser = mapUsers.find((u) => {
            const uid = u.userId ?? u.id ?? u.user?.id;
            return uid === hostId;
          });

          if (hostUser) {
            lat = hostUser.latitude ?? hostUser.lat ?? lat;
            lng = hostUser.longitude ?? hostUser.lng ?? lng;
            emoji =
              data.markerEmoji ??
              hostUser.markerEmoji ??
              emoji;
          }
        }

        const chatRoomId =
          data.chatRoomId != null
            ? Number(data.chatRoomId)
            : data.chatRoom?.id != null
            ? Number(data.chatRoom.id)
            : null;

        setDetail({
          id: data.id ?? taxiPotId,
          destination: data.destination ?? taxiPot?.destination ?? "",
          exitInfo: data.departure ?? taxiPot?.exitInfo ?? "",
          deadline: data.meetingTime ?? taxiPot?.deadline ?? "",
          currentCount:
            data.currentParticipants ?? taxiPot?.currentCount ?? 0,
          maxCount:
            data.maxParticipants ?? taxiPot?.maxCount ?? 0,
          price:
            data.expectedPrice != null
              ? `${Number(data.expectedPrice).toLocaleString()}원`
              : taxiPot?.price ?? "",
          emoji,
          description: data.content ?? taxiPot?.description ?? "",
          latitude: lat,
          longitude: lng,
          chatRoomId,
        });
      } catch (err) {
        console.error("[TaxiDetailScreen] 택시팟 정보 조회 실패:", err);
      }
    }

    fetchDetail();
  }, [taxiPotId, USER_ID, taxiPot]);

  // 총대 화면일 때만 참여 요청 개수 조회
  useEffect(() => {
    if (!isMyPost) return;

    const id = detail.id ?? taxiPotId;
    if (!id) return;

    getJoinRequests(id)
      .then((list) => {
        const count = Array.isArray(list) ? list.length : 0;
        setJoinRequestCount(count);
      })
      .catch((err) => {
        console.error("[TaxiDetailScreen] 참여 요청 목록 조회 실패:", err);
        setJoinRequestCount(0);
      });
  }, [isMyPost, detail.id, taxiPotId]);

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
        await joinTaxiPot(taxiPotId);
        setRequestState("requested");
      } catch (err) {
        console.error("[TaxiDetailScreen] 같이 타기 요청 실패:", err);
      }
    } else if (requestState === "requested") {
      setRequestState("accepted");
    } else if (requestState === "accepted") {
      const partyId = detail.id ?? taxiPotId;
      if (!partyId) return;

      try {
            const response = await enterOrCreateChatRoom(partyId);
            const chatRoomId = response.chatRoomId; 

            if (!chatRoomId) {
                console.error("[TaxiDetailScreen] 채팅방 입장 API에서 chatRoomId를 받지 못했습니다.");
                alert("채팅방 정보를 불러오는 데 실패했습니다.");
                return;
            }

            // 채팅방으로 이동
            navigate(`/chat/${chatRoomId}/${partyId}`);
        } catch (err) {
            console.error(
                "[TaxiDetailScreen] 채팅방 생성/입장 실패:",
                err
            );
            alert(`채팅방 이동 실패: ${err.message || '서버 오류'}`);
        }
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

  // 좌표 유무 체크 (0도 허용하도록 null 기반으로)
  const hasCoords =
    detail.latitude != null && detail.longitude != null;

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
              hasCoords
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

              {/* 총대슈니 프로필 보러가기 */}
              <button
                type="button"
                className="flex items-center gap-1"
                onClick={() => {
                  if (!hostUserId) return;
                  navigate(`/member-profile/${hostUserId}`, {
                    state: {
                      userId: hostUserId,
                      from: "taxi-detail",
                      taxiPotId: detail.id ?? taxiPotId,
                    },
                  });
                }}
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

          

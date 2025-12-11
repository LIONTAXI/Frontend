// src/screens/NotificationScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getNotifications,
  getUnreadNotificationCount,
  connectNotificationStream,
  readNotification,
} from "../api/notification";
import { getMyChatRooms } from "../api/chat";

export default function NotificationScreen() {
  const navigate = useNavigate();

  // 로그인 시 저장해 둔 userId 사용 (다른 화면과 통일)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // 알림 목록 + 미확인 개수
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // createdAt → "11:44" 또는 "10/31"
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    if (isToday) return `${hh}:${mm}`;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  // 서버 알림 → 화면용 객체로 매핑
  const mapNotification = (item) => {
    const type = item.type || item.notificationType || null;
    const targetType = item.targetType || item.target_type || null;
    const targetId = item.targetId ?? item.target_id ?? null;

    let taxiPotId = null;
    let roomId = null;
    let settlementId = null;
    let reviewId = null;

    // Target Type 에 따라 ID들 분리
    if (targetType === "TAXI_PARTY") {
      // 택시팟 자체가 타깃인 경우
      taxiPotId = item.taxiPartyId ?? item.taxiPotId ?? targetId;
    } else if (targetType === "TAXI_ROOM") {
      // 채팅방이 타깃인 경우 (현재 백엔드에서 roomId에 taxiPartyId를 넣어줄 수도 있음)
      roomId = item.roomId ?? targetId;
      taxiPotId =
        item.taxiPartyId ??
        item.taxiPotId ??
        item.partyId ??
        null;
    } else if (targetType === "SETTLEMENT") {
      settlementId = item.settlementId ?? targetId;
    } else if (targetType === "REVIEW") {
      reviewId = item.reviewId ?? targetId;
    }

    return {
      id: item.id,
      type,          // 예: "TAXI_PARTICIPATION_REQUEST"
      targetType,    // 예: "TAXI_PARTY" / "TAXI_ROOM"
      targetId,      // raw targetId
      taxiPotId,
      roomId,
      settlementId,
      reviewId,
      emoji: "🔔",
      title: item.title,
      message: item.body,
      time: formatTime(item.createdAt),
      unread: item.read === false,
    };
  };

  // 알림 목록 + 미확인 개수 새로고침
  const refreshNotifications = useCallback(async () => {
    if (!USER_ID) return;

    try {
      const list = await getNotifications(USER_ID);
      const mapped = Array.isArray(list) ? list.map(mapNotification) : [];
      setNotifications(mapped);
    } catch (err) {
      console.error("[NotificationScreen] 알림 목록 조회 실패:", err);
    }

    try {
      const count = await getUnreadNotificationCount(USER_ID);
      setUnreadCount(count);
      console.log("[NotificationScreen] unreadCount:", count);
    } catch (err) {
      console.error("[NotificationScreen] 미확인 개수 조회 실패:", err);
    }
  }, [USER_ID]);

  // 최초 진입 + SSE 메시지 수신 시 목록 갱신
  useEffect(() => {
    if (!USER_ID) {
      console.warn("[NotificationScreen] USER_ID가 없습니다.");
      return;
    }

    // 최초 1회
    refreshNotifications();

    // SSE 연결
    const es = connectNotificationStream(USER_ID);
    if (!es) return;

    es.onopen = () => {
      console.log("[NotificationScreen] SSE 연결 성공");
    };

    es.onmessage = (event) => {
      console.log("[NotificationScreen] SSE 메시지:", event.data);
      refreshNotifications();
    };

    es.onerror = (err) => {
      console.error("[NotificationScreen] SSE 에러:", err);
      es.close();
    };

    return () => {
      console.log("[NotificationScreen] SSE close");
      es.close();
    };
  }, [USER_ID, refreshNotifications]);

  // 알림 클릭 핸들러
  const handleClickNotification = async (item) => {
    console.log("알림 클릭", item);

    // 1) 안 읽은 알림이면 읽음 처리
    if (USER_ID && item.unread) {
      try {
        await readNotification(item.id, USER_ID);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, unread: false } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        console.error("[NotificationScreen] 알림 읽음 처리 실패:", err);
      }
    }

    // 2) 타입별로 네비게이션 분기
    switch (item.type) {
      // ✅ 택시팟 참여 요청 알림 → 참여 요청 목록
      case "TAXI_PARTICIPATION_REQUEST": {
        if (item.targetType === "TAXI_PARTY" && item.taxiPotId) {
          navigate("/join-taxi", {
            state: { taxiPotId: item.taxiPotId },
          });
        }
        break;
      }

      // ✅ 택시팟 참여 수락 알림 → 채팅방 이동
      case "TAXI_PARTICIPATION_ACCEPTED": {
        // 1차로 알림에서 바로 꺼낼 수 있는 값
        let roomId = item.roomId != null ? Number(item.roomId) : null;
        let partyId =
          item.taxiPotId != null ? Number(item.taxiPotId) : null;

        // 🔥 특수케이스: targetType이 TAXI_ROOM인데 taxiPotId가 없으면
        // 백엔드가 roomId에 taxiPartyId를 넣어준 것으로 보고 재해석
        if (item.targetType === "TAXI_ROOM" && roomId && !partyId) {
          console.log(
            "[NotificationScreen] TAXI_ROOM 알림에서 roomId를 partyId로 재해석",
            { roomId }
          );
          partyId = roomId; // 이 값을 taxiPartyId로 사용
          roomId = null;    // 실제 chatRoomId는 아직 모름
        }

        console.log("[NotificationScreen] 수락 알림 클릭:", {
          rawRoomId: item.roomId,
          rawTaxiPotId: item.taxiPotId,
          mappedRoomId: roomId,
          mappedPartyId: partyId,
          targetType: item.targetType,
        });

        try {
          // 둘 중 하나라도 비어 있으면 내 채팅방 목록에서 보충
          if (!roomId || !partyId) {
            const roomsResponse = await getMyChatRooms();

            // 응답 형태: { matchingRooms: [...], finishedRooms: [...] }
            const allRooms = [
              ...(roomsResponse.matchingRooms || []),
              ...(roomsResponse.finishedRooms || []),
            ];

            console.log(
              "[NotificationScreen] getMyChatRooms allRooms:",
              allRooms
            );

            // (1) partyId만 있고 roomId가 없는 경우 → 같은 파티 ID 가진 방 찾기
            if (partyId && !roomId) {
              const matched = allRooms.find((r) => {
                const rPartyId = Number(
                  r.taxiPartyId ??
                  r.partyId ??
                  r.taxiPotId
                );
                return rPartyId === partyId;
              });

              if (matched) {
                roomId = Number(
                  matched.chatRoomId ??
                  matched.roomId ??
                  matched.id
                );
              }
            }

            // (2) roomId만 있고 partyId가 없는 경우 → 같은 채팅방 ID 가진 방에서 파티 ID 찾기
            if (roomId && !partyId) {
              const matched = allRooms.find((r) => {
                const rRoomId = Number(
                  r.chatRoomId ??
                  r.roomId ??
                  r.id
                );
                return rRoomId === roomId;
              });

              if (matched) {
                partyId = Number(
                  matched.taxiPartyId ??
                  matched.partyId ??
                  matched.taxiPotId
                );
              }
            }
          }

          if (roomId && partyId) {
            console.log("[NotificationScreen] 채팅방으로 이동:", {
              roomId,
              partyId,
            });
            navigate(`/chat/${roomId}/${partyId}`);
          } else {
            console.warn(
              "[NotificationScreen] 채팅 알림이지만 roomId/partyId를 찾지 못했습니다.",
              { roomId, partyId }
            );
          }
        } catch (err) {
          console.error("[NotificationScreen] 채팅방 이동 중 오류:", err);
        }
        break;
      }

      // ✅ 정산 요청 알림 (SETTLEMENT_REQUEST)
      case "SETTLEMENT_REQUEST": {
        if (item.settlementId) {
          navigate("/current-pay-member", {
            state: {
              settlementId: item.settlementId,
              taxiPartyId: item.taxiPotId ?? null,
            },
          });
        }
        break;
      }

      // ✅ 정산 재촉 알림 (SETTLEMENT_REMIND)
      case "SETTLEMENT_REMIND": {
        if (item.settlementId) {
          navigate("/please", {
            state: {
              settlementId: item.settlementId,
              taxiPartyId: item.taxiPotId ?? null,
            },
          });
        }
        break;
      }

      // ✅ 후기 도착 알림 (REVIEW_ARRIVED)
      case "REVIEW_ARRIVED": {
        if (item.reviewId) {
          // TODO: 실제 상세 페이지 라우트에 맞게 수정
          navigate(`/review/${item.reviewId}`);
        }
        break;
      }

      default:
        console.log(
          "[NotificationScreen] 처리되지 않은 알림 타입:",
          item.type
        );
    }
  };

  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      <Header title="알림" onBack={() => navigate(-1)} />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClickNotification(item)}
              className={`
                w-full text-left
                px-4 py-6
                border-b border-black-15
                flex flex-row gap-2
                ${item.unread ? "bg-orange-sub" : "bg-white"}
              `}
            >
              {/* 이모지 */}
              <div className="text-[20px] leading-none text-black-70">
                {item.emoji}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-start gap-1">
                  <p className="text-body-semibold-16 text-black-70">
                    {item.title}
                  </p>
                  {item.unread && (
                    <span className="mt-[6px] w-2 h-2 rounded-full bg-orange-main" />
                  )}
                </div>

                <div className="flex items-end justify-between gap-2">
                  <p className="text-body-regular-14 text-black-70">
                    {item.message}
                  </p>
                  <span className="text-body-regular-14 text-black-70">
                    {item.time}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

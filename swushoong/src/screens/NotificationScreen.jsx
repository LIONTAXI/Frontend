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

export default function NotificationScreen() {
  const navigate = useNavigate();

  // 로그인 시 저장해 둔 userId 사용 (다른 화면과 통일)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // API에서 가져온 알림 목록
  const [notifications, setNotifications] = useState([]);
  // 필요하면 쓸 수 있도록 미확인 개수도 state로 보관 (지금은 UI에 안 씀)
  const [unreadCount, setUnreadCount] = useState(0);

  // createdAt → "11:44" 또는 "10/31" 형태로 변환
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    if (isToday) {
      return `${hh}:${mm}`; // 오늘이면 시:분
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`; // 과거는 MM/DD
  };

  // 서버에서 내려온 알림 → 화면에서 쓰는 형태로 매핑
  const mapNotification = (item) => ({
    id: item.id,
    emoji: item.emoji || "🔔", // 서버에 emoji 필드 없으면 기본 벨 아이콘
    title: item.title,
    message: item.body,
    time: formatTime(item.createdAt),
    unread: item.read === false, // read=false → 미확인
  });

  // 알림 목록 + 미확인 개수 한번에 새로고침
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

  // 최초 진입 시 + SSE 메시지 올 때마다 목록 갱신
  useEffect(() => {
    if (!USER_ID) {
      console.warn("[NotificationScreen] USER_ID가 없습니다.");
      return;
    }

    // 최초 1회 조회
    refreshNotifications();

    // SSE 연결
    const es = connectNotificationStream(USER_ID);
    if (!es) return;

    es.onopen = () => {
      console.log("[NotificationScreen] SSE 연결 성공");
    };

    es.onmessage = (event) => {
      console.log("[NotificationScreen] SSE 메시지:", event.data);
      // payload가 어떤 형태든, 일단 이벤트가 오면 목록을 다시 불러온다
      refreshNotifications();
    };

    es.onerror = (err) => {
      console.error("[NotificationScreen] SSE 에러:", err);
      // 오류 발생 시 연결 닫기
      es.close();
    };

    // 언마운트 시 SSE 해제
    return () => {
      console.log("[NotificationScreen] SSE close");
      es.close();
    };
  }, [USER_ID, refreshNotifications]);

  const handleClickNotification = async (item) => {
    console.log("알림 클릭", item);

    // 읽지 않은 알림이면 읽음 처리 API 호출
    if (USER_ID && item.unread) {
      try {
        await readNotification(item.id, USER_ID);
        // 로컬 상태에서도 읽음으로 변경
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, unread: false } : n
          )
        );
        // 미확인 개수도 1 감소 (0 아래로는 내려가지 않게)
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        console.error("[NotificationScreen] 알림 읽음 처리 실패:", err);
      }
    }

    // TODO: 알림 타입(type/targetType 등)에 따라 상세 페이지/채팅 등으로 이동
  };

  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <Header title="알림" onBack={() => navigate(-1)} />

      {/* 알림 리스트 */}
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

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";

function buildHeaders(options = {}) {
  const isFormData = options.body instanceof FormData;

  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const headers = isFormData
    ? {}
    : {
        "Content-Type": "application/json",
      };

  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    ...headers,
    ...(options.headers || {}),
  };
}

async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log("요청:", url, options);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(options),
      credentials: "include", 
    });
  } catch (err) {
    console.error("네트워크 에러:", err);
    throw err;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    console.log("응답 본문 없음");
  }

  if (!res.ok) {
    const error = new Error(
      (data && data.message) || "알림 API 요청에 실패했습니다."
    );
    error.status = res.status;
    error.response = data;
    throw error;
  }

  return data;
}

// 알림 목록 조회
export async function getNotifications(userId, { page = 0, size = 20 } = {}) {
  if (!userId) throw new Error("userId가 필요합니다.");

  const params = new URLSearchParams();
  params.set("userId", String(userId));
  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", "createdAt,DESC");

  const URI = `/api/notifications?${params.toString()}`;
  const data = await apiRequest(URI, { method: "GET" });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}


// 미확인 알림 개수 조회
export async function getUnreadNotificationCount(userId) {
  if (!userId) throw new Error("userId가 필요합니다.");

  const URI = `/api/notifications/unread-count?userId=${userId}`;
  const data = await apiRequest(URI, { method: "GET" });

  if (typeof data === "number") return data;
  if (data && typeof data.count === "number") return data.count;
  return 0;
}


// SSE 실시간 알림 스트림
export function connectNotificationStream(userId) {
  if (!userId) throw new Error("userId가 필요합니다.");

  const params = new URLSearchParams();
  params.set("userId", String(userId));

  const url = `${BASE_URL}/api/notifications/stream?${params.toString()}`;
  console.log("SSE connect:", url);

  if (typeof window === "undefined" || !window.EventSource) {
    console.warn("EventSource를 지원하지 않는 환경입니다.");
    return null;
  }

  const eventSource = new EventSource(url, { withCredentials: true });
  return eventSource;
}


// 알림 읽음 처리
export async function readNotification(id, userId) {
  if (!id || !userId) throw new Error("id, userId가 모두 필요합니다.");

  const URI = `/api/notifications/${id}/read?userId=${userId}`;
  return apiRequest(URI, { method: "PATCH" });
}
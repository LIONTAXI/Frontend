// src/api/taxi.js
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";

function buildHeaders(options = {}) {
  const isFormData = options.body instanceof FormData;

  // 로그인 시 localStorage에 저장해 둔 토큰 읽기
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  // 기본 헤더
  const headers = isFormData
    ? {}
    : {
        "Content-Type": "application/json",
      };

  // 토큰이 실제 값일 때만 Authorization 추가
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
  console.log("[taxiApi] 요청:", url, options);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(options),
    });
  } catch (err) {
    console.error("[taxiApi] 네트워크 에러:", err);
    throw err;
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    console.log("[taxiApi] 정상 요청이나, 응답 본문 없음");
  }

  console.log("[taxiApi] 응답 status:", res.status, data);

  const isError = !res.ok || data.success === false;
  if (isError) {
    const error = new Error(data.message || "요청에 실패했습니다.");
    error.status = res.status;
    error.response = data;
    throw error;
  }

  return data;
}

/* =========================
 *  지도 관련
 * ========================= */

// 유저 위치 및 마지막 활동 시간 업데이트 (PATCH)
export function updateUserStatus({ latitude, longitude }) {
  const URI = "/api/map/user-map-update";
  return apiRequest(URI, {
    method: "PATCH",
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  });
}

// 현재 접속 중인 유저 조회
export async function getCurrentUsers() {
  const URI = "/api/map";
  const data = await apiRequest(URI, {
    method: "GET",
  });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

/* =========================
 *  택시팟 관련
 * ========================= */

// 택시팟 목록 조회  (GET /api/taxi-party)
export async function getTaxiPotList() {
  const URI = "/api/taxi-party";
  const data = await apiRequest(URI, { method: "GET" });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.taxiPots)) return data.taxiPots;
  return [];
}

// 택시팟 게시물 작성  (POST /api/taxi-party)
export function createTaxiPot(payload) {
  const URI = "/api/taxi-party";
  return apiRequest(URI, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 택시팟 정보 조회  (GET /api/taxi-party/{id})
export async function getTaxiPotDetail(taxiPotId) {
  const URI = `/api/taxi-party/${taxiPotId}`;
  const data = await apiRequest(URI, { method: "GET" });
  return data;
}

// 택시팟 수정  (PUT /api/taxi-party/{id})
export function updateTaxiPot(taxiPotId, payload) {
  const URI = `/api/taxi-party/${taxiPotId}`;
  return apiRequest(URI, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 택시팟 삭제  (DELETE /api/taxi-party/{id})
export async function deleteTaxiPot(id, userId) {
  return apiRequest(`/api/taxi-party/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
}

// 동승슈니 - 같이 타기  (POST /api/taxi-party/{id}/participation)
export function joinTaxiPot(taxiPotId) {
  const URI = `/api/taxi-party/${taxiPotId}/participation`;
  return apiRequest(URI, {
    method: "POST",
  });
}

// 총대슈니 - 택시팟 참여 요청 조회  (GET /api/taxi-party/{partyId}/requests)
export async function getJoinRequests(taxiPotId) {
  const URI = `/api/taxi-party/${taxiPotId}/requests`;
  const data = await apiRequest(URI, { method: "GET" });

  if (Array.isArray(data)) return data;
  return data.data || data.requests || [];
}

// 총대슈니 - 택시팟 참여 요청 수락
// (스웨거에 나온 그대로라면 /api/taxi-party/requests/{taxiUserId}/accept)
export function acceptJoinRequest(taxiUserId) {
  const URI = `/api/taxi-party/requests/${taxiUserId}/accept`;
  return apiRequest(URI, {
    method: "POST",
  });
}

// 총대슈니 - 매칭 종료  (POST /api/taxi-party/{id}/close)
export function closeTaxiPot(taxiPotId, payload) {
  const URI = `/api/taxi-party/${taxiPotId}/close`;
  return apiRequest(URI, {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

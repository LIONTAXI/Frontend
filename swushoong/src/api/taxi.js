// src/api/taxi.js
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";

function buildHeaders(options = {}) {
  const isFormData = options.body instanceof FormData;
  const base = isFormData ? {} : { "Content-Type": "application/json" };
  return {
    ...base,
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
    console.log("[taxiApi]정상 요청이나, 응답 본문 없음 ");
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

// 유저 위치 및 마지막 활동 시간 업데이트 (PATCH)
export function updateUserStatus(payload) {
  const URI = "/api/map/user-map-update";
  return apiRequest(URI, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// 현재 접속 중인 유저 조회
export function getCurrentUsers(userId) {
  const URI = `/api/map?userId=${userId}`;
  return apiRequest(URI, {
    method: "GET",
  });
}

/* =========================
 *  택시팟 관련
 * ========================= */

// 택시팟 목록 조회
export async function getTaxiPotList(userId) {
  const URI = `/api/taxi-party?userId=${userId}`;
  const data = await apiRequest(URI, { method: "GET" });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.taxiPots)) return data.taxiPots;
  return [];
}

// 택시팟 게시물 작성
export function createTaxiPot(payload) {
  const URI = "/api/taxi-party";       
  return apiRequest(URI, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 택시팟 정보 조회
export async function getTaxiPotDetail(taxiPotId, userId) {
  const URI = `/api/taxi-party/${taxiPotId}?userId=${userId}`;
  const data = await apiRequest(URI, { method: "GET" });
  return data;
}

// 택시팟 수정
export function updateTaxiPot(taxiPotId, payload) {
  const URI = `/api/taxi-party/${taxiPotId}`;
  return apiRequest(URI, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 택시팟 삭제
export async function deleteTaxiPot(id, userId) {
  return apiRequest(`/api/taxi-party/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

// 동승슈니 - 같이 타기
export function joinTaxiPot(taxiPotId, userId) {
  const URI = `/api/taxi-party/${taxiPotId}/participation`;
  return apiRequest(URI, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

// 총대슈니 - 택시팟 참여 요청 조회
export async function getJoinRequests(taxiPotId) {
  const URI = `/api/taxi-party/${taxiPotId}/requests`;
  const data = await apiRequest(URI, { method: "GET" });
  
  if (Array.isArray(data)) return data;
  return data.data || data.requests || [];
}

// 총대슈니 - 택시팟 참여 요청 수락
export function acceptJoinRequest(taxiUserId) {
  const URI = `/api/taxi-party/requests/${taxiUserId}/accept`;
  return apiRequest(URI, {
    method: "POST",
  });
}

// 총대슈니 - 매칭 종료
export function closeTaxiPot(taxiPotId, payload) {
  const URI = `/api/taxi-party/${taxiPotId}/close`;
  return apiRequest(URI, {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

// src/api/my.js

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";

/* =========================
 *  공통 유틸
 * ========================= */

// 공통 헤더 생성
function buildHeaders(options = {}) {
  const isFormData = options.body instanceof FormData;

  // 로그인 시 저장된 토큰 읽기
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

// 공통 요청 유틸
async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log("[myApi] 요청:", url, options);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(options),
    });
  } catch (err) {
    console.error("[myApi] 네트워크 에러:", err);
    throw err;
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    console.log("[myApi] JSON 파싱 실패 (body 없을 수 있음)");
  }

  console.log("[myApi] 응답 status:", res.status, data);

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
 *  마이페이지 / 프로필
 * ========================= */

// 마이페이지_프로필수정_기존정보조회
const MY_INFO_URI = "/api/users/info";

export async function getMyInfo() {
  const data = await apiRequest(MY_INFO_URI, {
    method: "GET",
  });

  // imgUrl이 /images/... 같이 상대 경로로 오면 절대 경로로 변환
  if (data && typeof data.imgUrl === "string") {
    if (!data.imgUrl.startsWith("http")) {
      data.imgUrl = `${BASE_URL}${data.imgUrl}`;
    }
  }

  return data;
}

// 마이페이지_프로필수정_프로필사진업로드
const PROFILE_IMAGE_URI = "/api/users/profile-image";

export function uploadProfileImage(file) {
  if (!file) {
    throw new Error("file is required for uploadProfileImage");
  }

  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(PROFILE_IMAGE_URI, {
    method: "PUT",
    body: formData,
  });
}

/* =========================
 *  차단 관련
 * ========================= */

const BLOCKS_URI = "/api/blocks";

// 차단하기
export function createBlock(blockedId) {
  const payload = { blockedId };

  return apiRequest(BLOCKS_URI, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 내가 차단한 목록
export function getBlockedUsers() {
  return apiRequest(BLOCKS_URI, {
    method: "GET",
  });
}

// 차단 해제
export function unblockUser(blockedId) {
  const payload = { blockedId };

  return apiRequest(BLOCKS_URI, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

/* =========================
 *  리뷰 요약 프로필 정보
 * ========================= */

// 프로필 요약 정보 조회 (리뷰 기반)
// GET /api/reviews/profile/{userId}
const REVIEW_PROFILE_URI = "/api/reviews/profile";

export function getProfileReviewSummary(userId) {
  if (userId == null) {
    throw new Error("userId is required for getProfileReviewSummary");
  }

  const path = `${REVIEW_PROFILE_URI}/${userId}`;
  return apiRequest(path, {
    method: "GET",
  });
}

/* =========================
 *  보호된 프로필 이미지 blob URL 헬퍼
 * ========================= */

// imgPath: "/api/users/3/profile-image" 또는 "https://..."
// 반환: blob URL (예: "blob:https://localhost:5173/xxxx") 또는 null
export async function fetchProfileImageWithAuth(imgPath) {
  if (!imgPath) return null;

  // 토큰 읽기
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  // 절대/상대 경로 모두 지원
  const url = imgPath.startsWith("http") ? imgPath : `${BASE_URL}${imgPath}`;

  const headers = {};
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { method: "GET", headers });
  } catch (err) {
    console.error("[myApi] 프로필 이미지 blob 요청 네트워크 에러:", err);
    return null;
  }

  if (!res.ok) {
    console.error(
      "[myApi] 프로필 이미지 blob 요청 실패:",
      res.status
    );
    return null;
  }

  try {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("[myApi] 프로필 이미지 blob 변환 실패:", err);
    return null;
  }
}

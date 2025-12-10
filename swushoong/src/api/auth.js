// src/api/auth.js
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
  console.log("[apiRequest] 요청:", url, options);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(options),
    });
  } catch (err) {
    console.error("[apiRequest] 네트워크 에러:", err);
    throw err;
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    console.log("[apiRequest] JSON 파싱 실패 (body 없을 수 있음)");
  }

  console.log("[apiRequest] 응답 status:", res.status, data);

  const isError = !res.ok || data.success === false;
  if (isError) {
    const error = new Error(data.message || "요청에 실패했습니다.");
    error.status = res.status;
    error.response = data;
    throw error;
  }

  return data;
}

// 로그인
const LOGIN_URI = "/api/login";

export function login(email, password) {
  return apiRequest(LOGIN_URI, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// 비밀번호 변경 - 코드 전송
const PW_SEND_CODE_URI = "/api/password-reset/send-code";

export function sendPasswordResetCode(email) {
  return apiRequest(PW_SEND_CODE_URI, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// 비밀번호 변경 - 코드 재전송(초기화)
const PW_RESEND_CODE_URI = "/api/password-reset/resend-code";

export function resendPasswordResetCode(email) {
  return apiRequest(PW_RESEND_CODE_URI, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// 비밀번호 변경 - 코드 검증
const PW_VERIFY_CODE_URI = "/api/password-reset/verify-code";

export function verifyPasswordResetCode(email, code) {
  return apiRequest(PW_VERIFY_CODE_URI, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

// 비밀번호 변경 & 저장
const PW_CHANGE_URI = "/api/password-reset/change";

export function changePassword(email, password, confirmPassword) {
  return apiRequest(PW_CHANGE_URI, {
    method: "POST",
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}

// 1차 회원가입 - 인증코드 전송
const SIGNUP_SEND_CODE_URI = "/api/auth/email/send";

export function sendSignupCode(email) {
  return apiRequest(SIGNUP_SEND_CODE_URI, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// 1차 회원가입 - 인증코드 초기화 (재전송)
const SIGNUP_RESET_CODE_URI = "/api/auth/email/resend";

export function resetSignupCode(email) {
  return apiRequest(SIGNUP_RESET_CODE_URI, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// 1차 회원가입 - 인증코드 일치 여부 확인
const SIGNUP_VERIFY_CODE_URI = "/api/auth/email/verify";

export function verifySignupCode(email, code) {
  return apiRequest(SIGNUP_VERIFY_CODE_URI, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

// 1차 회원가입 - 비밀번호 설정
const SIGNUP_SET_PASSWORD_URI = "/api/auth/email/set-password";

export function setSignupPassword(email, password, confirmPassword) {
  return apiRequest(SIGNUP_SET_PASSWORD_URI, {
    method: "POST",
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}

// Clova OCR로 도서관 회원증 학번, 이름 추출 후 인증
const LIBRARY_OCR_URI = "/api/auth/library-card/upload";

export function signupLibraryOcr(formData) {
  return apiRequest(LIBRARY_OCR_URI, {
    method: "POST",
    body: formData,
  });
}

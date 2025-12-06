const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";
const ADMIN_ID = import.meta.env.VITE_ADMIN_USER || "admin_user";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASS || "admin_pass";

// ID:PASSWORD 문자열을 Base64로 인코딩
const authString = `${ADMIN_ID}:${ADMIN_PASSWORD}`;
const encodedAuth = btoa(authString); 

// commonHeaders
const commonHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${encodedAuth}`, // Basic 인증 헤더 사용
};

/**
 * 기본 Fetch 요청을 처리하는 유틸리티 함수
 * @param {string} endpoint - API 엔드포인트 경로 (예: /api/users)
 * @param {object} options - Fetch API 옵션 객체
 * @returns {Promise<object>} - 서버 응답 데이터 (JSON 형식)
 */

async function apiRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // 헤더 객체 복사 및 토큰 주입 로직
    const headers = {
        ...commonHeaders,
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: headers, // Basic 인증 헤더가 포함된 headers 사용
        });

        if (!response.ok) {
            // HTTP 오류 상태 코드(4xx, 5xx)에 대한 처리
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }

        // 응답 본문이 없을 경우 (204 No Content 등)를 처리
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // JSON 응답이 아닌 경우 (예: 성공했으나 본문이 없는 경우)
            return { message: "Success (No content)" };
        }

    } catch (error) {
        console.error(`Error in API request to ${url}:`, error.message);
        throw error; // 호출하는 쪽에서 에러를 catch하여 처리할 수 있도록 다시 던짐
    }
}


// --- 1. 회원가입 수동인증 (관리자 승인 요청) ---
/*
 * POST /api/auth/library-card/submit
 * 사용자 정보를 포함하여 관리자 승인 요청을 제출
 */
export async function submitLibraryCardApproval(userData) {
    const endpoint = "/api/auth/library-card/submit";
    console.log(`Submitting approval request for user...`);
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(userData),
    });
}

// --- 2. 관리자 페이지에서 승인 요청 목록 전체 조회 ---
/**
 * GET /api/admin/auth-requests
 * 대기 중인 모든 인증 요청 목록을 조회
 */
export async function getAllAuthRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/auth-requests${queryString ? '?' + queryString : ''}`;
    console.log(`Fetching all auth requests...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// --- 3. 승인 요청 목록 상세 조회 ---
/**
 * GET /api/admin/auth-requests/{authId}
 * 특정 인증 요청의 상세 정보를 조회
 */
export async function getAuthRequestDetails(authId) {
    const endpoint = `/api/admin/auth-requests/${authId}`;
    console.log(`Fetching details for auth request ID: ${authId}...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// --- 4. 관리자가 해당 요청 승인 ---
/**
 * POST /api/admin/auth-requests/approve
 * 특정 인증 요청을 승인
 */
export async function approveAuthRequest(authId) {
    const endpoint = "/api/admin/auth-requests/approve";
    console.log(`Approving auth request ID: ${authId}...`);
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ authId }), // 백엔드 API에 맞게 Body 구조 조정 필요
    });
}

// --- 5. 승인 반려 메세지 조회 ---
/**
 * GET /api/admin/auth-requests/rejection-reasons
 * 관리자가 사용할 수 있는 승인 반려 사유 목록을 조회
 */
export async function getRejectionReasons() {
    const endpoint = "/api/admin/auth-requests/rejection-reasons";
    console.log(`Fetching rejection reasons...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// --- 6. 관리자가 해당 요청 반려 ---
/**
 * POST /api/admin/auth-requests/reject
 * 특정 인증 요청을 반려(거절)합니다.
 * 🚨 **주의**: 요청하신 API 명세가 "POST /api/admin/auth-requests/approve"로 승인/반려 모두 사용하는 것으로 보이나,
 * 일반적으로 반려(Reject)는 별도의 엔드포인트나 다른 파라미터를 사용합니다.
 * 여기서는 일반적인 RESTful 관행에 따라 **`/reject`** 엔드포인트가 있다고 가정하고 작성합니다.
 * 만약 요청하신 명세가 맞다면, **`approveAuthRequest`** 함수 내에서 파라미터로 처리 방식을 구분해야 합니다.
 * (요청하신 명세에 맞춰 아래 함수 이름을 **`rejectAuthRequestByApproveEndpoint`** 로 정의하고 구현합니다.)
 * @param {string | number} authId - 반려할 인증 요청의 ID
 * @param {string} [reasonId] - 반려 사유 ID (선택 사항, 서버 요구 사항에 따라 다름)
 */
export async function rejectAuthRequestByApproveEndpoint(authId, reasonId) {
    // 🚨 요청하신 엔드포인트(POST /api/admin/auth-requests/approve)를 사용하지만,
    // 실제 반려 로직을 수행하도록 Body에 반려 정보를 포함시킵니다.
    // 서버에서 요구하는 정확한 Body 구조로 변경해야 합니다.
    const endpoint = "/api/admin/auth-requests/approve";
    console.log(`Rejecting auth request ID: ${authId} with reason: ${reasonId}...`);
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ 
            authId,
            action: "REJECT", // 서버에서 반려임을 알 수 있는 필드 (예시)
            reasonId,
        }),
    });
}

// --- 7. 관리자 페이지에서 수신 목록 조회 (승인/반려 완료된 목록) ---
/**
 * GET /api/admin/auth-requests/completed
 * 처리 완료된 (승인 또는 반려) 인증 요청 목록을 조회
 */
export async function getCompletedAuthRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/auth-requests/completed${queryString ? '?' + queryString : ''}`;
    console.log(`Fetching completed auth requests...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

export default {
    submitLibraryCardApproval,
    getAllAuthRequests,
    getAuthRequestDetails,
    approveAuthRequest,
    getRejectionReasons,
    rejectAuthRequestByApproveEndpoint,
    getCompletedAuthRequests,
};

// --- 사용 예시 (Usage Example) ---
/*
async function main() {
    try {
        // 1. 회원가입 승인 요청
        const submitResult = await submitLibraryCardApproval({ name: "홍길동", ... });
        console.log("Submit Result:", submitResult);

        // 2. 전체 요청 목록 조회
        const allRequests = await getAllAuthRequests({ page: 1 });
        console.log("All Requests:", allRequests.data);
        const firstAuthId = allRequests.data[0].id; // 첫 번째 요청 ID 가정

        // 3. 상세 조회
        const detail = await getAuthRequestDetails(firstAuthId);
        console.log("Detail:", detail);

        // 4. 승인
        const approveResult = await approveAuthRequest(firstAuthId);
        console.log("Approval Result:", approveResult);
        
        // 5. 반려 사유 목록 조회
        const reasons = await getRejectionReasons();
        console.log("Rejection Reasons:", reasons.data);
        const rejectionReasonId = reasons.data[0].id; // 첫 번째 반려 사유 ID 가정

        // 6. 반려 (⚠️ rejectAuthRequestByApproveEndpoint 사용)
        // const rejectResult = await rejectAuthRequestByApproveEndpoint(firstAuthId, rejectionReasonId);
        // console.log("Rejection Result:", rejectResult);

        // 7. 완료된 목록 조회
        const completed = await getCompletedAuthRequests();
        console.log("Completed Requests:", completed.data);

    } catch (error) {
        console.error("Operation failed:", error.message);
    }
}

// main();
*/
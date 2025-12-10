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

/**
 * 6. 관리자가 해당 요청 반려 (API 명세 반영)
 * POST /api/admin/auth-requests/approve
 * * @param {string | number} authId - 반려할 인증 요청의 ID
 * @param {string} rejectionReason - 반려 사유 문자열 (필수)
 * @returns {Promise<object>} - 서버 응답 데이터 (JSON 형식) 또는 에러 메시지
 */
export async function rejectAuthRequestByApproveEndpoint(authId, rejectionReason) {
    
    // 1. 반려 사유 필수 검증 로직 추가
    if (!rejectionReason || rejectionReason.trim() === "") {
        // 명세에 따라 반려 사유가 없을 때 반환할 메시지를 Error 객체로 랩핑하여 던집니다.
        throw new Error("반려 사유를 입력해주세요"); 
    }

    const endpoint = "/api/admin/auth-requests/approve";
    
    console.log(`Rejecting auth request ID: ${authId} with reason: ${rejectionReason}...`);
    
    // 2. 요청 본문 구조 변경 (API 명세 반영)
    const requestBody = {
        authId: authId,
        isApproved: false, // 반려 처리
        rejectionReason: rejectionReason,
    };
    
    // apiRequest 유틸리티 함수를 사용하여 API 호출
    try {
        const response = await apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(requestBody), 
        });

        // 명세에 따라 "인증 요청이 반려되었습니다" 라는 응답을 가정
        // apiRequest가 JSON 응답을 반환한다고 가정하면, 서버는 { message: "인증 요청이 반려되었습니다" } 형태일 수 있습니다.
        return response; 
        
    } catch (error) {
        // API 요청 자체에서 발생한 오류 (네트워크, 4xx, 5xx) 처리
        console.error(`Error rejecting request ${authId}:`, error.message);
        throw error;
    }
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

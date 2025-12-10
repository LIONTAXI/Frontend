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
 */
export async function rejectAuthRequestByApproveEndpoint(authId, rejectionReason) {
    
    if (!rejectionReason || rejectionReason.trim() === "") {
        throw new Error("반려 사유를 입력해주세요"); 
    }

    const endpoint = "/api/admin/auth-requests/approve";
    
    console.log(`Rejecting auth request ID: ${authId} with reason: ${rejectionReason}...`);
    
    // 2. 요청 본문 구조 변경
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

// --- 8. 인증 요청 이미지 조회 ---
/**
 * GET /api/admin/auth-requests/{authId}/image
 * 특정 인증 요청에 첨부된 이미지 파일을 조회 (Base64 인코딩된 문자열이나 URL 등으로 가정)
 */
export async function getAuthRequestImage(authId) {
    const endpoint = `/api/admin/auth-requests/${authId}/image`;
    console.log(`Fetching image for auth request ID: ${authId}...`);

    try {
        const response = await apiRequest(endpoint, {
            method: "GET",
        });
        
        return response; 
        
    } catch (error) {
        console.error(`Error fetching image for request ${authId}:`, error.message);
        throw error;
    }
}

// --- 9. 관리자 로그인 API ---
/**
 * POST /api/admin/login
 * 관리자 계정으로 로그인하고 인증 토큰을 획득
 */
export async function adminLogin(email, password) {
    const endpoint = "/api/admin/login";
    console.log(`Attempting admin login for: ${email}...`);
    
    const requestBody = {
        email: email,
        password: password,
    };

    try {
        const response = await apiRequest(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify(requestBody), 
        });
        
        // 로그인 성공 시 응답 예시: { "success": true, "message": "string", "email": "string", "role": "ADMIN"}
        return response; 
        
    } catch (error) {
        console.error(`Error during admin login for ${email}:`, error.message);
        throw error;
    }
}

/*
// --- 9. 관리자 로그인 API (수정된 버전: Basic 인증 헤더 제외) ---
export async function adminLogin(email, password) {
    const url = `${BASE_URL}/api/admin/login`; // BASE_URL 사용
    const requestBody = { email, password };
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Authorization 헤더를 포함하지 않음
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `Login failed with status ${response.status}`);
        }

        return await response.json(); 
        
    } catch (error) {
        console.error(`Error during admin login for ${email}:`, error.message);
        throw error;
    }
}
*/

export default {
    submitLibraryCardApproval,
    getAllAuthRequests,
    getAuthRequestDetails,
    approveAuthRequest,
    getRejectionReasons,
    rejectAuthRequestByApproveEndpoint,
    getCompletedAuthRequests,
    getAuthRequestImage, 
    adminLogin,
};

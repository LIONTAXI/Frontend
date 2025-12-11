const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";
const ADMIN_ID = import.meta.env.VITE_ADMIN_USER || "admin_user";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASS || "admin_pass";

const authString = `${ADMIN_ID}:${ADMIN_PASSWORD}`;
const encodedAuth = btoa(authString); 

const commonHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${encodedAuth}`, // Basic 인증 헤더 사용
};

async function apiRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // 헤더 객체 복사 및 토큰 주입 
    const headers = {
        ...commonHeaders,
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: headers, 
        });

        if (options.returnRawResponse) {
            return response;
        }

        if (response.status >= 400 && response.status !== 400) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return { message: `Success (Status: ${response.status})` };
        }

    } catch (error) {
        console.error(`Error in API request to ${url}:`, error.message);
        throw error; 
    }
}


// 회원가입 수동인증
export async function submitLibraryCardApproval(userData) {
    const endpoint = "/api/auth/library-card/submit";
    console.log(`Submitting approval request for user...`);
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(userData),
    });
}

// 승인 요청 목록 전체 조회 
export async function getAllAuthRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/auth-requests${queryString ? '?' + queryString : ''}`;
    console.log(`Fetching all auth requests...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// 승인 요청 목록 상세 조회 
export async function getAuthRequestDetails(authId) {
    const endpoint = `/api/admin/auth-requests/${authId}`;
    console.log(`Fetching details for auth request ID: ${authId}...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// 해당 요청 승인 
export async function approveAuthRequest(authId) {
    const endpoint = "/api/admin/auth-requests/approve";
    
    const requestBody = {
        authId: authId,
        isApproved: true, 
        rejectionReason: null, 
    };

    console.log(`Approving auth request ID: ${authId}...`);
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(requestBody), 
    });
}

// 승인 반려 메세지 조회
export async function getRejectionReasons() {
    const endpoint = "/api/admin/auth-requests/rejection-reasons";
    console.log(`Fetching rejection reasons...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// 해당 요청 반려 
export async function rejectAuthRequestByApproveEndpoint(authId, rejectionReason) {
    
    if (!rejectionReason || rejectionReason.trim() === "") {
        throw new Error("반려 사유를 입력해주세요"); 
    }

    const endpoint = "/api/admin/auth-requests/approve";
    
    console.log(`Rejecting auth request ID: ${authId} with reason: ${rejectionReason}...`);
    
    const requestBody = {
        authId: authId,
        isApproved: false,
        rejectionReason: rejectionReason,
    };
    
    try {
        const response = await apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(requestBody), 
        });

        return response; 
        
    } catch (error) {
        console.error(`Error rejecting request ${authId}:`, error.message);
        throw error;
    }
}

// 수신 목록 조회
export async function getCompletedAuthRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/auth-requests/completed${queryString ? '?' + queryString : ''}`;
    console.log(`Fetching completed auth requests...`);
    return apiRequest(endpoint, {
        method: "GET",
    });
}

// 인증 요청 이미지 조회
export async function getAuthRequestImage(authId) {
    const endpoint = `/api/admin/auth-requests/${authId}/image`;
    console.log(`Fetching image for auth request ID: ${authId}...`);

    try {
        const response = await apiRequest(endpoint, {
            method: "GET",
            returnRawResponse: true 
        });

        if (!response.ok) {
            throw new Error(`이미지 로드 실패: ${response.status}`);
        }
        
        return await response.blob();
        
    } catch (error) {
        console.error(`Error fetching image for request ${authId}:`, error.message);
        throw error;
    }
}

// 관리자 로그인
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
        
        return response; 
        
    } catch (error) {
        console.error(`Error during admin login for ${email}:`, error.message);
        throw error;
    }
}

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
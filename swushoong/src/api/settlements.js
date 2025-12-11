import { apiRequest } from "./auth"; 
import { getAuthToken } from "./token";

function settlementApiRequest(path, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error("인증 토큰이 필요합니다. 먼저 로그인해주세요.");
    }

    const authHeaders = {
        'Authorization': `Bearer ${token}`,
    };

    const mergedOptions = {
        ...options,
        headers: {
            ...authHeaders,
            ...(options.headers || {}),
        },
    };

    return apiRequest(path, mergedOptions);
}

// 정산 생성
export async function createSettlement(body) {
    const path = "/api/settlements";
    
    const settlementId = await settlementApiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
    });

    return settlementId;
}

// 정산 상세 조회 
export function getSettlementDetails(settlementId) {
    const path = `/api/settlements/${settlementId}`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// 참여자 정산 완료 처리 
export function markParticipantPaid(settlementId, userId) {
    const path = `/api/settlements/${settlementId}/participants/${userId}/pay`;
    return settlementApiRequest(path, {
        method: "POST",
    });
}

// 정산 재촉 
export function remindSettlement(settlementId) {
    const path = `/api/settlements/${settlementId}/remind`;
    return settlementApiRequest(path, {
        method: "POST",
    });
}

// 현재 유저의 정산 ID 조회
export function getCurrentSettlementId(taxiPartyId) {
    const path = `/api/settlements/current?taxiPartyId=${taxiPartyId}`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// 택시팟 상세 정보 조회
export function getTaxiPartyDetails(taxiPartyId, userId) {
    const path = `/api/taxi-party/${taxiPartyId}?userId=${userId}`; 
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// 택시팟 참여 목록 조회
export function getParticipatingTaxiParties(userId) {
    const path = `/api/taxi-party?userId=${userId}`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// 택시팟 참여 요청 조회
export function getPartyRequests(partyId) {
    const path = `/api/taxi-party/${partyId}/requests`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}
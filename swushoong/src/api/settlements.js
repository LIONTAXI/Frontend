// src/api/settlements.js
import { apiRequest } from "./auth"; 
import { getAuthToken } from "./token";

/**
 * 모든 정산 관련 API 호출 시 인증 헤더를 추가하는 헬퍼 함수입니다.
 * @param {string} path API 경로
 * @param {object} options fetch 옵션
 * @returns {Promise<any>} API 응답 데이터
 */
function settlementApiRequest(path, options = {}) {
    const token = getAuthToken();
    if (!token) {
        // 토큰이 없으면 즉시 에러 발생
        throw new Error("인증 토큰이 필요합니다. 먼저 로그인해주세요.");
    }

    const authHeaders = {
        'Authorization': `Bearer ${token}`,
    };

    // 기존 options의 headers와 인증 헤더를 병합합니다.
    const mergedOptions = {
        ...options,
        headers: {
            ...authHeaders,
            ...(options.headers || {}),
        },
    };

    return apiRequest(path, mergedOptions);
}

// --- 1. 정산 생성 API (POST /api/settlements) ---

/**
 * 정산 생성 요청 Body 타입 정의
 * @typedef {object} CreateSettlementBody
 * @property {number} taxiPartyId 정산을 생성할 택시팟 ID
 * @property {number} totalFare 전체 택시비
 * @property {string} bankName 은행 이름
 * @property {string} accountNumber 계좌번호
 * @property {Array<{userId: number, amount: number}>} participants 참여자별 부담 금액
 */

/**
 * 정산을 생성합니다.
 * @param {CreateSettlementBody} body 정산 생성 정보
 * @returns {Promise<number>} 생성된 settlementId (Long 타입)
 */
export async function createSettlement(body) {
    const path = "/api/settlements";
    
    // apiRequest는 성공 응답의 body가 없거나 JSON 파싱에 실패하면 {}를 반환합니다.
    // 명세에 따라 성공 시 ID가 숫자로 반환되므로, 실제 응답을 그대로 반환합니다.
    const settlementId = await settlementApiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
        // settlementApiRequest 내부에서 'Content-Type': 'application/json' 이 처리됨
    });

    // 성공 응답 예시가 1 (생성된 settlementId) 이므로, 반환되는 값 그대로 사용
    return settlementId;
}

// --- 2. 정산 상세 조회 API (GET /api/settlements/{settlementId}) ---

/**
 * 정산 참여자 정보 타입 정의
 * @typedef {object} SettlementParticipant
 * @property {number} userId 사용자 ID
 * @property {string} name 이름
 * @property {string} shortStudentId 학번 (단축)
 * @property {string} imgUrl 프로필 이미지 URL
 * @property {number} amount 내야할 금액
 * @property {boolean} paid 정산 완료 여부
 * @property {string | null} paidAt 정산 시각 (ISO 8601)
 * @property {boolean} host 총대 여부
 */

/**
 * 정산 상세 정보 응답 타입 정의
 * @typedef {object} SettlementDetails
 * @property {number} settlementId 정산 ID
 * @property {number} taxiPartyId 택시팟 ID
 * @property {number} totalFare 총 택시요금
 * @property {string} bankName 은행 이름
 * @property {string} accountNumber 계좌번호
 * @property {'IN_PROGRESS' | 'COMPLETED'} status 정산 상태
 * @property {string} createdAt 생성 시각 (ISO 8601)
 * @property {SettlementParticipant[]} participants 참여자 목록
 */

/**
 * 특정 정산의 상세 정보를 조회합니다.
 * @param {number} settlementId 조회할 정산의 ID 값
 * @returns {Promise<SettlementDetails>} 정산 상세 정보
 */
export function getSettlementDetails(settlementId) {
    const path = `/api/settlements/${settlementId}`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// --- 3. 참여자 정산 완료 처리 API (POST /api/settlements/{settlementId}/participants/{userId}/pay) ---

/**
 * 방장만 할 수 있는 참여자 정산 완료 처리를 수행합니다.
 * 요청자는 반드시 이 정산의 총대여야 합니다.
 * @param {number} settlementId 정산의 ID 값
 * @param {number} userId "정산 완료"로 표시할 대상 유저의 ID 값
 * @returns {Promise<void>} Body 없음 (HTTP 200 OK)
 */
export function markParticipantPaid(settlementId, userId) {
    const path = `/api/settlements/${settlementId}/participants/${userId}/pay`;
    return settlementApiRequest(path, {
        method: "POST",
        // Body가 없으므로 JSON.stringify 등을 사용하지 않습니다.
    });
}

// --- 4. 정산 재촉 API (POST /api/settlements/{settlementId}/remind) ---

/**
 * 방장만 할 수 있는 정산 재촉 기능을 호출합니다. (2시간에 1번만 호출 가능)
 * 미정산자에게 알림 + 채팅 메시지를 재전송합니다.
 * @param {number} settlementId 정산의 ID 값
 * @returns {Promise<void>} Body 없음 (HTTP 200 OK)
 */
export function remindSettlement(settlementId) {
    const path = `/api/settlements/${settlementId}/remind`;
    return settlementApiRequest(path, {
        method: "POST",
        // Body가 없으므로 JSON.stringify 등을 사용하지 않습니다.
    });
}

// --- 5. 현재 유저의 정산 ID 조회 API (GET /api/settlements/current) ---

/**
 * 현재 유저가 속한 택시팟의 정산 ID 조회 응답 타입 정의
 * @typedef {object} CurrentSettlementStatus
 * @property {boolean} hasSettlement 정산 생성 여부
 * @property {number | null} settlementId 정산 ID (생성되지 않았으면 null)
 */

/**
 * 현재 로그인한 사용자가 속한 특정 택시팟의 정산 ID를 조회합니다.
 * @param {number} taxiPartyId 조회할 택시팟의 ID 값
 * @returns {Promise<CurrentSettlementStatus>} 정산 상태 및 ID
 */
export function getCurrentSettlementId(taxiPartyId) {
    const path = `/api/settlements/current?taxiPartyId=${taxiPartyId}`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// ===============================================


// --- 1. 택시팟 상세 정보 조회 API (GET /api/taxi-party/{id}) ---
/**
 * ParticipationStatus 필드 종류 (Enum)
 * @typedef {'NONE' | 'WAITING' | 'ACCEPTED'} ParticipationStatus
 */

/**
 * 택시팟 상세 정보 응답 타입 정의
 * @typedef {object} TaxiPartyDetails
 * @property {number} id 택시팟 ID
 * @property {number} hostId 방장 유저 ID
 * @property {string} departure 출발지
 * @property {string} destination 목적지
 * @property {string} meetingTime 예상 만남 시각 (HH:mm)
 * @property {number} currentParticipants 현재 참여 인원 수
 * @property {number} maxParticipants 최대 참여 인원 수
 * @property {number} expectedPrice 예상 택시 요금
 * @property {string} content 내용/설명
 * @property {string} status 택시팟 상태 (예: 'MATCHING')
 * @property {ParticipationStatus} participationStatus 사용자 참여 상태
 */

/**
 * 특정 택시팟의 상세 정보를 조회합니다.
 * @param {number} taxiPartyId 조회할 택시팟의 ID 값
 * @returns {Promise<TaxiPartyDetails>} 택시팟 상세 정보
 */
export function getTaxiPartyDetails(taxiPartyId, userId) {
    const path = `/api/taxi-party/${taxiPartyId}?userId=${userId}`; // ???
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// --- 2. 택시팟 참여 목록 조회 API (GET /api/taxi-party?userId={userId}) ---
/**
 * 택시팟 목록 항목 응답 타입 정의
 * @typedef {object} TaxiPartyListItem
 * @property {number} id 택시팟 ID
 * @property {string} departure 출발지
 * @property {string} destination 목적지
 * @property {string} meetingTime 예상 만남 시각 (HH:mm)
 * @property {number} currentParticipants 현재 참여 인원 수
 * @property {number} maxParticipants 최대 참여 인원 수
 * @property {number} expectedPrice 예상 택시 요금
 */

/**
 * 특정 사용자가 참여하기로 한 택시팟 목록을 조회합니다.
 * @param {number} userId 조회할 사용자의 ID 값
 * @returns {Promise<TaxiPartyListItem[]>} 참여 목록
 */
export function getParticipatingTaxiParties(userId) {
    const path = `/api/taxi-party?userId=${userId}`;
    return settlementApiRequest(path, {
        method: "GET",
    });
}

// --- 3. 택시팟 참여 요청 조회 API (GET /api/taxi-party/{partyId}/requests) ---

/**
 * 택시팟 참여 요청 항목 응답 타입 정의
 * @typedef {object} TaxiPartyRequestItem
 * @property {number} taxiUserId 택시팟 유저 ID (파티 내 고유 ID)
 * @property {number} userId 실제 유저 ID
 * @property {string} name 이름
 * @property {number} shortStudentId 학번 (단축)
 * @property {string} imgUrl 프로필 이미지 URL
 * @property {'ACCEPTED' | 'WAITING' | 'REJECTED'} status 요청 상태
 */

/**
 * 방장 입장에서 택시팟 참여 요청 목록을 조회합니다.
 * @param {number} partyId 조회할 택시팟 ID
 * @returns {Promise<TaxiPartyRequestItem[]>} 요청 목록
 */
export function getPartyRequests(partyId) {
    const path = `/api/taxi-party/${partyId}/requests`;
    // 이 API는 방장(Host) 권한이 필요하며, 인증 헤더를 사용합니다.
    return settlementApiRequest(path, {
        method: "GET",
    });
}
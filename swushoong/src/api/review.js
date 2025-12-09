// src/api/review.js 
import { apiRequest } from './auth'; 
import { getAuthToken } from './token'; 

// 모든 리뷰 API에 필요한 Authorization 헤더를 생성하는 헬퍼 함수
function getAuthHeader() {
  const token = getAuthToken();
  if (!token) {
    // 토큰이 없으면 에러를 발생시키거나, 빈 객체를 반환하여 apiRequest가 에러를 처리하도록 할 수 있습니다.
    throw new Error("인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
  }
  return {
    "Authorization": `Bearer ${token}`,
  };
}

// 1. 후기 작성 API (POST /api/reviews)
export function postReview(reviewData) {
  return apiRequest("/api/reviews", {
    method: "POST",
    headers: getAuthHeader(), // 인증 헤더 수동 추가
    body: JSON.stringify(reviewData),
  });
}

// 2. 채팅방 "사용자 목록" 화면 데이터 조회 API (GET /api/reviews/members?taxiPartyId={taxiPartyId})
export function getPartyMembersWithReviewStatus(taxiPartyId) {
  // 쿼리 파라미터는 apiRequest가 자동으로 처리하도록 경로에 직접 추가합니다.
  const path = `/api/reviews/members?taxiPartyId=${taxiPartyId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(), // 인증 헤더 수동 추가
  });
}

// 3. 프로필 요약 정보 조회 API (GET /api/reviews/profile/{userId})
export function getUserReviewSummary(userId) {
  const path = `/api/reviews/profile/${userId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(), // 인증 헤더 수동 추가
  });
}

/**
 * 특정 택시팟의 현재 정산 ID를 조회합니다.
 * GET /api/settlements/current?taxiPartyId={taxiPartyId}
 * @param {number} taxiPartyId - 택시팟 ID
 * @returns {Promise<{ hasSettlement: boolean, settlementId: number | null }>}
 */
export function getCurrentSettlementId(taxiPartyId) {
  const path = `/api/settlements/current?taxiPartyId=${taxiPartyId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(),
  });
}

/**
 * 정산 상세 정보를 조회합니다.
 * GET /api/settlements/{settlementId}
 * @param {number} settlementId - 정산 ID
 * @returns {Promise<object>} 정산 상세 정보 객체
 */
export function getSettlementDetails(settlementId) {
  const path = `/api/settlements/${settlementId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(),
  });
}


/**
 * (통합 함수) 특정 택시팟의 후기 대상이 될 멤버 정보를 가져옵니다.
 * @param {number} taxiPartyId - 택시팟 ID
 * @returns {Promise<object[]>} 후기 대상이 될 멤버 목록 (본인 제외)
 */
export async function fetchReviewableMembers(taxiPartyId) {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) throw new Error("현재 로그인한 사용자 ID를 확인할 수 없습니다.");

    const settlementInfo = await getCurrentSettlementId(taxiPartyId);

    if (!settlementInfo.hasSettlement || !settlementInfo.settlementId) {
        throw new Error("해당 택시팟에 정산 정보가 존재하지 않습니다.");
    }

    const details = await getSettlementDetails(settlementInfo.settlementId);

    // 참여자 목록에서 본인(currentUserId)을 제외한 나머지 멤버만 필터링합니다.
    const revieweeList = details.participants.filter(p => p.userId !== currentUserId);

    // 필요한 정보만 추출하여 반환
    return revieweeList.map(p => ({
        userId: p.userId,
        name: p.name,
        role: p.host ? "총대슈니" : "동승슈니",
        shortStudentId: p.shortStudentId,
        imgUrl: p.imgUrl,
    }));
}
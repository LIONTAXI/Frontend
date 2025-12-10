// src/api/review.js 
import { apiRequest } from './auth'; 
import { getAuthToken, getCurrentUserId } from './token';

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

// 🌟 4. 단일 후기 상세 조회 API (GET /api/reviews/{reviewId}) 추가
/**
 * 후기 도착 알림 클릭 시, 해당 리뷰 한 건의 상세 정보를 조회합니다.
 * GET /api/reviews/{reviewId}
 * @param {number} reviewId - 조회할 후기 ID
 * @returns {Promise<object>} 단일 후기 상세 정보 객체
 */
export function getReviewDetail(reviewId) {
    const path = `/api/reviews/${reviewId}`;
    
    return apiRequest(path, {
        method: "GET",
        headers: getAuthHeader(), // 인증 헤더 수동 추가
    });
}

// 🚨 6. 택시팟 멤버 강퇴 API (총대만 실행 가능) 추가
/**
 * 택시팟 멤버를 강퇴시킵니다. (총대만 실행 가능)
 * POST /api/chat/rooms/{taxiPartyId}/kick/{userId}
 * @param {number} taxiPartyId - 택시팟 ID
 * @param {number} userId - 강퇴시킬 멤버의 ID
 * @returns {Promise<void>} 
 */
export function kickPartyMember(taxiPartyId, userId) {
  const path = `/api/chat/rooms/${taxiPartyId}/kick/${userId}`;
  
  return apiRequest(path, {
    method: "POST",
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
 * (최종 수정된 통합 함수) 특정 택시팟의 후기 대상이 될 멤버 정보를 가져옵니다.
 * getPartyMembersWithReviewStatus API를 사용하여 참여자 목록을 가져옵니다.
 *
 * @param {number} taxiPartyId - 택시팟 ID
 * @returns {Promise<object[]>} 후기 대상이 될 멤버 목록 (본인 제외)
 */
export async function fetchReviewableMembers(taxiPartyId) {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) throw new Error("현재 로그인한 사용자 ID를 확인할 수 없습니다.");

    try {
        // 🚨 1. 사용자 목록 화면용 API 호출 (이름, 학번, 역할, reviewWritten 포함)
        const allParticipants = await getPartyMembersWithReviewStatus(taxiPartyId); 
        
        // 2. 참여자 목록에서 본인(currentUserId)을 제외한 나머지 멤버만 필터링합니다.
        // (getPartyMembersWithReviewStatus는 원래 본인 제외를 전제로 하지 않으므로 필터링 필요)
        const revieweeList = allParticipants.filter(p => p.userId !== currentUserId);

        // 3. 필요한 정보만 추출하여 반환 (응답 필드 구조 가정)
        return revieweeList.map(p => ({
            userId: p.userId,
            name: p.name,
            // 🚨 host 필드를 사용하여 역할 설정 (getPartyMembersWithReviewStatus 응답 필드: host)
            role: p.host ? "총대슈니" : "동승슈니", 
            shortStudentId: p.shortStudentId,
            imgUrl: p.imgUrl, 
            // reviewWritten 필드는 후기 작성이 이미 완료되었는지 판단하는 데 유용할 수 있지만, 
            // 현재 ReviewAllScreen에서는 대상자 정보를 찾는 것이 주 목적입니다.
        }));

    } catch (error) {
        console.error("멤버 목록 로드 실패:", error);
        throw new Error(`후기 대상 멤버 정보를 불러오는 데 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
}

/**
 * 사용자 차단 API (POST /api/blocks)
 * @param {number} blockerId - 차단하는 사람 (나)의 ID
 * @param {number} blockedId - 차단당하는 사람 (상대방)의 ID
 * @returns {Promise<object>} 응답 메시지
 */
export function postBlockUser(blockerId, blockedId) {
    const path = "/api/blocks";
    return apiRequest(path, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ blockerId, blockedId }),
    });
}
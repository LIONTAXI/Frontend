import { apiRequest } from './auth'; 
import { getAuthToken, getCurrentUserId } from './token';

function getAuthHeader() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
  }
  return {
    "Authorization": `Bearer ${token}`,
  };
}

// 후기 작성
export function postReview(reviewData) {
  return apiRequest("/api/reviews", {
    method: "POST",
    headers: getAuthHeader(), 
    body: JSON.stringify(reviewData),
  });
}

// 채팅방 사용자 목록 화면 데이터 조회 
export function getPartyMembersWithReviewStatus(taxiPartyId) {
  const path = `/api/reviews/members?taxiPartyId=${taxiPartyId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(), 
  });
}

// 프로필 요약 정보 조회
export function getUserReviewSummary(userId) {
  const path = `/api/reviews/profile/${userId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(), 
  });
}

// 단일 후기 상세 조회 
export function getReviewDetail(reviewId) {
    const path = `/api/reviews/${reviewId}`;
    
    return apiRequest(path, {
        method: "GET",
        headers: getAuthHeader(), 
    });
}

// 택시팟 멤버 강퇴 
export function kickPartyMember(taxiPartyId, userId) {
  const path = `/api/chat/rooms/${taxiPartyId}/kick/${userId}`;
  
  return apiRequest(path, {
    method: "POST",
    headers: getAuthHeader(), 
  });
}

// 특정 택시팟 현재 정산 ID 조회
export function getCurrentSettlementId(taxiPartyId) {
  const path = `/api/settlements/current?taxiPartyId=${taxiPartyId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(),
  });
}

// 정산 상세 정보 조
export function getSettlementDetails(settlementId) {
  const path = `/api/settlements/${settlementId}`;
  
  return apiRequest(path, {
    method: "GET",
    headers: getAuthHeader(),
  });
}


// 참여자 목록
export async function fetchReviewableMembers(taxiPartyId) {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) throw new Error("현재 로그인한 사용자 ID를 확인할 수 없습니다.");

    try {
        const allParticipants = await getPartyMembersWithReviewStatus(taxiPartyId); 

        const revieweeList = allParticipants.filter(p => p.userId !== currentUserId);

        return revieweeList.map(p => ({
            userId: p.userId,
            name: p.name,
            role: p.host ? "총대슈니" : "동승슈니", 
            shortStudentId: p.shortStudentId,
            imgUrl: p.imgUrl, 
        }));

    } catch (error) {
        console.error("멤버 목록 로드 실패:", error);
        throw new Error(`후기 대상 멤버 정보를 불러오는 데 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
}

// 사용자 차단
export function postBlockUser(blockerId, blockedId) {
    const path = "/api/blocks";
    return apiRequest(path, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ blockerId, blockedId }),
    });
}
// src/api/chat.js
import { apiRequest } from './auth'; // 기존 apiRequest 함수 import
import { getAuthToken } from './token'; // 토큰 관리 함수 import
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; 

// 토큰을 포함하여 API 요청을 보내는 래핑 함수
async function apiRequestWithAuth(path, options = {}) {
    const token = getAuthToken();

    console.log("✅ REST: getAuthToken 결과:", !!token, "for path:", path);

    if (!token) {
        console.error("인증 토큰이 없습니다. 로그인 상태를 확인하세요.");
        throw new Error("Authorization token is missing.");
    }
    
    // 1. Authorization: Bearer {token} 헤더 생성
    const authHeader = {
        'Authorization': `Bearer ${token}`,
    };

    // 2. 기존 옵션에서 헤더를 분리하고, 인증 헤더와 기존 헤더를 병합합니다.
    // 기존 options의 headers를 auth.js의 apiRequest에 병합되도록 전달해야 합니다.
    const finalHeaders = {
        ...authHeader,
        ...(options.headers || {}),
    };
    
    // auth.js의 apiRequest 함수를 사용하여 요청 실행
    return apiRequest(path, {
        ...options,
        headers: finalHeaders, // ⭐️ 최종 병합된 헤더를 'headers' 속성에 전달
    });
}

/**
 * 내 채팅방 목록 조회 (GET /api/chat/rooms/my)
 */
export function getMyChatRooms() {
  const uri = "/api/chat/rooms/my";
  return apiRequestWithAuth(uri, {
    method: "GET",
  });
}

/**
 * 채팅방 입장 또는 생성 (POST /api/chat/rooms/enter?taxiPartyId={taxiPartyId})
 */
export function enterOrCreateChatRoom(taxiPartyId) {
  const uri = `/api/chat/rooms/enter?taxiPartyId=${taxiPartyId}`;
  return apiRequestWithAuth(uri, {
    method: "POST",
  });
}

/**
 * 1. 택시팟 정보 조회 API (Host ID 및 상태 확인용)
 * GET /api/taxi-party/{id}
 */
export function getTaxiPartyInfo(partyId, userId) {
    // 명세에 따라 userId를 쿼리 파라미터로 포함 (인증 헤더도 사용)
    return apiRequestWithAuth(`/api/taxi-party/${partyId}?userId=${userId}`, {
        method: 'GET',
    });
}

// -----------------------------------------------------
// 1. 매칭 종료하기 API (총대슈니 전용)
// POST /api/taxi-party/{partyId}/close
// -----------------------------------------------------
export function closeTaxiParty(partyId, userId) {
  return apiRequestWithAuth(`/api/taxi-party/${partyId}/close`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}


// -----------------------------------------------------
// 2. 택시팟 끝내기 API (채팅방 최종 종료)
// POST /api/chat/rooms/{chatRoomId}/close
// -----------------------------------------------------
export function closeChatRoom(chatRoomId) {
  return apiRequestWithAuth(`/api/chat/rooms/${chatRoomId}/close`, {
    method: 'POST',
  });
}

// -----------------------------------------------------
//  3. 특정 채팅방 메시지 목록 조회 API (NEW)
// GET /api/chat/rooms/{chatRoomId}/messages
// -----------------------------------------------------
/**
 * 특정 채팅방의 과거 메시지 목록을 조회합니다. (인증 필요)
 * @param {number} chatRoomId - 채팅방 ID
 * @returns {Promise<Array<Object>>} - 메시지 배열
 */
export function getChatHistory(chatRoomId) {
  return apiRequestWithAuth(`/api/chat/rooms/${chatRoomId}/messages`, {
    method: 'GET',
  });
}

// 4. 채팅방 사용자 목록 조회 API (NEW)
// GET /api/reviews/members?taxiPartyId={taxiPartyId}
// -----------------------------------------------------
/**
 * 채팅방 하단 메뉴의 “사용자 목록” 화면에서 사용할 멤버 목록을 조회합니다.
 * @param {number} taxiPartyId - 택시 파티 ID
 * @returns {Promise<Array<Object>>} - 멤버 배열
 */
export function getPartyMembersForReview(taxiPartyId) {
    const uri = `/api/reviews/members?taxiPartyId=${taxiPartyId}`;
    return apiRequestWithAuth(uri, {
        method: 'GET',
    });
}


// -----------------------------------------------------
// 3. WebSocket (STOMP) 설정 및 메시지 전송
// Method: SEND, Endpoint: ws://{서버주소}/ws
// -----------------------------------------------------

// 서버 주소는 auth.js의 BASE_URL에서 가져옴 (WS 연결은 wss:// 또는 ws:// 사용)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";
//const WEBSOCKET_URL = BASE_URL.replace('http', 'ws') + '/ws';
//const WEBSOCKET_URL = BASE_URL.replace('https', 'wss').replace('http', 'ws') + '/ws';
//const WEBSOCKET_URL = "wss://swushoong.click/ws";
const WEBSOCKET_URL = "https://swushoong.click/ws";

/**
 * STOMP 클라이언트와 연결하고 메시지 구독/전송을 처리
 * @param {number} chatRoomId - 구독할 채팅방 ID
 * @param {function} onMessageReceived - 메시지 수신 시 호출될 콜백 함수
 * @returns {Client} - STOMP 클라이언트 인스턴스
 */
export function connectStomp(chatRoomId, onMessageReceived) {
  const token = getAuthToken();

  console.log("✅ STOMP: getAuthToken 결과:", !!token); 
  if (token) console.log("✅ STOMP: 토큰 길이:", token.length);

  if (!token) {
    console.error("STOMP 연결 실패: 인증 토큰 없음");
    return null;
  }

  //const urlWithToken = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;
  const urlWithToken = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;

  const stompClient = new Client({
    //brokerURL: urlWithToken,

    webSocketFactory: () => {
            // SockJS 객체에 백엔드 웹소켓 엔드포인트를 전달
            // 서버 설정에 따라 토큰을 URL에 포함해야 할 수도 있습니다.
            //return new SockJS(WEBSOCKET_URL + `?token=${encodeURIComponent(token)}`);
            return new SockJS(urlWithToken);
        },

    connectHeaders: {
      'Authorization': `Bearer ${token}`, // 인증 헤더 
    },
    forceBinary: true,


    debug: function (str) {
      console.log('STOMP Debug:', str);
    },
    reconnectDelay: 5000, // 5초 후 재연결 시도
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = (frame) => {
    console.log('STOMP 연결 성공:', frame);

    // 채팅방 구독
    stompClient.subscribe(`/topic/chatrooms/${chatRoomId}`, (message) => {
      console.log('STOMP 메시지 수신:', message.body);
      const receivedData = JSON.parse(message.body);
      onMessageReceived(receivedData);
    });
    
    // 연결 성공 시 시스템 메시지 처리 로직을 위해 콜백 호출
    onMessageReceived({ type: 'system-connect', content: '채팅방에 연결되었습니다.' });
  };

  stompClient.onStompError = (frame) => {
    console.error('STOMP 에러:', frame);
  };

  stompClient.activate(); // STOMP 연결 시작
  return stompClient;
}


/**
 * STOMP를 통해 채팅 메시지를 전송
 * @param {Client} stompClient - 활성화된 STOMP 클라이언트
 * @param {number} chatRoomId - 메시지를 보낼 채팅방 ID
 * @param {string} content - 메시지 내용
 * @param {string} senderId - 현재 사용자 ID
 */
export function sendChatMessage(stompClient, chatRoomId, content, senderId) {
  if (stompClient && stompClient.connected) {
    const message = JSON.stringify({
      chatRoomId: chatRoomId,
      senderId: senderId, // 실제 사용자 ID로 대체 필요
      content: content,
    });

    stompClient.publish({
      destination: '/app/chat/send', // 명세에 따른 전송 엔드포인트
      body: message,
      headers: { 'Content-Type': 'application/json' },
    });

  } else {
    console.error("STOMP 연결이 끊어졌거나 준비되지 않았습니다.");
  }
}

/**
 * 이미지 파일을 서버에 업로드하고 채팅 메시지를 전송합니다.
 * POST /api/chat/send-image
 * * @param {File} file - 업로드할 이미지 파일 객체
 * @param {number} partyId - 택시 파티 ID
 * @param {string} senderId - 현재 사용자 ID
 * @param {number} chatRoomId - 채팅방 ID
 * @returns {Promise<Object>} - 서버 응답 (예: 이미지 URL, 메시지 ID)
 */
export async function sendImageMessage(file, partyId, senderId, chatRoomId) {
    const formData = new FormData();
    formData.append("image", file); // 서버에서 'image'로 받도록 설정
    formData.append("partyId", partyId);
    formData.append("senderId", senderId);
    formData.append("chatRoomId", chatRoomId);
    
    // REST API의 `/api/chat/send-image` 엔드포인트에 Multipart/form-data로 전송합니다.
    const uri = "/api/chat/send-image"; 
    
    // apiRequestWithAuth 내부에서 'Content-Type': 'multipart/form-data' 헤더가 자동으로 설정되거나,
    // (Fetch API가 FormData를 사용할 때 자동으로 설정함)
    // 수동으로 설정해야 할 수도 있습니다. 여기서는 FormData 사용 시 자동 설정을 가정합니다.
    return apiRequestWithAuth(uri, {
        method: 'POST',
        // FormData를 body로 직접 전달합니다.
        // 이 경우 'Content-Type' 헤더를 수동으로 설정하면 안 됩니다!
        body: formData, 
        headers: {
            // Content-Type: 'multipart/form-data' 헤더를 명시적으로 설정하면 안 됩니다.
            // 브라우저가 boundary를 포함하여 자동으로 설정하게 두어야 합니다.
            // 따라서 Authorization 헤더 외 다른 헤더는 여기에서 제외합니다.
        },
    });
}
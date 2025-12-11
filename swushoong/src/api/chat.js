import { apiRequest } from './auth'; 
import { getAuthToken } from './token'; 
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; 

async function apiRequestWithAuth(path, options = {}) {
    const token = getAuthToken();

    console.log("REST: getAuthToken 결과:", !!token, "for path:", path);

    if (!token) {
        console.error("인증 토큰이 없습니다. 로그인 상태를 확인하세요.");
        throw new Error("Authorization token is missing.");
    }
    
    const authHeader = {
        'Authorization': `Bearer ${token}`,
    };

    const finalHeaders = {
        ...authHeader,
        ...(options.headers || {}),
    };
    
    return apiRequest(path, {
        ...options,
        headers: finalHeaders, 
    });
}

// 내 채팅방 목록 조회 
export function getMyChatRooms() {
  const uri = "/api/chat/rooms/my";
  return apiRequestWithAuth(uri, {
    method: "GET",
  });
}

// 채팅방 입장 또는 생성
export function enterOrCreateChatRoom(taxiPartyId) {
  const uri = `/api/chat/rooms/enter?taxiPartyId=${taxiPartyId}`;
  return apiRequestWithAuth(uri, {
    method: "POST",
  });
}


// 택시팟 정보 조회
export function getTaxiPartyInfo(partyId, userId) {
  return apiRequestWithAuth(`/api/taxi-party/${partyId}?userId=${userId}`, {
      method: 'GET',
  });
}

// 매칭 종료하기(총대슈니 전용)
export function closeTaxiParty(partyId, userId) {
  return apiRequestWithAuth(`/api/taxi-party/${partyId}/close`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}


// 택시팟 끝내기
export function closeChatRoom(chatRoomId) {
  return apiRequestWithAuth(`/api/chat/rooms/${chatRoomId}/close`, {
    method: 'POST',
  });
}


// 특정 채팅방 메시지 목록 조회
export function getChatHistory(chatRoomId) {
  return apiRequestWithAuth(`/api/chat/rooms/${chatRoomId}/messages`, {
    method: 'GET',
  });
}

// 채팅방 사용자 목록 조회 
export function getPartyMembersForReview(taxiPartyId) {
  const uri = `/api/reviews/members?taxiPartyId=${taxiPartyId}`;
  return apiRequestWithAuth(uri, {
      method: 'GET',
  });
}

// WebSocket (STOMP) 설정 및 메시지 전송
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://swushoong.click";
const WEBSOCKET_URL = "https://swushoong.click/ws";

export function connectStomp(chatRoomId, onMessageReceived) {
  const token = getAuthToken();

  if (!token) {
    console.error("STOMP 연결 실패: 인증 토큰 없음");
    return null;
  }

  const urlWithToken = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;

  const stompClient = new Client({

    webSocketFactory: () => {
      return new SockJS(urlWithToken);
    },

    connectHeaders: {
      'Authorization': `Bearer ${token}`,
    },
    forceBinary: true,
    debug: function (str) {
      console.log('STOMP Debug:', str);
    },
    reconnectDelay: 5000, 
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = (frame) => {
    console.log('STOMP 연결 성공:', frame);

    stompClient.subscribe(`/topic/chatrooms/${chatRoomId}`, (message) => {
      console.log('STOMP 메시지 수신:', message.body);
      const receivedData = JSON.parse(message.body);
      onMessageReceived(receivedData);
    });
    
    onMessageReceived({ type: 'system-connect', content: '채팅방에 연결되었습니다.' });
  };

  stompClient.onStompError = (frame) => {
    console.error('STOMP 에러:', frame);
  };

  stompClient.activate(); 
  return stompClient;
}

// STOMP를 통해 채팅 메시지를 전송
export function sendChatMessage(stompClient, chatRoomId, content, senderId) {
  if (stompClient && stompClient.connected) {
    const message = JSON.stringify({
      chatRoomId: chatRoomId,
      senderId: senderId, 
      content: content,
    });

    stompClient.publish({
      destination: '/app/chat/send', 
      body: message,
      headers: { 'Content-Type': 'application/json' },
    });

  } else {
    console.error("STOMP 연결이 끊어졌거나 준비되지 않았습니다.");
  }
}


// 이미지 파일 업로드 및 채팅 메시지 전송
export async function sendImageMessage(file, partyId, senderId, chatRoomId) {
    const formData = new FormData();
    formData.append("image", file); 
    formData.append("partyId", partyId);
    formData.append("senderId", senderId);
    formData.append("chatRoomId", chatRoomId);
    
    const uri = "/api/chat/send-image"; 
    
    return apiRequestWithAuth(uri, {
        method: 'POST',
        body: formData, 
        headers: {
        },
    });
}
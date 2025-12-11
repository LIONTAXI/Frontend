// src/pages/ChatScreen.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from "../components/Header";
import ChatBubble from "../components/ChatBubble";
import ActionButton from "../components/ActionButton"; 
import ChatInput from "../components/ChatInput";
import MatchInfo from "../components/MatchInfo";
import MenuIcon from "../assets/icon/icon_menu.svg";
import { closeTaxiParty, closeChatRoom, connectStomp, sendChatMessage, getChatHistory, getTaxiPartyInfo, sendImageMessage, getPartyMembersForReview } from "../api/chat"; 
import { getCurrentUserId } from "../api/token";
import {getCurrentSettlementId} from "../api/settlements";


const getUserIdFromAuth = () => {
    // token.js의 getCurrentUserId를 호출하여 실제 ID 가져옴 
    return getCurrentUserId();
};

export default function ChatScreen() {
    const navigate = useNavigate();
    const location = useLocation();

    // URL 파라미터에서 ID를 가져옴(라우팅 설정 필요: /chat/:chatRoomId/:partyId)
    const { chatRoomId: rawChatRoomId, partyId: rawPartyId } = useParams();

    const chatRoomId = parseInt(rawChatRoomId, 10) || 0; 
    const partyId = parseInt(rawPartyId, 10) || 0;

    // 현재 사용자 ID를 인증 상태에서 가져옴 
    const currentUserId = getUserIdFromAuth();
    
    // 상태 관리
    const [isHost, setIsHost] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);
    const [matchInfo, setMatchInfo] = useState(null); // 택시팟 정보를 담을 상태
    const [matchStatus, setMatchStatus] = useState('active'); 
    const [messages, setMessages] = useState([]);
    const [isSettled, setIsSettled] = useState(false);
    const [isSettlementEntered, setIsSettlementEntered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // STOMP 클라이언트 참조
    const stompClientRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isConnectingRef = useRef(false);


    // 유효성 검사 실패 시 (ID 누락, 비로그인 상태) 로딩 화면/경고 표시
    if (!currentUserId || chatRoomId <= 0 || partyId <= 0) {
        console.error("FATAL ERROR: 필수 ID 또는 사용자 인증 상태가 유효하지 않습니다.");

        if (!currentUserId) return <div className="p-4 text-red-500">로그인 상태를 확인해 주세요.</div>;
        return <div className="p-4 text-red-500">유효하지 않은 채팅방/파티 ID입니다.</div>;
    }
    
    // --- 헬퍼 함수: 서버 응답을 UI 메시지 형식으로 변환 ---
    const formatMessage = (data) => {
        const dateToParse = data.sentAt.endsWith('Z') || data.sentAt.includes('+') ? data.sentAt : data.sentAt + 'Z';
        const dateObject = new Date(dateToParse);

        // 서버 응답 예시: { "messageId": 10, "senderId": 3, "name": "이슈니", "shortStudentId": "23", "content": "...", "sentAt": "2025-11-10T19:20:00" }
        const isMyMessage = data.senderId === currentUserId; 

        // KST(한국 표준시, UTC+9)로 정확히 포맷팅
        const formatter = new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // '오전/오후' 형식 포함
        timeZone: 'Asia/Seoul'
        });

        if (!isMyMessage) {
        console.log("상대방 메시지 데이터 수신 확인:", { 
            senderId: data.senderId, 
            name: data.name, 
            shortStudentId: data.shortStudentId 
        });
        }

        return {
            id: data.messageId || Date.now(),
            side: isMyMessage ? 'right' : 'left',
            type: 'text',
            name: isMyMessage ? '나' : data.name,
            age: data.shortStudentId,
            text: data.content,
            //time: new Date(data.sentAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            time: formatter.format(dateObject),
            timestamp: new Date(data.sentAt).getTime(),
        };
    };

    // STOMP 메시지 수신 처리 함수
    const handleStompMessage = useCallback((data) => {
        if (data.type === 'system-connect') {

            console.log("💰 정산 완료 시스템 메시지 수신:", data);
            setMatchStatus('ended');
            setIsSettlementEntered(true);

            if (!isHost) {
            const SETTLEMENT_COMPLETE_MESSAGE = '총대슈니가 정산정보를 입력했어요.\n빠른 시일 내에 정산해 주세요.';
            setMessages(prev => {
                const isDuplicate = prev.some(msg => msg.type === 'system' && msg.text === SETTLEMENT_COMPLETE_MESSAGE);
                if (isDuplicate) return prev;
                return [ ...prev, { id: Date.now(), type: 'system', text: SETTLEMENT_COMPLETE_MESSAGE, timestamp: Date.now() }];
            });
            return;
            }   

            setMessages((prev) => [...prev, {
                id: Date.now(),
                type: 'system',
                text: data.content,
                timestamp: new Date().getTime(),
            }]);
            return;
        }
        
        const receivedMessage = formatMessage(data);

        setMessages((prev) => [...prev, receivedMessage]);
    }, [currentUserId, isHost]); // currentUserId가 변경될 때마다 재생성

    // 메뉴 닫기 및 열기 함수 
    const handleOpenMenu = () => { setIsMenuOpen(true); };
    const handleCloseMenu = () => { setIsMenuOpen(false); };

    const navigateToMemberList = () => {
    handleCloseMenu();
    // [핵심 수정]: partyId는 URL에 있지만, chatRoomId를 state로 전달
    navigate(`/member-list/${partyId}`, {
        state: { 
            chatRoomId: chatRoomId, // ✅ chatRoomId 전달
            partyId: partyId // partyId도 명시적으로 전달 (선택 사항이지만 일관성을 위해 유지)
        }
    }); 
};

    // '택시팟 끝내기' 메뉴 항목 클릭 핸들러 (최종 종료 API 호출)
    const handleCloseChatRoom = async () => {
        handleCloseMenu();

        if (isSettled && isHost && chatRoomId) {
            try {
                await closeChatRoom(chatRoomId); 
                console.log(`채팅방 ${chatRoomId} 최종 종료 성공.`);
                navigate('/chat-list');
            } catch (error) {
                console.error("택시팟 최종 종료 실패:", error);
                alert(`택시팟 최종 종료 실패: ${error.message || '알 수 없는 오류'}`);
            }
        } else {
            console.log("택시팟 최종 종료 조건 미충족 또는 참여자입니다.");
        }
    };

    const navigateToSettlement = async (targetPath) => {
        handleCloseMenu();

        // 1. 필요한 경우에만 settlementId를 조회 (정산 관련 페이지로 이동 시)
        let settlementIdToPass = null;

        if (targetPath === '/please' || targetPath === '/current-pay-member') {
        try {
            // 2. 현재 파티의 정산 ID를 조회하는 API 호출
            const settlementStatus = await getCurrentSettlementId(partyId);
            
            if (settlementStatus.hasSettlement && settlementStatus.settlementId) {
                settlementIdToPass = settlementStatus.settlementId;
                // ChatScreen의 상태도 업데이트 (선택 사항이지만 일관성을 위해 좋음)
                setIsSettlementEntered(true); 
                console.log(`✅ 정산 ID 조회 성공: ${settlementIdToPass}`);
            } else {
                console.warn("⚠️ 정산 ID 조회 실패: 정산 정보가 아직 생성되지 않았습니다.");
                // 정산 정보 입력 페이지(/confirm)가 아닌데 ID가 없다면 오류로 간주할 수도 있음.
                if (targetPath !== '/confirm') {
                    alert("정산 정보가 아직 입력되지 않았습니다. 총대에게 문의해 주세요.");
                    return; // 이동 중단
                }
            }
        } catch (error) {
            console.error("정산 ID 조회 중 오류 발생:", error);
            alert("정산 정보를 불러오는 중 오류가 발생했습니다.");
            return; // 이동 중단
        }
    }
        
        // CountScreen이 필요로 하는 필수 정보만 state에 담아 전달
        const settlementData = {
            taxiPartyId: partyId, // URL 파라미터의 taxiPartyId 전달
            isHost: isHost,       // Host 여부 전달
            isSettlementEntered: isSettlementEntered,
            chatRoomId: chatRoomId,
            // participants 목록은 CountScreen이 API로 직접 조회

            settlementId: settlementIdToPass,
        };

        navigate(targetPath, { state: settlementData });
    };


    // 메뉴 항목 정의 
    const hostMenuItems = [
        { label: '사용자 목록',  onClick: navigateToMemberList },
        {  
            label: isSettlementEntered ? '정산 현황' : '정산 정보 입력', 
            onClick: () => { 
                const path = isSettlementEntered ? '/please' : '/confirm';
                navigateToSettlement(path);
            }
        },
        { label: '택시팟 끝내기', onClick: handleCloseChatRoom },
    ];
    const memberMenuItems = [
        { label: '사용자 목록', onClick: navigateToMemberList},
    ];
    if (isSettlementEntered) {
        memberMenuItems.splice(1, 0, {
            label: '정산 정보', 
            onClick: () => { navigateToSettlement('/current-pay-member'); }
        });
    }
    const menuItems = isHost ? hostMenuItems : memberMenuItems;


    // 스크롤을 항상 가장 아래로 이동시키는 함수
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    
    // 정산 완료 상태를 확인하고 처리하는 useEffect 
    useEffect(() => {
        const SETTLEMENT_COMPLETE_MESSAGE = '총대슈니가 정산정보를 입력했어요.\n빠른 시일 내에 정산해 주세요.';
        if (location.state && location.state.settlementCompleted) {
            setMatchStatus('ended');
            setIsSettlementEntered(true);
            setMessages(prev => {
                const isDuplicate = prev.length > 0 && prev[prev.length - 1].type === 'system' && prev[prev.length - 1].text === SETTLEMENT_COMPLETE_MESSAGE;
                if (isDuplicate) return prev; 
                return [ ...prev, { id: Date.now(), type: 'system', text: SETTLEMENT_COMPLETE_MESSAGE, timestamp: Date.now() }];
            });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate, setMessages]); 

    // 최종 정산 완료 상태 처리 
    useEffect(() => {
        if (location.state && location.state.isSettled) {
            console.log("🔥 모든 정산이 최종 완료되었습니다. isSettled 상태 업데이트.");
            setMatchStatus('ended');
            setIsSettlementEntered(true);
            setIsSettled(true);
            navigate(location.pathname, { replace: true, state: {} }); 
        }
    }, [location, navigate]);

    // ------------------------------------------------------------------
    // 초기 로딩 및 STOMP 연결 로직
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!currentUserId || chatRoomId <= 0 || partyId <= 0) {
            console.error("채팅방 ID 또는 사용자 ID가 유효하지 않아 연결을 시도할 수 없습니다.");
            setIsLoading(false);
            return; 
        }

        if (isConnectingRef.current) {
        console.log("STOMP 연결 시도 중: 중복 호출 무시.");
        return; 
    }

        // 1단계: 새로운 연결을 시도하기 전에 기존 연결이 있으면 확실히 종료
    if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("기존 STOMP 연결을 정리합니다.");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
    }

    isConnectingRef.current = true; // 연결 시도 시작
    console.log("✅ STOMP 연결 시도 시작");

        // 1. 과거 메시지 로드 (API 호출)
        const loadChatHistory = async () => {
            try {
                const partyInfo = await getTaxiPartyInfo(partyId, currentUserId);
                setIsHost(partyInfo.hostId === currentUserId);
                setMatchInfo(partyInfo);

                if (partyInfo.status === 'ENDED' || partyInfo.isCompleted) { // API 응답 필드명에 따라 수정 필요
                    setMatchStatus('ended');
                    console.log("🔎 채팅방 로드 시 매칭 상태 확인: ENDED");
                }


                const settlementStatus = await getCurrentSettlementId(partyId);
                if (settlementStatus.hasSettlement && settlementStatus.settlementId) {
                    setIsSettlementEntered(true);
                    console.log("✅ 채팅방 로드 시 정산 정보 입력 상태 확인: TRUE");
                } else {
                    setIsSettlementEntered(false);
                }

                const historyData = await getChatHistory(chatRoomId);
                console.log("채팅 기록 로드 성공:", historyData);
                const formattedHistory = historyData.map(formatMessage);
                setMessages(formattedHistory);

                const stompClient = connectStomp(chatRoomId, handleStompMessage);
                stompClientRef.current = stompClient;

            } catch (error) {
                console.error("채팅 기록 로드 실패:", error);
                alert(`채팅방 로드 실패: ${error.response?.message || '서버 오류'}`);   
            } finally {
                setIsLoading(false);
            isConnectingRef.current = false; // 연결 시도 완료
            console.log("✅ STOMP 연결 시도 완료");
            }
        };

        loadChatHistory();

        // 컴포넌트 언마운트 시 STOMP 연결 종료
        // 언마운트 시 정리 로직 
    return () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            console.log("컴포넌트 언마운트 시 STOMP 연결 종료");
            stompClientRef.current.deactivate();
        }
    };
    }, [chatRoomId, partyId, currentUserId, handleStompMessage]);


    // 메시지 상태가 업데이트될 때마다 스크롤
    useEffect(() => {
    // DOM 업데이트가 완료된 후 스크롤이 실행되도록 짧은 딜레이
    const timer = setTimeout(() => {
        scrollToBottom();
    }, 0); // 딜레이를 0ms로 설정해도 비동기적으로 실행

    return () => clearTimeout(timer);
}, [messages]);


    // 메시지 전송 핸들러
    const handleSendMessage = useCallback((text) => {
        if (!chatRoomId || !currentUserId) {
            console.error("채팅방 또는 사용자 ID가 유효하지 않아 메시지 전송 불가");
            return;
        }
        sendChatMessage(stompClientRef.current, chatRoomId, text, currentUserId);
    }, [chatRoomId, currentUserId]);

    // 이미지 파일 선택 핸들러
const handleFileSelect = useCallback(async (file) => {
    if (!chatRoomId || !currentUserId || !partyId) {
        console.error("채팅방, 파티 ID 또는 사용자 ID가 유효하지 않아 파일 전송 불가");
        return;
    }
    if (!file) return;

    // 전송 중 시스템 메시지 추가
    const tempMessageId = Date.now();
    setMessages((prev) => [...prev, {
        id: tempMessageId,
        type: 'system',
        text: `사진(${file.name}) 전송을 시도합니다...`,
        timestamp: Date.now(),
    }]);

    try {
        // 1. 파일을 서버에 업로드하고 메시지 전송 요청
        const response = await sendImageMessage(file, partyId, currentUserId, chatRoomId);
        
        console.log("이미지 전송 요청 성공:", response);


    } catch (error) {
        console.error("이미지 전송 실패:", error);
        
        // 전송 실패 시 시스템 메시지 업데이트 또는 실패 메시지 추가
        setMessages((prev) => {
            // 임시 시스템 메시지 제거 시도 
            const filtered = prev.filter(msg => msg.id !== tempMessageId);
            return [...filtered, {
                id: Date.now() + 1,
                type: 'system',
                text: `사진 전송 실패: ${error.message || '알 수 없는 오류'}`,
                timestamp: Date.now(),
            }];
        });
    }

}, [chatRoomId, partyId, currentUserId]); // 의존성 배열 유지




    // 매칭 종료 버튼 클릭 핸들러
    const handleEndMatch = async () => {
        if (matchStatus === 'active' && isHost && partyId && currentUserId) {
            try {
                await closeTaxiParty(partyId, currentUserId);
                console.log(`매칭 파티 ${partyId} 종료 API 호출 성공.`);

                setMatchStatus('ended');
                const DELAY_MS = 5000;
                setTimeout(() => {
                    setMessages((prev) => [...prev, {
                        id: Date.now() + 1,
                        type: 'system', 
                        text: '목적지에 도착했다면\n총대슈니는 정산정보를 입력해 주세요', 
                        timestamp: Date.now(),
                    }]);
                }, DELAY_MS); 

            } catch (error) {
                console.error("매칭 종료 실패:", error);
                alert(`매칭 종료 실패: ${error.response?.message || '총대슈니만 종료할 수 있습니다.'}`);
            }

        } else if (isSettled && isHost) { 
            handleCloseChatRoom();

        } else if (matchStatus === 'ended') {
            let targetPath; 

            if (isSettlementEntered) {
                targetPath = isHost ? '/please' : '/current-pay-member';
            } else if (isHost) {
                targetPath = '/confirm';
            }
            
            if (targetPath) {
                navigateToSettlement(targetPath);
            }
        }
    };

    // 렌더링
    return (
        <div className={`${isMenuOpen ? 'overflow-hidden' : 'overflow-y-auto'} relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col`}>
            <Header 
                title="택시팟 채팅" 
                onBack={() => navigate(-1)} 
                rightIcon={MenuIcon} 
                onRightClick={() => setIsMenuOpen(true)}
            />


            {/* 로딩 스피너 및 오류 처리 */}
            {isLoading && (
                <div className="flex flex-grow justify-center items-center text-body-regular-16 text-black-70">
                    채팅방 정보를 불러오는 중입니다... 
                </div>
            )}
            
            {!isLoading && matchInfo && (
                <div className="flex flex-col flex-grow w-full">
                    {/* 1. 매칭 정보 섹션 (API 데이터 사용) */}
                    <div className="w-full flex justify-center py-4"> 
                        <MatchInfo
                            destination={matchInfo.destination}
                            departureIcon="🍄" 
                            departure={matchInfo.departure}
                            departureTime={matchInfo.meetingTime}
                            //members={`${matchInfo.currentParticipants}/${matchInfo.maxParticipants}`}
                            currentParticipants={matchInfo.currentParticipants}
                            maxParticipants={matchInfo.maxParticipants}
                            estimatedFare={`${matchInfo.expectedPrice.toLocaleString()}원`}
                        />
                    </div>
                
                {/* 2. 채팅 메시지 목록 */}
                <div 
                    ref={chatContainerRef}
                    className={`flex-grow p-4 pb-[130px] ${isMenuOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}
                >
                    {messages.map((msg, index) => {
                        const currentMsgDate = new Date(msg.timestamp || Date.now()).toDateString();
                        const prevMsgDate = index > 0 ? new Date(messages[index - 1].timestamp || 0).toDateString() : '';
                        const isNewDay = index === 0 || currentMsgDate !== prevMsgDate;
                        const isSeparator = msg.type === 'dateSeparator' || msg.type === 'timeSeparator';
                        const isSystem = msg.type === 'system';

                        return (
                            <React.Fragment key={msg.id}>
                                {/* 날짜 구분선 */}
                                {isNewDay && !isSystem && (
                                    <div className="w-full flex justify-center my-4">
                                        <span className="text-body-regular-14 text-black-70">
                                            {new Date(msg.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '. ')}
                                        </span>
                                    </div>
                                )}
                                {isSystem && (
                                    <div className="w-full flex justify-center my-4">
                                        <div className="inline-flex px-4 py-3 bg-[#FFF4DF] rounded text-body-regular-14 
                                                         text-black-90 text-center leading-[1.4] whitespace-pre-line">
                                            {msg.text}
                                        </div>
                                    </div>
                                )}
                                {!isSeparator && !isSystem && (
                                    <ChatBubble
                                        side={msg.side}
                                        variant={msg.type || 'text'} 
                                        text={msg.text}
                                        time={msg.time}
                                        name={msg.name}
                                        age={msg.age}
                                        avatarUrl={msg.avatarUrl}
                                        className="my-3"
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                
                        <div className="h-10"></div>
                    </div>

                    <div className="fixed bottom-0 z-10 w-[393px] left-1/2 -translate-x-1/2 bg-white">
                        {/* ActionButton */}
                            <ActionButton 
                                status={matchStatus} 
                                onClick={handleEndMatch} 
                                isHost={isHost}
                                isSettlementEntered={isSettlementEntered}
                                isSettled={isSettled}
                            />

                        {/* 채팅 입력창 */}
                        <div className="border-t border-black-10">
                            <ChatInput onSend={handleSendMessage} 
                                onCameraClick={() => console.log("카메라 클릭")}
                                onFileSelect={handleFileSelect}
                            /> 
                        </div>
                    </div>
                </div>
            )}

                {/* 메뉴 모달 */}
                {isMenuOpen && (
                <div
                    className="absolute inset-0 z-50 flex justify-center items-end bg-black-90 bg-opacity-70"
                    onClick={handleCloseMenu} 
                >
                    <div
                        className="w-full max-w-[393px] mx-auto bg-white rounded-t-[20px] pt-3 pb-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-9 h-[5px] bg-[rgba(60,60,67,0.3)] rounded-full mx-auto mb-5" />
                        <h2 className="px-4 text-head-semibold-20 text-black-90 mt-4 mb-4"> 메뉴 </h2>
                        <div className="flex flex-col">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-4 py-3 border-b border-black-15 text-body-regular-16 text-black-90"
                                    onClick={item.onClick}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
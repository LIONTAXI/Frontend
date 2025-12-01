// src/pages/ChatScreen.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Header2 from "../components/Header2";
import ChatBubble from "../components/ChatBubble";
import ActionButton from "./components/ActionButton"; 
import ChatInput from "./components/ChatInput";
import MatchInfo from "./components/MatchInfo";
import BottomMenu from "./components/BottomMenu";


// --- 메인 채팅 화면 컴포넌트 ---
export default function ChatScreen() {
    const navigate = useNavigate();
    const location = useLocation();

    // 💡 1. isHost 상태 (참여자 테스트를 위해 false로 변경 가능)
    const [isHost, setIsHost] = useState(true); // 총대슈니 (Host)

    // 💡 2. 매칭 상태 (매칭 완료 여부) ('active' | 'ended')
    const [matchStatus, setMatchStatus] = useState('active'); 

    // 💡 3. 메시지 필터링 (endMatchButton 제거)
    const chatMessages = initialMessages.filter(msg => msg.type !== 'endMatchButton');
    const [messages, setMessages] = useState(chatMessages);

    // 💡 4. 정산 상태 (정산 완료 여부) 
    const [isSettled, setIsSettled] = useState(false);

    // 💡 [새로 추가] 정산 정보 입력 페이지로 이동했는지 여부
    const [isSettlementEntered, setIsSettlementEntered] = useState(false);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const wsRef = useRef(null);
    const chatContainerRef = useRef(null);

    // 메뉴 열기 함수: Header2의 onMenu prop에 전달
    const handleOpenMenu = () => {
        setIsMenuOpen(true);
    };

    // 메뉴 닫기 함수: BottomMenu의 onClose prop에 전달
    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };

    // 바텀 메뉴에 전달할 항목 정의
    // TODO: 실제 페이지 이동 로직으로 변경 필요
    const hostMenuItems = [
        { label: '시용자 목록', onClick: () => {
            // navigate('/member-profile'); 
        }},
        { 
            label: isSettlementEntered ? '정산 현황' : '정산 정보 입력', 
            onClick: () => {
                // navigate(isSettlementEntered ? '/please' : '/confirm'); // 정산 현황/입력 페이지로 이동
                console.log(`방장: ${isSettlementEntered ? '정산 현황' : '정산 정보 입력'} 페이지로 이동`);
            },
        },
        { 
            label: '택시팟 끝내기', 
            onClick: () => {
                //
            },
        },
    ];

    const memberMenuItems = [
        { label: '사용자 목록', onClick: () => {
            // navigate('/member-profile'); // 예시 경로
        }},
    ];

    // 2. 정산 정보 입력 완료 시 '정산 정보' 메뉴 항목 추가
    if (isSettlementEntered) {
        // '사용자 목록' 다음에 '정산 정보'를 추가합니다.
        memberMenuItems.splice(1, 0, {
             label: '정산 정보', 
             onClick: () => {
                // navigate('/view-settlement-info'); 
                console.log("참여자: 정산 정보 보기로 이동");
             }
        });
    }

    const menuItems = isHost ? hostMenuItems : memberMenuItems;

    // TODO: 실제 백엔드 로직에 따라 handleBack 함수 구현 필요
    const handleBack = () => {
        console.log("뒤로가기 버튼 클릭");

    };

    // 스크롤을 항상 가장 아래로 이동시키는 함수
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };


    // WebSocket 연결 설정
    useEffect(() => {
        // TODO: 실제 WebSocket 서버 URL로 변경해야 합니다.
        const WS_URL = "ws://localhost:8080/taxi-chat";
        
        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
            console.log("WebSocket 연결 성공");
            // 연결 성공 시 시스템 메시지 추가 예시
            setMessages((prev) => [...prev, {
                id: Date.now(),
                type: 'system',
                text: '채팅방에 연결되었습니다.',
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            }]);
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // TODO: 수신된 메시지 형식에 따라 파싱 및 setMessages 호출
            console.log("메시지 수신:", data);
        };

        wsRef.current.onclose = () => {
            console.log("WebSocket 연결 종료");
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket 오류:", error);
        };

        // 컴포넌트 언마운트 시 WebSocket 연결 종료
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // 메시지 상태가 업데이트될 때마다 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages]);



    // 💡 정산 완료 상태를 확인하고 처리하는 useEffect
    useEffect(() => {
        const SETTLEMENT_COMPLETE_MESSAGE = '총대슈니가 정산정보를 입력했어요.\n빠른 시일 내에 정산해 주세요.';

        if (location.state && location.state.settlementCompleted) {
            console.log("정산 페이지에서 정산 완료 상태를 수신했습니다.");
            
            setMatchStatus('ended');

            setIsSettlementEntered(true);

        setMessages(prev => {
            const isDuplicate = prev.length > 0 && 
                                prev[prev.length - 1].type === 'system' &&
                                prev[prev.length - 1].text === SETTLEMENT_COMPLETE_MESSAGE;

            if (isDuplicate) {
                console.log("⚠️ 시스템 메시지 중복 추가 방지됨.");
                return prev; // 중복이면 상태 변경 없이 이전 상태 반환
            }
            
            // 중복이 아니면 새 메시지 추가
            return [
                ...prev, 
                {
                    id: Date.now(), 
                    type: 'system', 
                    // 💡 코드를 정리하기 위해 변수를 사용
                    text: SETTLEMENT_COMPLETE_MESSAGE, 
                    timestamp: Date.now()
                }
            ];
        });

          navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate, setMessages]); // location.state가 변경될 때마다 실행

    // 최종 정산 완료 상태(allSettled) 처리
    useEffect(() => {
        if (location.state && location.state.isSettled) {
            console.log("🔥 모든 정산이 최종 완료되었습니다. isSettled 상태 업데이트.");

            setMatchStatus('ended');
            setIsSettlementEntered(true);

            setIsSettled(true);

            navigate(location.pathname, { replace: true, state: {} }); // state 제거
        }
    }, [location, navigate]);

    // 메시지 전송 핸들러
    const handleSendMessage = useCallback((text) => {
        const newMessage = {
            id: Date.now(),
            side: 'right', // 내 메시지는 'right'
            type: 'text',
            name: '나', // TODO: 실제 사용자 이름으로 대체
            age: '23', // TODO: 실제 사용자 나이로 대체
            text: text,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
        };

        // 1. UI에 즉시 반영
        setMessages((prev) => [...prev, newMessage]);

        // 2. WebSocket을 통해 서버로 전송
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const messageToSend = JSON.stringify({
                // TODO: 서버에서 필요한 메시지 형식으로 구성
                type: 'chat',
                content: text,
                sender: 'my_user_id', 
            });
            wsRef.current.send(messageToSend);
        } else {
            console.error("WebSocket 연결이 끊어졌거나 준비되지 않았습니다.");
        }
    }, []);

    // 카메라 버튼 클릭 핸들러 (TODO: 갤러리/카메라 이동 흐 사진 전송 기능 구현 필요)
    const handleCameraClick = () => {
        console.log("카메라 버튼 클릭 - 사진 전송 기능 구현 필요");
    };

    // 매칭 종료 버튼 클릭 핸들러
    const handleEndMatch = () => {
        if (matchStatus === 'active') {
            console.log("매칭 종료 처리 및 상태 변경");
            setMatchStatus('ended');

            // 2. 알림 메시지 지연 발송 시뮬레이션 (서버 역할 흉내)
            const DELAY_MS = 5000; // 💡 테스트 편의를 위해 5초(5000ms)로 단축 (300000ms 대신)
            console.log(`알림 메시지 발송을 ${DELAY_MS / 1000}초 지연합니다 (서버 역할 시뮬레이션)`);
            
            // 💡 5분 지연 후 메시지를 setMessages로 추가 (WebSocket 수신 흉내)
            // **[유지/변경]** `delayedMessageTimeout`을 `useRef`로 관리하면 '정산 정보 입력하기' 클릭 시 취소 가능
            const delayedMessageTimeout = setTimeout(() => {
                console.log('5분 지연 후, 시스템 메시지 수신 (서버로부터의 WebSocket 수신 시뮬레이션)');
            
                setMessages((prev) => [...prev, {
                    id: Date.now() + 1,
                    type: 'system', 
                    // **[변경 3]** 메시지 내용을 요청하신 내용으로 변경 및 줄바꿈 처리
                    text: '목적지에 도착했다면\n총대슈니는 정산정보를 입력해 주세요', 
                    timestamp: Date.now(),
                }]);
            }, DELAY_MS); 

        } else if (isSettled && isHost) { // 💡 [추가] 최종 정산 완료 후, 방장만 '택시팟 종료하기' 클릭 시
            console.log("택시팟 최종 종료 및 채팅방 나가기 처리");
            // TODO: 최종 종료 API 호출 후, 채팅 목록 페이지로 navigate
            navigate('/review-member'); 
        } else if (matchStatus === 'ended') {
            if (isSettlementEntered) {
                // ⭐ 이 부분을 isHost 여부에 따라 분리합니다. ⭐
                if (isHost) {
                    console.log("방장: 정산 현황 페이지로 이동 (정산 현황 보기)");
                    navigate('/please'); // 방장은 기존 정산 현황 경로
                } else {
                    // 참여자 전용 페이지 경로 설정
                    console.log("참여자: 정산 정보 보기 페이지로 이동 (정산 정보 보기)");
                    navigate('/view-settlement-info'); // 👈 참여자 전용 경로 (새로 정의)
                }     
            } else {
                // 정산 정보 입력 전 (방장 전용)
                console.log("정산 정보 입력 페이지로 이동");
                navigate('/confirm'); 
            }
        }
    };


    console.log(`[DEBUG] isHost: ${isHost}, matchStatus: ${matchStatus}, isSettlementEntered: ${isSettlementEntered}, isSettled: ${isSettled}`);

    // -----------------------------------------------------
    // 렌더링
    return (
        <div className="relative h-full bg-white font-pretendard flex flex-col">
            <Header2 title="택시팟 채팅" onBack={handleBack} onMenu={handleOpenMenu} />

            <div className="flex flex-col flex-grow w-full">
                {/* 1. 매칭 정보 섹션 */}
                <MatchInfo
                    destination="서울여대 누리관"
                    departureIcon="🍄"
                    departure="태릉입구 7번출구"
                    departureTime="14:50"
                    members="2/4"
                    estimatedFare="5,000원"
                />
                
                {/* 2. 채팅 메시지 목록 */}
                <div 
                    ref={chatContainerRef}
                    className="flex-grow p-4 overflow-y-auto pb-[130px]"
                >
                    {messages.map((msg, index) => {
                        // 날짜 구분선 표시 로직
                        const isNewDay = index === 0 || 
                            new Date(messages[index - 1].date || '2025.11.10').toDateString() !== new Date(msg.date || '2025.11.10').toDateString();

                        // 날짜/시간 구분선 렌더링 (ChatBubble을 호출하지 않음)
                        const isSeparator = msg.type === 'dateSeparator' || msg.type === 'timeSeparator';

                        // 💡 시스템 메시지 직접 렌더링 로직 (ChatBubble 충돌 방지)
                        const isSystem = msg.type === 'system';

                        return (

                            <React.Fragment key={msg.id}>
                                {/* 날짜 구분선 */}
                                {isNewDay && (
                                    <div className="w-full flex justify-center my-4">
                                        <span className="text-body-regular-14 text-black-70">
                                            {msg.date || new Date(msg.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '. ')}
                                        </span>
                                    </div>
                                )}

                                {/* 시간 구분선 */}
                                {(msg.type === 'timeSeparator') && (
                                    <div className="w-full flex justify-center mt-[-20px] mb-4">
                                        <span className="text-body-regular-14 text-black-70">
                                            {msg.time}
                                        </span>
                                    </div>
                                )}

                                {/* 💡 시스템 메시지 직접 렌더링 */}
                                {isSystem && (
                                    <div className="w-full flex justify-center my-4">
                                        <div className="inline-flex px-4 py-3 bg-[#FFF4DF] rounded text-body-regular-14 
                                                         text-black-90 text-center leading-[1.4] whitespace-pre-line">
                                            {msg.text}
                                        </div>
                                    </div>
                                )}

                                {/* ChatBubble 컴포넌트 렌더링 */}
                                {!isSeparator && !isSystem && (
                                    <ChatBubble
                                        side={msg.side}
                                        // 일반 메시지는 variant를 'text'로 명시하거나, 
                                        // 실제 variant 값(예: 'image')이 있으면 그대로 전달합니다.
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
                
                        {/* 스크롤 가능한 콘텐츠의 맨 아래 여백 확보 (유지) */}
                        <div className="h-10"></div>
                    </div>

                    <div className="fixed bottom-0 z-10 w-[393px] left-1/2 -translate-x-1/2 bg-white">
                        {/* 3a. ActionButton (고정됨) */}
                            <ActionButton 
                                status={matchStatus} 
                                onClick={handleEndMatch} 
                                isHost={isHost}
                                isSettlementEntered={isSettlementEntered}
                                isSettled={isSettled}
                            />

                        {/* 3b. 채팅 입력창 (고정됨) */}
                        <div className="border-t border-black-10">
                            <ChatInput onSend={handleSendMessage} onCameraClick={handleCameraClick}/> 
                        </div>
                    </div>
                </div>
                <BottomMenu
                    isOpen={isMenuOpen}      // 상태 값 전달
                    onClose={handleCloseMenu} // 닫기 함수 전달
                    menuItems={menuItems}   // 메뉴 항목 리스트 전달
                />
            </div>
    );
}

// -----------------------------------------------------
// 💡 화면 구성을 위한 더미 데이터
// 실제로는 서버에서 받아오거나 WebSocket을 통해 실시간으로 추가됩니다.
const initialMessages = [
    { id: 1, type: 'dateSeparator', date: '2025.11.10' }, 
    { id: 2, type: 'timeSeparator', time: '19:20' }, 

    // 왼쪽(상대방) 메시지: 임슈니 
    {
        id: 3,
        side: 'left',
        type: 'text',
        name: '임슈니',
        age: '23',
        text: '혹시 지금 어디 계신가요?',
        time: '12:03',
        timestamp: new Date('2025/11/10 12:03:00').getTime(),
    },

    // 오른쪽(나) 메시지: 나
    {
        id: 4,
        side: 'right',
        type: 'text',
        name: '나',
        age: '23',
        text: '저는 지금 태릉입구역 1번출구예요! 지금 7번출구로 가고있어요!',
        time: '12:03',
        timestamp: new Date('2025/11/10 12:03:00').getTime() + 1, // 시간만 동일하게
    },

    // 왼쪽(상대방) 메시지: 김슈니
    {
        id: 5,
        side: 'left',
        type: 'text',
        name: '김슈니',
        age: '23',
        text: '혹시 지금 어디 계신가요?',
        time: '12:03',
        timestamp: new Date('2025/11/10 12:03:00').getTime() + 2,
    },

    // 왼쪽(상대방) 메시지: 이슈니
    {
        id: 6,
        side: 'left',
        type: 'text',
        name: '이슈니',
        age: '21',
        text: '혹시 지금 어디 계신가요?',
        time: '12:03',
        timestamp: new Date('2025/11/10 12:03:00').getTime() + 3,
    },
];
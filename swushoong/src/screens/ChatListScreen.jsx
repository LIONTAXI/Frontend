// src/screens/ChatListScreen.jsx
// 채팅목록 화면
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../components/TabBar";
import { getMyChatRooms, enterOrCreateChatRoom } from "../api/chat";
import { setAuthToken } from "../api/token"; // 경로를 utils로 가정하여 수정

// ==== 더미 데이터 정의 ====
const DUMMY_CHAT_DATA = {
    // API 연결 성공 시 matchingRooms에 대응
    matchingRooms: [
        {
            chatRoomId: 101, // API 응답 필드
            taxiPartyId: 1,  // 채팅방 입장에 사용될 ID (API 응답 필드)
            title: '서울여대 50주년기념관 (Dummy)',
            lastMessage: '테스트 더미: 이미 다들 모이셨을까요? 저 지금 지하철...',
            lastMessageAt: '2025-12-08T11:48:00Z', // API 응답 시간 형식
            closed: false, // isMatching을 위한 필드
            hasUnread: true, // hasUnread를 위한 필드
            avatarIcon: '🐙',
        },
    ],
    // API 연결 성공 시 finishedRooms에 대응
    finishedRooms: [
        {
            chatRoomId: 201,
            taxiPartyId: 2,
            title: '화랑대역 택시팟 (Dummy)',
            lastMessage: '테스트 더미: 도착하셔서 수고하셨습니다!',
            lastMessageAt: '2025-10-25T17:02:00Z',
            closed: true, // 매칭 종료
            hasUnread: false,
            avatarIcon: '🚕',
        },
        {
            chatRoomId: 202,
            taxiPartyId: 3,
            title: '별관 셔틀 승강장 (Dummy)',
            lastMessage: '테스트 더미: 다음 주에 다시 팟 만들어볼까요?',
            lastMessageAt: '2025-10-19T10:28:00Z',
            closed: true,
            hasUnread: false,
            avatarIcon: '⭐',
        },
    ],
};
// =======================

const ChatItem = ({ title, lastMessage, time, isMatching, hasUnread, avatarIcon, onClick }) => {
    // UI/CSS 변경 없음: 기존 코드 유지
    const itemClasses = hasUnread
        ? "flex items-center py-3 px-4 bg-[#FFF4DF]" // 읽지 않은 메시지 배경색
        : "flex items-center py-3 px-4 mt-4 mb-4";

    const titleClasses = hasUnread
        ? "text-body-bold-16 text-black-90 truncate mr-2" // 안 읽은 거
        : "text-body-bold-16 text-black-50 truncate mr-2";
    const messageClasses = hasUnread
        ? "text-body-regular-16 text-black-90 truncate mr-2"
        : "text-body-regular-16 text-black-50 truncate mr-2";
    const timeClasses = hasUnread
        ? "text-body-regular-14 text-black-70 flex-shrink-0"
        : "text-body-regular-14 text-black-70 flex-shrink-0";

    return (
        <div className={itemClasses} onClick={onClick}>
            {/* 아이콘 */}
            <div className="relative w-12 h-12 rounded-full bg-white border border-black-20 flex items-center justify-center mr-3">
                <span className="text-xl">{avatarIcon}</span>
            </div>

            {/* 채팅 정보 */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <p className={titleClasses}>
                        {title}
                    </p>
                    {/* 안읽음 표시  */}
                    {hasUnread && (
                        <span className="block h-3 w-3 rounded-full bg-[#FC7E2A] flex-shrink-0"></span>
                    )}
                </div>

                <div className="flex justify-between items-center mt-0.5">
                    {/* 마지막 메시지  */}
                    <p className={messageClasses}>
                        {lastMessage}
                    </p>
                    {/* 시간 */}
                    <span className={timeClasses}>
                        {time}
                    </span>
                </div>
            </div>
        </div>
    );
};

// 날짜 구분
const DateDivider = ({ date }) => (
    // UI/CSS 변경 없음: 기존 코드 유지
    <div className="text-body-semibold-16 text-black-70 px-4">
        {date}
    </div>
);

export default function ChatListScreen() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("chat-list");
    
    const [matchingChats, setMatchingChats] = useState([]);
    const [pastChats, setPastChats] = useState([]);
    const [loading, setLoading] = useState(true);

    // 탭바 이동 (UI/CSS 변경 없음)
    const handleTabChange = (key) => {
        setActiveTab(key);
        console.log(`${key} 탭으로 이동합니다.`);
        if (key === "home") {
            navigate("/home");
        } else if (key === "my") {
            navigate("/my");
        } else if (key === "chat-list") {
            navigate("/chat-list");
        }
    };
    
    // 채팅 목록 API 호출 함수 (API 통신 시뮬레이션 포함)
    const fetchChatRooms = async () => {
        setLoading(true);
        let apiSuccess = false;
        let apiData = { matchingRooms: [], finishedRooms: [] }; // dummy 

        try {
            // 1. API 실제 호출 시도
            const data = await getMyChatRooms();
            
            //setMatchingChats(data.matchingRooms || []);
            //setPastChats(data.finishedRooms || []);
            
            // API가 빈 배열을 반환해도, 통신은 성공으로 간주
            apiSuccess = true; 

        } catch (error) {
            console.error("채팅 목록 로드 실패 (API 에러):", error.message);
            // API 호출 실패 시, 빈 상태로 둡니다.
            //setMatchingChats([]);
            //setPastChats([]);
            apiSuccess = false;
        } finally {
            const isDataEmpty = apiData.matchingRooms.length === 0 && apiData.finishedRooms.length === 0;

    if (isDataEmpty || !apiSuccess) {
        // 더미 데이터를 사용
        console.log("데이터가 비어있거나 API 호출 실패: 더미 데이터를 사용하여 화면을 테스트합니다.");
        setMatchingChats(DUMMY_CHAT_DATA.matchingRooms);
        setPastChats(DUMMY_CHAT_DATA.finishedRooms);
    } else {
        // API에서 실제 데이터를 가져온 경우
        setMatchingChats(apiData.matchingRooms);
        setPastChats(apiData.finishedRooms);
    }
    
            setLoading(false);
            
            // 2. ⭐ 더미 데이터 표시 로직 (API 실패 또는 빈 데이터 반환 시 테스트를 위해) ⭐
            // API가 성공했지만 데이터가 0개이거나 (data.matchingRooms.length === 0) 
            // API 호출이 실패한 경우 (apiSuccess === false) 더미 데이터를 사용
            
            /*if (matchingChats.length === 0 && pastChats.length === 0 && !loading) {
                // 주의: fetchChatRooms가 실행된 후 바로 matchingChats를 확인하면 이전 상태값이 반영될 수 있음.
                // 그러나 여기서는 테스트를 위해 API 응답이 빈 경우를 가정하여 더미를 채워줍니다.
                 if (apiSuccess && matchingChats.length === 0 && pastChats.length === 0) {
                     console.log("API 호출 성공했으나 데이터가 비어있어 더미 데이터를 표시합니다.");
                     setMatchingChats(DUMMY_CHAT_DATA.matchingRooms);
                     setPastChats(DUMMY_CHAT_DATA.finishedRooms);
                 } else if (!apiSuccess) {
                     console.log("API 호출 실패로 인해 더미 데이터를 표시합니다.");
                     setMatchingChats(DUMMY_CHAT_DATA.matchingRooms);
                     setPastChats(DUMMY_CHAT_DATA.finishedRooms);
                 }
            }*/

        }
    };

    // 화면 로드 시 토큰 설정 및 데이터 로드 (UI/CSS 변경 없음)
    useEffect(() => {
        const TEMP_TOKEN = "YOUR_ACTUAL_VALID_JWT_TOKEN_HERE";
        if (TEMP_TOKEN.length > 50) {
            setAuthToken(TEMP_TOKEN);
        }
        
        fetchChatRooms();
    }, []);
    
    // 채팅 화면 이동 (API 호출 로직)
    const handleChatClick = async (chat) => {
        try {
            const taxiPartyId = chat.taxiPartyId || chat.id;
            if (!taxiPartyId) {
                 throw new Error("TaxiParty ID가 없습니다.");
            }
            
            const response = await enterOrCreateChatRoom(taxiPartyId);
            const chatRoomId = response.chatRoomId;
            
            navigate(`/chat/${chatRoomId}`);
            console.log(`채팅 ID ${chatRoomId} 상세 화면으로 이동합니다.`);
        } catch (error) {
            console.error("채팅방 입장 실패:", error);
            alert(`채팅방 입장에 실패했습니다: ${error.message}`);
        }
    };
    
    // 날짜별로 지난 채팅 목록을 그룹화 (UI/CSS 변경 없음)
    const groupedPastChats = pastChats.reduce((acc, chat) => {
        let date = '날짜 미정';
        if (chat.lastMessageAt) {
            try {
                const dateObj = new Date(chat.lastMessageAt);
                date = `${dateObj.getFullYear()}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getDate().toString().padStart(2, '0')}`;
            } catch (e) {
                // 날짜 파싱 실패 시 처리
            }
        }
        
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(chat);
        return acc;
    }, {});
    
    // 로딩 상태 표시 (UI/CSS 변경 없음)
    if (loading) {
        return (
            <div className="h-full bg-white font-pretendard flex flex-col">
                <header className="py-8 px-4"><h1 className="text-head-bold-24 text-black-70">채팅</h1></header>
                <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
                    <p className="text-body-regular-16 text-black-50">채팅 목록을 불러오는 중입니다...</p>
                </main>
                <div className="fixed bottom-0 z-10 w-[393px] left-1/2 -translate-x-1/2 bg-white">
                    <TabBar active={activeTab} onChange={handleTabChange}/>
                </div>
            </div>
        );
    }

    return (
        // UI/CSS 변경 없음: 기존 코드 유지
        <div className="h-full w-[393px] h-screen bg-white font-pretendard flex flex-col">
            {/* 헤더 영역 */}
            <header className="py-8 px-4">
                <h1 className="text-head-bold-24 text-black-70">채팅</h1>
            </header>

            {/* 채팅 목록 스크롤 영역 */}
            <main className="flex-1 min-h-0 overflow-y-auto pb-[393px]">
                
                {/* 현재 매칭 중인 택시팟 섹션 */}
                {matchingChats.length > 0 && (
                    <section className="mt-0 mb-14">
                        <h2 className="text-head-semibold-20 text-[#000] px-4 py-2">지금 매칭중인 택시팟</h2>
                        <div>
                            {matchingChats.map(chat => (
                                <ChatItem
                                    key={chat.chatRoomId}
                                    title={chat.title || '택시팟 제목'}
                                    lastMessage={chat.lastMessage || '메시지 없음'}
                                    time={chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '시간 미정'}
                                    isMatching={!chat.closed}
                                    hasUnread={chat.hasUnread || false}
                                    avatarIcon={chat.avatarIcon || '🐙'}
                                    onClick={() => handleChatClick(chat)}
                                />
                            ))}
                        </div>
                    </section>
                )}
                
                {/* 지난 택시팟 섹션 */}
                {pastChats.length > 0 && (
                    <section className="mt-0">
                        <h2 className="text-head-semibold-20 text-[#000] px-4 py-2">지난 택시팟</h2>
                        
                        {/* 날짜별 그룹 렌더링 */}
                        {Object.keys(groupedPastChats).sort((a, b) => b.localeCompare(a)).map(date => (
                            <div key={date}>
                                <DateDivider date={date} />
                                <div>
                                    {groupedPastChats[date].map(chat => (
                                        <ChatItem
                                            key={chat.chatRoomId}
                                            title={chat.title || '택시팟 제목'} 
                                            lastMessage={chat.lastMessage || '메시지 없음'}
                                            time={chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '시간 미정'} 
                                            isMatching={!chat.closed}
                                            hasUnread={chat.hasUnread || false}
                                            avatarIcon={chat.avatarIcon || '🐙'}
                                            onClick={() => handleChatClick(chat)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}
                
            </main>

            {/* 하단 메뉴 푸터 영역 */}
            <div className="fixed bottom-0 z-10 w-[393px] left-1/2 -translate-x-1/2 bg-white">
                <div>
                    <TabBar 
                        active={activeTab} 
                        onChange={handleTabChange}
                    />
                </div>
            </div>
        </div>
    );
}
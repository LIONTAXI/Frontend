// src/screens/ChatListScreen.jsx
// 채팅목록 화면
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TabBar from "../components/TabBar";
import { getMyChatRooms, enterOrCreateChatRoom } from "../api/chat";
import { setAuthToken } from "../api/token"; 


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
                    {/* 안읽음 표시  */}
                    {hasUnread && (
                        <span className="block h-3 w-3 rounded-full bg-[#FC7E2A] flex-shrink-0"></span>
                    )}
                </div>

                <div className="flex justify-between items-center mt-0.5">
                    {/* 마지막 메시지  */}
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
    
    // 채팅 목록 API 호출 함수 (더미 데이터 사용 로직 제거)
    const fetchChatRooms = async () => {
        setLoading(true);

        try {
            // 1. API 실제 호출
            const data = await getMyChatRooms();
            
            // API 응답 구조에 따라 상태 업데이트
            setMatchingChats(data.matchingRooms || []);
            setPastChats(data.finishedRooms || []);
            
            console.log("채팅 목록 로드 성공: API 데이터를 사용합니다.");

        } catch (error) {
            console.error("채팅 목록 로드 실패 (API 에러):", error.message);
            // API 호출 실패 시, 빈 상태로 둡니다.
            setMatchingChats([]);
            setPastChats([]);
        } finally {
            setLoading(false);
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
            
            navigate(`/chat/${chatRoomId}/${taxiPartyId}`);
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
                
                {/* API 호출 실패 또는 데이터가 없는 경우 */}
                {matchingChats.length === 0 && pastChats.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48">
                        <p className="text-body-regular-16 text-black-50">채팅방 목록이 비어 있습니다.</p>
                        <p className="text-body-regular-14 text-black-40">새로운 택시팟에 참여하거나 생성해보세요!</p>
                    </div>
                )}

                {/* 현재 매칭 중인 택시팟 섹션 */}
                {/*{matchingChats.length > 0 && (*/}
                    <section className="mt-0 mb-14">
                        <h2 className="text-head-semibold-20 text-[#000] px-4 py-2">지금 매칭중인 택시팟</h2>
                        <div>
                            {matchingChats.map(chat => (
                                <ChatItem
                                    key={chat.chatRoomId}
                                    title={chat.destination || '택시팟 제목'}
                                    lastMessage={chat.lastMessage || '메시지 없음'}
                                    time={chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '시간 미정'}
                                    isMatching={!chat.closed}
                                    hasUnread={chat.hasUnread || false}
                                    avatarIcon={chat.markerEmoji || '🐙'}
                                    onClick={() => handleChatClick(chat)}
                                />
                            ))}
                        </div>
                    </section>
                {/*})}*/}
                
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
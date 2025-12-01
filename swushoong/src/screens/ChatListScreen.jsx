//src/screens/ChatLisScreen.jsx
// 채팅목록 화면 
import React from "react";
import TabBar from "../components/TabBar";

const ChatItem = ({ title, lastMessage, time, isMatching, hasUnread, avatarIcon }) => {
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
        <div className={itemClasses}>
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
    <div className="text-body-semibold-16 text-black-70 px-4">
        {date}
    </div>
);

export default function ChatListScreen() {
    // ==== 더미 데이터 ==== 
    const chatData = [
        {
            type: 'current',
            id: 1,
            title: '서울여대 50주년기념관',
            lastMessage: '이미 다들 모이셨을까요? 저 지금 지하철...',
            time: '11:48',
            isMatching: true,
            hasUnread: true,
            avatarIcon: '🐙',
        },
        {
            type: 'past',
            date: '2025.10.25',
            id: 2,
            title: '서울여대 50주년기념관',
            lastMessage: '이미 다들 모이셨을까요? 저 지금 지하철...',
            time: '17:02',
            isMatching: false,
            hasUnread: false,
            avatarIcon: '🐙',
        },
        {
            type: 'past',
            date: '2025.10.25',
            id: 3,
            title: '서울여대 50주년기념관',
            lastMessage: '이미 다들 모이셨을까요? 저 지금 지하철...',
            time: '10:28',
            isMatching: false,
            hasUnread: false,
            avatarIcon: '🐙',
        },
        {
            type: 'past',
            date: '2025.10.19',
            id: 4,
            title: '서울여대 50주년기념관',
            lastMessage: '이미 다들 모이셨을까요? 저 지금 지하철...',
            time: '17:02',
            isMatching: false,
            hasUnread: false,
            avatarIcon: '🐙',
        },
    ];

    // 날짜별로 채팅 목록을 그룹화
    const groupedChats = chatData.reduce((acc, chat) => {
        if (chat.type === 'past') {
            const date = chat.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(chat);
        }
        return acc;
    }, {});
    
    // 현재 매칭 중인 채팅 목록
    const currentMatchingChats = chatData.filter(chat => chat.type === 'current');

    return (
        <div className="h-full bg-white font-pretendard flex flex-col">
            {/* 헤더 영역 */}
            <header className="py-8 px-4">
                <h1 className="text-head-bold-24 text-black-70">채팅</h1>
            </header>

            {/* 채팅 목록 스크롤 영역 */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                
                {/* 현재 매칭 중인 택시팟 섹션 */}
                {currentMatchingChats.length > 0 && (
                    <section className="mt-0 mb-14">
                        <h2 className="text-head-semibold-20 text-[#000] px-4 py-2">지금 매칭중인 택시팟</h2>
                        <div>
                            {currentMatchingChats.map(chat => (
                                <ChatItem
                                    key={chat.id}
                                    title={chat.title}
                                    lastMessage={chat.lastMessage}
                                    time={chat.time}
                                    isMatching={chat.isMatching}
                                    hasUnread={chat.hasUnread}
                                    avatarIcon={chat.avatarIcon}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 지난 택시팟 섹션 */}
                <section className="mt-0">
                    <h2 className="text-head-semibold-20 text-[#000] px-4 py-2">지난 택시팟</h2>
                    
                    {/* 날짜별 그룹 렌더링 */}
                    {Object.keys(groupedChats).sort((a, b) => b.localeCompare(a)).map(date => (
                        <div key={date}>
                            <DateDivider date={date} />
                            <div>
                                {groupedChats[date].map(chat => (
                                    <ChatItem
                                        key={chat.id}
                                        title={chat.title}
                                        lastMessage={chat.lastMessage}
                                        time={chat.time}
                                        isMatching={chat.isMatching}
                                        hasUnread={chat.hasUnread}
                                        avatarIcon={chat.avatarIcon}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
                
            </main>

            {/* 하단 메뉴 푸터 영역 */}
            <div className="fixed bottom-0 z-10 w-[393px] left-1/2 -translate-x-1/2 bg-white">
                    <div>
                        <TabBar />
                    </div>
            </div>
        </div>
    );
}
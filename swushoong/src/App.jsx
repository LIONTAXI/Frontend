import React, { useState } from "react";
import InputInfo from "./components/InputInfo";
import BtnLong from "./components/BtnLong";
import BtnShort from "./components/BtnShort";
import ChatBubble from "./components/ChatBubble";
import TabBar from "./components/TabBar";

export default function App() {
  const [activeTab, setActiveTab] = useState("home"); // "home" | "chat" | "my"

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 pb-4">
      {/* 메인 콘텐츠 영역 */}
      <div className="w-[360px] space-y-6 flex-1">
        <InputInfo />

        {/* 아래에서 버튼 상태 확인 영역 */}
        <div className="mt-6 space-y-3">
          {/* 활성 버튼 */}
          <BtnLong label="로그인" variant="primary" />

          {/* 비활성 버튼 */}
          <BtnLong label="로그인" variant="disabled" />
        </div>

        {/* 짧은 버튼 2개 */}
        <div className="flex gap-2">
          <BtnShort label="같이 타기" variant="primary" />
          <BtnShort label="같이 타기" variant="disabled" />
        </div>

        {/* 채팅 버블 샘플 영역 */}
        <div className="mt-8 space-y-4">
          {/* 왼쪽 텍스트 말풍선 */}
          <ChatBubble
            side="left"
            variant="text"
            name="임슈니"
            age="23"
            text="혹시 지금 어디 계신가요?"
            time="12:03"
          />

          {/* 시스템 안내 말풍선 */}
          <ChatBubble
            side="system"
            text={`총대슈니는 택시를 호출했다면\n택시 정보를 알려주세요`}
          />

          {/* 오른쪽 텍스트 말풍선 */}
          <ChatBubble
            side="right"
            variant="text"
            text="저는 지금 태릉입구역 8번출구예요! 7번출구로 가고있어요!"
            time="12:03"
          />

          {/* 오른쪽 이미지 말풍선 (이미지 없으면 회색 박스만 보임) */}
          <ChatBubble
            side="right"
            variant="image"
            time="12:03"
            imageUrl="" // 필요하면 실제 이미지 경로 넣기
          />

          {/* 왼쪽 이미지 말풍선 + 프로필 */}
          <ChatBubble
            side="left"
            variant="image"
            name="임슈니"
            age="23"
            time="12:03"
            imageUrl=""
          />
        </div>
      </div>

      {/* 하단 탭바 */}
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        className="w-full max-w-[360px] mt-8"
      />
    </div>
  );
}

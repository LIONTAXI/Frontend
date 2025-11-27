import React, { useState } from "react";
import InputInfo from "./components/InputInfo";
import BtnLong from "./components/BtnLong";
import BtnShort from "./components/BtnShort";
import ChatBubble from "./components/ChatBubble";
import TabBar from "./components/TabBar";
import CountScreen from "./screens/CountScreen";
import ResultScreen from "./screens/ResultScreen";
import CurrentPayScreen from "./screens/CurrentPayScreen";
import TaxiMemberScreen from "./screens/TexiMemberScreen";
//import ReviewMemberScreen from "./screens/ReviewMemberScreen";

export default function App() {

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 pb-4">
      {/* 화면 너비 고정 컨테이너 (360px로 가정) */}
      <div className="w-[360px] space-y-6 flex-1 border "> 
        <CurrentPayScreen />
      </div>
    </div>
  );
}
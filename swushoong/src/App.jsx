// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import JoinScreen1 from "./screens/JoinScreen1";
import JoinScreen2 from "./screens/JoinScreen2";
import JoinScreen3 from "./screens/JoinScreen3";
import VerifyResultScreen from "./screens/VerifyResultScreen";
import ManualVerifyScreen from "./screens/ManualVerifyScreen";
import SetPWScreen1 from "./screens/SetPWScreen1";
import SetPWScreen2 from "./screens/SetPWScreen2";

export default function App() {
  return (
    <div className="min-h-screen bg-white flex justify-center items-start">
      {/* 아이폰 화면 폭 맞추기 (393px 또는 360px 원하시는 값으로 조정 가능) */}
      <div className="w-[393px]">
        <Routes>
          <Route path="/" element={<LoginScreen/>}/>
          <Route path="/join1" element={<JoinScreen1/>}/>
          <Route path="/join2" element={<JoinScreen2/>}/>
          <Route path="/join3" element={<JoinScreen3/>}/>
          <Route path="/verify-result" element={<VerifyResultScreen />} />
          <Route path="/manual-verify" element={<ManualVerifyScreen />} />
          <Route path="/set-pw1" element={<SetPWScreen1 />} />
          <Route path="/set-pw2" element={<SetPWScreen2 />} />
        </Routes>
      </div>
    </div>
  );
}
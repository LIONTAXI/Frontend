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
import HomeScreen from "./screens/HomeScreen";
import AddTaxiScreen from "./screens/AddTaxiScreen";
import NotificationScreen from "./screens/NotificationScreen";
import TaxiDetailScreen from "./screens/TaxiDetailScreen";
import JoinTexiMember from "./screens/JoinTexiMember";

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
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/add-taxi" element={<AddTaxiScreen />} />
          <Route path="/notifications" element={<NotificationScreen />} />
          <Route path="/taxi-detail" element={<TaxiDetailScreen />} />
          <Route path="/join-taxi" element={<JoinTexiMember />} />
        </Routes>
      </div>
    </div>
  );
}
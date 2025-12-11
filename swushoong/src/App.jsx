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
import MyScreen from "./screens/MyScreen";
import BlockScreen from "./screens/BlockScreen";
import EditProfile from "./screens/EditProfile";

/* === 관리자 페이지 === */
import AdminLoginScreen from "./screens/AdminLoginScreen";
import AdminHomeScreen from "./screens/AdminHomeScreen";
import AdminHomeBigScreen from "./screens/AdminHomeBigScreen";

/* === 채팅 === */
import ChatListScreen from "./screens/ChatListScreen";
import ChatScreen from "./screens/ChatScreen";

/* === 정산 === */
import CountScreen from "./screens/CountScreen"; 
import ResultScreen from "./screens/ResultScreen";
import CurrentPayScreen from "./screens/CurrentPayScreen";
import MemberListScreen from "./screens/MemberListScreen";
import PayMemberScreen from "./screens/PayMemberScreen";

/* --- 후기 === */
import ReviewScreen from "./screens/ReviewScreen";
import ReviewArriveScreen from "./screens/ReviewArriveScreen";
import ReviewMemberScreen from "./screens/ReviewMemberScreen";
import ReviewSwuScreen from "./screens/ReviewSwuScreen";

import ReviewAllScreen from "./screens/ReviewAllScreen";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-black-10 flex justify-center items-start">
      {/* 아이폰 화면 폭 맞추기 (393px 또는 360px 원하시는 값으로 조정 가능) */}
      <div className="w-[393px] bg-white">
        <Routes>
          
          <Route path="/" element={<LoginScreen/>}/>
          <Route path="/join1" element={<JoinScreen1/>}/>
          <Route path="/join2" element={<JoinScreen2/>}/>
          <Route path="/join3" element={<JoinScreen3/>}/>
          <Route path="/verify-result" element={<VerifyResultScreen />} />
          <Route path="/manual-verify" element={<ManualVerifyScreen />} />
          <Route path="/set-pw1" element={<SetPWScreen1 />} />
          <Route path="/set-pw2" element={<SetPWScreen2 />} />

          {/* === 관리자 페이지 === */}
          <Route path="/login-admin" element={<AdminLoginScreen/>}/>
          <Route path="/admin-home" element={<AdminHomeScreen/>}/>
          <Route path="/admin-home-big" element={<AdminHomeBigScreen/>}/>  

          {/* === 채팅 === */}
          <Route path="/chat-list" element={<ChatListScreen/>} />
          <Route path="/chat/:chatRoomId/:partyId" element={<ChatScreen/>} />

          {/* === 정산 === */}
          <Route path="/confirm" element={<CountScreen/>} /> 
          <Route path="/send" element={<ResultScreen/>} />
          <Route path="/please" element={<CurrentPayScreen />} /> 
          <Route path="/member-list/:partyId" element={<MemberListScreen />} />
          <Route path="/current-pay-member" element={<PayMemberScreen />} /> 

          {/* === 후기 === */}
          <Route path="/review-member" element={<ReviewMemberScreen />} />   
          <Route path="/review-swu" element={<ReviewSwuScreen />} /> 
          <Route path="/review-all/:taxiPartyId/:revieweeId" element={<ReviewAllScreen />} /> 
          <Route path="/member-profile/:userId" element={<ReviewScreen />} />  
          <Route path="/review/:reviewId" element={<ReviewArriveScreen />} /> 

          <Route path="/home" element={<HomeScreen />} />
          <Route path="/add-taxi" element={<AddTaxiScreen />} />
          <Route path="/notifications" element={<NotificationScreen />} />
          <Route path="/taxi-detail" element={<TaxiDetailScreen />} />
          <Route path="/join-taxi" element={<JoinTexiMember />} />
          <Route path="/my" element={<MyScreen />} />
          <Route path="/block" element={<BlockScreen />} />
          <Route path="/edit-profile" element={<EditProfile />} />

        </Routes>
      </div>
    </div>
  );
}
// src/screens/LoginScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/img/img_logo.svg";
import MailPlug from "../assets/img/img_mailPlugBtn.svg";
import BtnLong from "../components/BtnLong";

// 비밀번호 표시/숨김 아이콘
import BlindIcon from "../assets/icon/icon_blind.svg";
import EyeIcon from "../assets/icon/icon_eye.svg";

export default function LoginScreen() {
  const [showPw, setShowPw] = useState(false);

// 로그인 버튼 활성화 조작
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

// 로그인 실패 여부
  const [loginError, setLoginError] = useState(false);

  const navigate = useNavigate();

// 로그인 버튼 활성화(둘 다 비어 있지 않을 경우)
  const canLogin =
    userId.trim().length > 0 && password.trim().length > 0;

// 서울여대 웹메일 연결
  const handleMailPlugClick = () => {
    window.open(
      "https://mc183.mailplug.com/member/login?host_domain=swu.ac.kr",
      "_blank"
    );
  };

  const handleLogin = () => {
    if (!canLogin) return;
    console.log("로그인 시도", { userId, password });
    setLoginError(true);
  };


  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto overflow-hidden pt-12 pb-4">

      {/* ===== 로고 ===== */}
      <img
        src={Logo}
        alt="logo"
        className="w-[88px] h-[40px] absolute left-4"
      />

      {/* ===== “서울여대 웹메일이 없다면?” 버튼 (말풍선 이미지) ===== */}
      <button
        type="button"
        onClick={handleMailPlugClick}
        className="absolute left-[213px] top-[80px]"
        >
        <img src= {MailPlug} alt="서울여대 웹메일 안내" />
      </button>

      {/* ===== 메인 입력 영역 ===== */}
      <div className="absolute left-4 top-[130px] w-[361px] flex flex-col gap-6">
        {/* --- 아이디 영역 --- */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">아이디</p>
            <p className="text-body-regular-16 text-black-70">
              서울여대 웹메일을 사용해 주세요
            </p>
          </div>

          {/* 아이디 인풋 + @swu.ac.kr */}
          <div className="w-full h-12 bg-black-10 rounded-[4px] px-4 flex items-center justify-between">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
            />
            <span className="ml-2 text-body-regular-16 text-black-50">
              @swu.ac.kr
            </span>
          </div>
        </div>

        {/* --- 비밀번호 영역 --- */}
        <div className="flex flex-col gap-4">
          <p className="text-head-semibold-20 text-black-90">비밀번호</p>

          <div className="w-full h-12 bg-black-10 rounded-[4px] px-4 flex items-center justify-between">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError(false);
              }}
              className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
            />
            <button
              type="button"
              className="ml-2 w-5 h-5"
              onClick={() => setShowPw((prev) => !prev)}
            >
              <img
                src={showPw ? EyeIcon : BlindIcon}
                alt="toggle password"
                className="w-full h-full"
              />
            </button>
          </div>
          {/* ===== 로그인 실패 문구 ===== */}
          {loginError && (
            <p className="mt-1 text-body-regular-14 text-oryu">
                *아이디 또는 비밀번호를 다시 확인해주세요
            </p>
          )}
        </div>
      </div>

      {/* ===== 회원가입 / 비밀번호 변경 ===== */}
      <div className="absolute top-[430px] left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button 
            className="text-body-semibold-16 text-black-90"
            onClick={() => navigate("/join1")}
            >
          회원가입
        </button>
        <span className="text-body-regular-16 text-black-90">|</span>
        <button 
            className="text-body-semibold-16 text-black-90"
            onClick={() => navigate("/set-pw1")}>
          비밀번호 변경
        </button>
      </div>

      {/* ===== 로그인 버튼 (비활성) ===== */}
      <div className="absolute left-4 top-[670px] w-[361px]">
        <BtnLong 
          label="로그인" 
          variant={canLogin ? "primary" : "disabled"}
          disabled={!canLogin}
          onClick={handleLogin} 
          />
      </div>
    </div>
  );
}

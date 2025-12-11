// src/screens/LoginScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/img/img_logo.svg";
import MailPlug from "../assets/img/img_mailPlugBtn.svg";
import BtnLong from "../components/BtnLong";

// 비밀번호 표시/숨김 아이콘
import BlindIcon from "../assets/icon/icon_blind.svg";
import EyeIcon from "../assets/icon/icon_eye.svg";

// 로그인 API
import { login } from "../api/auth";
import { setAuthToken } from "../api/token";

export default function LoginScreen() {
  const [showPw, setShowPw] = useState(false);

  // 로그인 버튼 활성화 조작
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // 로그인 실패 여부
  const [loginError, setLoginError] = useState(false);

  const navigate = useNavigate();

  // 로그인 버튼 활성화(둘 다 비어 있지 않을 경우)
  const canLogin = userId.trim().length > 0 && password.trim().length > 0;

  // 서울여대 웹메일 연결
  const handleMailPlugClick = () => {
    window.open(
      "https://mc183.mailplug.com/member/login?host_domain=swu.ac.kr",
      "_blank"
    );
  };

  // 로그인 처리
  const handleLogin = async () => {
    if (!canLogin) return;

    const email = `${userId.trim()}@swu.ac.kr`;

    try {
      setLoginError(false);

      const data = await login(email, password);

      // 1) 서버에서 토큰 꺼내기
      const token = data.token || data.accessToken;
      if (!token) {
        throw new Error("서버 응답에 인증 토큰이 포함되어 있지 않습니다.");
      }

      // 2) 토큰을 공통 유틸 함수로 저장 (키: authToken)
      setAuthToken(token);
      console.log("[LoginScreen] 토큰 저장 완료");

      // 3) JWT payload에서 userId 꺼내기
      let loginUserId = null;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("[LoginScreen] token payload:", payload);
        loginUserId = payload.userId;
      } catch (e) {
        console.error("JWT 페이로드 파싱 실패:", e);
      }

      // 4) userId 따로 저장 (다른 화면에서 사용)
      if (loginUserId != null) {
        localStorage.setItem("userId", String(loginUserId));
      }

      // 5) 홈 화면으로 이동
      navigate("/home");
    } catch (err) {
      console.error("로그인 실패:", err);
      setLoginError(true);
      alert(
        err.response?.message ||
          "아이디 또는 비밀번호를 다시 확인해주세요."
      );
    }
  };

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      <div className="flex-1 flex flex-col px-4 pt-12 pb-4">
        {/* ===== 로고 + 웹메일 안내 ===== */}
        <div className="flex items-start justify-between">
          <img src={Logo} alt="logo" className="w-[88px] h-[40px]" />

          <button
            type="button"
            onClick={handleMailPlugClick}
            className="mt-4"
          >
            <img src={MailPlug} alt="서울여대 웹메일 안내" />
          </button>
        </div>

        {/* ===== 메인 입력 영역 ===== */}
        <div className="mt-10 w-full max-w-[361px] mx-auto flex flex-col gap-6">
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

            {/* 로그인 실패 문구 */}
            {loginError && (
              <p className="mt-1 text-body-regular-14 text-oryu">
                *아이디 또는 비밀번호를 다시 확인해주세요
              </p>
            )}
          </div>
        </div>

        {/* ===== 회원가입 / 비밀번호 변경 ===== */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            className="text-body-semibold-16 text-black-90"
            onClick={() => navigate("/join1")}
          >
            회원가입
          </button>
          <span className="text-body-regular-16 text-black-90">|</span>
          <button
            className="text-body-semibold-16 text-black-90"
            onClick={() => navigate("/set-pw1")}
          >
            비밀번호 변경
          </button>
        </div>

        {/* ===== 로그인 버튼 ===== */}
        <div className="mt-auto pb-2">
          <BtnLong
            label="로그인"
            variant={canLogin ? "primary" : "disabled"}
            disabled={!canLogin}
            onClick={handleLogin}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

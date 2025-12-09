import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoAdmin from "../assets/img/img_logo_admin.svg";
import BtnLong from "../components/BtnLong";
import Admin from "../api/Admin";

export default function AdminLoginScreen() {
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


  // API 연결 
  const handleLogin = () => {
    if (!canLogin) return;

            const requiredId = import.meta.env.VITE_ADMIN_USER;
            const requiredPassword = import.meta.env.VITE_ADMIN_PASS;
        
            // 입력 ID: 'admin' (userId) + '@swu.ac.kr'
            const fullUserId = `${userId}@swu.ac.kr`;

            // 인증 성공 여부 판단
        if (fullUserId === requiredId && password === requiredPassword) {
            // 인증 성공: API 파일의 commonHeaders에 고정된 인증 정보가 이미 설정되었으므로
            // 로그인 상태를 유지하고 대시보드로 이동만 하면 됩니다.
            console.log("로그인 성공 (환경 변수 일치)");
            setLoginError(false);
            navigate('/admin-home'); // 성공 시 대시보드로 이동
        } else {
            // 인증 실패
            console.log("로그인 실패 (환경 변수 불일치)");
            setLoginError(true);
        }
  };

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      <div className="flex-1 flex flex-col px-4 pt-12 pb-4">
      <div className="flex items-start justify-between">
        {/* ===== 로고 ===== */}
        <img
          src={LogoAdmin}
          alt="logo"
          className="w-[147px] h-[58px]"
        />
      </div>

      {/* ===== 메인 입력 영역 ===== */}
      <div className="mt-10 w-full max-w-[361px] mx-auto flex flex-col gap-6">
        {/* --- 아이디 영역 --- */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">관리자 로그인</p>
            <p className="text-body-regular-16 text-black-70">
              관리자용 아이디를 입력해 주세요
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

      {/* ===== 로그인 버튼 (비활성) ===== */}
      <div className="mt-auto pb-2">
        <BtnLong 
          label="로그인" 
          variant={canLogin ? "primary" : "disabled"}
          disabled={!canLogin}
          onClick={handleLogin} 
          />
      </div>
    </div>
    </div>
  );
}

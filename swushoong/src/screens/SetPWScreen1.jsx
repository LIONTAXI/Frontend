// src/screens/SetPWScreen1.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import InputInfo from "../components/InputInfo";
import EmailVerificationSection from "../components/EmailVerificationSection";

export default function JoinScreen1() {
  const [userId, setUserId] = useState("");
  const domain = "@swu.ac.kr";

  const canSend = userId.trim().length > 0;
  const [showVerification, setShowVerification] = useState(false);
  const [isCodeFilled, setIsCodeFilled] = useState(false);

  const navigate = useNavigate();

  const handleBack = () => {
    window.history.back();
  };

  const handleSendCode = () => {
    if (!canSend) return;
    console.log("인증번호 보내기:", `${userId}${domain}`);
    setShowVerification(true);
  };

  const handleVerify = () => {
    console.log("인증하기 클릭");
    navigate("/set-pw2", { state: { userId } });
  };

  const handleResendCode = () => {
    console.log("인증코드 다시 받기");
  };

  const primaryLabel = showVerification ? "인증하기" : "인증번호 보내기";
  const primaryVariant = showVerification
    ? isCodeFilled
      ? "primary"
      : "disabled"
    : canSend
    ? "primary"
    : "disabled";
  const primaryDisabled = showVerification ? !isCodeFilled : !canSend;

  const handlePrimaryClick = () => {
    if (primaryDisabled) return;
    if (showVerification) {
      handleVerify();
    } else {
      handleSendCode();
    }
  };

  const fullEmail = `${userId || "swuni123"}${domain}`;

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      {/* ===== 헤더 ===== */}
      <Header title="비밀번호 재설정" onBack={handleBack} />

      {/* ===== 메인 콘텐츠 ===== */}
      <main className="flex-1 px-4 pt-8 pb-4">
        <section className="w-full max-w-[361px] mx-auto flex flex-col gap-4">
          {/* 아이디 텍스트 영역 */}
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">아이디</p>
            <p className="text-body-regular-16 text-black-70">
              서울여대 웹메일을 사용해 주세요
            </p>
          </div>

          {/* 아이디 인풋 + @swu.ac.kr */}
          <div className="mt-2 w-full h-12 bg-black-10 rounded-md px-4 flex items-center justify-between">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
            />
            <span className="ml-2 text-body-regular-16 text-black-50">
              {domain}
            </span>
          </div>
        </section>

        {/* ⭐ 인증코드 입력 영역 */}
        {showVerification && (
          <section className="w-full max-w-[361px] mx-auto mt-8">
            <EmailVerificationSection
              email={fullEmail}
              onResend={handleResendCode}
              onFilledChange={setIsCodeFilled}
            />
          </section>
        )}
      </main>

      {/* ===== 하단 버튼 ===== */}
      <div className="px-4 pb-6">
        <BtnLong
          label={primaryLabel}
          variant={primaryVariant}
          disabled={primaryDisabled}
          onClick={handlePrimaryClick}
          className="w-full"
        />
      </div>
    </div>
  );
}

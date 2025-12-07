// src/screens/JoinScreen1.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import InputInfo from "../components/InputInfo";
import EmailVerificationSection from "../components/EmailVerificationSection";

import {
  sendSignupCode,
  resetSignupCode,
  verifySignupCode,
} from "../api/auth";

export default function JoinScreen1() {
  const [userId, setUserId] = useState("");
  const domain = "@swu.ac.kr";

  const canSend = userId.trim().length > 0;
  const [showVerification, setShowVerification] = useState(false);
  const [isCodeFilled, setIsCodeFilled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSending, setIsSending] = useState(false);

  const navigate = useNavigate();

  const handleBack = () => {
    window.history.back();
  };

  const email = `${userId.trim()}${domain}`;
  const displayEmail = `${userId || "swuni123"}${domain}`;

  const handleSendCode = async () => {
    if (!canSend || isSending) return;
    try {
      setIsSending(true);
      console.log("[JoinScreen1] 인증번호 보내기:", email);
      const data = await sendSignupCode(email);
      console.log("[JoinScreen1] sendSignupCode 성공:", data);
      alert(data.message || "인증 코드가 전송되었습니다.");
      setShowVerification(true);
    } catch (err) {
      console.error("[JoinScreen1] sendSignupCode 실패:", err);
      alert(err.response?.message || "인증 코드 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!isCodeFilled || !verificationCode) return;
    try {
      console.log("[JoinScreen1] 인증하기 클릭:", {
        email,
        verificationCode,
      });
      const data = await verifySignupCode(email, verificationCode);
      console.log("[JoinScreen1] verifySignupCode 성공:", data);
      alert(data.message || "인증이 완료되었습니다.");
      navigate("/join2", { state: { userId } });
    } catch (err) {
      console.error("[JoinScreen1] verifySignupCode 실패:", err);
      alert(err.response?.message || "인증 코드가 일치하지 않습니다.");
    }
  };

  const handleResendCode = async () => {
    try {
      console.log("[JoinScreen1] 인증코드 다시 받기:", email);
      const data = await resetSignupCode(email);
      console.log("[JoinScreen1] resetSignupCode 성공:", data);
      alert(
        data.message ||
          "인증 코드가 재전송되었습니다. (기존 코드는 초기화되었습니다.)"
      );
    } catch (err) {
      console.error("[JoinScreen1] resetSignupCode 실패:", err);
      alert(err.response?.message || "인증 코드 재전송에 실패했습니다.");
    }
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

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      <Header title="회원가입" onBack={handleBack} />

      <main className="flex-1 px-4 pt-8 pb-4">
        <section className="w-full max-w-[361px] mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">아이디</p>
            <p className="text-body-regular-16 text-black-70">
              서울여대 웹메일을 사용해 주세요
            </p>
          </div>

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

        {showVerification && (
          <section className="w-full max-w-[361px] mx-auto mt-8">
            <EmailVerificationSection
              email={displayEmail}
              onResend={handleResendCode}
              onFilledChange={setIsCodeFilled}
              onCodeChange={setVerificationCode}
            />
          </section>
        )}
      </main>

      <div className="px-4 pb-6">
        <BtnLong
          label={primaryLabel}
          variant={primaryVariant}
          disabled={primaryDisabled || isSending}
          onClick={handlePrimaryClick}
          className="w-full"
        />
      </div>
    </div>
  );
}

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";

import SuccessIcon from "../assets/icon/icon_success.svg";
import FailedIcon from "../assets/icon/icon_failed.svg";

export default function VerifyResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const isSuccess = location.state?.success ?? true;

  const iconSrc = isSuccess ? SuccessIcon : FailedIcon;
  const message = isSuccess ? "인증 완료!" : "인증 실패";
  const buttonLabel = isSuccess ? "확인" : "수동인증 신청하기";

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrimary = () => {
    if (isSuccess) {
      // 인증 성공 -> 로그인 화면으로
      navigate("/");
    } else {
      // 인증 실패 -> 수동 인증 화면으로
      navigate("/manual-verify");
    }
  };

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      {/* 상단 헤더 */}
      <Header title="2차 인증" onBack={handleBack} />

      {/* 가운데 결과 아이콘 + 텍스트 */}
      <main className="flex-1 flex flex-col items-center justify-center mb-40">
        <div className="flex flex-col items-center gap-4">
          <img
            src={iconSrc}
            alt={isSuccess ? "인증 성공" : "인증 실패"}
            className="w-15 h-15"
          />
          <p className="text-head-semibold-20 text-black-70">{message}</p>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="px-4 pb-6">
        <BtnLong
          label={buttonLabel}
          variant="primary"
          onClick={handlePrimary}
          className="w-full"
        />
      </div>
    </div>
  );
}

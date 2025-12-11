import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import InputInfo from "../components/InputInfo"; // 스타일 참고/추후 재사용용
import CheckedIcon from "../assets/icon/icon_checked2.svg";
import BlindIcon from "../assets/icon/icon_blind.svg";
import EyeIcon from "../assets/icon/icon_eye.svg";

//비밀번호 변경 API
import { changePassword } from "../api/auth";

export default function JoinScreen2() {
  const navigate = useNavigate();
  const location = useLocation();

  const domain = "@swu.ac.kr";
  // 1단계에서 넘어온 아이디 받기
  const userId = location.state?.userId || "";

  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwCheck, setShowPwCheck] = useState(false);

  // 비밀번호 조건
  const isLengthOk = password.length >= 8;
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isMatch = password.length > 0 && password === passwordCheck;

  const canSubmit = isLengthOk && hasSpecial && isMatch;

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  //API 사용
  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    const email = `${userId}${domain}`;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const data = await changePassword(email, password, passwordCheck);
      alert(data.message || "비밀번호가 성공적으로 변경되었습니다.");
      navigate("/"); // 로그인 화면으로
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
      setErrorMessage(
        err.response?.message ||
          "비밀번호 변경에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      {/*  헤더  */}
      <Header title="비밀번호 재설정" onBack={handleBack} />

      {/*  메인 영역  */}
      <main className="flex-1 px-4 pt-8 pb-4">
        <div className="w-full max-w-[361px] mx-auto flex flex-col gap-8">
          {/*  아이디 영역 (인증 완료 표시) */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-head-semibold-20 text-black-90">아이디</p>
              <p className="text-body-regular-16 text-black-70">
                서울여대 웹메일을 사용해 주세요
              </p>
            </div>

            <div className="w-full bg-black-10 rounded-md px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={CheckedIcon}
                  alt="인증 완료"
                  className="w-5 h-5"
                />
                <span className="text-body-regular-16 text-black-90">
                  {userId}
                </span>
              </div>
              <span className="text-body-regular-16 text-black-50">
                {domain}
              </span>
            </div>
          </section>

          {/*  비밀번호 입력  */}
          <section className="flex flex-col gap-4">
            <p className="text-head-semibold-20 text-black-90">새로운 비밀번호</p>

            {/* 비밀번호 인풋 + 눈 아이콘 */}
            <div className="w-full bg-black-10 rounded-md px-4 h-12 flex items-center justify-between">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* 비밀번호 조건 2개 */}
            <div className="w-full flex justify-between items-center text-body-regular-14">
              <div className="flex items-center gap-1">
                <img
                  src={CheckedIcon}
                  alt=""
                  className={`w-5 h-5 ${
                    isLengthOk ? "" : "opacity-30"
                  }`}
                />
                <span
                  className={
                    isLengthOk ? "text-black-70" : "text-black-40"
                  }
                >
                  비밀번호 8자리 이상
                </span>
              </div>

              <div className="flex items-center gap-1">
                <img
                  src={CheckedIcon}
                  alt=""
                  className={`w-5 h-5 ${
                    hasSpecial ? "" : "opacity-30"
                  }`}
                />
                <span
                  className={
                    hasSpecial ? "text-black-70" : "text-black-40"
                  }
                >
                  특수문자(!@#$%^&*) 사용
                </span>
              </div>
            </div>
          </section>

          {/*  비밀번호 확인  */}
          <section className="flex flex-col gap-4">
            <p className="text-head-semibold-20 text-black-90">
              비밀번호 확인
            </p>

            <div className="w-full bg-black-10 rounded-md px-4 h-12 flex items-center justify-between">
              <input
                type={showPwCheck ? "text" : "password"}
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
              />
              <button
                type="button"
                className="ml-2 w-5 h-5"
                onClick={() => setShowPwCheck((prev) => !prev)}
              >
                <img
                  src={showPwCheck ? EyeIcon : BlindIcon}
                  alt="toggle password"
                  className="w-full h-full"
                />
              </button>
            </div>

            {/* 비밀번호 일치 여부 */}
            <div className="flex items-center gap-1 text-body-regular-14">
              <img
                src={CheckedIcon}
                alt=""
                className={`w-5 h-5 ${
                  isMatch ? "" : "opacity-30"
                }`}
              />
              <span
                className={
                  isMatch ? "text-black-70" : "text-black-40"
                }
              >
                비밀번호 일치
              </span>
            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <p className="mt-1 text-body-regular-14 text-oryu">
                {errorMessage}
              </p>
            )}
          </section>
        </div>
      </main>

      {/*  하단 완료 버튼  */}
      <div className="px-4 pb-6">
        <BtnLong
          label="완료"
          variant={canSubmit ? "primary" : "disabled"}
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
          className="w-full"
        />
      </div>
    </div>
  );
}

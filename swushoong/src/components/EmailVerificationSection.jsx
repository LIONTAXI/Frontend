// src/components/EmailVerificationSection.jsx
import React, { useEffect, useRef, useState } from "react";

export default function EmailVerificationSection({
  email = "",
  onResend,
  onFilledChange,          // 코드가 다 채워졌는지 알려줄 콜백
}) {
  const [timeLeft, setTimeLeft] = useState(180);   // 4분 타이머
  const [codes, setCodes] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  // 타이머
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  // 코드 변경 시 부모에게 “다 채워졌는지” 알려주는 헬퍼
  const notifyFilled = (nextCodes) => {
    if (onFilledChange) {
      const filled = nextCodes.every((c) => c !== "");
      onFilledChange(filled);
    }
  };

  const handleChange = (idx, e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) value = value.slice(-1);

    setCodes((prev) => {
      const next = [...prev];
      next[idx] = value;
      notifyFilled(next);         //여기서 채워진 상태 전달
      return next;
    });

    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !codes[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleResendClick = () => {
    setTimeLeft(180);
    const empty = Array(6).fill("");
    setCodes(empty);
    notifyFilled(empty);          //다시 받기 시 false 전달
    if (onResend) onResend();
  };

  return (
    <section className="w-full flex flex-col gap-4 mt-10">
      {/* 타이틀 + 설명 */}
      <div className="flex flex-col gap-1">
        <p className="text-head-semibold-20 text-black-90">인증코드 입력</p>
        <p className="text-body-regular-16 text-black-70">
          {email}로 전송된 인증코드 6자리를 입력해 주세요
        </p>
      </div>

      {/* 타이머 박스 */}
      <div className="mt-2 flex justify-center">
        <div className="px-4 py-3 rounded-md bg-[#FFF4DF]">
          <span className="text-[24px] font-bold text-[#FC7E2A] leading-none">
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      {/* 6자리 코드 박스 */}
      <div className="mt-4 flex gap-3">
        {codes.map((val, idx) => {
          const hasValue = val !== "";

          return (
            <div
              key={idx}
              className={`w-[50px] h-[60px] rounded-md flex items-center justify-center
                ${
                  hasValue
                    ? "bg-white border border-[#FC7E2A]"     //입력된 칸: 흰색 + 주황 테두리
                    : "bg-black-10 border border-black-10"    // 빈 칸: 회색
                }`}
            >
              <input
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                ref={(el) => (inputRefs.current[idx] = el)}
                className="w-full h-full text-center bg-transparent outline-none text-[24px] font-bold text-black-90"
              />
            </div>
          );
        })}
      </div>

      {/* 인증코드 다시 받기 */}
      <button
        type="button"
        onClick={handleResendClick}
        className="self-center mt-2 text-body-semibold-14 text-black-50"
      >
        인증코드 다시 받기
      </button>
    </section>
  );
}

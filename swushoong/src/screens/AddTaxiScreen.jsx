// src/screens/AddTaxiScreen.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";

export default function AddTaxiScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== 모드 판별 =====
  // TaxiDetailScreen 에서 navigate("/add-taxi", { state: { mode: "edit", initialForm } })
  const isEditMode = location.state?.mode === "edit";
  const initialForm = location.state?.initialForm || {};

  // ===== 폼 상태 (edit 모드일 때 초기값 세팅) =====
  const [boarding, setBoarding] = useState(initialForm.boarding ?? ""); // 승차지
  const [alighting, setAlighting] = useState(initialForm.alighting ?? ""); // 하차지
  const [deadline, setDeadline] = useState(initialForm.deadline ?? ""); // 모집 마감 시각
  const [recruitCount, setRecruitCount] = useState(
    initialForm.recruitCount ?? ""
  ); // 모집 인원
  const [price, setPrice] = useState(initialForm.price ?? ""); // 예상 가격 (숫자만)
  const [description, setDescription] = useState(
    initialForm.description ?? ""
  ); // 추가 설명

  // 필수 값 모두 채워졌을 때만 버튼 활성화
  const canSubmit =
    boarding.trim().length > 0 &&
    alighting.trim().length > 0 &&
    deadline.trim().length > 0 &&
    recruitCount.trim().length > 0 &&
    price.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = {
      boarding,
      alighting,
      deadline,
      recruitCount,
      price,
      description,
    };

    if (isEditMode) {
      // TODO: 실제 수정 API 연동
      console.log("택시팟 수정 요청", payload);
    } else {
      // TODO: 실제 생성 API 연동
      console.log("택시팟 생성 요청", payload);
    }

    // 일단 이전 화면으로 (상세 페이지)
    navigate(-1);
  };

  return (
    <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        title={isEditMode ? "택시팟 수정" : "택시팟 생성"}
        onBack={() => navigate(-1)}
      />

      {/* 내용 영역 */}
      <main className="flex-1 px-4 pt-4 pb-[96px] overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* --- 승차지 --- */}
          <div className="flex flex-col gap-2">
            <p className="text-body-bold-16 text-black-90">승차지</p>
            <div className="w-full bg-black-10 rounded-[4px] px-4 py-4 flex items-center">
              <input
                type="text"
                value={boarding}
                onChange={(e) => setBoarding(e.target.value)}
                placeholder="ex) 화랑대역 2번출구"
                className="w-full bg-transparent outline-none text-body-regular-16 text-black-90 placeholder:text-black-50"
              />
            </div>
          </div>

          {/* --- 하차지 --- */}
          <div className="flex flex-col gap-2">
            <p className="text-body-bold-16 text-black-90">하차지</p>
            <div className="w-full bg-black-10 rounded-[4px] px-4 py-4 flex items-center">
              <input
                type="text"
                value={alighting}
                onChange={(e) => setAlighting(e.target.value)}
                placeholder="ex) 서울여대 50주년기념관"
                className="w-full bg-transparent outline-none text-body-regular-16 text-black-90 placeholder:text-black-50"
              />
            </div>
          </div>

          {/* --- 모집 마감 시각 / 모집 인원 --- */}
          <div className="flex flex-col gap-4">
            {/* 모집 마감 시각 */}
            <div className="flex flex-col gap-2">
              <p className="text-body-bold-16 text-black-90">모집 마감 시각</p>
              <div className="w-full bg-black-10 rounded-[4px] px-4 py-4 flex items-center">
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-transparent outline-none text-body-regular-16 text-black-90 placeholder:text-black-50"
                />
              </div>
            </div>

            {/* 모집 인원 */}
            <div className="flex flex-col gap-2">
              <p className="text-body-bold-16 text-black-90">모집 인원</p>
              <div className="w-full bg-black-10 rounded-[4px] px-4 py-4 flex items-center">
                <input
                  type="text"
                  value={recruitCount}
                  inputMode="numeric"
                  onChange={(e) => {
                    const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
                    setRecruitCount(onlyNumber);
                  }}
                  className="w-full bg-transparent outline-none text-body-regular-16 text-black-90 placeholder:text-black-50"
                />
                <span className="text-body-regular-16 text-black-50">명</span>
              </div>
            </div>
          </div>

          {/* --- 예상 가격 / 추가 설명 --- */}
          <div className="flex flex-col gap-4">
            {/* 예상 가격 */}
            <div className="flex flex-col gap-2">
              <p className="text-body-bold-16 text-black-90">예상 가격</p>
              <div className="w-full bg-black-10 rounded-[4px] px-4 py-4 flex items-center">
                <input
                  type="text"
                  value={price}
                  inputMode="numeric"
                  onChange={(e) => {
                    const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
                    setPrice(onlyNumber);
                  }}
                  className="w-full bg-transparent outline-none text-body-regular-16 text-black-90 placeholder:text-black-50"
                />
                <span className="text-body-regular-16 text-black-50">원</span>
              </div>
            </div>

            {/* 추가 설명 (선택) */}
            <div className="flex flex-col gap-2">
              <p className="text-body-bold-16 text-black-90">
                추가 설명{" "}
                <span className="text-body-bold-16 text-black-40">(선택)</span>
              </p>
              <div className="w-full bg-black-10 rounded-[4px] px-4 py-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={
                    "동승슈니들이 총대슈니를 잘 알아 볼 수 있도록 자세한\n위치와 인상착의를 설명하면 좋아요. (100자 내외)"
                  }
                  className="w-full h-[140px] resize-none bg-transparent outline-none text-body-regular-14 text-black-70 placeholder:text-black-50"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== 하단 버튼 ===== */}
      <div className="px-4 pb-6">
        <BtnLong
          label={isEditMode ? "수정 완료" : "택시팟 생성"}
          variant={canSubmit ? "primary" : "disabled"}
          disabled={!canSubmit}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}

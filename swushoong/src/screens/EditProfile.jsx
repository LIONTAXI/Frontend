// src/screens/EditProfile.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProfileImg from "../assets/img/profileIMG.svg";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 프로필 영역 클릭 → 파일 선택창 열기
  const handleClickProfile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 미리보기 이미지로 반영
  const handleChangeFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // TODO: 나중에 이 file 을 FormData로 묶어서 프로필 수정 API에 보내면 됨
  };

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <Header
        title="프로필 수정"
        onBack={() => navigate(-1)}
      />

      {/* 콘텐츠 */}
      <main className="flex-1 px-4 pt-10 pb-6 flex flex-col items-center">
        {/* 프로필 이미지 (클릭 영역) */}
        <button
          type="button"
          onClick={handleClickProfile}
          className="w-[100px] h-[100px] rounded-full border border-[#D6D6D6] overflow-hidden bg-[#D6D6D6] flex items-center justify-center"
        >
          <img
            src={previewUrl || ProfileImg}
            alt="프로필 이미지"
            className="w-full h-full object-cover"
          />
        </button>

        {/* 숨겨진 파일 인풋 */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleChangeFile}
        />

        {/* 이름/나이 */}
        <p className="mt-4 text-[20px] font-semibold text-[#444444]">
          박슈니 · 23
        </p>

        {/* 이메일 배지 */}
        <div className="mt-2 inline-flex px-4 py-2 bg-[#F5F5F5] rounded-full">
          <span className="text-[16px] font-semibold text-[#444444]">
            swuni123@swu.ac.kr
          </span>
        </div>
      </main>
    </div>
  );
}

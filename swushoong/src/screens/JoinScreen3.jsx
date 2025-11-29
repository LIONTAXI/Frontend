// src/screens/JoinScreen3.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import ImageIcon from "../assets/icon/icon_image.svg";

export default function JoinScreen3() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // 나중에 백엔드에서 인식 결과를 넣어 줄 자리
  const [userName, setUserName] = useState("");     
  const [studentId, setStudentId] = useState("");  

  const navigate = useNavigate();

  const handleBack = () => {
    window.history.back();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // TODO: 이후 백엔드 연결 시 여기서 setUserName / setStudentId 호출
  };

  const handleRegisterImage = () => {
    if (!selectedImage) return;
    console.log("도서관 전자출입증 이미지 등록:", selectedImage);

    // 지금은 일단 성공으로 보냄
    navigate("/verify-result", {
      state: { success: false },
    });
  };

  const canSubmit = !!selectedImage;

  // 자리수를 맞추기 위한 더미 텍스트 (보이지 않지만 폭은 유지)
  const nameDisplay = userName || "김슈니";          
  const idDisplay = studentId || "2021111222";      

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      {/* ===== 헤더 ===== */}
      <Header title="2차 인증" onBack={handleBack} />

      {/* ===== 메인 콘텐츠 ===== */}
      <main className="flex-1 px-4 pt-8 pb-4">
        <section className="w-full max-w-[361px] mx-auto flex flex-col gap-6">
          {/* 타이틀 & 설명 */}
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">
              도서관 전자출입증 인증
            </p>
            <p className="text-body-regular-16 text-black-70">
              서울여자대학교 전자출입증 화면을 등록해주세요
            </p>
          </div>

          {/* 업로드 박스 */}
          <div className="mt-6 flex justify-center">
            <label
              htmlFor="library-card-upload"
              className={`w-[200px] h-[200px] rounded-lg flex items-center justify-center 
                cursor-pointer overflow-hidden
                ${
                    previewUrl
                    ? "bg-white border border-black-20"   // 이미지 선택 시: 흰 배경 + 테두리
                    : "bg-black-10 border border-transparent" // 미선택 시: 회색 박스, 테두리 없음
                }`}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="업로드된 전자출입증"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={ImageIcon}
                  alt="이미지 업로드 아이콘"
                  className="w-10 h-10"
                />
              )}
            </label>
            <input
              id="library-card-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 이미지가 선택된 경우에만 이름/학번 영역 표시 (이미지 기준 가운데 정렬) */}
          {selectedImage && (
            <div className="mt-8 flex flex-col items-center gap-3 text-body-regular-16">
              {/* 폭을 이미지와 동일하게 200px로 고정*/}
              <div className="w-[150px] flex justify-between">
                <span className="text-black-50">이름</span>
                <span
                  className={
                    userName
                      ? "text-black-90 font-semibold"
                      : "text-black-90 font-semibold opacity-0"
                  }
                >
                  {nameDisplay}
                </span>
              </div>
              <div className="w-[150px] flex justify-between">
                <span className="text-black-50">학번</span>
                <span
                  className={
                    studentId
                      ? "text-black-90 font-semibold"
                      : "text-black-90 font-semibold opacity-0"
                  }
                >
                  {idDisplay}
                </span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ===== 하단 버튼 ===== */}
      <div className="px-4 pb-6">
        <BtnLong
          label="이미지 등록"
          variant={canSubmit ? "primary" : "disabled"}
          disabled={!canSubmit}
          onClick={handleRegisterImage}
          className="w-full"
        />
      </div>
    </div>
  );
}

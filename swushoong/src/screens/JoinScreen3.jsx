// src/screens/JoinScreen3.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import ImageIcon from "../assets/icon/icon_image.svg";

import { signupLibraryOcr } from "../api/auth";

export default function JoinScreen3() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // 새 이미지를 선택하면 이전 인식 결과는 초기화
    setUserName("");
    setStudentId("");
  };

  // 이미지로 OCR 요청 보내고, 응답 결과를 화면에 반영만 하는 함수
  const handleRegisterImage = async () => {
    if (!selectedImage || isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("[JoinScreen3] OCR 요청 이미지:", selectedImage);

      const formData = new FormData();
      formData.append("image", selectedImage);

      for (const [k, v] of formData.entries()) {
        console.log("formData entry:", k, v);
      }

      const data = await signupLibraryOcr(formData);
      console.log("[JoinScreen3] signupLibraryOcr 성공:", data);

      if (data.extractedName) setUserName(data.extractedName);
      if (data.extractedStudentId) setStudentId(data.extractedStudentId);
    } catch (err) {
      console.error("[JoinScreen3] signupLibraryOcr 실패:", err);
      navigate("/verify-result", {
        state: { success: false },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 버튼 클릭 시 동작:
  // 1) 아직 이름/학번이 없으면 OCR 요청 실행
  // 2) 이미 이름/학번이 채워져 있으면 결과 화면으로 이동
  const handlePrimaryClick = () => {
    if (!selectedImage || isSubmitting) return;

    const hasResult = !!userName && !!studentId;

    if (!hasResult) {
      handleRegisterImage();
    } else {
      navigate("/verify-result", {
        state: {
          success: true,
          userName,
          studentId,
        },
      });
    }
  };

  const canSubmit = !!selectedImage && !isSubmitting;
  const hasResult = !!userName && !!studentId;

  const nameDisplay = userName || "김슈니";
  const idDisplay = studentId || "2021111222";

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      <Header title="2차 인증" onBack={handleBack} />

      <main className="flex-1 px-4 pt-8 pb-4">
        <section className="w-full max-w-[361px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">
              도서관 전자출입증 인증
            </p>
            <p className="text-body-regular-16 text-black-70">
              서울여자대학교 전자출입증 화면을 등록해주세요
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <label
              htmlFor="library-card-upload"
              className={`w-[200px] h-[200px] rounded-lg flex items-center justify-center 
                cursor-pointer overflow-hidden
                ${
                  previewUrl
                    ? "bg-white border border-black-20"
                    : "bg-black-10 border border-transparent"
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

          {selectedImage && (
            <div className="mt-8 flex flex-col items-center gap-3 text-body-regular-16">
              <div className="w-[150px] flex items-center gap-8">
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
              <div className="w-[150px] flex items-center gap-8">
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

      <div className="px-4 pb-6">
        <BtnLong
          label={
            isSubmitting
              ? "처리 중..."
              : hasResult
              ? "인증 완료"
              : "이미지 등록"
          }
          variant={canSubmit ? "primary" : "disabled"}
          disabled={!canSubmit}
          onClick={handlePrimaryClick}
          className="w-full"
        />
      </div>
    </div>
  );
}

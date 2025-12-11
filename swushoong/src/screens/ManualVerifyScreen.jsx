import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BtnLong from "../components/BtnLong";
import ImageIcon from "../assets/icon/icon_image.svg";

export default function ManualVerifyScreen() {
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleBack = () => {
    window.history.back();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    console.log("수동 인증 제출:", { name, studentId, selectedImage });

    navigate("/verify-result", {
      state: { status: "success", method: "manual" },
    });
  };

  const canSubmit =
    !!selectedImage && name.trim().length > 0 && studentId.trim().length > 0;

  return (
    <div className="min-h-screen bg-white font-pretendard flex flex-col">
      {/* ===== 헤더 ===== */}
      <Header title="2차 인증" onBack={handleBack} />

      {/* ===== 메인 콘텐츠 ===== */}
      <main className="flex-1 ppx-4 pt-8 pb-4">
        <section className="w-full max-w-[361px] mx-auto flex flex-col gap-6">
          {/* 타이틀 & 설명 */}
          <div className="flex flex-col gap-1">
            <p className="text-head-semibold-20 text-black-90">
              도서관 전자출입증 인증
            </p>
            <p className="text-body-regular-16 text-black-70">
              서울여자대학교 전자출입증과 실명, 학번을 입력해 주세요
            </p>
          </div>

          {/* 업로드 박스 */}
          <div className="mt-6 flex justify-center">
            <label
              htmlFor="manual-library-card-upload"
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
              id="manual-library-card-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 이름 / 학번 입력 영역 */}
          <div className="mt-8 flex flex-col items-center gap-3 text-body-regular-16">
            {/* 이름 */}
            <div className="w-[160px] flex items-center gap-4">
              <span className="w-10 text-center text-black-50">이름</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-[110px] h-[37px] px-3 bg-black-10 outline-none text-black-90"
              />
            </div>

            {/* 학번 */}
            <div className="w-[160px] flex items-center gap-4">
              <span className="w-10 text-center text-black-50">학번</span>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-[110px] h-[37px] px-3 bg-black-10 outline-none text-black-90"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ===== 하단 버튼 ===== */}
      <div className="px-4 pb-6">
        <BtnLong
          label="완료"
          variant={canSubmit ? "primary" : "disabled"}
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full"
        />
      </div>
    </div>
  );
}

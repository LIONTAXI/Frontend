// src/screens/EditProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProfileImg from "../assets/img/profileIMG.svg";
import {
  getMyInfo,
  uploadProfileImage,
  fetchProfileImageWithAuth,
} from "../api/my";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 로그인 유저 ID (토큰 기반이지만, 로그인 안 된 상태 체크용으로만 사용)
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

  // 프로필 기본 정보
  const [profile, setProfile] = useState({
    imgUrl: null, // 서버가 주는 원래 경로 (ex. /api/users/3/profile-image)
    name: "",
    shortStudentId: "",
    email: "",
  });

  // 최초 진입 시 기존 정보 조회
  useEffect(() => {
    if (!USER_ID) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getMyInfo();
        const imgFromServer =
          data.profileImageUrl || data.imgUrl || data.imageUrl || null;

        const next = {
          imgUrl: imgFromServer,
          name: data.name ?? "",
          shortStudentId: data.shortStudentId ?? "",
          email: data.email ?? "",
        };
        setProfile(next);

        // 🔹 서버에 저장된 기존 프로필 이미지를 blob으로 받아서 미리보기로 사용
        if (imgFromServer) {
          const blobUrl = await fetchProfileImageWithAuth(imgFromServer);
          if (!cancelled && blobUrl) {
            setPreviewUrl(blobUrl);
          }
        }
      } catch (err) {
        console.error("[EditProfile] 프로필 정보 조회 실패:", err);
      }
    })();

    return () => {
      cancelled = true;
      // 필요하면 여기서 URL.revokeObjectURL(previewUrl) 정리 가능
    };
  }, [USER_ID]);

  // 프로필 영역 클릭 → 파일 선택창 열기
  const handleClickProfile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 미리보기 + 업로드 API 호출 + 서버 정보 재조회
  const handleChangeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 일단 로컬 미리보기 (blob URL)
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      const res = await uploadProfileImage(file);
      console.log("[EditProfile] 프로필 이미지 업로드 응답:", res);

      // 업로드 이후 서버 기준 최신 프로필 다시 조회
      const updated = await getMyInfo();
      const imgFromServer =
        updated.profileImageUrl || updated.imgUrl || updated.imageUrl || null;

      setProfile((prev) => ({
        ...prev,
        imgUrl: imgFromServer,
        name: updated.name ?? prev.name,
        shortStudentId: updated.shortStudentId ?? prev.shortStudentId,
        email: updated.email ?? prev.email,
      }));

      //    -> 방금 선택한 로컬 미리보기 이미지를 계속 유지
      //    -> 나갔다가 다시 들어오면 위 useEffect에서 서버 이미지를 blob으로 다시 불러옴
    } catch (err) {
      console.error("[EditProfile] 프로필 이미지 업로드 실패:", err);
    }
  };

  const displayName =
    profile.name && profile.shortStudentId
      ? `${profile.name} · ${profile.shortStudentId}`
      : "이름 · 학번";

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <Header title="프로필 수정" onBack={() => navigate(-1)} />

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

        {/* 이름/학번 */}
        <p className="mt-4 text-[20px] font-semibold text-[#444444]">
          {displayName}
        </p>

        {/* 이메일 배지 */}
        <div className="mt-2 inline-flex px-4 py-2 bg-[#F5F5F5] rounded-full">
          <span className="text-[16px] font-semibold text-[#444444]">
            {profile.email || "이메일 정보 없음"}
          </span>
        </div>
      </main>
    </div>
  );
}

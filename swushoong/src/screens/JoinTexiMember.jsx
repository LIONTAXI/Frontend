// src/screens/JoinTexiMember.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";

import {
  getJoinRequests,
  acceptJoinRequest,
} from "../api/taxi";

export default function JoinTexiMember() {
  const navigate = useNavigate();
  const location = useLocation();

  const taxiPotId = location.state?.taxiPotId;
  const [requests, setRequests] = useState([]);

  // 로그인 유저 id
  const rawUserId = localStorage.getItem("userId");
  const USER_ID = rawUserId ? Number(rawUserId) : null;

   useEffect(() => {
  if (!taxiPotId) return;

  getJoinRequests(taxiPotId)
    .then((list) => {
      console.log("[JoinTexiMember] getJoinRequests list:", list);

      const mapped = list.map((item) => ({
        // key + 수락 API용 id
        id: item.taxiUserId,
        name: item.name,
        // 명세에 age 없고 shortStudentId만 있어서 이걸 표시용으로 사용
        shortStudentId: item.shortStudentId,
        imgUrl: item.imgUrl,
        // 버튼 상태용 내부 status
        status:
          item.status === "ACCEPTED" ? "accepted" : "pending",
      }));

      setRequests(mapped);
    })
    .catch((err) => {
      console.error("[JoinTexiMember] 참여 요청 조회 실패:", err);
    });
}, [taxiPotId]);

  const handleAccept = async (id) => {
  try {
    await acceptJoinRequest(id); // /requests/{taxiUserId}/accept
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "accepted" } : item
      )
    );
  } catch (err) {
    console.error("[JoinTexiMember] 참여 요청 수락 실패:", err);
  }
};

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      <Header
        title="택시팟 참여 요청"
        onBack={() => navigate(-1)}
      />

      <main className="flex-1 px-4 pt-6 pb-6 overflow-y-auto">
        <p className="text-body-semibold-16 text-black-90 mb-6">
          택시팟 참여 요청이 왔어요
        </p>

        <div className="flex flex-col gap-6">
        {requests.map((item) => (
            <div
            key={item.id} 
            className="flex items-center justify-between"
            >
            <div className="flex items-center gap-3">
                {/* 프로필 이미지 명세에 맞게 */}
                <div className="w-11 h-11 rounded-full border border-black-20 bg-[#D9D9D9] overflow-hidden">
                {item.imgUrl && (
                    <img
                    src={item.imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    />
                )}
                </div>
                <span className="text-body-semibold-16 text-black-70">
                {item.name} · {item.shortStudentId}
                </span>
            </div>

            {item.status === "pending" ? (
                <button
                type="button"
                className="px-3 py-1.5 rounded bg-orange-main text-white text-body-semibold-14"
                onClick={() => handleAccept(item.id)}
                >
                요청 수락
                </button>
            ) : (
                <button
                type="button"
                disabled
                className="px-3 py-1.5 rounded bg-black-20 text-black-50 text-body-semibold-14 cursor-default"
                >
                수락 완료
                </button>
            )}
            </div>
        ))}
        </div>
      </main>
    </div>
  );
}

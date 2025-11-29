// src/screens/JoinTexiMember.jsx
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function JoinTexiMember() {
  const navigate = useNavigate();

  // 임시 더미 데이터 (나중에 API 연동 예정)
  const [requests, setRequests] = useState([
    { id: 1, name: "임슈니", age: 23, status: "pending" },
    { id: 2, name: "박슈니", age: 23, status: "pending" },
    { id: 3, name: "이슈니", age: 23, status: "pending" },
    { id: 4, name: "김슈니", age: 21, status: "accepted" }, // 수락 완료
  ]);

  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "accepted" } : item
      )
    );
  };

  return (
    <div className="w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
      {/* 상단 헤더 */}
      <Header
        title="택시팟 참여 요청"
        onBack={() => navigate(-1)}
      />

      {/* 내용 영역 */}
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
              {/* 프로필 + 이름/나이 */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border border-black-20 bg-[#D9D9D9]" />
                <span className="text-body-semibold-16 text-black-70">
                  {item.name} · {item.age}
                </span>
              </div>

              {/* 요청 수락 / 수락 완료 버튼 */}
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

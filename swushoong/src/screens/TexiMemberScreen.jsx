//src/screens/TaxiMemberScreen.jsx
//채팅_택시팟멤버_총대슈니 시점 

import React from "react";
import Header from "../components/Header";
import IconOut from '../assets/icon/icon_out.svg';

// === 더미 데이터 ===
const DUMMY_MEMBERS = [
    { name: "임슈니 · 23 (나)", isMe: true },
    { name: "박슈니 · 23", status: 'DONE', isMe: false },
    { name: "이슈니 · 23", status: 'WRITING', isMe: false },
    { name: "김슈니 · 21", status: 'WRITING', isMe: false },
];

export default function TaxiMemberScreen() {

    return (
        <div className="h-full h-screen bg-white font-pretendard flex flex-col"> 
            <Header title="택시팟 멤버" />

            <div className="bg-white flex flex-col flex-grow w-full space-y-4 px-4">
                <h1 className="text-head-semibold-20 text-[#000] mt-2">
                    택시팟 멤버 
                </h1>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {DUMMY_MEMBERS.map((member, index) => (
                        <div key={index} className="flex justify-between items-center">
                            {/* 왼쪽: 프로필 이미지 (임시 회색 원) + 이름 */}
                            <div className="flex items-center gap-2">
                                {/* 임시 프로필 원 */}
                                <div className={`w-10 h-10 rounded-full ${
                                    member.isMe ? 'border border-[#FC7E2A] bg-[#D6D6D6]' : 'bg-[#D6D6D6]'
                                }`}></div>
                                <span className="text-body-semibold-16 text-black-70">
                                    {member.name}
                                </span>
                            </div>  
                            
                            <div className="flex items-center gap-4">

                                {/* 정산 상태 버튼 */}
                                {member.isMe ? (
                                    <div className="w-[88px] h-8"></div>
                                ) : (
                                    <div className={`
                                        py-1.5 px-3 rounded 
                                        w-[88px] h-8 flex items-center justify-center 
                                    `}
                                        style={{ 
                                            backgroundColor: member.status === 'DONE' ? '#D6D6D6' : '#FC7E2A'
                                        }}
                                    >
                                        <span className="text-body-semibold-14"
                                                style={{ color: member.status === 'DONE' ? '#444' : '#FFF' }}>
                                            {member.status === 'DONE' ? '작성 완료' : '후기 작성'}
                                        </span>
                                    </div>
                                )}

                                {/* 멤버 내보내기 버튼 */}
                                <span className="flex items-center justify-center h-8">
                                    <button>
                                        <img src={IconOut} alt="멤버 내보내기"/>
                                    </button>
                                </span>                                
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 
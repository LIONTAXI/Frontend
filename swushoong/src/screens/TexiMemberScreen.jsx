import React from "react";
import IconLeft from '../assets/icon/icon_left.svg';
import IconOut from '../assets/icon/icon_out.svg';

// ------------------------------------
// 💡 더미 데이터 정의
// ------------------------------------
const DUMMY_MEMBERS = [
    { name: "임슈니 · 23 (나)", isMe: true },
    { name: "박슈니 · 23", status: 'DONE', isMe: false },
    { name: "이슈니 · 23", status: 'WRITING', isMe: false },
    { name: "김슈니 · 21", status: 'WRITING', isMe: false },
];

export default function TaxiMemberScreen() {

    return (
        <div className="px-4 bg-white min-h-screen"> 
            
            {/* 1. 상단 헤더 (CountScreen과 동일) */}
            <div className="flex items-center justify-between mb-6 mt-6">
                <div className="flex justify-start"> 
                    <button>
                        <img src={IconLeft} alt="뒤로가기"/>
                    </button>
                </div>
                <p className="head-regular-20 text-center flex-grow text-black-90">
                    택시팟 멤버  
                </p>
                <div className="w-10"></div>
            </div>

            {/* 2.  */}
            <div className="bg-white rounded-lg space-y-4">
                <h3 className="head-semibold-20 text-[#000]">
                    택시팟 멤버 
                </h3>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {DUMMY_MEMBERS.map((member, index) => (
                        <div key={index} className="flex justify-between items-center">
                            {/* 왼쪽: 프로필 이미지 (임시 회색 원) + 이름 */}
                            <div className="flex items-center gap-2">
                                {/* 임시 프로필 원 */}
                                <div className="w-10 h-10 rounded-full bg-[#D6D6D6]"></div> 
                                <span className="body-semibold-16 text-black-70">
                                    {member.name}
                                </span>
                            </div>  
                            
                            <div className="flex items-center gap-4">

                                {/* ⭐ 정산 상태 버튼 (조건부 렌더링) ⭐ */}
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
                                        <span className="body-semibold-14"
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
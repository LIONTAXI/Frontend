import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import IconCopy from "../assets/icon/icon_copy.svg";

// 더미 데이터 정의 
const DUMMY_FARE = 5000;

const DUMMY_MEMBERS = [
    { name: "이슈니 · 23 (나)", amount: 1250, isMe: true },
    { name: "박슈니 · 23", amount: 1250, isMe: false },
    { name: "임슈니 · 23", amount: 1250, isMe: false },
    { name: "김슈니 · 21", amount: 1250, isMe: false },
];

const DUMMY_ACCOUNT = "슈니은행 393-401-4953";

// 금액을 천 단위 콤마와 '원' 단위로 포맷팅하는 함수
const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
};


export default function PayMemberScreen() {
    const navigate = useNavigate();
    
    // 합계 금액 계산
    const totalPayment = DUMMY_MEMBERS.reduce((sum, member) => sum + member.amount, 0);
    
    return (
        <div className="h-full w-full bg-white max-w-[393px] mx-auto font-pretendard flex flex-col"> 
            <Header title="정산 정보" />

            {/* 2. 지불한 택시비 및 계좌 정보 (이미지 상단) */}
            <div className="flex-col flex-grow w-full space-y-4 px-4 py-4">
                <div className="w-full space-y-3">
                    {/* 택시비 */}
                    <div className="flex items-center">
                        <span className="text-head-semibold-20 text-black-40 mr-1">택시비</span>
                        <span className="text-head-semibold-20 text-[#FC7E2A]">
                            {formatCurrency(DUMMY_FARE)}원
                        </span>
                    </div>

                    {/* 계좌 정보 */}
                    <div className="flex items-center">
                        <span className="text-head-semibold-20 text-black-40 mr-1">계좌정보</span>
                        <div className="flex items-center">
                            <span className="text-head-semibold-20 text-black-90">
                                {DUMMY_ACCOUNT}
                            </span>
                            <button
                                className="flex items-center" 
                                onClick={() => {navigator.clipboard.writeText(DUMMY_ACCOUNT);}}
                            >
                                <img src={IconCopy} alt="복사" className="ml-2" /> {/* 이미지 크기 명시 권장 */}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. 인당 지불할 금액 섹션  */}
            <div className="bg-[#FFF4DF] h-screen flex-col flex-grow w-full px-4 pt-6 pb-64">
            <div className="bg-white rounded-lg p-4 space-y-4">
                <h3 className="text-head-semibold-20 text-[#000] mb-2 mt-0">
                    인당 지불할 금액
                </h3>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {DUMMY_MEMBERS.map((member, index) => (
                        <div key={index} className="flex justify-between items-center">
                            {/* 프로필 이미지*/}
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full ${
                                    member.isMe ? 'border border-[#FC7E2A] bg-[#D6D6D6]' : 'bg-[#D6D6D6]'
                                }`}></div>
                                <span className="text-body-semibold-16 text-black-70">
                                    {member.name}
                                </span>
                            </div>
                            
                            {/*  금액 */}
                            <span className="text-body-medium-14 text-black-70 rounded bg-black-10 py-1.5 px-3" >
                                {formatCurrency(member.amount)}원
                            </span>
                        </div>
                    ))}
                </div>

                {/* 구분선 */}
                <hr className="border-t border-dashed border-[#AAA] my-4" />

                {/* 합계 및 차액 */}
                <div className="space-y-4">
                    {/* 합계 */}
                    <div className="flex justify-between items-center">
                        <span className="text-body-regular-16 text-black-50">합계</span>
                        <span className="text-body-bold-16 text-[#FC7E2A]">
                            {formatCurrency(totalPayment)}원
                        </span>
                    </div>
                </div>
            </div>

            </div>
        </div>
    );
}
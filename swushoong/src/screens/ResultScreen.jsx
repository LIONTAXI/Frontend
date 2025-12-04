import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// 더미 데이터 정의 
const DUMMY_FARE = 5000;

const DUMMY_MEMBERS = [
    { name: "임슈니 · 23 (나)", amount: 1250, isMe: true },
    { name: "박슈니 · 23", amount: 1250, isMe: false },
    { name: "이슈니 · 23", amount: 1250, isMe: false },
    { name: "김슈니 · 21", amount: 1250, isMe: false },
];

const DUMMY_ACCOUNT = "슈니은행 393-401-4953";

// 금액을 천 단위 콤마와 '원' 단위로 포맷팅하는 함수
const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
};


export default function ResultScreen() {
    const navigate = useNavigate();
    
    // 합계 금액 계산
    const totalPayment = DUMMY_MEMBERS.reduce((sum, member) => sum + member.amount, 0);
    // 차액 계산
    const difference = DUMMY_FARE - totalPayment; 
    
    return (
        <div className="h-full w-full bg-white max-w-[393px] mx-auto font-pretendard flex flex-col"> 
            <Header title="정산 정보" />

            {/* 2. 지불한 택시비 및 계좌 정보 (이미지 상단) */}
            <div className="flex-col flex-grow w-full space-y-4 px-4 pb-8">
                {/* 지불한 택시비 */}
                <div className="space-y-1 mb-0">
                    <p className="text-head-semibold-20 text-black-90">지불한 택시비</p>

                    {/* 금액이 표시되는 회색 영역 */}
                    <div className="relative h-12
                                    flex p-4 justify-start self-stretch items-center
                                    rounded bg-black-10 ">
                        
                        <div className="flex items-baseline gap-1"> 
            
                            {/* 금액 부분  */}
                            <span className="text-body-regular-16 text-black-90">
                                {formatCurrency(DUMMY_FARE)} 
                            </span>
            
                            {/* '원' 부분  */}
                            <span className="text-body-regular-16 text-black-50">
                                원 
                            </span>
                        </div>
                    </div>
                </div>

                {/* 계좌 정보 */}
                <div className="space-y-1 mt-0">
                    <h2 className="text-head-semibold-20 text-black-90">계좌정보</h2>
                    <p className="text-body-regular-16 text-[#7E7E7E] -mt-1 mb-2">
                        정확한 은행명과 계좌번호를 입력해 주세요
                    </p>
                    <div className="flex items-center self-stretch rounded p-4 bg-black-10">
                        <span className="text-body-regular-16 text-black-90">
                            {DUMMY_ACCOUNT}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. 인당 지불할 금액 섹션  */}
            <div className="bg-[#FFF4DF] w-[393px] h-screen flex-col flex-grow w-full px-4 pt-6 pb-56">
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
                    {/* 차액 */}
                    <div className="flex justify-between items-center">
                        <span className="text-body-regular-16 text-black-50">차액</span>
                        <span className={`text-body-bold-16 ${difference === 0 ? 'text-black-90' : 'text-red-500'}`}>
                            {formatCurrency(difference)}원
                        </span>
                    </div>
                </div>
            </div>
            
            {/* 4. 정산 요청하기 버튼 (이미지 하단 고정) */}
            <div className="fixed bottom-10 z-10 w-full max-w-[393px] left-1/2 -translate-x-1/2 flex flex-col flex-grow space-y-4 px-4">
                <button 
                    onClick={() => navigate("/chat/:chatId", { state: { settlementCompleted: true } })}
                    className="w-full h-14 p-3 bg-[#FC7E2A] text-white rounded justify-center items-center text-body-semibold-16"
                >
                    정산 요청하기
                </button>
            </div>

            </div>
        </div>
    );
} 
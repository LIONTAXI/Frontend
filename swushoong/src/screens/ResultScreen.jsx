import React from "react";
import IconLeft from '../assets/icon/icon_left.svg';

// ------------------------------------
// 💡 더미 데이터 정의
// ------------------------------------
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
    
    // 합계 금액 계산
    const totalPayment = DUMMY_MEMBERS.reduce((sum, member) => sum + member.amount, 0);
    // 차액 계산
    const difference = DUMMY_FARE - totalPayment; 
    
    // 이 컴포넌트는 CountScreen과 동일한 부모 컨테이너(w-[360px] 등) 내에서 렌더링됩니다.
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
                    정산 정보
                </p>
                <div className="w-10"></div>
            </div>

            {/* 2. 지불한 택시비 및 계좌 정보 (이미지 상단) */}
            <div className="space-y-4 mb-5">
                {/* 지불한 택시비 */}
                <div className="space-y-1 mb-0">
                    <p className="head-semibold-20 text-black-90">지불한 택시비</p>

                    {/* 금액이 표시되는 회색 영역 */}
                    <div className="relative h-12
                                    flex p-4 justify-start self-stretch items-center
                                    rounded bg-black-10 ">
                        
                        <div className="flex items-baseline gap-1"> 
            
                            {/* 1. 금액 부분 (더 굵거나 큰 스타일) */}
                            <span className="body-regular-16 text-black-90">
                                {formatCurrency(DUMMY_FARE)} 
                            </span>
            
                            {/* 2. '원' 부분 (다른 CSS 적용 가능) */}
                            <span className="body-regular-16 text-black-50">
                                원 
                            </span>
                        </div>
                    </div>
                </div>

                {/* 계좌 정보 */}
                <div className="space-y-1 mt-0">
                    <h2 className="head-semibold-20 text-black-90">계좌정보</h2>
                    <p className="body-regular-16 text-[#7E7E7E] -mt-1 mb-2">
                        정확한 은행명과 계좌번호를 입력해 주세요
                    </p>
                    <div className="flex items-center self-stretch rounded p-4 bg-black-10">
                        <span className="text-body-regular-16 text-black-90">
                            {DUMMY_ACCOUNT}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. 인당 지불할 금액 섹션 (노란색 배경) */}
            <div className="bg-[#FFF4DF] px-4 py-6">
            <div className="bg-white rounded-lg p-4 space-y-4">
                <h3 className="head-semibold-20 text-[#000] mb-2 mt-0">
                    인당 지불할 금액
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
                            
                            {/* 오른쪽: 금액 */}
                            <span className="body-medium-14 text-black-70 rounded bg-black-10 py-1.5 px-3" >
                                {formatCurrency(member.amount)}원
                            </span>
                        </div>
                    ))}
                </div>

                {/* 구분선 (대시드 보더) */}
                <hr className="border-t border-dashed border-[#AAA] my-4" />

                {/* 합계 및 차액 */}
                <div className="space-y-4">
                    {/* 합계 */}
                    <div className="flex justify-between items-center">
                        <span className="body-regular-16 text-black-50">합계</span>
                        <span className="body-bold-16 text-[#FC7E2A]">
                            {formatCurrency(totalPayment)}원
                        </span>
                    </div>
                    {/* 차액 */}
                    <div className="flex justify-between items-center">
                        <span className="body-regular-16 text-black-50">차액</span>
                        {/* 차액이 0이면 검은색, 아니면 주황색 등으로 표시 */}
                        <span className={`body-bold-16 ${difference === 0 ? 'text-black-90' : 'text-red-500'}`}>
                            {formatCurrency(difference)}원
                        </span>
                    </div>
                </div>
            </div>
            
            {/* 4. 정산 요청하기 버튼 (이미지 하단 고정) */}
            <div className="pt-8">
                <button 
                    className="w-full h-12 px-4 bg-[#FC7E2A] text-white rounded-lg body-semibold-16"
                >
                    정산 요청하기
                </button>
            </div>

            </div>
        </div>
    );
}
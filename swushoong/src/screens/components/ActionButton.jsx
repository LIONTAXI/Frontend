// src/components/ActionButton.jsx

import React from 'react';

// 매칭 상태에 따른 액션 버튼 컴포넌트
const ActionButton = ({ status, onClick, isHost, isSettlementEntered, isSettled }) => {
    
    const shouldRenderButton =
    // 매칭 active → 방장만 “매칭 종료하기”
    (status === 'active' && isHost) ||

    // 매칭 ended + 정산 입력 전 → 방장만 “정산 정보 입력하기"
    (status === 'ended' && !isSettlementEntered && isHost) ||

    // 매칭 ended + 정산 입력 완료 → 방장/참여자 모두 “정산 현황 보기”
    (status === 'ended' && isSettlementEntered) ||

    // 최종 정산 완료 → 방장만 “택시팟 종료하기”
    (isSettled && isHost);


    let text = "";
    let colorClass = "bg-[#FC7E2A] text-white text-body-semibold-14"; // 버튼 색상 클래스
    
    if (isSettled && isHost) {
        text = "택시팟 종료하기";
        
    // 2. 매칭 active 상태 검사 (매칭 종료하기)
    } else if (status === 'active' && isHost) {
        text = "매칭 종료하기";

    // 3. 1차 정산 정보 입력 전 검사 (정산 정보 입력하기)
    } else if (status === 'ended' && !isSettlementEntered && isHost) {
        text = "정산 정보 입력하기";

    // 4. 1차 정산 정보 입력 후 검사 (정산 현황 보기)
    } else if (status === 'ended' && isSettlementEntered) {
        
        // isHost 여부에 따라 버튼 텍스트를 분리
        if (isHost) {
            text = "정산 현황 보기"; // 방장
        } else {
            text = "정산 정보 보기"; // 참여자
        }
    }

    if (!shouldRenderButton) return null; // 버튼 숨기기 

    return (
        <div className="w-full flex justify-center mt-5 mb-3">
            <button 
                onClick={onClick}
                className={`px-4 py-3 rounded-full text-body-semibold-14 shadow-sm hover:opacity-80 ${colorClass}`}
            >
                {text}
            </button>
        </div>
    );
};

export default ActionButton;
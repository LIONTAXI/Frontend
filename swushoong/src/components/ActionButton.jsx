import React from 'react';

const ActionButton = ({ status, onClick, isHost, isSettlementEntered, isSettled }) => {
    const shouldRenderButton =
    (status === 'active' && isHost) ||
    (status === 'ended' && !isSettlementEntered && isHost) ||
    (status === 'ended' && isSettlementEntered) ||
    (isSettled && isHost);


    let text = "";
    let colorClass = "bg-[#FC7E2A] text-white text-body-semibold-14"; 
    
    if (isSettled && isHost) {
        text = "택시팟 종료하기";
    } else if (status === 'active' && isHost) {
        text = "매칭 종료하기";
    } else if (status === 'ended' && !isSettlementEntered && isHost) {
        text = "정산 정보 입력하기";
    } else if (status === 'ended' && isSettlementEntered) {
        if (isHost) {
            text = "정산 현황 보기"; // 방장
        } else {
            text = "정산 정보 보기"; // 참여자
        }
    }

    if (!shouldRenderButton) return null; 

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
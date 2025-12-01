import React from "react";

const MailModal = ({ reason, onConfirm, onCancel }) => {
    return (
        // 배경
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-4 pt-8 w-[320px] rounded-lg shadow-2xl text-center">
                
                {/* 제목 및 사유 */}
                <h3 className="text-head-bold-20 text-black-90 mb-2">메일을 전송할까요?</h3>
                <p className="text-body-regular-16 text-black-90 mb-8">
                    반려사유: {reason}
                </p>
                
                {/* 버튼 영역 */}
                <div className="flex justify-between space-x-2">
                    <button 
                        onClick={onCancel} 
                        className="flex-1 bg-black-20 text-black-90 text-body-bold-16 py-3 rounded transition-colors duration-200 hover:bg-black-30"
                    >
                        취소
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="flex-1 bg-[#FC7E2A] text-white text-body-bold-16 py-3 rounded transition-colors duration-200 hover:bg-[#E66F00]"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};
export default MailModal;
import React, {useState }from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function CountScreen ({ onConfirm }) {
    const navigate = useNavigate();
    
    const [fare, setFare] = useState(''); // 지불한 택시비 
    const [account, setAccount] = useState(''); // 계좌번호 
    
    // 활성화 조건 확인 
    // 두 State 모두 값이 있을 때 활성화 됨 
    const isButtonActive = fare.length > 0 && account.length > 0;

    const handleFareChange = (e) => {
        setFare(e.target.value.trim()); 
    };
    
    const handleAccountChange = (e) => {
        setAccount(e.target.value.trim());
    };

    // 확인 버튼 클릭 핸들러
    const handleConfirmClick = () => {
        if (isButtonActive && onConfirm) {
            onConfirm(fare, account);
        }
        navigate("/send");
    };

  return (
    <div className="h-full bg-white font-pretendard flex flex-col">
        <Header title="정산 정보" />

        <div className="bg-white flex flex-col flex-grow w-full space-y-4 px-4">
        
        {/* 지불한 택시비 입력 필드 */}
        <div className="space-y-1 mb-0">
            <label 
                htmlFor="taxi-fare"
                className="text-head-semibold-20 text-black-90"
            >
                지불한 택시비
            </label>
            <div className="relative h-12 
                            flex p-4 justify-end items-center gap-x-2.5 
                            self-stretch rounded bg-black-10"
            >
                <input
                    id="taxi-fare"
                    type="text"
                    value={fare}
                    onChange={handleFareChange}
                    className="w-full text-body-regular-16 text-black-90 
                                focus:outline-none bg-transparent 
                                text-left overflow-hidden whitespace-nowrap"
                />

                {/* '원' 단위 */}
                <span className="flex-shrink-0 text-body-regular-16 text-black-50">
                    원
                </span>
            </div>
        </div>

        {/* 계좌 정보 입력 필드 */}
        <div className="space-y-1 mt-0">
            <h2 className="text-head-semibold-20 text-black-90">
                계좌정보
            </h2>
            <p className="text-body-regular-16 text-[#7E7E7E] -mt-1 mb-2">
                정확한 은행명과 계좌번호를 입력해 주세요
            </p>
            <div className="flex items-center gap-x-2.5 self-stretch
                            rounded p-4                
                            bg-black-10"
            >
                <input
                    type="text"
                    placeholder="ex) 슈니은행 110-012-345-6789"
                    value={account}
                    onChange={handleAccountChange}
                    className="w-full text-body-regular-16
                                text-black-90 bg-transparent 
                                focus:outline-none placeholder-black-50"
                />
            </div>
        </div>
        
      </div>
      
      {/* 확인 버튼 */}
      <div className="fixed bottom-10 z-10 w-[393px] left-1/2 -translate-x-1/2 flex flex-col flex-grow space-y-4 px-4">
        <button 
            onClick={handleConfirmClick}
            className={`w-full h-14 justify-center items-center body-semibold-16 rounded p-3 
                ${isButtonActive 
                    // 활성화 시
                    ? 'bg-[#FC7E2A] text-white' 
                    // 비활성화 시
                    : 'bg-black-20 text-black-70'
                }`}
            disabled={!isButtonActive}
        >
          확인
        </button>
      </div>
    </div>
  );
}
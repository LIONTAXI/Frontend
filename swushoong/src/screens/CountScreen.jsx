import React, {useState }from "react";
import IconLeft from '../assets/icon/icon_left.svg';

export default function CountScreen ({ onConfirm }) {
    // ⭐ 1. State 정의 ⭐
    const [fare, setFare] = useState(''); // 지불한 택시비 (contentEditable div 값)
    const [account, setAccount] = useState(''); // 계좌번호 (input 값)
    
    // ⭐ 2. 활성화 조건 확인 ⭐
    // 두 State 모두 값이 있고, 비어 있지 않은지 확인합니다.
    const isButtonActive = fare.length > 0 && account.length > 0;

    
    // ⭐ 3. 이벤트 핸들러 정의  ⭐
    const handleFareChange = (e) => {
        // 숫자와 쉼표 등을 허용하는 필터링 로직을 여기에 추가할 수 있습니다.
        setFare(e.target.value.trim()); 
    };
    
    // ⭐ 4. 이벤트 핸들러 정의 (일반 Input 전용) ⭐
    const handleAccountChange = (e) => {
        // 일반 input의 value를 상태로 저장
        setAccount(e.target.value.trim());
    };

    // ⭐ 3. 확인 버튼 클릭 핸들러: 상위 컴포넌트의 onConfirm 함수 호출 ⭐
    const handleConfirmClick = () => {
        if (isButtonActive && onConfirm) {
            onConfirm(fare, account);
        }
    };

  return (
    <div className="px-4 bg-white min-h-screen">

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

      {/* 2. 섹션 컨테이너: 정산 정보 입력 필드를 포함하도록 구조 변경 */}
      {/* 기존 리스트 아이템의 스타일을 입력 필드 그룹에 적용합니다. */}
      <div className="space-y-4 mb-5">
        
        {/* === A. 지불한 택시비 입력 필드 === */}
        <div className="space-y-1 mb-0">
            <label 
                htmlFor="taxi-fare"
                className="head-semibold-20 text-black-90"
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
                <span className="flex-shrink-0 body-regular-16 text-black-50">
                    원
                </span>
            </div>
        </div>

        {/* --- 섹션 구분선 --- */}

        {/* === B. 계좌 정보 입력 필드 === */}
        <div className="space-y-1 mt-0">
            <h2 className="head-semibold-20 text-black-90">
                계좌정보
            </h2>
            <p className="body-regular-16 text-[#7E7E7E] -mt-1 mb-2">
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
                    className="w-full body-regular-16
                                text-black-90 bg-transparent 
                                focus:outline-none placeholder-black-50"
                />
            </div>
        </div>
        
      </div>
      
      {/* 3. 확인 버튼 (화면 하단에 배치) */}
      <div className="mt-[401px] w-full h-14">
        <button 
            onClick={handleConfirmClick}
            className={`w-full h-14 justify-center items-center body-semibold-16 rounded p-3 
                ${isButtonActive 
                    // 활성화 시: 진한 배경색 (bg-black-90), 흰색 텍스트 (text-white), 투명도 제거
                    ? 'bg-[#FC7E2A] text-white' 
                    // 비활성화 시: 옅은 배경색 (bg-black-20), 옅은 텍스트 (text-black-70), 투명도 50%
                    : 'bg-black-20 text-black-70'
                }`}
            // ⭐ disabled 속성 적용 ⭐
            disabled={!isButtonActive}
        >
          확인
        </button>
      </div>
    </div>
  );
}
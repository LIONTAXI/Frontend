import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import IconNotify from "../assets/img/chat_notify.svg"

// == 더미 데이터 ==
const DUMMY_FARE = 5000;
const DUMMY_MEMBERS = [
    { name: "임슈니 · 23 (나)", amount: 1250, isMe: true },
    { name: "박슈니 · 23", amount: 1250, status: 'DONE', isMe: false },
    { name: "이슈니 · 23", amount: 1250, status: 'PENDING', isMe: false },
    { name: "김슈니 · 21", amount: 1250, status: 'PENDING', isMe: false },
];
const DUMMY_ACCOUNT = "슈니은행 393-401-4953";

// 금액을 천 단위 콤마와 '원' 단위로 포맷팅하는 함수
const formatCurrency = (amount) => {
    return `${amount.toLocaleString()}`;
};

// 40분을 밀리초로 설정 (2,400,000 ms)
const COOL_DOWN_MS = 2400000; 
// 테스트를 위해 짧게 설정 (예: 5초)
const TEST_COOL_DOWN_MS = 5000;

export default function CurrentPayScreen() {

    const navigate = useNavigate();

    const [showTooltip, setShowTooltip] = useState(false);

    const [isDisabled, setIsDisabled] = useState(false);
    
    // 합계 금액 계산
    const totalPayment = DUMMY_MEMBERS.reduce((sum, member) => sum + member.amount, 0);

    // 차액 계산
    const difference = DUMMY_FARE - totalPayment; 
    
    const handleRemindClick = () => {
        // 이미 쿨타임 중이면 아무것도 하지 않음
        if (isDisabled) return;

        // 서버 전송 시뮬레이션 ... 
        console.log("미정산 요청 메일 전송 시도...");
        
        // (성공 메시지)
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 3000); // 3초만 보여줌
        
        // 쿨타임 시작 (버튼 비활성화)
        setIsDisabled(true); 

        // 쿨타임 타이머 설정
        setTimeout(() => {
            setIsDisabled(false); // 쿨타임 종료 후 버튼 활성화
            console.log("쿨타임 종료. 다시 조르기 가능.");
        }, TEST_COOL_DOWN_MS); // 테스트 시 5초, 실제 40분 시 COOL_DOWN_MS 사용
    };

    return (
        <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidde"> 
            <Header title="정산 현황" />

            {/* 지불한 택시비 및 계좌 정보 */}
            <div className="w-full space-y-4 px-4 pb-8">
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

            <div className="bg-white rounded-lg mt-14 space-y-4 flex-col flex-grow w-full space-y-4 px-4 pb-8">
                <h3 className="text-head-semibold-20 text-[#000]">
                    인당 지불할 금액
                </h3>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {DUMMY_MEMBERS.map((member, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full ${
                                    member.isMe ? 'border border-[#FC7E2A] bg-[#D6D6D6]' : 'bg-[#D6D6D6]'
                                }`}></div>
                                <span className="text-body-semibold-16 text-black-70">
                                    {member.name}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {/* 금액 */}
                                <span className="text-body-medium-14 text-black-70">
                                    {formatCurrency(member.amount)}원
                                </span>

                                {/* 정산 상태 버튼 */}
                                {member.isMe ? (
                                    <div className="w-[88px] h-8"></div>
                                ) : (
                                    <div className={`
                                        py-1.5 px-3 rounded 
                                        w-[88px] h-8 flex items-center justify-center 
                                    `}
                                        style={{ 
                                            backgroundColor: member.status === 'DONE' ? '#FC7E2A' : '#D6D6D6'
                                        }}
                                    >
                                        <span className="text-body-semibold-14"
                                                style={{ color: member.status === 'DONE' ? '#FFF' : '#444' }}>
                                            {member.status === 'DONE' ? '정산 완료' : '미정산'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            
            <div className="fixed bottom-10 z-10 w-full max-w-[393px] left-1/2 -translate-x-1/2 flex flex-col flex-grow space-y-4 px-4">
                {showTooltip && (
                    <div className="absolute right-4 bottom-14">
                        <img 
                            src={IconNotify} 
                            alt="40분 뒤에 다시 보낼 수 있어요" 
                            className="max-w-[180px] h-auto rounded-lg" 
                        /> 
                    </div>
                )}
                <button
                    onClick={handleRemindClick}
                    className={`w-full h-14 p-3 rounded justify-center items-center text-body-semibold-16 
                                ${isDisabled 
                                    ? 'bg-black-40 text-black-70' 
                                    : 'bg-orange-main text-white active:bg-[#AA561D]'
                                }
                                transition-colors duration-100`}
                >
                    미정산 동승슈니 조르기
                </button>
            </div>
        </div>
    );
} 
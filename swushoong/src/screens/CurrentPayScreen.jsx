import React,{useState, useEffect, useCallback} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import IconNotify from "../assets/img/chat_notify.svg";
import { getSettlementDetails, markParticipantPaid, remindSettlement } from "../api/settlements";
import { getCurrentUserId } from "../api/token";

const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === null) return '0';
    return `${amount.toLocaleString()}`;
};

// 2시간을 밀리초로 설정 
const COOL_DOWN_MS = 2 * 60 * 60 * 1000; 
const REMIND_COOL_DOWN = COOL_DOWN_MS;

export default function CurrentPayScreen() {

    const navigate = useNavigate();
    const location = useLocation();

    const chatRoomId = location.state?.chatRoomId;
    const partyId = location.state?.taxiPartyId || location.state?.partyId;

    const [settlementData, setSettlementData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false); // 재촉 버튼 쿨타임 상태
    
    // 실제 ID를 가져옵니다.
    const currentUserId = getCurrentUserId();
    
    const stateSettlementId = location.state?.settlementId || '';
    const settlementId = stateSettlementId || localStorage.getItem("currentSettlementId");

    // 정산 상세 정보 불러오기
    const loadSettlementDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const idToFetch = parseInt(settlementId, 10);

        if (isNaN(idToFetch) || idToFetch <= 0) {

         setError("정산 ID를 찾을 수 없습니다. (ID가 유효하지 않거나 0 이하)");
         setIsLoading(false);
         return;
         }

        try {
            // 정산 상세 조회
            const data = await getSettlementDetails(idToFetch); 
            setSettlementData(data);
        } catch (err) {
            const errorMessage = err.response?.message || "정산 현황을 불러오는 데 실패했습니다.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [settlementId]);

    // 쿨타임 로직
    useEffect(() => {
        loadSettlementDetails();
        
        const lastRemindTime = localStorage.getItem(`lastRemindTime_${settlementId}`);
        if (lastRemindTime) {
            const elapsedTime = Date.now() - parseInt(lastRemindTime, 10);
            if (elapsedTime < REMIND_COOL_DOWN) {
                setIsDisabled(true);
                // 남은 쿨타임 시간 후 버튼 활성화
                const remainingTime = REMIND_COOL_DOWN - elapsedTime;
                setTimeout(() => {
                    setIsDisabled(false);
                }, remainingTime);
            }
        }
    }, [loadSettlementDetails, settlementId]);


    // 정산 재촉 API 호출
    const handleRemindClick = async () => {
        if (isDisabled || !settlementData) return;
        
        setIsDisabled(true); // 쿨타임 시작 (버튼 비활성화)
        
        try {
            // 정산 재촉
            await remindSettlement(settlementData.settlementId);
            
            // 쿨타임 기록 및 툴팁 표시
            localStorage.setItem(`lastRemindTime_${settlementData.settlementId}`, Date.now().toString());
            setShowTooltip(true);
            
            setTimeout(() => setShowTooltip(false), 3000); // 3초 후 툴팁 숨김
            
            // 쿨타임 타이머 설정
            setTimeout(() => {
                setIsDisabled(false); // 쿨타임 종료 후 버튼 활성화
            }, REMIND_COOL_DOWN);
            
        } catch (err) {
            const errorMessage = err.response?.message || "정산 조르기에 실패했습니다.";
            setIsDisabled(true); // 실패 시 버튼 재활성화
        }
    };
    
    // 정산 완료 처리 핸들러 (총대만 가능)
    const handleMarkPaid = async (targetUserId) => {
        if (!settlementData) return;
        
        if (window.confirm(`${targetUserId}번 유저의 정산을 완료 처리하시겠습니까?`)) {
            try {
                // 참여자 정산 완료 처리 
                await markParticipantPaid(settlementData.settlementId, targetUserId);
                
                // 성공 후 정산 목록 갱신
                loadSettlementDetails(); 
            } catch (err) {
                const errorMessage = err.response?.message || "정산 완료 처리에 실패했습니다.";
                alert(`정산 완료 처리에 실패했습니다: ${errorMessage}`);
            }
        }
    };

    if (isLoading) return <div className="text-center p-8 text-black-90">정산 현황을 불러오는 중...</div>;
    if (error || !settlementData) return <div className="text-center p-8 text-red-500">{error || "정산 정보가 없습니다."}</div>;

    // API 데이터 구조 분해 및 가공
    const { totalFare, bankName, accountNumber, participants } = settlementData;
    const displayFare = totalFare;
    const displayAccount = `${bankName} ${accountNumber}`;

    const hostMember = participants.find(p => p.host);
    const isHost = hostMember && hostMember.userId === currentUserId;

    const sortedParticipants = [...participants].sort((a, b) => {
        // a.host가 true이고 b.host가 false이면 a를 앞으로 (a < b, -1 반환)
        if (a.host && !b.host) return -1;
        // a.host가 false이고 b.host가 true이면 b를 앞으로 (a > b, 1 반환)
        if (!a.host && b.host) return 1;
        // 나머지 경우는 순서 변경 없음 (0 반환)
        return 0;
    });

    const displayMembers = sortedParticipants.map(p => {
        const isMe = p.userId === currentUserId;
        return {
            ...p,
            name: `${p.name} · ${p.shortStudentId} ${isMe ? '(나)' : ''}`, 
            isMe: isMe,
            status: p.paid ? 'DONE' : 'PENDING',
        }
    });
    
    // 미정산 인원 확인 (조르기 버튼 활성화 조건)
    const pendingMembers = displayMembers.filter(m => m.status === 'PENDING' && !m.isMe);
    const hasPendingMembers = pendingMembers.length > 0;

    const handleGoBackToChat = () => {
        if (chatRoomId && partyId) {
            const isAllSettled = !hasPendingMembers;

            // 채팅 페이지 경로
            navigate(`/chat/${chatRoomId}/${partyId}`, { 
                replace: true,
                state: { 
                    isSettled: isAllSettled
                }
            });
        } else {
            // 필수 정보가 없으면 이전 화면으로 돌아가거나 홈으로 이동
            console.warn("채팅방 ID 또는 파티 ID가 없어 이전 채팅방으로 이동할 수 없습니다. 직전 페이지로 돌아갑니다.");
            navigate(-1); 
        }
    };

    return (
        <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidde"> 
            <Header title="정산 현황" onBack={handleGoBackToChat} />

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
                                {formatCurrency(displayFare)} 
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
                            {displayAccount}
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
                    {displayMembers.map((member) => (
                        <div key={member.userId} className="flex justify-between items-center">
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

                                {/* 정산 상태 버튼, 총대가 아니거나 이미 완료된 경우 버튼 비활성화 */}
                                {member.isMe ? (
                                    <div className="w-[88px] h-8"></div> // 총대 본인은 버튼 없음
                                ) : (
                                    <button 
                                        // 총대이면서 미정산 상태일 때만 클릭 가능
                                        onClick={() => isHost && member.status === 'PENDING' && handleMarkPaid(member.userId)}
                                        className={`
                                            py-1.5 px-3 rounded 
                                            w-[88px] h-8 flex items-center justify-center 
                                        `}
                                        style={{ 
                                            backgroundColor: member.status === 'DONE' ? '#FC7E2A' : '#D6D6D6'
                                        }}
                                        // 총대가 아니거나, 이미 완료된 경우 버튼 비활성화
                                        disabled={!isHost || member.status === 'DONE'} 
                                    >
                                        <span className="text-body-semibold-14"
                                            style={{ color: member.status === 'DONE' ? '#FFF' : '#444' }}>
                                            {member.status === 'DONE' ? '정산 완료' : '미정산'}
                                        </span>
                                    </button>
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
                            alt={`${REMIND_COOL_DOWN / 60000}분 뒤에 다시 보낼 수 있어요`}
                            className="max-w-[180px] h-auto rounded-lg" 
                        /> 
                    </div>
                )}
                {isHost && ( // 총대에게만 조르기 버튼 노출
                    <button
                        onClick={handleRemindClick}
                        className={`w-full h-14 p-3 rounded justify-center items-center text-body-semibold-16 
                                    ${!hasPendingMembers || isDisabled 
                                        ? 'bg-black-40 text-black-70' 
                                        : 'bg-orange-main text-white active:bg-[#AA561D]'
                                    }
                                    transition-colors duration-100`}
                        // 미정산자가 없거나 쿨타임 중이면 비활성화
                        disabled={!hasPendingMembers || isDisabled}
                    >
                        미정산 동승슈니 조르기
                    </button>
                )}
            </div>
        </div>
    );
} 
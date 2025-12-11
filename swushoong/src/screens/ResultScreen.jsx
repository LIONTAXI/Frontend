// 정산 정보 확인 페이지 -> 정산 요청하기 -> 채팅방 복귀 

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getSettlementDetails, remindSettlement } from "../api/settlements";
// 현재 로그인 유저 ID를 가져오는 함수 (host 판단에 사용)
import { getCurrentUserId } from "../api/token";

// 금액을 천 단위 콤마와 '원' 단위로 포맷팅하는 함수
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === null) return '0'; 
    return `${amount.toLocaleString()}`;
};

export default function ResultScreen() {
    const navigate = useNavigate();
    
    const [settlementData, setSettlementData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const currentUserId = getCurrentUserId(); // 현재 로그인한 사용자 ID
    const chatRoomId = localStorage.getItem("currentChatRoomId");

    // API 연결: 정산 상세 정보 불러오기
    const loadSettlementDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        // 정산 ID를 로컬 스토리지에서 가져옴 (CountScreen에서 저장한 값)
        const settlementId = localStorage.getItem("currentSettlementId"); 
        
        if (!settlementId) {
            setError("❌ 정산 ID를 찾을 수 없습니다. (CountScreen에서 넘어오지 않음)");
            setIsLoading(false);
            return;
        }

        try {
            // API 호출: 정산 상세 조회 (GET /api/settlements/{settlementId})
            const data = await getSettlementDetails(parseInt(settlementId, 10));
            setSettlementData(data);
        } catch (err) {
            const errorMessage = err.response?.message || "정산 정보를 불러오는 데 실패했습니다.";
            console.error("❌ 정산 상세 조회 실패:", errorMessage, err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // 🚨 chatRoomId가 없으면 로딩을 멈추고 에러 표시
        if (!chatRoomId) {
            setError("❌ 채팅방 ID 정보가 누락되어 복귀할 수 없습니다.");
            setIsLoading(false);
            return;
        }
        loadSettlementDetails();
    }, [loadSettlementDetails, chatRoomId]);

    // 로딩 및 에러 상태 처리
    if (isLoading) {
        return <div className="text-center p-8 text-black-90">정산 정보를 불러오는 중...</div>;
    }
    if (error || !settlementData) {
        return <div className="text-center p-8 text-red-500">{error || "정산 정보가 없습니다."}</div>;
    }

    // API 데이터 구조 분해
    const { totalFare, bankName, accountNumber, participants } = settlementData;
    
    // UI에 맞게 데이터 가공
    const displayFare = totalFare;
    const displayAccount = `${bankName} ${accountNumber}`;

    const sortedParticipants = [...participants].sort((a, b) => {
        // a.host가 true이고 b.host가 false이면 a를 앞으로 (a < b, -1 반환)
        if (a.host && !b.host) return -1;
        // a.host가 false이고 b.host가 true이면 b를 앞으로 (a > b, 1 반환)
        if (!a.host && b.host) return 1;
        // 나머지 경우는 순서 변경 없음 (0 반환)
        return 0;
    });

    
    const displayMembers = sortedParticipants.map(p => {
        const isMe = p.userId === currentUserId; // 현재 유저 ID와 비교
        
        return {
            ...p,
            name: `${p.name} · ${p.shortStudentId} ${isMe ? '(나)' : ''}`, 
            isMe: isMe,
        }
    });

    // 합계 금액 계산
    const totalPayment = displayMembers.reduce((sum, member) => sum + member.amount, 0);
    // 차액 계산
    const difference = displayFare - totalPayment; 
    
    // 정산 요청하기 버튼 클릭 핸들러 (채팅방 이동만 담당)
    const handleRequestSettlement = async () => {
        const taxiPartyId = settlementData.taxiPartyId;
        const settlementId = settlementData.settlementId;

        try {
            // 서버에서 createSettlement 후 바로 알림을 보내지 않는다면,
            // 클라이언트가 이 알림 API를 호출해야 동승자에게 시스템 메시지가 전파됩니다.
            await remindSettlement(settlementId); 
            console.log("✅ 정산 요청(알림) API 호출 성공.");

        } catch (error) {
            console.error("❌ 정산 요청 알림 전송 실패:", error);
            alert("정산 요청 알림 전송에 실패했습니다. 채팅방으로 이동합니다.");
        }

        const returnPath = `/chat/${chatRoomId}/${taxiPartyId}`;

        localStorage.removeItem("currentSettlementId");
        localStorage.removeItem("currentChatRoomId");

        navigate(returnPath, { 
            replace: true, // 뒤로가기 스택에서 정산 화면을 제거
            state: { 
                settlementCompleted: true, 
                settlementId: settlementData.settlementId 
            } 
        });
    };

    return (
        <div className="h-full w-full bg-white max-w-[393px] mx-auto font-pretendard flex flex-col"> 
            <Header title="정산 정보" onBack={() => navigate(-1)} />

            {/* 2. 지불한 택시비 및 계좌 정보*/}
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

            {/* 3. 인당 지불할 금액 섹션  */}
            <div className="bg-[#FFF4DF] w-[393px] h-screen flex-col flex-grow w-full px-4 pt-6 pb-56">
            <div className="bg-white rounded-lg p-4 space-y-4">
                <h3 className="text-head-semibold-20 text-[#000] mb-2 mt-0">
                    인당 지불할 금액
                </h3>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {displayMembers.map((member, index) => (
                        <div key={member.userId || index} className="flex justify-between items-center">
                            {/* 프로필 이미지*/}
                            <div className="flex items-center gap-2">
                                {/* member.imgUrl이 있다면 추가. 현재는 더미 배경색 유지 */}
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
                    onClick={handleRequestSettlement}
                    className="w-full h-14 p-3 bg-[#FC7E2A] text-white rounded justify-center items-center text-body-semibold-16"
                >
                    정산 요청하기
                </button>
            </div>

            </div>
        </div>
    );
} 
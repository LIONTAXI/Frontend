// 정산 정보 확인 페이지 (참여자용-동승슈니)

import React, {useState, useEffect, useCallback} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import IconCopy from "../assets/icon/icon_copy.svg";
import { getSettlementDetails } from "../api/settlements";
// 현재 로그인 유저 ID를 가져오는 함수
import { getCurrentUserId } from "../api/token";

// 금액을 천 단위 콤마와 '원' 단위로 포맷팅하는 함수
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === null) return '0';
    return `${amount.toLocaleString()}`;
};


export default function PayMemberScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [settlementData, setSettlementData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 실제 ID를 가져옵니다.
    const currentUserId = getCurrentUserId(); 
    const chatRoomId = location.state?.chatRoomId;
    const partyId = location.state?.taxiPartyId;

    const settlementIdFromState = location.state?.settlementId;
    const settlementId = settlementIdFromState || localStorage.getItem("currentSettlementId");

    // API 연결: 정산 상세 정보 불러오기
    const loadSettlementDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        if (!settlementId || typeof settlementId !== 'number' || settlementId <= 0) {
            setError("❌ 정산 ID를 찾을 수 없거나 유효하지 않습니다.");
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
    }, [settlementId]);

    useEffect(() => {
        loadSettlementDetails();
    }, [loadSettlementDetails]);

    const handleGoBackToChat = () => {
        if (chatRoomId && partyId) {
            navigate(`/chat/${chatRoomId}/${partyId}`); 
        } else {
            // 필수 ID가 없다면 안전하게 이전 페이지로 돌아가거나 목록으로 이동
            navigate(-1); 
        }
    };

    if (isLoading) return <div className="text-center p-8 text-black-90">정산 정보를 불러오는 중...</div>;
    if (error || !settlementData) return <div className="text-center p-8 text-red-500">{error || "정산 정보가 없습니다."}</div>;

    // API 데이터 구조 분해 및 가공
    const { totalFare, bankName, accountNumber, participants } = settlementData;
    const displayFare = totalFare;
    const displayAccount = `${bankName} ${accountNumber}`;

    const displayMembers = participants.map(p => {
        const isMe = p.userId === currentUserId; // 현재 유저 ID와 비교
        return {
            ...p,
            name: `${p.name} · ${p.shortStudentId} ${isMe ? '(나)' : ''}`, 
            isMe: isMe,
        }
    });

    // 합계 금액 계산
    const totalPayment = displayMembers.reduce((sum, member) => sum + member.amount, 0);

    // 계좌 복사 핸들러
    const handleCopyAccount = () => {
        const textToCopy = displayAccount;
        navigator.clipboard.writeText(textToCopy);
        alert(`계좌 정보가 복사되었습니다: ${textToCopy}`);
    };

    return (
        <div className="h-full w-full bg-white max-w-[393px] mx-auto font-pretendard flex flex-col"> 
            <Header title="정산 정보" onBack={handleGoBackToChat} />

            {/* 2. 지불한 택시비 및 계좌 정보 */}
            <div className="flex-col flex-grow w-full space-y-4 px-4 py-4">
                <div className="w-full space-y-3">
                    {/* 택시비 */}
                    <div className="flex items-center">
                        <span className="text-head-semibold-20 text-black-40 mr-1">택시비</span>
                        <span className="text-head-semibold-20 text-[#FC7E2A]">
                            {formatCurrency(displayFare)}원
                        </span>
                    </div>

                    {/* 계좌 정보 */}
                    <div className="flex items-center">
                        <span className="text-head-semibold-20 text-black-40 mr-1">계좌정보</span>
                        <div className="flex items-center">
                            <span className="text-head-semibold-20 text-black-90">
                                {displayAccount}
                            </span>
                            <button
                                className="flex items-center" 
                                onClick={handleCopyAccount}
                            >
                                <img src={IconCopy} alt="복사" className="ml-2" /> {/* 이미지 크기 명시 권장 */}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. 인당 지불할 금액 섹션  */}
            <div className="bg-[#FFF4DF] h-screen flex-col flex-grow w-full px-4 pt-6 pb-64">
            <div className="bg-white rounded-lg p-4 space-y-4">
                <h3 className="text-head-semibold-20 text-[#000] mb-2 mt-0">
                    인당 지불할 금액
                </h3>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {displayMembers.map((member) => (
                        <div key={member.userId} className="flex justify-between items-center">
                            {/* 프로필 이미지*/}
                            <div className="flex items-center gap-2">
                                {/* member.imgUrl이 있다면 사용. 현재는 더미 배경색 유지 */}
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
                </div>
            </div>

            </div>
        </div>
    );
}
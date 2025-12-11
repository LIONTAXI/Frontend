import React, {useState, useMemo, useEffect, useCallback }from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { createSettlement, getTaxiPartyDetails, getPartyRequests, getCurrentSettlementId } from "../api/settlements";
import {getCurrentUserId} from "../api/token";

const EMPTY_PARTICIPANTS = [];

export default function CountScreen () {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. State에서 택시팟 ID와 Host 여부 정보만 추출 (참여자 목록은 API로 조회)
    const { 
        taxiPartyId: receivedTaxiPartyId, 
        isHost: receivedIsHost,
        isSettlementEntered: initialIsSettlementEntered = false,
        participants: initialParticipants = EMPTY_PARTICIPANTS,
        chatRoomId: receivedChatRoomId 
    } = location.state || {};

    // 2. 상태 정의
    const [fare, setFare] = useState(''); // 사용자가 입력한 총 택시비
    const [account, setAccount] = useState(''); // 계좌번호
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [fetchedDetails, setFetchedDetails] = useState(null); // 택시팟 상세 정보
    const [finalParticipants, setFinalParticipants] = useState(initialParticipants); 
    
    const finalTaxiPartyId = receivedTaxiPartyId || null;
    const totalParticipants = finalParticipants.length;

    const currentUserId = getCurrentUserId();
    // 🚨 ResultScreen으로 전달할 chatRoomId를 컴포넌트 스코프에서 정의
    const chatRoomId = location.state?.chatRoomId || 'default';

    const handleBackClick = useCallback(() => {
        // chatRoomId와 finalTaxiPartyId(partyId)가 모두 있어야 채팅방으로 이동 가능
        if (chatRoomId && finalTaxiPartyId) {
            // 채팅방 URL 형식: /chat/:chatRoomId/:partyId
            navigate(`/chat/${chatRoomId}/${finalTaxiPartyId}`, { replace: true });
        } else {
            // 필수 ID가 없으면 채팅 목록이나 이전 화면으로 이동
            console.warn("채팅방 ID 또는 파티 ID가 없어 이전 화면으로 돌아갑니다.");
            navigate(-1);
        }
    }, [navigate, chatRoomId, finalTaxiPartyId]);

    // 3. 컴포넌트 로드 시, API를 통해 상세 정보를 조회
    useEffect(() => {
        if (!finalTaxiPartyId) {
            setError("택시팟 ID 정보가 누락되었습니다.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        async function fetchSettlementData() {
            try {
                // 3-A. 택시팟 상세 정보 조회 (총 요금 등)
                const details = await getTaxiPartyDetails(finalTaxiPartyId, currentUserId); 
                setFetchedDetails(details);
                const hostId = details.hostId;
                console.log(`🔎 Host ID: ${hostId}`);
                
                // 🚨 새로 추가된 API를 사용하여 기존 정산 ID 확인
                const settlementStatus = await getCurrentSettlementId(finalTaxiPartyId);
                const existingSettlementId = settlementStatus.settlementId;
        
                // 🚨 정산 ID가 존재할 경우 즉시 ResultScreen (/send)으로 이동
                if (settlementStatus.hasSettlement && existingSettlementId) {
                    console.log(`🔎 기존 Settlement ID 발견 (New API): ${existingSettlementId}`);
                    
                    // ⚠️ 중요: 이동 전 chatRoomId와 settlementId를 localStorage에 저장
                    localStorage.setItem("currentChatRoomId", chatRoomId); 
                    localStorage.setItem("currentSettlementId", existingSettlementId);
                    
                    const navigatePath = '/send'; 

                    const newState = { 
                        ...location.state, 
                        isSettlementEntered: true,
                        settlementId: existingSettlementId 
                    };
            
                    navigate(navigatePath, { state: newState });
                    setIsLoading(false);
                    return; // 함수 실행 중단
                }

                // 3-B. 택시팟 참여 요청 목록 조회 (정산 대상자 확정)
                const requests = await getPartyRequests(finalTaxiPartyId);
                console.log("✅ getPartyRequests 응답:", requests);

                // 'ACCEPTED' 상태인 참여자만 정산 대상에 포함
                let participantsList = requests
                    .filter(req => req.status === 'ACCEPTED')
                    .map(req => ({
                        userId: req.userId,
                        host: req.userId === hostId, // Host 여부 표시
                    }));

                    const isHostIncluded = participantsList.some(p => p.userId === hostId);

                    if (!isHostIncluded) {
                    // Host가 목록에 없다면, Host 본인도 정산 대상에 추가
                    participantsList.push({
                        userId: hostId,
                        host: true,
                    });
                    console.log(`⚠️ Host ID ${hostId}가 목록에 없어 명시적으로 추가했습니다.`);
                }

                const acceptedParticipants = participantsList;

                console.log("✅ 정산 대상 필터링 결과 (finalParticipants):", acceptedParticipants);

                if (acceptedParticipants.length <= 1) {
                    throw new Error("정산에 필요한 동승자가 없습니다. 최소 2명 (방장 포함)이 ACCEPTED 상태여야 합니다.");
                }

                setFinalParticipants(acceptedParticipants);
                
                // 에러 상태 초기화
                setError(null);
            } catch (err) {
                console.error("정산 준비 데이터 조회 실패:", err);
                setError(err.response?.message || "정산에 필요한 데이터를 불러오는 데 실패했습니다.");
                setFinalParticipants(EMPTY_PARTICIPANTS);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettlementData();
    }, [finalTaxiPartyId, chatRoomId]); // chatRoomId를 의존성 배열에 추가

    // 4. 이벤트 핸들러 및 계산 로직 (기존과 동일)
    const handleFareChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFare(value); 
        setError(null);
    };
    
    const handleAccountChange = (e) => {
        setAccount(e.target.value);
        setError(null);
    };

    // 5. 1/N 정산 금액 계산 로직 (useMemo)
    const calculatedAmounts = useMemo(() => {
        const totalFareValue = parseInt(fare, 10) || 0;
        
        if (totalParticipants === 0 || totalFareValue === 0) return [];

        const baseAmount = Math.floor(totalFareValue / totalParticipants);
        const remainder = totalFareValue % totalParticipants; 

        let participantsData = finalParticipants.map(p => ({
            userId: p.userId,
            amount: baseAmount,
            host: p.host 
        }));

        // 나머지 금액은 총대(host)에게 추가
        const hostIndex = participantsData.findIndex(p => p.host);
        if (hostIndex !== -1) {
            participantsData[hostIndex].amount += remainder;
        }

        return participantsData.map(({ userId, amount }) => ({ userId, amount }));

    }, [fare, finalParticipants, totalParticipants]);

    // 6. 버튼 활성화 조건
    const isInputComplete = fare.length > 0 && account.length > 0;
    const isButtonActive = isInputComplete;
    
    // 7. 정산 생성 API 호출 핸들러
    const handleConfirmClick = async () => {
        if (!isButtonActive) {
            if (totalParticipants <= 1) setError("정산할 동승자가 없습니다.");
            return;
        }

        if (initialIsSettlementEntered) {
            setError("이미 정산 정보가 입력된 택시팟입니다. 정산 현황 페이지를 확인해 주세요.");
            return;
        }

        const totalFareValue = parseInt(fare, 10);
        
        // 계좌 정보 분리
        const accountParts = account.trim().split(/\s+/); 
        let bankName = accountParts[0] || "은행명 없음";

        let accountNumberCandidate = "";

        if (accountParts.length > 1) {
        // 공백이 2개 이상이면, 첫 번째는 은행명, 나머지는 계좌번호로 간주하고 합침
        accountNumberCandidate = accountParts.slice(1).join('');
        } else {
        // 공백이 없으면, 입력 전체를 계좌번호 후보로 간주
        accountNumberCandidate = accountParts[0]; 
        }

        let accountNumber = accountNumberCandidate.replace(/[^0-9-]/g, '');
        //let accountNumber = accountNumberCandidate.replace(/[^0-9]/g, '');
        
        console.log("▶️ 최종 Request Body:", {
        "taxiPartyId": finalTaxiPartyId,
        "totalFare": totalFareValue,
        "bankName": bankName,
        "accountNumber": accountNumber, // 🚨 이 값을 확인!
        "participants": calculatedAmounts
        });

        if (accountParts.length === 1 && !accountNumber.includes(bankName)) {
        // 이 로직은 복잡해질 수 있으니, 최대한 명확하게 구분하는 것이 좋습니다.
        // 예를 들어, 계좌번호에 숫자가 아닌 문자가 포함되어 있다면 그것을 은행명으로 간주합니다.
        
        // 현재 로직을 유지하면서, bankName이 단순 숫자만 포함하는 계좌번호가 되는 것을 방지
        const isBankNameProbablyAccount = /^\d+$/.test(bankName); // bankName이 오직 숫자로만 이루어져 있다면?
        if (isBankNameProbablyAccount) {
            bankName = "은행명 없음"; // 서버에서 기본값 처리 가능하도록 임시 설정
            //accountNumber = accountNumberCandidate.replace(/[^0-9-]/g, ''); // 입력 전체를 계좌번호로 간주
        }
        }

        // 유효성 검사 추가 (생략 가능하나 권장)
        if (!accountNumber) {
            setError("유효한 계좌번호를 입력해주세요.");
            return;
        }

        // API 요청 바디 구성
        const requestBody = {
            "taxiPartyId": finalTaxiPartyId,
            "totalFare": totalFareValue,
            "bankName": bankName,
            "accountNumber": accountNumber,
            "participants": calculatedAmounts // 1/N 계산 결과 사용
        };

        setIsLoading(true);
        setError(null);

        try {
            // POST /api/settlements 호출
            const settlementId = await createSettlement(requestBody);
            console.log("✅ 정산 생성 성공, Settlement ID:", settlementId);
            
            // 성공 시 로컬 스토리지에 ID 저장 후 ResultScreen으로 이동
            localStorage.setItem("currentSettlementId", settlementId);
            localStorage.setItem("currentChatRoomId", chatRoomId);
            navigate("/send"); // 정산 전송 화면 (ResultScreen)으로 이동

        } catch (err) {
            // 🚨🚨🚨 디버깅 코드 추가 🚨🚨🚨
            console.log("-----------------------------------------");
            console.error("❌ 정산 생성 실패 전체 에러 객체:", err);
            console.log("❌ 서버 응답 데이터 (err.response):", err.response);
            console.log("-----------------------------------------");

            const errorMessage = err.response?.message || "정산 생성에 실패했습니다.";
            const status = err.status;

            const isDuplicateError = 
                errorMessage.includes("already exists") || 
                errorMessage.includes("duplicate") ||
                (status === 400 && errorMessage === "정산 생성에 실패했습니다."); 

            if (isDuplicateError) {
                setError("✅ 정산 정보가 이미 생성되어 있습니다. ID를 재조회 후 현황 페이지로 이동합니다.");

                // 🚨 새로 추가된 API를 호출하여 이미 생성된 정산 ID를 조회합니다.
                let confirmedSettlementId = null;
                try {
                    const statusCheck = await getCurrentSettlementId(finalTaxiPartyId);
                    confirmedSettlementId = statusCheck.settlementId;
                    
                    if (!statusCheck.hasSettlement || !confirmedSettlementId) {
                        // 중복 에러가 났는데 ID가 없다면 심각한 문제
                        throw new Error("정산 생성은 실패했으나, 정산 ID를 찾을 수 없습니다.");
                    }
                } catch (lookupErr) {
                    console.error("❌ 정산 ID 재조회 실패:", lookupErr);
                    setError("심각한 오류: 정산 ID 재확보에 실패했습니다. 관리자에게 문의하세요.");
                    setIsLoading(false);
                    return;
                }

                // ⚠️ 중요: 중복 에러 시에도 chatRoomId를 저장
                localStorage.setItem("currentChatRoomId", chatRoomId); 
                localStorage.setItem("currentSettlementId", confirmedSettlementId);
                
                // 재조회에 성공한 ID로 페이지 이동 준비
                const navigatePath = '/please'; 

                const navigateState = {
                    ...location.state,
                    settlementId: confirmedSettlementId 
                };

                navigate(navigatePath, { state: navigateState });
                setIsLoading(false);
                return; // 함수 종료
            }

            console.error("❌ 정산 생성 실패:", errorMessage, err);
            setError(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col overflow-hidden">
            <Header title="정산 정보" onBack={handleBackClick}/>

            {/* 🚨 로딩 중 전체 화면 비활성화 및 로딩 메시지 표시 */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex justify-center items-center z-20">
                    <p className="text-body-semibold-16 text-[#FC7E2A]">정산 정보를 불러오는 중...</p>
                </div>
            )}

            <div className="bg-white flex flex-col flex-grow w-full space-y-4 px-4 py-6">
            
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
                    className={`w-full h-14 justify-center items-center text-body-semibold-16 rounded p-3 
                        ${isButtonActive 
                            // 활성화 시
                            ? 'bg-[#FC7E2A] text-white' 
                            // 비활성화 시
                            : 'bg-black-20 text-black-70'
                        }`}
                    disabled={!isButtonActive || isLoading}
                >
                    확인
                </button>
            </div>
        </div>
    );
}
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogoAdmin from "../assets/img/img_logo_admin.svg";
import IconSmall from "../assets/icon/icon_small.svg"; 
import MailModal from "../components/MainModal"; // 메일 전송 모달 컴포넌트 
import RequestItem from "../components/RequestItem"; // 수신 목록 컴포넌트 
import SvgArrowLeft from "../components/svg_arrowLeft";
import SvgArrowRight from "../components/svg_arrowRight";
import Example from "../assets/img/img_student.svg"; // 임시 학생증 정보 
import * as API from "../api/Admin";

// IconToggle 컴포넌트 
const IconToggle = ({ isOpen }) => (
    <svg 
        className={`w-4 h-4 ml-auto transition-transform duration-300`} 
        width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18 9L12 15L6 9" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// ----------------------------------------------------
// [더미 데이터 설정]
// ----------------------------------------------------

// ⭐ 테스트 시: true로 설정
// ⭐ 실제 서비스 시: false로 변경하여 API 호출
const USE_DUMMY_DATA = false; 

const DUMMY_PENDING_REQUESTS = [
    {
        id: 1, // authId
        name: '김슈니',
        major: '소프트웨어융합학과', 
        status: '학부생', 
        requesterName: '김슈니',
        requesterId: '2021111222',
        date: '2025.12.01',
        rejectionReason: null,
        rejectionDate: null,
        isApproved: false,
        imageUrl: Example, 
        userEmail: 'kim.shuni@swu.ac.kr', 
    },
    {
        id: 2,
        name: '최서연',
        major: '컴퓨터공학과', 
        status: '학부생', 
        requesterName: '최서연',
        requesterId: '2021111409',
        date: '2025.12.02',
        rejectionReason: null,
        rejectionDate: null,
        isApproved: false,
        imageUrl: Example, 
        userEmail: 'choi.sy@swu.ac.kr', 
    },
];

const DUMMY_COMPLETED_REQUESTS = [
    {
        id: 3,
        name: '박민준',
        major: '디자인학과', 
        status: '졸업생', 
        requesterName: '박민준',
        requesterId: '20190501',
        date: '2025.11.25',
        rejectionReason: '이미지 부정확',
        rejectionDate: '2025.11.26',
        isApproved: false, // 반려 완료
        imageUrl: Example,
        userEmail: 'park.mj@swu.ac.kr',
    },
    {
        id: 4,
        name: '이보람',
        major: '소프트웨어융합학과', 
        status: '학부생', 
        requesterName: '이보람',
        requesterId: '2022110111',
        date: '2025.11.20',
        rejectionReason: null,
        rejectionDate: null,
        isApproved: true, // 승인 완료
        imageUrl: Example,
        userEmail: 'lee.br@swu.ac.kr',
    },
];
// ----------------------------------------------------


export default function AdminHomeBigScreen() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('request');
    const [pendingRequests, setPendingRequests] = useState([]); // 대기 중인 요청
    const [completedRequests, setCompletedRequests] = useState([]); // 완료된 요청
    const [currentIndex, setCurrentIndex] = useState(0); 
    
    const [isRejecting, setIsRejecting] = useState(false); 
    const [isReasonOpen, setIsReasonOpen] = useState(false)
    const [selectedReason, setSelectedReason] = useState(''); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [rejectReasons, setRejectReasons] = useState([]); // API에서 가져온 반려 사유
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 현재 탭에 따라 사용할 목록을 결정
    const currentList = activeTab === 'request' ? pendingRequests : completedRequests;
    const currentRequest = currentList[currentIndex];

    // 현재 요청의 authId
    const currentAuthId = currentRequest?.id;

    // 현재 요청 상태 초기화 로직
    const resetControlState = useCallback(() => {
        setIsRejecting(false);
        setSelectedReason('');
        setIsReasonOpen(false);
        setIsModalOpen(false);
    }, []);

    // API: 반려 사유 목록 조회
    useEffect(() => {
        const fetchRejectionReasons = async () => {
            if (USE_DUMMY_DATA) {
                 // ⭐ [더미 데이터 코드]
                setRejectReasons([
                    '이미지와 입력 정보 불일치',
                    '이미지 정보 미포함',
                    '이미지 부정확',
                ]);
                return;
            }

            // ⭐ [API 연결 코드]
            try {
                const response = await API.getRejectionReasons(); 
                
                if (Array.isArray(response)) {
                    setRejectReasons(response);
                } else if (response && Array.isArray(response.reasons)) {
                    setRejectReasons(response.reasons);
                } else {
                    console.error("API getRejectionReasons returned unexpected format:", response);
                }
            } catch (err) {
                console.error("Failed to fetch rejection reasons:", err);
                setError("반려 사유를 불러오는 데 실패했습니다.");
            }
        };

        fetchRejectionReasons();
    }, []);

    // API: 요청 목록 조회 (대기 중 또는 완료)
    const fetchData = useCallback(async (tab) => {
        setIsLoading(true);
        setError(null);
        
        // ⭐ [더미 데이터 코드]
        if (USE_DUMMY_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 효과 시뮬레이션
            if (tab === 'request') {
                setPendingRequests(DUMMY_PENDING_REQUESTS.filter(req => !req.isApproved && req.rejectionReason === null));
                setCurrentIndex(0);
            } else if (tab === 'complete') {
                setCompletedRequests(DUMMY_COMPLETED_REQUESTS.filter(req => req.isApproved || req.rejectionReason !== null));
            }
            setIsLoading(false);
            return;
        }

        // ⭐ [API 연결 코드]
        try {
            let requestsData = [];
            let response;
            
            if (tab === 'request') {
                // 승인 요청 목록 전체 조회 API 연결
                response = await API.getAllAuthRequests();
                requestsData = Array.isArray(response) ? response : response.requests || [];
            } else if (tab === 'complete') {
                // 수신 목록 조회 API 연결
                response = await API.getCompletedAuthRequests();
                requestsData = Array.isArray(response) ? response : response.requests || [];
            }

            // 데이터를 컴포넌트 구조에 맞게 매핑
            const mappedRequests = requestsData.map(req => ({
                id: req.id, // authId
                name: req.extractedName, 
                major: '정보 없음', 
                status: '학부생', 
                requesterName: req.extractedName,
                requesterId: req.extractedStudentId,
                date: new Date(req.createdAt).toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, ''),
                rejectionReason: req.failureReason,
                rejectionDate: req.reviewedAt && req.failureReason ? new Date(req.reviewedAt).toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '') : null,
                isApproved: req.status === 'APPROVED',
                imageUrl: req.imageUrl,
                userEmail: req.userEmail, 
            })).sort((a, b) => (b.id > a.id ? 1 : -1));

            if (tab === 'request') {
                setPendingRequests(mappedRequests);
            } else if (tab === 'complete') {
                setCompletedRequests(mappedRequests);
            }
            
            setCurrentIndex(0);
        } catch (err) {
            console.error(`Failed to fetch ${tab} requests:`, err.message); 
            setError("요청 목록을 불러오는 데 실패했습니다.");
            if (tab === 'request') setPendingRequests([]);
            if (tab === 'complete') setCompletedRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 탭 변경 또는 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchData(activeTab);
        resetControlState();
    }, [activeTab, fetchData, resetControlState]);


    // 탭 클릭 핸들러
    const handleTabClick = (tabName) => {
        if (activeTab === tabName) return;
        setActiveTab(tabName);
        setCurrentIndex(0); 
        resetControlState();
    };

    // '작게 보기' 클릭 핸들러
    const handleExpandClick = () => {
        navigate('/admin-home')
    };

    // 처리 후 목록 갱신만 수행
    const refreshDataAfterAction = () => {
        resetControlState();
        fetchData('request');
        fetchData('complete');
    }


    // API: 반려 메일 전송 및 반려 처리
    const handleSendRejectMailConfirm = async () => {
        if (!currentAuthId || !selectedReason) return;
        
        const rejectionDate = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');

        try {
            if (USE_DUMMY_DATA) {
                // ⭐ [더미 데이터 코드]: DUMMY_PENDING_REQUESTS에서 즉시 제거하고 현재 화면에 반영
                const currentIdxInPending = DUMMY_PENDING_REQUESTS.findIndex(req => req.id === currentAuthId);
                if (currentIdxInPending !== -1) {
                    const rejectedRequest = DUMMY_PENDING_REQUESTS.splice(currentIdxInPending, 1)[0];
                    rejectedRequest.rejectionReason = selectedReason;
                    rejectedRequest.rejectionDate = rejectionDate;
                    rejectedRequest.isApproved = false;
                    DUMMY_COMPLETED_REQUESTS.unshift(rejectedRequest);
                }
                
                // ✅ [반려 확인 상태로 변경]: pendingRequests 상태만 업데이트하여 현재 화면에 반려 정보 표시
                setPendingRequests(prev => prev.map(req => 
                    req.id === currentAuthId 
                    ? { ...req, rejectionReason: selectedReason, rejectionDate: rejectionDate, isApproved: false }
                    : req
                ));
                
            } else {
                 // ⭐ [API 연결 코드]
                await API.rejectAuthRequestByApproveEndpoint(currentAuthId, selectedReason);
                
                // ✅ [반려 확인 상태로 변경]: API 모드에서도 현재 요청 상태를 임시 업데이트
                setPendingRequests(prev => prev.map(req => 
                    req.id === currentAuthId 
                    ? { ...req, rejectionReason: selectedReason, rejectionDate: rejectionDate, isApproved: false }
                    : req
                ));
            }

            // 성공 알림
            // alert(`${currentRequest.name} 님의 요청을 반려 사유: [${selectedReason}]와 함께 메일로 전송했습니다.`);
            setIsModalOpen(false); 
            
            // ✅ 다음 항목으로 이동하지 않고, resetControlState만 호출하여 반려 토글 닫기
            resetControlState();

        } catch (err) {
            console.error("Failed to reject request:", err);
            alert(`요청 반려에 실패했습니다: ${err.message}`);
            setIsModalOpen(false);
        }
    };

    // '인증 불가/메일 전송' 버튼 클릭 핸들러 
    const handleRejectButtonClick = () => {
        // 1. 거절 사유가 선택되었고, 버튼이 '메일 전송' 상태라면 -> 모달 열기
        if (isMailReady) { 
            setIsModalOpen(true); 
            return;
        }

        // 2. 사유가 선택되지 않았거나, 토글 상태 해제 요청이면 -> 인증 불가 토글
        setIsRejecting(prev => !prev);
        setIsReasonOpen(false);
        setSelectedReason('');
        
        // 메일 전송 후 '반려 확인 상태'에서 '인증 불가'를 누른 경우, 상태를 복구
        if (currentRequest?.rejectionReason) {
             // 이 경우, 목록 전체를 다시 불러와야 함.
             fetchData('request'); 
        }
    };

    // API: 승인 처리 핸들러 
    const handleApprove = async (request) => {
        if (isRejecting) {
            alert('반려 처리를 완료하거나 상태를 해제 후 승인해주세요.');
            return;
        }
        if (!request?.id) return;
        
        try {
            if (USE_DUMMY_DATA) {
                 // ⭐ [더미 데이터 코드]: DUMMY_PENDING_REQUESTS에서 즉시 제거하고 현재 화면에 반영
                const currentIdxInPending = DUMMY_PENDING_REQUESTS.findIndex(req => req.id === request.id);
                if (currentIdxInPending !== -1) {
                    const approvedRequest = DUMMY_PENDING_REQUESTS.splice(currentIdxInPending, 1)[0];
                    approvedRequest.isApproved = true;
                    approvedRequest.rejectionReason = null;
                    approvedRequest.rejectionDate = null;
                    DUMMY_COMPLETED_REQUESTS.unshift(approvedRequest);
                }
                
                 // ✅ [승인 확인 상태로 변경]: pendingRequests 상태만 업데이트하여 현재 화면에 승인 정보 표시
                setPendingRequests(prev => prev.map(req => 
                    req.id === currentAuthId 
                    ? { ...req, rejectionReason: null, rejectionDate: null, isApproved: true }
                    : req
                ));
                
            } else {
                // ⭐ [API 연결 코드]
                await API.approveAuthRequest(request.id);
                
                // ✅ [승인 확인 상태로 변경]: API 모드에서도 현재 요청 상태를 임시 업데이트
                setPendingRequests(prev => prev.map(req => 
                    req.id === currentAuthId 
                    ? { ...req, rejectionReason: null, rejectionDate: null, isApproved: true }
                    : req
                ));
            }

            // 2. 처리 완료 알림
            alert(`${request.name} 님의 요청을 승인합니다.`);
            
            // ✅ 다음 항목으로 이동하지 않고, resetControlState만 호출하여 버튼 상태 초기화
            resetControlState();

        } catch (err) {
            console.error("Failed to approve request:", err);
            alert(`요청 승인에 실패했습니다: ${err.message}`);
        }
    };

    const handleSelectReason = (reason) => {
        setSelectedReason(reason);
        setIsReasonOpen(false);
    }

    const handleCompletedItemClick = (requestId) => {
        alert(`클릭된 요청 ID: ${requestId}. 상세 페이지로 이동 또는 모달 표시`);
    };

    // 요청 이동 핸들러 (이동 시 상태 초기화) 
    const handlePrevRequest = () => {
        if (activeTab === 'complete') return; 
        
        // ✅ 요청 이동 시, 현재 항목이 처리(반려/승인)된 상태라면 목록을 갱신합니다.
        if (currentRequest?.rejectionReason || currentRequest?.isApproved) {
            refreshDataAfterAction();
            return; 
        }

        setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
        resetControlState();
    };

    const handleNextRequest = () => {
        if (activeTab === 'complete') return; 
        
        // ✅ 요청 이동 시, 현재 항목이 처리(반려/승인)된 상태라면 목록을 갱신합니다.
        if (currentRequest?.rejectionReason || currentRequest?.isApproved) {
            refreshDataAfterAction();
            return;
        }
        
        setCurrentIndex(prevIndex => Math.min(currentList.length - 1, prevIndex + 1));
        resetControlState();
    };


    const isMailReady = isRejecting && selectedReason;
    
    // 현재 탭의 목록에서 다음/이전 버튼 비활성화 여부 확인
    const isPrevDisabled = currentIndex === 0;
    const isNextDisabled = currentIndex === currentList.length - 1 || currentList.length === 0;

    // ✅ 현재 요청이 처리되었는지 확인 (반려 사유가 있거나 승인된 경우)
    const isProcessed = currentRequest?.rejectionReason || currentRequest?.isApproved;


    // === 렌더링 ===
    return (
        <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto flex flex-col">
            
            {/* 1. 헤더 영역 */}
            <header className="flex items-center p-4 pt-12">
                <div className="flex items-center">
                    <img src={LogoAdmin} alt="로고" className="w-[147px] h-[58px] absolute left-4"/>
                </div>
            </header>

            {/* 2. 탭 내비게이션 및 구분선 */}
            <nav className="flex w-full border-b border-black-40 relative mt-5">
                <div 
                    className="flex-1 text-center py-3 relative cursor-pointer"
                    onClick={() => handleTabClick('request')}
                >
                    <span className={`font-bold text-[16px] ${activeTab === 'request' ? 'text-black-90' : 'text-black-40'}`}>
                        승인 요청 
                    </span>
                    {activeTab === 'request' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black-90"></div>
                    )}
                </div>
                <div 
                    className="flex-1 text-center py-3 relative cursor-pointer"
                    onClick={() => handleTabClick('complete')}
                >
                    <span className={`font-bold text-[16px] ${activeTab === 'complete' ? 'text-black-90' : 'text-black-40'}`}>
                        수신 목록 
                    </span>
                    {activeTab === 'complete' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black-90"></div>
                    )}
                </div>
            </nav>

            {/* 3. 메인 콘텐츠 영역 (조건부 렌더링) */}
            <main className="flex-grow overflow-y-auto p-4 flex flex-col">

                {/* 작게 보기 버튼 (승인 요청 탭에서만 표시) */}
                {activeTab === 'request' && (
                    <button 
                        className="w-full flex justify-end items-center text-black-70 text-[16px] font-bold mb-4 cursor-pointer"
                        onClick={handleExpandClick}
                    >
                        <span>작게보기</span>
                        <img src={IconSmall} alt="작게보기 아이콘" className="w-5 h-5 ml-1"/>
                    </button>
                )}
                
                {isLoading ? (
                    <div className="flex-grow flex items-center justify-center text-black-50 text-[16px] mt-20">
                        데이터를 불러오는 중입니다...
                    </div>
                ) : error ? (
                    <div className="flex-grow flex items-center justify-center text-red-500 text-[16px] mt-20">
                        오류: {error}
                    </div>
                ) : activeTab === 'request' && currentRequest ? (
                    <div className="flex-grow flex flex-col items-center justify-start">
                        
                        {/* 카드 슬라이더 영역 */}
                        <div className="relative w-full h-[400px] flex items-center justify-center">

                            {/* 왼쪽 슬라이드 버튼 */}
                            <button 
                                className={`absolute left-0 z-10 w-[52px] h-[52px] flex items-center justify-center rounded-full transition duration-200 ${isPrevDisabled ? 'text-black-40' : 'text-[#FC7E2A]'}`}
                                onClick={handlePrevRequest}
                                disabled={isPrevDisabled}
                            >
                                <SvgArrowLeft />
                            </button>

                            {/* 요청 정보 카드 */}
                            <div className=" w-[300px] flex flex-col items-center">
                                {/* 이미지 URL 사용 */}
                                <img src={currentRequest.imageUrl || Example} alt="학생증" /> 
                            </div>

                            {/* 오른쪽 슬라이드 버튼 */}
                            <button 
                                className={`absolute right-0 z-10 w-[52px] h-[52px] flex items-center justify-center rounded-full transition duration-200 ${isNextDisabled ? 'text-black-40' : 'text-[#FC7E2A]'}`}
                                onClick={handleNextRequest}
                                disabled={isNextDisabled}
                            >
                                <SvgArrowRight />
                            </button>
                        </div>
                        
                        {/* 요청자 정보  */}
                        <div className="w-[300px] bg-black-10 p-4 rounded-b">
                            <div className="flex mb-1"><span className="flex items-center text-black-40 text-body-semibold-16 mr-1">이름</span><span className="text-black-90 text-body-regular-16">{currentRequest.requesterName}</span></div>
                            <div className="flex mb-1"><span className="flex items-center text-black-40 text-body-semibold-16 mr-1">학번</span><span className="text-black-90 text-body-regular-16">{currentRequest.requesterId}</span></div>
                            <div className="flex"><span className="flex items-center text-black-40 text-body-semibold-16 mr-1">날짜</span><span className="text-black-50 text-body-regular-16">{currentRequest.date}</span></div>
                            
                            {/* ✅ 반려 사유/날짜 표시 */}
                            {currentRequest.rejectionReason && (
                                <>
                                <div className="flex mb-2 mt-2 border-t border-black-40"><span className="flex items-center text-black-40 text-body-semibold-16 mr-1 mt-2">반려 사유</span><span className="text-black-90 text-body-regular-16 mt-2">{currentRequest.rejectionReason}</span></div>
                                <div className="flex"><span className="flex items-center text-black-40 text-body-semibold-16 mr-1">반려 날짜</span><span className="text-black-50 text-body-regular-16">{currentRequest.rejectionDate}</span></div>
                                </>
                            )}
                            {/* ✅ 승인 완료된 경우 */}
                             {currentRequest.isApproved && !currentRequest.rejectionReason && (
                                <div className="flex mt-2"><span className="flex items-center text-[#FC7E2A] text-body-semibold-16 mr-1">승인 완료</span></div>
                            )}
                        </div>
                        
                            <>
                                {/* ✅ 처리 완료 시 이 버튼 영역 전체를 숨깁니다. */}
                                {!isProcessed && (
                                    <div className="w-[300px] flex justify-between mt-2 space-x-2">
                                        <button 
                                            className={`flex justify-center items-center w-[130px] h-[43px] flex-1 text-body-bold-16 py-4 rounded transition duration-200 
                                                ${isMailReady ? 'bg-black-70 text-white' : isRejecting ? 'bg-black-70 text-white' : 'bg-black-40 text-[#FFF]'}
                                            `}
                                            onClick={handleRejectButtonClick} 
                                            disabled={isLoading}
                                        >
                                            {isMailReady ? '메일 전송' : '인증 불가'}
                                        </button>
                                        <button 
                                            className={`flex justify-center items-center w-[130px] h-[43px] flex-1 text-body-bold-16 py-4 rounded transition duration-200 
                                                ${isRejecting ? 'bg-black-40 text-[#FFF]' : 'bg-[#FC7E2A] text-white'}
                                            `}
                                            onClick={() => handleApprove(currentRequest)} 
                                            disabled={isRejecting || isLoading} 
                                        >
                                            승인
                                        </button>
                                    </div>
                                )}

                                {/* 거절 사유 토글 메뉴  */}
                                {/* ✅ isProcessed 상태와 관계 없이 isRejecting일 때만 표시됩니다. */}
                                {isRejecting && (
                                    <div className="w-[300px] mt-4">
                                        {/* 토글 헤더 */}
                                        <div 
                                            className="flex justify-between items-center px-4 py-3 bg-black-10 cursor-pointer"
                                            onClick={() => setIsReasonOpen(prev => !prev)}
                                        >
                                            <span className={`text-body-regular-16 ${selectedReason ? 'text-black-90' : 'text-black-50'}`}>
                                                {selectedReason || '인증 반려 사유를 선택하세요'}
                                            </span>
                                            <IconToggle isOpen={isReasonOpen} /> 
                                        </div>

                                            {/* 사유 목록 */}
                                            {isReasonOpen && (
                                                <div className="mt-2 bg-black-10">
                                                    {rejectReasons.map((reason, index) => (
                                                        <div
                                                            key={index}
                                                            className="px-4 py-3 text-body-regular-16 text-black-50 cursor-pointer hover:bg-black-20"
                                                            onClick={() => handleSelectReason(reason)}
                                                        >
                                                            {reason}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </>
                        
                    </div>
                ) : activeTab === 'complete' && completedRequests.length > 0 ? (
                    <div className="w-full">
                        {completedRequests.map((request) => (
                            <RequestItem 
                                key={request.id} 
                                request={request} 
                                onClick={handleCompletedItemClick}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-black-50 text-[16px] mt-20">
                        {activeTab === 'request' ? '현재 승인 요청이 없습니다.' : '수신 목록이 비어있습니다.'}
                    </div>
                )}
            </main>

            {/* 모달 렌더링 영역 */}
            {isModalOpen && currentRequest && (
                <MailModal 
                    name={currentRequest.name} 
                    reason={selectedReason} 
                    onConfirm={handleSendRejectMailConfirm} 
                    onCancel={() => setIsModalOpen(false)} 
                    // API 응답에서 가져온 이메일 정보
                    email={currentRequest.userEmail} 
                />
            )}
        </div>
    );
}
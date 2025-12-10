import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LogoAdmin from "../assets/img/img_logo_admin.svg";
import IconSmall from "../assets/icon/icon_small.svg"; 
import MailModal from "../components/MainModal"; // 메일 전송 모달 컴포넌트 
import RequestItem from "../components/RequestItem"; // 수신 목록 컴포넌트 
import SvgArrowLeft from "../components/svg_arrowLeft";
import SvgArrowRight from "../components/svg_arrowRight";
import Example from "../assets/img/img_student.svg"; // 임시 학생증 정보 

// 토글 목록 
const rejectReasons = [
    '이미지와 입력 정보 불일치',
    '이미지 정보 미포함',
    '이미지 부정확',
];

// IconToggle 컴포넌트 
const IconToggle = ({ isOpen }) => (
    <svg 
        className={`w-4 h-4 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
        width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18 9L12 15L6 9" stroke="#777777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// === 더미 데이터 ===
const initialRequests = [
    {
        id: '2021111409',
        name: '최서연',
        major: '소프트웨어융합학과',
        status: '학부생',
        requesterName: '김슈니',
        requesterId: '2021111222',
        date: '2025.11.15',
        rejectionReason: null, 
        rejectionDate: null,
        isApproved: false, 
    },
    {
        id: '2024111496',
        name: '김유빈',
        major: '소프트웨어융합학과',
        status: '학부생',
        requesterName: '김유빈',
        requesterId: '2024111496',
        date: '2025.11.16',
        rejectionReason: '이미지 부정확', 
        rejectionDate: '2025.11.16', 
        isApproved: false,
    },
    {
        id: '20230501',
        name: '박민준',
        major: '컴퓨터공학과',
        status: '학부생',
        requesterName: '박민준',
        requesterId: '20230501',
        date: '2025.11.17',
        rejectionReason: null,
        rejectionDate: null,
        isApproved: false,
    },
];

export default function AdminHomeBigScreen() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('request');
    const [requests, setRequests] = useState(initialRequests); 
    const [currentIndex, setCurrentIndex] = useState(0); 
    
    const [isRejecting, setIsRejecting] = useState(false); 
    const [isReasonOpen, setIsReasonOpen] = useState(false)
    const [selectedReason, setSelectedReason] = useState(''); 
    const [isModalOpen, setIsModalOpen] = useState(false); 

    // 요청 대기 중인 목록 필터링 (반려/승인되지 않은 항목)
    const pendingRequests = useMemo(() => {
        return requests.filter(req => req.rejectionReason === null && req.isApproved === false);
    }, [requests]);

    // 수락 완료 목록 필터링 (승인되었거나 반려된 항목)
    const completedRequests = useMemo(() => {
        // 내림차순 정렬 
        const completed = requests.filter(req => req.isApproved === true || req.rejectionReason !== null);
        
        // 정렬 로직 
        return completed.sort((a, b) => (b.id > a.id ? 1 : -1));
    }, [requests]);

    // 현재 탭에 따라 사용할 목록을 결정
    const currentList = activeTab === 'request' ? pendingRequests : completedRequests;
    const currentRequest = currentList[currentIndex];

    // 탭 클릭 핸들러
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setCurrentIndex(0); 
        setIsRejecting(false); 
        setSelectedReason('');
        setIsReasonOpen(false);
        setIsModalOpen(false); 
    };

    // '작게 보기' 클릭 핸들러
    const handleExpandClick = () => {
        navigate('/admin-home')
    };

    // 요청 이동 핸들러 (이동 시 상태 초기화) 
    const resetControlState = () => {
        setIsRejecting(false);
        setSelectedReason('');
        setIsReasonOpen(false);
        setIsModalOpen(false);
    };

    const handlePrevRequest = () => {
        if (activeTab === 'complete') return; 
        setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
        resetControlState();
    };

    const handleNextRequest = () => {
        if (activeTab === 'complete') return; 
        setCurrentIndex(prevIndex => Math.min(currentList.length - 1, prevIndex + 1));
        resetControlState();
    };
    
    // 다음 요청으로 이동 및 처리 상태 초기화
    const moveToNextRequestAfterAction = () => {
        resetControlState();

        const newPendingCount = pendingRequests.length - 1; // 방금 하나가 처리되었으므로
        if (currentIndex > newPendingCount && newPendingCount >= 0) {
            setCurrentIndex(0);
        } else if (newPendingCount < 0) {
            // 모든 요청이 처리된 경우, 인덱스를 0으로 설정하여 빈 상태로 표시
            setCurrentIndex(0);
        }
    }

    const handleSendRejectMailConfirm = () => {
        // 현재 요청을 찾아서 반려 정보 추가
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === currentRequest.id 
                ? { ...req, rejectionReason: selectedReason, rejectionDate: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '') }
                : req
            )
        );
        
        // 처리 완료 알림 및 다음 요청으로 이동
        alert(`${currentRequest.name} 님의 요청을 반려 사유: [${selectedReason}]과 함께 메일로 전송했습니다.`);
        setIsModalOpen(false); 
        moveToNextRequestAfterAction(); 
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
    };

    // 승인 처리 핸들러 
    const handleApprove = (request) => {
        if (isRejecting) {
            alert('반려 처리를 완료하거나 상태를 해제 후 승인해주세요.');
            return;
        }
        
        // 1. 상태 업데이트: 현재 요청을 찾아서 isApproved를 true로 설정
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === request.id 
                ? { ...req, isApproved: true }
                : req
            )
        );

        // 2. 처리 완료 알림 및 다음 요청으로 이동
        alert(`${request.name} 님의 요청을 승인합니다.`);
        moveToNextRequestAfterAction();
    };

    const handleSelectReason = (reason) => {
        setSelectedReason(reason);
        setIsReasonOpen(false);
    }

    const handleCompletedItemClick = (requestId) => {
        alert(`클릭된 요청 ID: ${requestId}. 상세 페이지로 이동 또는 모달 표시`);
        navigate('/admin-home');
    };

    const isMailReady = isRejecting && selectedReason;
    
    // 현재 탭의 목록에서 다음/이전 버튼 비활성화 여부 확인
    const isPrevDisabled = currentIndex === 0;
    const isNextDisabled = currentIndex === currentList.length - 1;
    
    // 현재 요청의 처리 상태 확인
    const isRequestRejected = currentRequest?.rejectionReason !== null;
    const isRequestApproved = currentRequest?.isApproved === true;
    const isRequestProcessed = isRequestRejected || isRequestApproved;


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

                {/* 작게 보기 버튼 */}
                {activeTab === 'request' && (
                    <button 
                        className="w-full flex justify-end items-center text-black-70 text-[16px] font-bold mb-4 cursor-pointer"
                        onClick={handleExpandClick}
                    >
                        <span>작게보기</span>
                        <img src={IconSmall} alt="작게보기 아이콘" className="w-5 h-5 ml-1"/>
                    </button>
                )}
                
                {activeTab === 'request' && currentRequest ? (
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
                                <img src={Example} alt="학생증" />
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
                        </div>
                        
                            <>
                                <div className="w-[300px] flex justify-between mt-2 space-x-2">
                                    <button 
                                        className={`flex justify-center items-center w-[130px] h-[43px] flex-1 text-body-bold-16 py-4 rounded transition duration-200 
                                            ${isMailReady ? 'bg-black-70 text-white' : isRejecting ? 'bg-black-70 text-white' : 'bg-black-40 text-[#FFF]'}
                                        `}
                                        onClick={handleRejectButtonClick} 
                                    >
                                        {isMailReady ? '메일 전송' : '인증 불가'}
                                    </button>
                                    <button 
                                        className={`flex justify-center items-center w-[130px] h-[43px] flex-1 text-body-bold-16 py-4 rounded transition duration-200 
                                            ${isRejecting ? 'bg-black-40 text-[#FFF]' : 'bg-[#FC7E2A] text-white'}
                                        `}
                                        onClick={() => handleApprove(currentRequest)} 
                                        disabled={isRejecting} 
                                    >
                                        승인
                                    </button>
                                </div>

                                {/* 거절 사유 토글 메뉴  */}
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
                />
            )}
        </div>
    );
}
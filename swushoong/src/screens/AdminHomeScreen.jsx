import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogoAdmin from "../assets/img/img_logo_admin.svg";
import IconBig from "../assets/icon/icon_big.svg";
// API 함수 임포트 (경로 확인 필수)
import { getAllAuthRequests, approveAuthRequest, getCompletedAuthRequests } from "../api/Admin";

// 승인 요청 카드를 렌더링하는 개별 컴포넌트
const ApprovalCard = ({ authId, name, studentId, onApprove }) => {
    // 이미지 placeholder (나중에 API 연결 )
    const imagePlaceholder = (
        <div className="w-full h-[180px] bg-[#D9D9D9] rounded-lg"></div>
    );

    // 승인 버튼 클릭 핸들러
    const handleApproveClick = () => {
        if (window.confirm(`${name} (${studentId}) 님의 승인 요청을 처리하시겠습니까?`)) { 
            onApprove(authId);
        }
    };

    return (
        <div className="flex flex-col bg-white shadow-sm">
            {imagePlaceholder}
            <div className="p-2 mt-1 border border-black-10 bg-black-10 rounded-lg">
                <p className="text-body-bold-16 text-black-40">
                    이름
                    <span className="text-black-90 text-body-regular-16 ml-1">
                        {name}
                    </span>
                </p>
                <p className="text-body-bold-16 text-black-40">
                    학번 
                    <span className="text-black-90 text-body-regular-16 ml-1">
                        {studentId}
                    </span>
                </p>
            </div>
            <button 
                className="w-full w-[176.5px] py-2 mt-1 text-body-bold-16 text-white bg-[#FC7E2A] rounded-lg transition-colors duration-150"
                onClick={handleApproveClick}
            >
                승인
            </button>
        </div>
    );
};

export default function AdminHomeScreen() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('request');
    const [requests, setRequests] = useState([]); // 승인 요청 목록 상태
    const [completedRequests, setCompletedRequests] = useState([]); // 수신 완료 목록 상태
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 탭 클릭 핸들러
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    // 탭 확장 
    const handleExpandClick = () => {
        navigate('/admin-home-big');
    };

    /*
     * ✅ 승인 요청 목록 (Request Tab)을 API에서 가져오는 함수 
     */
    const fetchRequests = useCallback(async () => {
        if (activeTab !== 'request') return;
        setIsLoading(true);
        setError(null);
        try {
            // 2. 관리자 페이지에서 승인 요청 목록 전체 조회 API 호출
            const data = await getAllAuthRequests();
            setRequests(data); 
        } catch (err) {
            console.error("승인 요청 목록 조회 실패:", err);
            setError("승인 요청 목록을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]); 

    /**
     * ✅ 수신 목록 (Complete Tab)을 API에서 가져오는 함수
     */
    const fetchCompletedRequests = useCallback(async () => {
        if (activeTab !== 'complete') return;
        setIsLoading(true);
        setError(null);
        try {
            // 7. 관리자 페이지에서 수신 목록 조회 API 호출
            const data = await getCompletedAuthRequests();
            setCompletedRequests(data);
        } catch (err) {
            console.error("수신 목록 조회 실패:", err);
            setError("수신 목록을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    /**
     * 개별 승인 요청을 승인 처리하는 함수
     */
    const handleApprove = async (authId) => {
        setIsLoading(true);
        try {
            // 4. 관리자가 해당 요청 승인 API 호출
            await approveAuthRequest(authId);
            alert("승인 처리가 완료되었습니다.");

            // 승인이 완료되면 목록을 새로고침하여 해당 항목 제거
            await fetchRequests(); 

        } catch (err) {
            console.error(`승인 처리 실패 (ID: ${authId}):`, err);
            alert(`승인 처리 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // 탭이 변경될 때마다 해당 목록을 불러오도록 useEffect 설정
    useEffect(() => {
        if (activeTab === 'request') {
            fetchRequests();
        } else if (activeTab === 'complete') {
            fetchCompletedRequests();
        }
    }, [activeTab, fetchRequests, fetchCompletedRequests]);

    // 로딩 및 에러 메시지 렌더링
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-black-70">로딩 중...</div>;
        }

        if (error) {
            return <div className="text-center p-8 text-red-500">오류: {error}</div>;
        }

        if (activeTab === 'request') {
            if (requests.length === 0) {
                return <div className="text-center p-8 text-gray-500"><p>현재 대기 중인 승인 요청이 없습니다.</p></div>;
            }
            return (
                <div className="grid grid-cols-2 gap-4">
                    {requests.map((request) => (
                        <ApprovalCard
                            // API 필드 이름에 맞게 매핑: ID는 key와 authId로, 이름/학번은 extracted 필드를 사용
                            key={request.id} 
                            authId={request.id} 
                            name={request.extractedName} 
                            studentId={request.extractedStudentId} 
                            onApprove={handleApprove} // 승인 처리 함수 전달
                        />
                    ))}
                </div>
            );
        }

        if (activeTab === 'complete') {
             if (completedRequests.length === 0) {
                 return <div className="text-center p-8 text-gray-500"><p>처리 완료된 수신 목록이 없습니다.</p></div>;
             }
            // AdminHomeScreen에서는 간단한 목록만 표시 (AdminHomeBigScreen에서 상세 처리)
            return (
                 <div className="grid grid-cols-2 gap-4">
                    {completedRequests.map((item) => (
                        <div key={item.id} className="p-2 border rounded-lg bg-black-10 text-sm">
                            <p>이름: {item.extractedName}</p>
                            <p>학번: {item.extractedStudentId}</p>
                            <p>상태: {item.status === 'APPROVED' ? '승인' : '반려'}</p>
                        </div>
                    ))}
                </div>
            );
        }
    };


    return (
        <div className="relative w-[393px] h-screen bg-white font-pretendard mx-auto overflow-hidden flex flex-col">
            
            {/* 1. 헤더 영역 */}
            <header className="flex items-center p-4 pt-12">
                <div className="flex items-center">
                    <img src={LogoAdmin} alt="logo" className="w-[147px] h-[58px] absolute left-4"/>
                </div>
            </header>

            {/* 2. 탭 내비게이션 및 구분선 */}
            <nav className="flex w-full border-b border-black-40 relative mt-5">
                {/* === 승인 요청 탭 === */}
                <div 
                    className="flex-1 text-center py-3 relative cursor-pointer"
                    onClick={() => handleTabClick('request')}
                >
                    <span className={`font-bold ${activeTab === 'request' ? 'text-black-90' : 'text-black-40'}`}>
                        승인 요청
                    </span>
                    {/* 활성화된 탭 밑줄 */}
                    {activeTab === 'request' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black-90"></div>
                    )}
                </div>
                
                {/* === 수신 목록 탭 === */}
                <div 
                    className="flex-1 text-center py-3 relative cursor-pointer"
                    onClick={() => handleTabClick('complete')}
                >
                    <span className={`font-bold ${activeTab === 'complete' ? 'text-black-90' : 'text-black-40'}`}>
                        수신 목록 
                    </span>
                    {/* 활성화된 탭 밑줄 */}
                    {activeTab === 'complete' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black-90"></div>
                    )}
                </div>
            </nav>

            {/* 3. 메인 콘텐츠 영역 (조건부 렌더링) */}
            <main className="flex-grow overflow-y-auto p-4 flex flex-col">

                <button 
                    className="w-full flex justify-end items-center text-black-70 text-body-bold-16 mb-4 cursor-pointer"
                    onClick={handleExpandClick}
                >
                    {/* 크게보기 텍스트 */}
                    <span>크게보기</span>
                    
                    {/* 확대/축소 아이콘 */}
                    <img src={IconBig} alt="크게보기 아이콘" className="w-5 h-5 ml-1"/>
                </button>

                {/* 탭 상태에 따른 콘텐츠 렌더링 */}
                {renderContent()}

            </main>
            
        </div>
    );
}
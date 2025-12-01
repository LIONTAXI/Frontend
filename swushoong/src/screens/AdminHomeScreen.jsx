import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoAdmin from "../assets/img/img_logo_admin.svg"; // 로고 이미지 경로
import IconBig from "../assets/icon/icon_big.svg";
import AdminHomeBigScreen from "./AdminHomeBigScreen";

// 예시 데이터 구조
const approvalRequests = [
    { id: 1, name: "김슈니", studentId: "2021111222" },
    { id: 2, name: "김슈니", studentId: "2021111222" },
    { id: 3, name: "김슈니", studentId: "2021111222" },
    { id: 4, name: "김슈니", studentId: "2021111222" },
];

// 승인 요청 카드를 렌더링하는 개별 컴포넌트
const ApprovalCard = ({ name, studentId }) => {
    // 이미지 placeholder (나중에 API 연결 )
    const imagePlaceholder = (
        <div className="w-full h-[180px] bg-[#D9D9D9] rounded-lg"></div>
    );

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
            <button className="w-full w-[176.5px] py-2 mt-1 text-body-bold-16 text-white bg-[#FC7E2A] rounded-lg transition-colors duration-150">
                승인
            </button>
        </div>
    );
};

export default function AdminHomeScreen() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('request'); // 'request' 또는 'complete'

    // 탭 클릭 핸들러
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    // 탭 확장 
    const handleExpandClick = () => {
        navigate('/admin-home-big');
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
                    onClick={() => handleTabClick('request')} // 클릭 이벤트 추가
                >
                    <span className={`font-bold ${activeTab === 'request' ? 'text-black-90' : 'text-black-40'}`}>
                        승인 요청
                    </span>
                    {/* 활성화된 탭 밑줄 */}
                    {activeTab === 'request' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black-90"></div>
                    )}
                </div>
                
                {/* === 승인 완료 탭 === */}
                <div 
                    className="flex-1 text-center py-3 relative cursor-pointer"
                    onClick={() => handleTabClick('complete')} // 클릭 이벤트 추가
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

                {/* 탭 상태에 따라 다른 내용 렌더링 */}
                {activeTab === 'request' && (
                    <div className="grid grid-cols-2 gap-4">
                        {approvalRequests.map((request) => (
                            <ApprovalCard
                                key={request.id}
                                name={request.name}
                                studentId={request.studentId}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'complete' && (
                    <div className="text-center p-8 text-gray-500">
                        <p>수신 목록이 여기에 표시됩니다.</p>
                    </div>
                )}
            </main>
            
        </div>
    );
}
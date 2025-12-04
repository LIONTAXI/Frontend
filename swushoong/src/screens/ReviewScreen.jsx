import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomMenu from "./components/BottomMenu";
import MenuIcon from "../assets/icon/icon_menu.svg";

// == 더미 데이터 == 
const dummyProfileData = {
    nickname: "이슈니",
    age: 23,
    rePurchaseRate: 72, // 재매칭 희망률 (%)
    noSettlementCount: 3, // 미정산 이력 (회)
    
    // 받은 매너 평가 
    positiveReviews: [
        { text: "약속을 잘 지켜요", count: 21 },
        { text: "정산이 빨라요", count: 13 },
        { text: "친절해요", count: 12 },
    ],

    // 받은 비매너 평가 
    negativeReviews: [
        { text: "정산이 느려요", count: 1 },
    ],
};

export default function ReviewScreen() {
    const menuItems = [
        { label: '시용자 차단', onClick: () => {
            // navigate('/member-profile'); 
            console.log("사용자 차단 클릭");
        }},
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    // 실제 앱에서는 서버에서 데이터를 fetch하고 state에 저장할 예정 
    const [profileData] = useState(dummyProfileData); 

    const handleBack = () => {
        // navigate(-1); // 실제 사용 시 이전 페이지로 돌아갑니다.
        console.log("뒤로가기 클릭");
    };


    // 메뉴 닫기 함수: BottomMenu의 onClose prop에 전달
    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };
    
    // 평가 뱃지 렌더링을 위한 공통 컴포넌트
    const ReviewBadge = ({ text, count, isNegative = false }) => {
        const countTextColor = isNegative ? "text-[#EA2A11]" : "text-[#FC7E2A]";
    
        // 뱃지 전체 배경색과 기본 텍스트 색상
        const badgeStyle = isNegative
            ? "bg-black-10 text-black-70" // 비매너 평가: 연한 회색 배경, 회색 텍스트
            : "bg-[#FFF4DF] text-black-70"; // 매너 평가: 연한 노란색 배경, 회색 텍스트
        
        return (
            <div className={`
                px-3 py-2 mr-2 mb-2 rounded text-body-semibold-14 flex items-center
                ${badgeStyle}
            `}>
                <span>{text}</span>
                <span className={`ml-1 ${countTextColor}`}>
                    {count}
                </span>
            </div>
        );
    }

    return (
        <div className="relative h-screen bg-white font-pretendard flex flex-col">
            {/* 1. 상단 헤더 */}
            <Header
                title="프로필" 
                onBack={handleBack} 
                rightIcon={MenuIcon} // 메뉴 아이콘 표시
                onRightClick={() => setIsMenuOpen(true)} // 클릭 시 메뉴 열기
            />

            <main className="flex-grow p-4">
                {/* 2. 프로필 정보 섹션 */}
                <div className="flex items-center mb-6">
                    {/* 프로필 이미지 - 추후 서버 연결 후 수정 */}
                    <div className="w-16 h-16 bg-black-20 rounded-full mr-4"></div> 

                    {/* 닉네임, 나이 및 평가 지표 */}
                    <div>
                        <div className="flex items-center mb-1">
                            <span className="text-head-semibold-20 text-black-70 mr-2">{profileData.nickname}</span>
                            <span className="text-head-semibold-20 text-black-70">· {profileData.age}</span>
                        </div>
                        <div className="flex text-sm">
                            <span className="text-black-70 text-body-regular-14 mr-1">재매칭 희망률</span>
                            <span className="text-[#FC7E2A] text-body-semibold-14 mr-4">
                                {profileData.rePurchaseRate}%
                            </span>
                            <span className="text-body-semibold-14 text-[#EA2A11] mr-1">미정산이력</span>
                            <span className="text-body-semibold-14 text-[#EA2A11]">
                                {profileData.noSettlementCount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. 받은 매너 평가 섹션 */}
                <h2 className="text-head-semibold-20 text-[#000] my-4">받은 매너 평가</h2>
                <div className="flex flex-wrap">
                    {profileData.positiveReviews.map((review, index) => (
                        <ReviewBadge 
                            key={`pos-${index}`} 
                            text={review.text} 
                            count={review.count} 
                            isNegative={false} 
                        />
                    ))}
                </div>

                {/* 4. 받은 비매너 평가 섹션 */}
                <h2 className="text-head-semibold-20 text-[#000] my-4 mt-14">받은 비매너 평가</h2>
                <div className="flex flex-wrap">
                    {profileData.negativeReviews.map((review, index) => (
                        <ReviewBadge 
                            key={`neg-${index}`} 
                            text={review.text} 
                            count={review.count} 
                            isNegative={true} 
                        />
                    ))}
                </div>

            </main>
            {isMenuOpen && (
                <div
                    className="absolute inset-0 z-50 flex justify-center items-end bg-black-90 bg-opacity-70"
                    onClick={handleCloseMenu} // 외부 클릭 시 닫기
                >
                    <div
                        className="w-full max-w-[393px] mx-auto bg-white rounded-t-[20px] pt-3 pb-8 relative"
                        onClick={(e) => e.stopPropagation()} // 메뉴 내부 클릭 시 버블링 방지
                    >
                        {/* 상단 닫기 핸들 */}
                        <div className="w-9 h-[5px] bg-[rgba(60,60,67,0.3)] rounded-full mx-auto mb-5" />

                        <h2 className="px-4 text-head-semibold-20 text-black-90 mt-4 mb-4">
                            메뉴
                        </h2>

                        <div className="flex flex-col">
                            {/* 메뉴 항목 리스트 렌더링 */}
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-4 py-3 border-b border-black-15 text-body-regular-16 text-black-90"
                                    onClick={() => {
                                        item.onClick();
                                        handleCloseMenu(); // 메뉴 클릭 후 닫기
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
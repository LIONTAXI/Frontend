import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/Header2";
import BottomMenu from "./components/BottomMenu";
import Profile from "../assets/img/profileIMG.svg";

// == 더미 데이터 ==
const dummyProfileData = {
    nickname: "김슈니",
    age: 23,
    rePurchaseRate: 97, // 재매칭 희망률 (%)
    noSettlementCount: 0, // 미정산 이력 (회)
    
    // 받은 매너 평가 
    positiveReviews: [
        { text: "약속을 잘 지켜요" },
        { text: "정산이 빨라요" },
        { text: "친절해요"},
    ],

    // 받은 비매너 평가 
    negativeReviews: [

    ],
};

export default function ReviewArriveScreen() {
    const menuItems = [
        { label: '시용자 차단', onClick: () => {
            // navigate('/member-profile'); 
        }},
    ];

    // 실제로는 서버에서 데이터를 fetch하고 state에 저장할 예정 
    const [profileData] = useState(dummyProfileData); 

    const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 토글 

    const [isSubmitEnabled] = useState(true); // 확인 버튼 활성화 상태 (항상 활성화 가정) 

    const [isUserReviewed, setIsUserReviewed] = useState(false); // 후기 작성 여부 

    const navigate = useNavigate(); // 페이지 이동 

    const handleBack = () => {
        // navigate(-1); // 실제 사용 시 이전 페이지로 돌아갑니다.
        console.log("뒤로가기 클릭");
    };

    // 메뉴 열기 
    const handleOpenMenu = () => {
        console.log("메뉴 클릭");
        setIsMenuOpen(true);
    };

    // 메뉴 닫기 
    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };

    // 버튼 클릭 
    const handleButtonClick = () => {
        if (isUserReviewed) {
            console.log("확인 버튼 클릭: 페이지 닫기 또는 이동");
            // navigate('/'); 예시
        } else {
            console.log("나도 후기 작성하러 가기 클릭: 후기 작성 페이지로 이동");
            // navigate('/write-review'); 예시 
        }
    };
    
    // 평가 뱃지 렌더링을 위한 공통 컴포넌트
    const ReviewBadge = ({ text, isNegative = false }) => {
        const badgeStyle = isNegative
            ? "bg-black-10 text-black-70" 
            : "bg-[#FFF4DF] text-black-70"; 
        
        // 텍스트가 비어있으면 렌더링하지 않음
        if (!text) return null;

        return (
            <div className={`
                px-3 py-2 mr-2 mb-2 rounded text-body-semibold-14 flex items-center
                ${badgeStyle}
            `}>
                <span>{text}</span>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-white px-4 font-pretendard flex flex-col">
            {/* 1. 상단 헤더 */}
            <Header2 title="후기 도착" onBack={handleBack} onMenu={handleOpenMenu} />

            <main className="flex-grow p-4 pb-24">
                <div className="flex text-head-semibold-20 text-[#000] mb-3">
                    <h1>{profileData.nickname}님이 보낸 후기예요.</h1>
                </div>

                {/* 2. 프로필 정보 섹션 */}
                <div className="flex items-center mb-14 bg-black-10 px-4 py-3 rounded">
                    {/* 프로필 이미지 - 추후 서버 연결 후 수정 */}
                    <div className="w-[50px] h-[50px] bg-black-20 rounded-full mr-2"><img src={Profile} alt="프로필" /></div> 

                    {/* 닉네임, 나이 및 평가 */}
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
                    {profileData.positiveReviews && profileData.positiveReviews.length > 0 ? (
                        profileData.positiveReviews.map((review, index) => (
                            <ReviewBadge 
                                key={`pos-${index}`} 
                                text={review.text} 
                                isNegative={false} 
                            />
                        ))
                    ) : (
                        <p className="text-body-semibold-14 text-black-50 py-0">
                            받은 매너 평가가 없습니다.
                        </p>
                    )}
                </div>

                {/* 4. 받은 비매너 평가 섹션 */}
                <h2 className="text-head-semibold-20 text-[#000] my-4 mt-14">받은 비매너 평가</h2>
                <div className="flex flex-wrap">
                    {profileData.negativeReviews && profileData.negativeReviews.length > 0 ? (
                        profileData.negativeReviews.map((review, index) => (
                            <ReviewBadge 
                                key={`neg-${index}`} 
                                text={review.text} 
                                isNegative={true} 
                            />
                        ))
                    ) : (
                        <p className="text-body-semibold-14 text-black-50 py-0">
                            받은 비매너 평가가 없습니다.
                        </p>
                    )}
                </div>

            </main>

            <div className="mt-64 py-8">
                <button 
                    onClick={handleButtonClick} 
                    disabled={!isSubmitEnabled}
                    className={`
                        w-full h-12 rounded-lg text-white text-body-semibold-16 transition-all duration-300
                        ${isSubmitEnabled 
                            ? 'bg-[#FC7E2A]' // 활성화
                            : 'bg-black-20 text-black-50 cursor-not-allowed' // 비활성화
                        }
                    `}
                >
                    {isUserReviewed ? '확인' : '나도 후기 작성하러 가기'}
                </button>
            </div>

            <BottomMenu
                    isOpen={isMenuOpen}      // 상태 값 전달
                    onClose={handleCloseMenu} // 닫기 함수 전달
                    menuItems={menuItems}   // 메뉴 항목 리스트 전달
            />
        </div>
    );
}
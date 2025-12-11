import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MenuIcon from "../assets/icon/icon_menu.svg";
import { getUserReviewSummary, postBlockUser } from '../api/review'; 
import { getCurrentUserId } from '../api/token';

const ENUM_TO_LABEL = {
    "PROMISE_ON_TIME": "약속을 잘 지켜요",
    "RESPONSE_FAST": "응답이 빨라요",
    "GOOD_MANNER": "매너가 좋아요",
    "SETTLEMENT_FAST": "정산이 빨라요",
    "KIND": "친절해요",
    "INFO_NOTICE_FAST": "정보 공지가 빨라요",
    "INFO_ACCURATE": "정산 정보가 정확해요",
    "PROMISE_NOT_KEPT": "약속시간을 지키지 않았어요",
    "COMMUNICATION_HARD": "소통이 어려웠어요",
    "MANNER_BAD": "매너가 좋지 않았어요",
    "SETTLEMENT_LATE": "정산이 느렸어요",
    "INFO_INACCURATE": "정산 정보가 정확하지 않았어요",
};

// == 초기 상태 데이터 ==
const initialProfileData = {
    nickname: "",
    shortStudentId: '?', 
    rePurchaseRate: null,
    noSettlementCount: 0,
    positiveReviews: [],
    negativeReviews: [],
};

export default function ReviewScreen() {
    const { userId: targetUserIdParam } = useParams();

    const currentUserId = getCurrentUserId();
    const targetUserId = targetUserIdParam ? parseInt(targetUserIdParam, 10) : currentUserId;
    
    const [profileData, setProfileData] = useState(initialProfileData); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const fetchProfileData = useCallback(async () => {
        if (!targetUserId || isNaN(targetUserId) || targetUserId <= 0) {
            setError("유효하지 않은 사용자 ID입니다.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getUserReviewSummary(targetUserId);

          
            const transformedData = {
                nickname: data.name || "알 수 없음", 
                shortStudentId: data.shortStudentId || '?',
                
                // 재매칭 희망률: null이면 null로 저장하여 "데이터 없음" 표시 유도
                rePurchaseRate: data.matchPreferenceRate !== null 
                    ? data.matchPreferenceRate
                    : null,
                    
                noSettlementCount: data.unpaidCount || 0,
                
                // 긍정 평가 태그 변환 (ENUM -> 한글 + 횟수)
                positiveReviews: data.positiveTagCounts.map(item => ({
                    text: ENUM_TO_LABEL[item.tag] || item.tag,
                    count: item.count,
                })),
                
                // 부정 평가 태그 변환 (ENUM -> 한글 + 횟수)
                negativeReviews: data.negativeTagCounts.map(item => ({
                    text: ENUM_TO_LABEL[item.tag] || item.tag,
                    count: item.count,
                })),
            };

            setProfileData(transformedData);
            setError(null);

        } catch (err) {
            console.error("프로필 데이터 로드 실패:", err);
            setError(`데이터 로드 실패: ${err.message || '알 수 없는 오류'}`);
        } finally {
            setIsLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleBackToList = () => {
        navigate(-1);
    };

    // 메뉴 닫기 함수: BottomMenu의 onClose prop에 전달
    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };
    
    const handleBlockUser = async () => {
        handleCloseMenu();

        if (targetUserId === currentUserId) {
            alert("자기 자신은 차단할 수 없습니다.");
            return;
        }

        if (!targetUserId || !currentUserId) {
             alert("사용자 정보를 확인할 수 없습니다.");
             return;
        }

        if (!window.confirm(`${profileData.nickname || '이 사용자'}님을 정말로 차단하시겠습니까?`)) {
            return;
        }

        try {
            await postBlockUser(currentUserId, targetUserId); // blockerId: 나, blockedId: 타겟 사용자
            
            alert(`${profileData.nickname || '사용자'} 차단이 완료되었습니다.`);

        } catch (error) {
            console.error("사용자 차단 실패:", error);
            const errorMessage = error.response?.message || error.message || '알 수 없는 오류';
            alert(`차단 실패: ${errorMessage}`);
        }
    };

    const menuItems = [
        { label: '사용자 차단', onClick: handleBlockUser },
    ];

    // 평가 뱃지 렌더링을 위한 공통 컴포넌트
    const ReviewBadge = ({ text, count, isNegative = false }) => {
        const countTextColor = isNegative ? "text-[#EA2A11]" : "text-[#FC7E2A]";
    
        // 뱃지 전체 배경색과 기본 텍스트 색상
        const badgeStyle = isNegative
            ? "bg-black-10 text-black-70" // 비매너 평가
            : "bg-[#FFF4DF] text-black-70"; // 매너 평가
        
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
            {/* 상단 헤더 */}
            <Header
                title="프로필" 
                onBack={handleBackToList} 
                rightIcon={MenuIcon} // 메뉴 아이콘 표시
                onRightClick={() => setIsMenuOpen(true)} // 클릭 시 메뉴 열기
            />

            <main className="flex-grow p-4">
                {/* 프로필 정보 섹션 */}
                <div className="flex items-center mb-6">
                    {/* 프로필 이미지 */}
                    <div className="w-16 h-16 bg-black-20 rounded-full mr-4"></div> 

                    {/* 닉네임, 나이 및 평가 지표 */}
                    <div>
                        <div className="flex items-center mb-1">
                            <span className="text-head-semibold-20 text-black-70 mr-2">{profileData.nickname}</span>
                            <span className="text-head-semibold-20 text-black-70">· {profileData.shortStudentId}</span>
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

                {/* 받은 매너 평가 섹션 */}
                <h2 className="text-head-semibold-20 text-[#000] my-4">받은 매너 평가</h2>
                <div className="flex flex-wrap">
                    {profileData.positiveReviews.length > 0 ? (
                        profileData.positiveReviews.map((review, index) => (
                            <ReviewBadge 
                                key={`pos-${index}`} 
                                text={review.text} 
                                count={review.count} 
                                isNegative={false} 
                            />
                        ))
                    ) : (
                        <p className="text-body-semibold-14 text-black-50 py-0">
                            받은 매너 평가가 없습니다.
                        </p> 
                    )}
                </div>

                {/* 받은 비매너 평가 섹션 */}
                <h2 className="text-head-semibold-20 text-[#000] my-4 mt-14">받은 비매너 평가</h2>
                <div className="flex flex-wrap">
                    {profileData.negativeReviews.length > 0 ? (
                        profileData.negativeReviews.map((review, index) => (
                            <ReviewBadge 
                                key={`neg-${index}`} 
                                text={review.text} 
                                count={review.count} 
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
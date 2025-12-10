import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/Header2";
import Profile from "../assets/img/profileIMG.svg";

import { getReviewDetail } from '../api/review';
import { getCurrentUserId } from '../api/token';

const getReviewDetail = async (reviewId) => {
    console.log(`API Call: GET /api/reviews/${reviewId}`);
    // 실제 API 호출 로직 대신, 제공된 성공 응답으로 시뮬레이션합니다.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ 
                "reviewId": reviewId,
                "taxiPartyId": 9,
                "reviewerId": 4,
                "reviewerName": "김수니",
                "reviewerShortStudentId": "23",
                "reviewerImgUrl": "https://...",
                "matchPreferenceRate": 97,
                "unpaidCount": 0,
                "positiveTags": [ "PROMISE_ON_TIME", "RESPONSE_FAST", "KIND" ],
                "negativeTags": [ "SETTLEMENT_LATE" ],
                "canWriteBack": true 
            });
        }, 500);
    });
};

const TAG_LABEL_TO_ENUM = {
    "약속을 잘 지켜요": "PROMISE_ON_TIME",
    "응답이 빨라요": "RESPONSE_FAST",
    "매너가 좋아요": "GOOD_MANNER",
    "정산이 빨라요": "SETTLEMENT_FAST",
    "친절해요": "KIND",
    "정보 공지가 빨라요": "INFO_NOTICE_FAST",
    "정산 정보가 정확해요": "INFO_ACCURATE",
    "약속시간을 지키지 않았어요": "PROMISE_NOT_KEPT",
    "소통이 어려웠어요": "COMMUNICATION_HARD",
    "매너가 좋지 않았어요": "MANNER_BAD",
    "정산이 느렸어요": "SETTLEMENT_LATE",
    "정산 정보가 정확하지 않았어요": "INFO_INACCURATE",
};

// ENUM -> LABEL 역방향 매핑 객체 생성 
const ENUM_TO_LABEL = Object.entries(TAG_LABEL_TO_ENUM).reduce((acc, [label, enumName]) => {
    acc[enumName] = label;
    return acc;
}, {});

// == (초기 상태용) ==
const initialProfileData = {
    nickname: "", // 리뷰를 보낸 사람 (reviewer) 이름
    shortStudentId: "", // 리뷰를 보낸 사람의 학번 끝 2자리 (age 필드 대체)
    rePurchaseRate: null, // 재매칭 희망률
    noSettlementCount: 0, // 미정산 이력
    positiveReviews: [], // 긍정 태그 리스트 (표시용)
    negativeReviews: [], // 부정 태그 리스트 (표시용)
    // 네비게이션을 위해 필요한 데이터
    taxiPartyId: null, 
    reviewerId: null, 
    canWriteBack: false, // API 응답의 canWriteBack 필드
};


export default function ReviewArriveScreen() {
    const { reviewId } = useParams();

    const [profileData, setProfileData] = useState(initialProfileData); 
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    const [isSubmitEnabled] = useState(true);
    //const [isUserReviewed, setIsUserReviewed] = useState(false);
    const navigate = useNavigate();

    const fetchReviewDetail = useCallback(async () => {
        if (!reviewId) {
            setError("후기 ID가 없습니다. (URL 경로 오류)");
            setIsLoading(false);
            return;
        }

        try {
            const data = await getReviewDetail(reviewId);
            
            const transformedData = {
                nickname: data.reviewerName || "사용자",
                shortStudentId: data.reviewerShortStudentId || "", // 학번 끝 2자리 사용
                
                // 후기 요약 정보
                rePurchaseRate: data.matchPreferenceRate !== null
                    ? data.matchPreferenceRate
                    : null,
                noSettlementCount: data.unpaidCount || 0,
                
                // 긍정 태그 변환: ENUM -> 한글 라벨 (단일 후기는 횟수가 없으므로 횟수 제외)
                positiveReviews: data.positiveTags.map(tag => ({
                    text: ENUM_TO_LABEL[tag] || tag,
                    originalText: ENUM_TO_LABEL[tag]
                })),
                
                // 부정 태그 변환: ENUM -> 한글 라벨 (단일 후기는 횟수가 없으므로 횟수 제외)
                negativeReviews: data.negativeTags.map(tag => ({
                    text: ENUM_TO_LABEL[tag] || tag,
                    originalText: ENUM_TO_LABEL[tag]
                })),

                // 네비게이션 및 버튼 로직용
                taxiPartyId: data.taxiPartyId,
                reviewerId: data.reviewerId,
                canWriteBack: data.canWriteBack,
            };

            setProfileData(transformedData);
            setError(null);

        } catch (err) {
            console.error("후기 상세 정보 로드 실패:", err);
            setError(`후기 로드 실패: ${err.message || '알 수 없는 오류'}`);
        } finally {
            setIsLoading(false);
        }
    }, [reviewId]);

    useEffect(() => {
        fetchReviewDetail();
    }, [fetchReviewDetail]);

    const handleBack = () => {
        navigate(-1); 
        console.log("뒤로가기 클릭");
    };


    // 버튼 클릭 
    const handleButtonClick = () => {
        if (profileData.canWriteBack) {
            console.log("나도 후기 작성하러 가기 클릭: 후기 작성 페이지로 이동");
            
            // 후기 작성 페이지로 이동 시, 택시 파티 ID와 리뷰 대상자 ID(리뷰를 보낸 사람, 즉 data.reviewerId)를 전달합니다.
            // 라우트: /review-all/{taxiPartyId}/{targetUserId}
            navigate(`/review-all/${profileData.taxiPartyId}/${profileData.reviewerId}`);
            
        } else {
            console.log("확인 버튼 클릭: 이전 페이지로 이동");
            navigate(-1); // 이전 페이지로 복귀
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen text-head-semibold-20">
                데이터를 불러오는 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-head-semibold-20 text-[#EA2A11]">
                {error}
            </div>
        );
    }

    return (
        <div className="relative w-[393px] h-screen bg-white px-4 font-pretendard flex flex-col">
            {/* 1. 상단 헤더 */}
            <Header2 title="후기 도착" onBack={handleBack} onMenu />

            <main className="flex-grow p-4 pb-24">
                <div className="flex text-head-semibold-20 text-[#000] mb-3">
                    <h1>{profileData.nickname}님이 보낸 후기예요.</h1>
                </div>

                {/* 2. 프로필 정보 섹션 */}
                <div className="flex items-center mb-14 bg-black-10 px-4 py-3 rounded">
                    {/* 프로필 이미지 */}
                    <div className="w-[50px] h-[50px] bg-black-20 rounded-full mr-2"><img src={Profile} alt="프로필" /></div> 

                    {/* 닉네임, 나이 및 평가 */}
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

            <div className="fixed bottom-10 z-10 w-[393px] left-1/2 -translate-x-1/2 flex flex-col flex-grow space-y-4 px-4">
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
                    {/* canWriteBack에 따라 버튼 텍스트 변경 */}
                    {profileData.canWriteBack ? '나도 후기 작성하러 가기' : '확인'} 
                </button>
            </div>
        </div>
    );
}
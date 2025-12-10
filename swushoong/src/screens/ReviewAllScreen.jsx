// src/components/ReviewScreen.js

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { postReview, fetchReviewableMembers } from '../api/review';
import { getCurrentUserId } from '../api/token';

import { convertLabelsToEnums } from '../api/reviewTag'; 
import Header from "../components/Header";
import IconDown from '../assets/icon/icon_down.svg';
import BtnNegetive from "../components/btn_negetive";
import BtnPositive from "../components/btn_positive";


// props로 taxiPartyId와 revieweeId를 받아야 함
export default function ReviewAllScreen() { 
    //const [searchParams] = useSearchParams();

    const { taxiPartyId: rawTaxiPartyId, revieweeId: rawRevieweeId } = useParams();
    const navigate = useNavigate();

    const taxiPartyId = Number(rawTaxiPartyId);
    const initialRevieweeId = Number(rawRevieweeId);

    const [isLoading, setIsLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null); // 현재 후기 작성 대상자 (총대/동승자)
    const [error, setError] = useState(null);

    // 후기 선택 상태
    const [selectedPositive, setSelectedPositive] = useState([]);
    const [selectedNegative, setSelectedNegative] = useState([]);
    const [showNegative, setShowNegative] = useState(false);
    const [wouldMeetAgain, setWouldMeetAgain] = useState(null);

    // 1. 초기 데이터 로딩: 멤버 목록을 가져와 대상자를 설정
    useEffect(() => {
        const loadMembers = async () => {
            if (!taxiPartyId || isNaN(taxiPartyId) || !initialRevieweeId || isNaN(initialRevieweeId)) {
                setError("필수 정보(택시팟 ID, 대상자 ID)가 누락되었습니다.");
                setIsLoading(false);
                return;
            }

            try {
                // 택시팟 멤버 목록
                const members = await fetchReviewableMembers(taxiPartyId);
                
                // 후기 대상자 (reviewee)
                const initialTarget = members.find(m => m.userId === initialRevieweeId);

                if (initialTarget) {
                    setTargetUser(initialTarget);
                } else {
                    setError(`후기 대상자 (ID: ${initialRevieweeId})를 찾을 수 없습니다.`);
                }

            } catch (error) {
                console.error("멤버 목록 로딩 실패:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadMembers();
    }, [taxiPartyId, initialRevieweeId]);
    
    const isHost = targetUser ? (targetUser.role === "총대슈니") : false;
    
    // UI 표시용 후기 항목 
    const positiveReviews = isHost ? 
        ["약속을 잘 지켜요", "응답이 빨라요", "매너가 좋아요", "정보 공지가 빨라요", "정산 정보가 정확해요"] :
        ["약속을 잘 지켜요", "응답이 빨라요", "매너가 좋아요", "정산이 빨라요", "친절해요"];

    const negativeReviews = isHost ? 
        ["약속시간을 지키지 않았어요", "소통이 어려웠어요", "매너가 좋지 않았어요", "정보 공지가 느렸어요", "정산 정보가 정확하지 않았어요"] :
        ["약속시간을 지키지 않았어요", "소통이 어려웠어요", "매너가 좋지 않았어요", "정산이 느렸어요"];


    // 항목 선택 핸들러
    const handleSelectReview = (review, selectionState, setSelectionState) => {
        if (selectionState.includes(review)) {
            setSelectionState(selectionState.filter(item => item !== review));
        } else {
            setSelectionState([...selectionState, review]);
        }
    };

    // 다시 만나고 싶은 여부 핸들러
    const handleMeetAgain = (value) => {
        setWouldMeetAgain(value);
    };

    // 등록 버튼 활성화 조건 계산 (API 명세: 긍정 1개 이상, 다시 만날지 여부 선택 필수)
    const isSubmitEnabled = useMemo(() => {
        return selectedPositive.length > 0 && wouldMeetAgain !== null && targetUser !== null;
    }, [selectedPositive, wouldMeetAgain, targetUser]);
    
    // ------------------- API 연동 및 데이터 변환 로직 -------------------
    const handleSubmit = async () => {
        if (!isSubmitEnabled || !targetUser) return;
        
        // 한글 라벨을 Enum Name으로 변환
        const positiveTagsEnums = convertLabelsToEnums(selectedPositive);
        const negativeTagsEnums = convertLabelsToEnums(selectedNegative); 
        
        if (positiveTagsEnums.length === 0) {
             alert('긍정 후기는 최소 1개 이상 선택해야 합니다.');
             return;
        }

        const reviewPayload = {
            taxiPartyId: taxiPartyId,
            revieweeId: targetUser.userId,
            positiveTags: positiveTagsEnums,
            negativeTags: negativeTagsEnums, 
            wantToMeetAgain: wouldMeetAgain,
        };

        try {
            const reviewId = await postReview(reviewPayload);
            console.log("✅ 후기 작성 성공. Review ID:", reviewId);
            alert(`${targetUser.name}님에게 후기 작성이 완료되었습니다.`);
            // 성공 후 화면 이동 로직 추가
        } catch (error) {
            console.error("❌ 후기 작성 실패:", error);
            alert(`후기 작성 실패: ${error.message}`);
        }
    };
    // -----------------------------------------------------------------


    // 긍정 후기 버튼 렌더링 함수 
    const renderPositiveButtons = () => (
        <div className="flex flex-wrap gap-2 mb-8">
            {positiveReviews.map((review) => {
                const isSelected = selectedPositive.includes(review);
                return (
                    <button
                    key={review}
                    onClick={() => handleSelectReview(review, selectedPositive, setSelectedPositive)}
                    className={`
                        px-3 py-2 rounded-lg text-sm transition-all duration-200
                        border
                        
                        ${isSelected 
                            ? 'bg-white text-[#FC7E2A] text-body-semibold-14 border-[#FC7E2A]' 
                            : 'bg-black-10 text-black-70 text-body-semibold-14 border-transparent' 
                        }
                    `}
                    >
                        {review}
                    </button>
                    );
                })}
        </div>
    );

    // 부정 후기 버튼 렌더링 함수 
    const renderNegativeButtons = () => (
        <div className="flex flex-wrap gap-2 mt-4">
            {negativeReviews.map((review) => {
                const isSelected = selectedNegative.includes(review);
                return (
                    <button
                        key={review}
                        onClick={() => handleSelectReview(review, selectedNegative, setSelectedNegative)}
                        className={`
                        px-3 py-2 rounded-lg text-sm transition-all duration-200
                        border
                        
                        ${isSelected 
                            ? 'bg-white text-[#FC7E2A] text-body-semibold-14 border-[#FC7E2A]' 
                            : 'bg-black-10 text-black-70 text-body-semibold-14 border-transparent' 
                        }
                    `}
                    >
                        {review}
                    </button>
                );
            })}
        </div>
    );
    
    // 다시 만나고 싶은 여부 버튼 렌더링 함수 
    const renderMeetAgainButtons = () => (
        <div className="flex justify-between gap-2 mt-2 ">
        <button
            onClick={() => handleMeetAgain(false)}
            className="relative p-0 flex items-center justify-center flex-1"
            style={{ 
                        height: '111px', 
                        minWidth: '160px', 
            }} 
        >
            <BtnNegetive 
                isClicked={wouldMeetAgain === false} 
                width="100%" 
                height="100%" 
            />
        </button>

        <button
            onClick={() => handleMeetAgain(true)}
            className="relative p-0 flex items-center justify-center flex-1"
            style={{ 
                        height: '111px', 
                        minWidth: '160px', 
            }}
        >
            <BtnPositive 
                isClicked={wouldMeetAgain === true} 
                width="100%" 
                height="100%"
            />
        </button>
    </div>
    );


    // --- 로딩 및 에러 처리 ---
    if (isLoading) {
        return <div className="p-4 text-center head-semibold-20">후기 정보를 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className="p-4 text-center head-semibold-20 text-red-600">에러 발생: {error}</div>;
    }
    
    // --- 메인 렌더링 ---
    return (
        <div className="px-4 bg-white min-h-screen"> 
            
            {/* 1. 상단 헤더 */}
            <Header title="후기작성" />

            {/* 2. 사용자 정보 (동적으로 로드된 targetUser 사용) */}
            <div className="flex items-center mb-8
                            rounded border border-black-20 bg-white
                            px-3 py-4"
            >
                <div className="w-12 h-12 bg-black-20 rounded-full mr-3">
                    {/* 프로필 이미지 영역 */}
                </div>
                <div>
                    {/* targetUser 정보 사용 */}
                    <p className="text-body-semibold-16 text-black-70">{targetUser.name} · {targetUser.shortStudentId}</p>
                    <p className="text-body-regular-14 text-black-70">{targetUser.role}</p>
                </div>
            </div>

            {/* 3. 후기 선택 (긍정) */}
            <h2 className="text-head-semibold-20 text-[##000] mb-3">후기 선택</h2>
            {renderPositiveButtons()}

            {/* 4. 아쉬운 점 (부정) */}
            <div className="mb-0">
                <button 
                    onClick={() => setShowNegative(!showNegative)}
                    className="flex items-center mt-16 text-body-semibold-16 text-black-50"
                >
                    아쉬운 점이 있었나요?
                    <img 
                        src={IconDown} 
                        alt="화살표" 
                        className={`ml-1 w-4 h-4 transition-transform duration-300 ${showNegative ? 'rotate-180' : 'rotate-0'}`}
                    />
                </button>
                {/* 화살표를 눌렀을 때만 보이도록 조건부 렌더링 */}
                {showNegative && renderNegativeButtons()}
            </div>
            
            <div className="fixed bottom-10 z-10 w-[393px] left-1/2 -translate-x-1/2 flex flex-col flex-grow space-y-4 px-4">
                
                {/* 5. 다시 만나고 싶은 여부 */}
                {renderMeetAgainButtons()}

                {/* 6. 등록 버튼 */}
                <div className="mt-4">
                    <button 
                        onClick={handleSubmit} // API 호출 함수 연결
                        disabled={!isSubmitEnabled}
                        className={`
                            w-full h-12 px-4 rounded-lg body-semibold-16 transition-all duration-300
                            ${isSubmitEnabled 
                                ? 'bg-[#FC7E2A] text-white' 
                                : 'bg-black-20 text-black-70 cursor-not-allowed' 
                            }
                        `}
                    >
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
}
// 총대슈니에 대한 후기 작성 
import React, { useState, useMemo } from "react";
import IconLeft from '../assets/icon/icon_left.svg';
import IconDown from '../assets/icon/icon_down.svg';
import BtnNegetive from "../components/btn_negetive";
import BtnPositive from "../components/btn_positive";

export default function ReviewSwuScreen () {
    // ====== 더미 데이터 사용자 =======
    const dummyUser = { name: "박슈니", age: 23, role: "총대슈니" };

    // 후기 선택 항목
    const positiveReviews = [
        "약속을 잘 지켜요", 
        "응답이 빨라요", 
        "매너가 좋아요", 
        "정보 공지가 빨라요", 
        "정산 정보가 정확해요"
    ];

    // 아쉬운 점 항목
    const negativeReviews = [
        "약속시간을 지키지 않았어요", 
        "소통이 어려웠어요", 
        "매너가 좋지 않았어요", 
        "정보 공지가 느렸어요",
        "정산 정보가 정확하지 않았어요"
    ];

    // 상태 관리
    const [selectedPositive, setSelectedPositive] = useState([]); // 선택된 긍정 후기
    const [selectedNegative, setSelectedNegative] = useState([]); // 선택된 부정 후기
    const [showNegative, setShowNegative] = useState(false); // 부정 후기 섹션 표시 여부
    const [wouldMeetAgain, setWouldMeetAgain] = useState(null); // 다시 만나고 싶은 여부 

    // 항목 선택 핸들러 (복수 선택 가능)
    const handleSelectReview = (review, selectionState, setSelectionState) => {
        if (selectionState.includes(review)) {
            // 이미 선택된 항목이면 제거
            setSelectionState(selectionState.filter(item => item !== review));
        } else {
            // 선택되지 않은 항목이면 추가
            setSelectionState([...selectionState, review]);
        }
    };

    // 다시 만나고 싶은 여부 핸들러 (단일 선택)
    const handleMeetAgain = (value) => {
        setWouldMeetAgain(value);
    };

    // 등록 버튼 활성화 조건 계산
    const isSubmitEnabled = useMemo(() => {
        // 필수 조건: 긍정 후기 1개 이상, 부정 후기 1개 이상 (선택은 필수로 했는데 추후 결정), 다시 만나고 싶은 여부 선택
        return selectedPositive.length > 0 && selectedNegative.length > 0 && wouldMeetAgain !== null;
    }, [selectedPositive, selectedNegative, wouldMeetAgain]);

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
                            // 선택됨
                            ? 'bg-white text-[#FC7E2A] body-semibold-14 border-[#FC7E2A]' 
                            // 미선택
                            : 'bg-black-10 text-black-70 body-semibold-14 border-transparent' 
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
                            // 선택됨
                            ? 'bg-white text-[#FC7E2A] body-semibold-14 border-[#FC7E2A]' 
                            // 미선택
                            : 'bg-black-10 text-black-70 body-semibold-14 border-transparent' 
                        }
                    `}
                    >
                        {review}
                    </button>
                );
            })}
        </div>
    );

    // 다시 만나고 싶은 여부 버튼 렌더링
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


    return (
        <div className="px-4 bg-white min-h-screen"> 
            
            {/* 1. 상단 헤더 */}
            <div className="flex items-center justify-between mb-6 mt-6">
                <div className="flex justify-start"> 
                    <button>
                        <img src={IconLeft} alt="뒤로가기"/>
                    </button>
                </div>
                <p className="head-regular-20 text-center flex-grow text-black-90">
                    후기 작성 
                </p>
                <div className="w-10"></div>
            </div>

            {/* 2. 사용자 정보 */}
            <div className="flex items-center mb-8
                            rounded border border-gray-300 bg-white
                            px-3 py-4"
            >
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3">
                    {/*  */}
                </div>
                <div>
                    <p className="body-semibold-16 text-black-70">{dummyUser.name} · {dummyUser.age}</p>
                    <p className="body-regular-14 text-black-70">{dummyUser.role}</p>
                </div>
            </div>

            {/* 3. 후기 선택 (긍정) */}
            <h2 className="head-semibold-20 text-[##000] mb-3">후기 선택</h2>
            {renderPositiveButtons()}

            {/* 4. 아쉬운 점 (부정) */}
            <div className="">
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
                        onClick={() => console.log("등록 버튼 클릭", { selectedPositive, selectedNegative, wouldMeetAgain })} 
                        disabled={!isSubmitEnabled}
                        className={`
                            w-full h-12 px-4 rounded-lg body-semibold-16 transition-all duration-300
                            ${isSubmitEnabled 
                                ? 'bg-[#FC7E2A] text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed' 
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
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';;
import Header from "../components/Header";
import { getPartyMembersWithReviewStatus } from '../api/review';
import { getCurrentUserId } from '../api/token';

export default function TaxiSwuScreen({chatRoomId}) {
    const { partyId } = useParams();
    const currentUserId = getCurrentUserId(); // 토큰에서 사용자 ID를 가져옴
    const taxiPartyId = parseInt(partyId, 10);
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 유효성 검사
    if (!currentUserId) {
        return <div className="h-screen flex items-center justify-center text-red-500">로그인이 필요합니다.</div>;
    }
    if (taxiPartyId <= 0 || isNaN(taxiPartyId)) {
        return <div className="h-screen flex items-center justify-center text-red-500">유효하지 않은 택시팟 ID입니다.</div>;
    }

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                // Props로 받은 taxiPartyId 사용
                const response = await getPartyMembersWithReviewStatus(taxiPartyId);
                
                // API 응답 데이터를 UI에 맞게 가공
                const processedMembers = response.map(member => ({
                    userId: member.userId,
                    name: `${member.name} · ${member.shortStudentId}${member.userId === currentUserId ? ' (나)' : ''}`,
                    isMe: member.userId === currentUserId,
                    status: member.reviewWritten ? 'DONE' : 'WRITING', // reviewWritten 사용 가정
                }));

                // 정렬 로직 추가: isMe가 true인 멤버를 배열의 맨 앞으로 이동 (나를 맨 위로)
                processedMembers.sort((a, b) => {
                    return (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0);
                });

                setMembers(processedMembers);

            } catch (err) {
                console.error("멤버 목록 조회 오류:", err);
                setError("멤버 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [taxiPartyId, currentUserId]); // 의존성 배열에 Props 추가

    if (loading) {
        return <div className="h-screen flex items-center justify-center">로딩 중...</div>;
    }

    if (error) {
        return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
    }

    // 후기 작성 페이지로 이동하는 핸들러 추가 
    const handleReviewClick = (member) => {
        if (member.status === 'DONE') {
            return;
        }

        console.log("--- 동승자 후기 작성 시도 ---");
        console.log(`taxiPartyId (전달값): ${taxiPartyId}`);
        console.log(`revieweeId (대상자): ${member.userId}`);
        console.log(`URL 경로: /review-all/${taxiPartyId}/${member.userId}`);


        if (!member.isMe) {
            console.log("--- 동승자 후기 작성 시도 ---");
            console.log(`Prop으로 받은 chatRoomId: ${chatRoomId}`);
            navigate(`/review-all/${taxiPartyId}/${member.userId}`, {
                // chatRoomId와 partyId를 state로 전달
                state: { chatRoomId: chatRoomId, partyId: taxiPartyId } 
            });
        }
    };

    const handleProfileClick = (memberId) => {
        console.log(`프로필 클릭: 사용자 ID ${memberId}`);
        navigate(`/member-profile/${memberId}`, {
            // chatRoomId와 partyId를 state로 전달
            state: { chatRoomId: chatRoomId, partyId: taxiPartyId }
        });
    };

    const handleBackToChat = () => {

        navigate(-1);
    };


    return (
        <div className="h-full h-screen bg-white font-pretendard flex flex-col"> 
            <Header title="택시팟 멤버" onBack={handleBackToChat} />

            <div className="bg-white flex flex-col flex-grow w-full space-y-4 px-4">
                <h1 className="text-head-semibold-20 text-[#000] mt-2">
                    택시팟 멤버 
                </h1>

                {/* 멤버 리스트 */}
                <div className="space-y-4">
                    {members.map((member, index) => (
                        <div key={index} className="flex justify-between items-center">
                            {/* 왼쪽 프로필 이미지 (임시 회색 원) + 이름 */}
                            <div className="flex items-center gap-2"
                                onClick={() => handleProfileClick(member.userId)}
                            >
                                {/* 임시 프로필 원 */}
                                <div className={`w-10 h-10 rounded-full ${
                                    member.isMe ? 'border border-[#FC7E2A] bg-[#D6D6D6]' : 'bg-[#D6D6D6]'
                                }`}></div>
                                <span className="text-body-semibold-16 text-black-70">
                                    {member.name}
                                </span>
                            </div>  
                            
                            <div className="flex items-center gap-4">
                                {member.isMe ? (
                                    // 본인일 경우 빈 공간 유지
                                    <div className="w-[88px] h-8"></div>
                                ) : (
                                    <button
                                        onClick={() => handleReviewClick(member)}
                                        disabled={member.status === 'DONE'} // 작성 완료 시 비활성화
                                        className={`
                                            py-1.5 px-3 rounded
                                            w-[88px] h-8 flex items-center justify-center
                                            transition-colors duration-200
                                            ${member.status === 'DONE' 
                                                ? 'bg-[#D6D6D6] cursor-not-allowed' // 작성 완료 스타일
                                                : 'bg-[#FC7E2A] hover:bg-[#E56E1A] cursor-pointer' // 후기 작성 스타일
                                            }
                                        `}
                                    >
                                        <span className="text-body-semibold-14"
                                                style={{ color: member.status === 'DONE' ? '#444' : '#FFF' }}>
                                            {member.status === 'DONE' ? '작성 완료' : '후기 작성'}
                                        </span>
                                        </button>
                                    )}

                                {/* 동승자 시점에서는 멤버 내보내기 버튼이 없으므로 빈 공간 */}
                                <div className="w-6 h-8"></div>
                            </div>
                       </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 
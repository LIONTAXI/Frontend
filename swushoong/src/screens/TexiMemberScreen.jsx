import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import IconOut from '../assets/icon/icon_out.svg';
import { getPartyMembersWithReviewStatus, kickPartyMember } from "../api/review";
import { getCurrentUserId } from '../api/token';


export default function TaxiMemberScreen({chatRoomId}) {

    const { partyId } = useParams();
    const currentUserId = getCurrentUserId(); // 토큰에서 사용자 ID를 가져옴
    const taxiPartyId = parseInt(partyId, 10);
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // 유효성 검사
    if (!currentUserId) {
        return <div className="p-4 text-red-500">로그인이 필요합니다.</div>;
    }
    if (taxiPartyId <= 0 || isNaN(taxiPartyId)) {
        return <div className="p-4 text-red-500">유효하지 않은 택시팟 ID입니다.</div>;
    }

    // 멤버 목록 조회 함수를 useCallback으로 분리하여 재사용 가능하게 함
    const fetchMembers = useCallback(async () => {
        if (taxiPartyId <= 0 || isNaN(taxiPartyId) || !currentUserId) return;

        try {
            setLoading(true);
            const response = await getPartyMembersWithReviewStatus(taxiPartyId);
            
            const processedMembers = response.map(member => ({ 
                name: `${member.name} · ${member.shortStudentId}${member.userId === currentUserId ? ' (나)' : ''}`, 
                isMe: member.userId === currentUserId,
                status: member.isReviewed ? 'DONE' : 'WRITING', 
                userId: member.userId,
            }));

            processedMembers.sort((a, b) => {
                return (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0);
            });

            setMembers(processedMembers);
            setError(null);
        } catch (err) {
            console.error("멤버 목록 조회 오류:", err);
            setError("멤버 목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [taxiPartyId, currentUserId]); 

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]); // fetchMembers가 변경될 때마다 실행

    const handleBackToChat = () => {

        navigate(-1);
    };

    // 내보내기(강퇴) 핸들러 구현
    const handleOutMember = async (member) => {
        if (member.isMe) {
            alert("자기 자신을 강퇴할 수 없습니다.");
            return;
        }

        if (!window.confirm(`정말로 ${member.name} 님을 택시팟에서 내보내시겠습니까?`)) {
            return;
        }

        try {
            await kickPartyMember(taxiPartyId, member.userId); 
            
            alert(`${member.name} 님이 택시팟에서 성공적으로 내보내졌습니다.`);
            
            // 멤버 목록 갱신
            await fetchMembers(); 

        } catch (error) {
            console.error("멤버 강퇴 실패:", error);
            // 서버에서 받은 메시지가 있으면 사용, 없으면 기본 메시지 사용
            alert(`멤버 강퇴에 실패했습니다: ${error.response?.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
    };

    const handleReviewClick = (member) => {
        // 이미 작성 완료된 경우 이동 안함 
        if (member.status === 'DONE') {
            return;
        }

        // 후기 작성 페이지 경로로 이동
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
        console.log(`총대 시점 프로필 클릭: 사용자 ID ${memberId}`);
        navigate(`/member-profile/${memberId}`, {
            // chatRoomId와 partyId를 모두 state로 전달
            state: { chatRoomId: chatRoomId, partyId: taxiPartyId }
        });
    };


    if (loading) {
        return <div className="h-screen flex items-center justify-center">로딩 중...</div>;
    }

    if (error) {
        return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
    }


    return (
        <div className="h-full h-screen bg-white font-pretendard flex flex-col"> 
            <Header title="택시팟 멤버" onBack={handleBackToChat}/>

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

                                {/* 정산 상태 버튼 */}
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
                                                ? 'bg-[#D6D6D6] cursor-not-allowed'
                                                : 'bg-[#FC7E2A] hover:bg-[#E56E1A] cursor-pointer'
                                            }
                                        `}
                                    >
                                        <span className="text-body-semibold-14"
                                            style={{ color: member.status === 'DONE' ? '#444' : '#FFF' }}>
                                            {member.status === 'DONE' ? '작성 완료' : '후기 작성'}
                                        </span>
                                    </button>
                                )}

                                {/* 멤버 내보내기 버튼 (총대 시점에서는 본인이 아닐 때만 노출) */}
                                <span className="flex items-center justify-center h-8">
                                    {!member.isMe && (
                                        <button onClick={() => handleOutMember(member)}>
                                            <img src={IconOut} alt="멤버 내보내기"/>
                                        </button>
                                    )}
                                    {member.isMe && (
                                        // 내가 나 자신을 내보낼 수 없으므로 빈 공간 유지
                                        <div className="w-6"></div> 
                                    )}
                                </span>                              
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 
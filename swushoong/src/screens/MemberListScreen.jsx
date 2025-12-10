// 택시팟 멤버 상위 페이지 

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCurrentUserId } from '../api/token';
import { getTaxiPartyInfo } from '../api/chat'; 
import TaxiSwuScreen from './TaxiSwuScreen'
import TaxiMemberScreen from './TexiMemberScreen';

const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center text-body-regular-16 text-black-70">
        역할 정보를 확인 중입니다... 🔄
    </div>
);

const ErrorScreen = ({ message }) => (
    <div className="h-screen flex items-center justify-center text-body-regular-16 text-red-500">
        ⚠️ 오류: {message}
    </div>
);

export default function MemberListScreen() {
    const { partyId } = useParams();
    const [isHost, setIsHost] = useState(null); // null: 로딩 중
    const currentUserId = getCurrentUserId();
    const partyIdNum = parseInt(partyId, 10);

    useEffect(() => {
        // 필수 ID 값 검사
        if (!currentUserId) {
            console.error("인증 토큰 누락: 로그인 상태를 확인하세요.");
            setIsHost(false); // 에러 상태로 간주
            return;
        }
        if (partyIdNum <= 0 || isNaN(partyIdNum)) {
            console.error("유효하지 않은 파티 ID:", partyId);
            setIsHost(false); // 에러 상태로 간주
            return;
        }

        const checkRole = async () => {
            try {
                // 1. 택시팟 상세 정보 API를 호출하여 Host ID를 확인
                const partyInfo = await getTaxiPartyInfo(partyIdNum, currentUserId);
                
                // 2. 현재 로그인한 사용자 ID와 Host ID를 비교하여 역할 설정
                setIsHost(partyInfo.hostId === currentUserId);
            } catch (error) {
                console.error("역할 확인 API 실패:", error);
                setIsHost(false); // API 실패 시 동승자 화면으로 폴백하거나, 명확한 에러 메시지 표시
            }
        };
        checkRole();
    }, [partyIdNum, currentUserId]);

    // --- 렌더링 분기 ---

    if (!currentUserId || partyIdNum <= 0) {
        return <ErrorScreen message="필수 정보(사용자/파티 ID)가 누락되었습니다." />;
    }

    if (isHost === null) {
        return <LoadingScreen />;
    }

    // 역할에 따라 최종 컴포넌트 렌더링
    if (isHost) {
        return <TaxiMemberScreen />;
    } else {
        return <TaxiSwuScreen />;
    }
}
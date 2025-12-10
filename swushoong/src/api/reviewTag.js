// 한글 라벨을 API Enum Name으로 매핑 (POST 요청 시 필요)
export const TAG_LABEL_TO_ENUM = {
    // 긍정 태그 (Positive)
    "약속을 잘 지켜요": "PROMISE_ON_TIME",
    "응답이 빨라요": "RESPONSE_FAST",
    "매너가 좋아요": "GOOD_MANNER",
    "정산이 빨라요": "SETTLEMENT_FAST", // 동승슈니
    "친절해요": "KIND", // 동승슈니
    "정보 공지가 빨라요": "INFO_NOTICE_FAST", // 총대슈니
    "정산 정보가 정확해요": "INFO_ACCURATE", // 총대슈니

    // 부정 태그 (Negative)
    "약속시간을 지키지 않았어요": "PROMISE_NOT_KEPT",
    "소통이 어려웠어요": "COMMUNICATION_HARD",
    "매너가 좋지 않았어요": "MANNER_BAD",
    "정산이 느렸어요": "SETTLEMENT_LATE", // 동승슈니
    "정산 정보가 정확하지 않았어요": "INFO_INACCURATE", // 총대슈니
    // 참고: 총대슈니 대상 부정 태그 중 "정보 공지가 느렸어요"는 명세에 없으므로, "INFO_NOTICE_FAST"의 반대인 "INFO_NOTICE_SLOW" 같은 Enum이 있다면 사용해야 하나, 명세에 없으므로 매핑하지 않거나 임시로 처리합니다.
    // 임시 처리: "정보 공지가 느렸어요" -> 'INFO_NOTICE_SLOW' (실제 백엔드 Enum에 맞춰야 함)
    // 현재 명세: "INFO_INACCURATE"만 총대슈니 전용 부정 태그로 존재
};

/**
 * 한글 라벨 배열을 API에 보낼 Enum Name 배열로 변환합니다.
 * @param {string[]} labels - 선택된 한글 라벨 배열
 * @returns {string[]} - 해당 Enum Name 배열
 */
export function convertLabelsToEnums(labels) {
    return labels.map(label => TAG_LABEL_TO_ENUM[label]).filter(enumName => enumName);
}
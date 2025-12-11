// Enum Name 매핑 
export const TAG_LABEL_TO_ENUM = {
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

// Enum Name 배열 변환
export function convertLabelsToEnums(labels) {
    return labels.map(label => TAG_LABEL_TO_ENUM[label]).filter(enumName => enumName);
}
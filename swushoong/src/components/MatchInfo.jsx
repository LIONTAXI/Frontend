// 채팅화면에 쓰이는 매칭 정보 컴포넌트

import React from "react";
import IconPin2 from '../assets/icon/icon_pin2.svg';
import IconPeople from '../assets/icon/icon_people.svg';

const MatchInfo = ({ destination, departureIcon, departure, departureTime, members, estimatedFare }) => (
    <div className="bg-black-10 px-4 py-3 rounded border-black-10 w-[361px]">
        <div className="flex items-center mb-2">
            <span className="text-xl">
                <img src={IconPin2} alt="위치 "/>
            </span>
            <span className="text-body-semibold-16 text-black-90 ml-1">
                {destination}
            </span>
        </div>

        <div className="flex items-center mb-2">
            <span className="text-xl">
                {departureIcon}
            </span>
            <span className="text-body-regular-16 text-black-50 ml-1">
                {departure}
            </span>
        </div>

        <div className="flex items-center text-body-semibold-14 text-black-40 gap-4">
            <div>
                마감 
                <span className="text-body-semibold-14 text-black-70 ml-1">
                    {departureTime}
                </span>
            </div>

            <div className="flex items-center">
                <img src={IconPeople} alt="인원" />
                <span className="text-body-semibold-14 text-black-70 ml-1">
                    {members}
                </span>
            </div>

            <div className="text-body-semibold-14 text-black-40">
                예상 
                <span className="text-body-semibold-16 text-black-70 ml-1">
                    {estimatedFare}
                </span>
            </div>
        </div>
    </div>
);

export default MatchInfo;
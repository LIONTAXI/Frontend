import React from "react";

const RequestItem = ({ request, onClick }) => {
    const isApproved = request.isApproved;
    const dateLabel = isApproved ? '승인날짜' : '반려날짜';
    const processedDate = isApproved 
        ? request.approvalDate 
        : request.rejectionDate;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.replace(/\. /g, '.').replace(/\.$/, ''); 
    };

    return (
        <div className="p-1 border-b border-[#EDEDED]"
            onClick={() => onClick(request.id)}
        >
            <div className="text-body-regular-16 text-black-90 mb-1">
                <span className="text-body-semibold-16 text-black-40">이름</span> {request.requesterName}
            </div>
            <div className="text-body-regular-16 text-black-90 mb-1">
                <span className="text-body-semibold-16 text-black-40">학번</span> {request.requesterId}
            </div>
            <div className="text-body-regular-16 text-black-90">
                <span className="text-black-40">날짜</span> {request.date}
                {processedDate && (
                    <span className="ml-4 text-black-40">{dateLabel}</span>
                )}
                <span className={`ml-1 ${isApproved ? 'text-black-90' : 'text-black-90'}`}>
                    {formatDate(processedDate)}
                </span>
            </div>
        </div>
    );
};

export default RequestItem;
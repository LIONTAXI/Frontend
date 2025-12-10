import React from 'react';

const BottomMenu = ({ isOpen, onClose, menuItems, children }) => {
  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 (배경을 어둡게 하고, 외부 클릭 시 모달 닫기) */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* 바텀 시트 (메뉴 컨테이너) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 z-50 
        transform transition-transform duration-300 ease-out h-[400px] overflow-y-auto"
        // isOpen이 true일 때 transform: translateY(0) 적용, CSS 트랜지션을 이용해 슬라이드 업 효과 구현
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* 2-1. 드래그 핸들 (스크린샷 중앙 상단의 작은 회색 바) */}
        <div className="flex justify-center">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className='flex justify-left px-3 py-10'>
            <h1 className="text-head-semibold-20 text-[#000]">메뉴</h1>
        </div>

        {/* 메뉴 항목 목록 */}
        <div className="text-body-regular-16 text-black-90">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                onClose(); // 메뉴 항목 클릭 후 모달 닫기
              }}
              className="w-full text-left py-4 px-3 border-b border-[#EDEDED] last:border-b-0 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 추가적인 자식 요소 (필요 시) */}
        {children}
      </div>
    </>
  );
};

export default BottomMenu;
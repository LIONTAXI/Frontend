import React from 'react';

const BottomMenu = ({ isOpen, onClose, menuItems, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 z-50 
        transform transition-transform duration-300 ease-out h-[400px] overflow-y-auto"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
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
                onClose(); 
              }}
              className="w-full text-left py-4 px-3 border-b border-[#EDEDED] last:border-b-0 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
        {children}
      </div>
    </>
  );
};

export default BottomMenu;
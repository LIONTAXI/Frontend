import React, { useState, useEffect } from "react";

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  showHandle = true,
  className = "",
}) {
  const [visible, setVisible] = useState(isOpen);
  const [yOffset, setYOffset] = useState(0);
  const [startY, setStartY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setVisible(false);
      setYOffset(0);
      setIsDragging(false);
      setStartY(null);
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const handleSheetClick = (e) => {
    e.stopPropagation();
  };

  // 드래그 핸들 + 터치 영역 
  const handlePointerDown = (e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || startY == null) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = clientY - startY;
    if (delta > 0) {
      setYOffset(delta);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;

    if (yOffset > 80) {
      if (onClose) onClose();
    }

    setYOffset(0);
    setIsDragging(false);
    setStartY(null);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex justify-center items-end bg-black-90/70"
      onClick={handleOverlayClick}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <div
        className={`
          w-full max-w-[393px] mx-auto bg-white rounded-t-[20px]
          pt-3 pb-8 relative
          shadow-[0_-4px_10px_rgba(0,0,0,0.15)]
          transition-transform duration-200 ease-out
          ${className}
        `}
        style={{
          transform: `translateY(${yOffset}px)`,
        }}
        onClick={handleSheetClick}
      >
        {showHandle && (
          <div
            className="w-9 h-[5px] bg-[rgba(60,60,67,0.3)] rounded-full mx-auto mb-5"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          />
        )}

        {children}
      </div>
    </div>
  );
}

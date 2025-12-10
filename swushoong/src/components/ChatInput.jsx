// src/components/ChatInput.jsx

import React, { useState } from 'react';
import IconCamera from '../assets/icon/icon_camera.svg';
import IconSend from '../assets/icon/icon_send.svg';

// 채팅 입력창 컴포넌트
const ChatInput = ({ onSend, onCameraClick }) => {
    const [inputMessage, setInputMessage] = useState("");

    const handleSend = () => {
        if (inputMessage.trim()) {
            onSend(inputMessage.trim());
            setInputMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-center px-2 py-4 rounded-10">
            <button onClick={onCameraClick} className="mr-3">
                <img src={IconCamera} alt="카메라" className="w-6 h-6" />
            </button>
            
            <div className="flex items-center flex-grow bg-black-10 rounded-full px-4 py-2">
                <input
                    type="text"
                    placeholder="대화를 나눠 보세요"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-transparent text-body-regular-16 focus:outline-none px-1"
                />
                <button onClick={handleSend} disabled={!inputMessage.trim()} className="ml-3">
                    <img src={IconSend} alt="전송" 
                        className={`w-6 h-6 ${inputMessage.trim() ? 'opacity-100' : 'opacity-40'}`} 
                    />
                </button>

            </div>
        </div>
    );
};

export default ChatInput;
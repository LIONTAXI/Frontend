import React, { useState, useRef } from 'react'; 
import IconCamera from '../assets/icon/icon_camera.svg';
import IconSend from '../assets/icon/icon_send.svg';

const ChatInput = ({ onSend, onCameraClick, onFileSelect }) => {
    const [inputMessage, setInputMessage] = useState("");
    const fileInputRef = useRef(null); 

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

    const handleCameraClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); 
        }
        if (onCameraClick) {
            onCameraClick(); 
        }
    };

    // 파일 선택 
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
        // input 값 초기화
        e.target.value = null; 
    };

    return (
        <div className="flex items-center px-2 py-4 rounded-10">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*" 
                onChange={handleFileChange}
            />
            
            <button onClick={handleCameraClick} className="mr-3">
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
import React, { useState, useRef } from 'react'; // useRef import
import IconCamera from '../assets/icon/icon_camera.svg';
import IconSend from '../assets/icon/icon_send.svg';

// 채팅 입력창 컴포넌트
// onFileSelect prop을 추가하여 파일이 선택되었을 때 상위 컴포넌트로 전달합니다.
const ChatInput = ({ onSend, onCameraClick, onFileSelect }) => {
    const [inputMessage, setInputMessage] = useState("");
    // 💡 파일 입력 필드에 접근하기 위한 ref
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

    // 💡 카메라 아이콘 클릭 시: 숨겨진 파일 입력 필드 클릭을 트리거합니다.
    const handleCameraClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); 
        }
        // 원래의 onCameraClick 함수도 호출 (옵션)
        if (onCameraClick) {
            onCameraClick(); 
        }
    };

    // 💡 파일 선택 핸들러: 파일 선택 시 onFileSelect로 파일 객체를 전달합니다.
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
        // 파일을 선택한 후, input 값을 초기화하여 같은 파일을 다시 선택할 수 있도록 함
        e.target.value = null; 
    };

    return (
        <div className="flex items-center px-2 py-4 rounded-10">
            {/* 💡 1. 숨겨진 파일 입력 필드 추가 */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*" // 이미지 파일만 허용
                onChange={handleFileChange}
            />
            
            {/* 💡 2. 버튼 클릭 시 handleCameraClick 호출 */}
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
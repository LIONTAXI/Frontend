import React from "react";

export default function ChatBubble({
  side = "left",          // "left" | "right" | "system"
  variant = "text",       // "text" | "image"
  text = "",
  time = "",
  name = "",
  age = "",
  avatarUrl = "",
  imageUrl = "",
  className = "",
}) {
  // 💛 시스템 메시지 (가운데 노란 박스)
  if (side === "system") {
    return (
      <div className={`w-full flex justify-center ${className}`}>
        <div className="inline-flex px-4 py-3 bg-[#FFF4DF] rounded text-body-regular-14 text-black-90 text-center leading-[1.4] whitespace-pre-line">
          {text}
        </div>
      </div>
    );
  }

  const isLeft = side === "left";

  // 아바타 (없으면 회색 동그라미)
  const Avatar = () => (
    <div className="w-[30px] h-[30px] rounded-full border border-[#D6D6D6] bg-[#D9D9D9] overflow-hidden">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );

  // 텍스트 말풍선
  const TextBubble = () => (
    <div
      className={
        (isLeft
          ? "bg-black-10 text-black-90 rounded-br-lg rounded-tr-lg rounded-bl-lg"
          : "bg-[#FC7E2A] text-white rounded-tl-lg rounded-bl-lg rounded-br-lg") +
        " px-4 py-4 max-w-[270px] leading-[1.4]"
      }
    >
      <span className="text-body-regular-16">{text}</span>
    </div>
  );

  // 이미지 말풍선
  const ImageBubble = () => (
    <div
      className={
        (isLeft
          ? "bg-black-10 rounded-br-lg rounded-tr-lg rounded-bl-lg"
          : "bg-[#FC7E2A] rounded-tl-lg rounded-bl-lg rounded-br-lg") +
        " p-[10px] max-w-[270px]"
      }
    >
      <div className="w-[120px] h-[180px] rounded-lg bg-[#D9D9D9] overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="chat"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );

  // 말풍선 + 시간 한 줄
  const BubbleRow = () => (
    <div
      className={
        "flex items-end gap-2 " + (isLeft ? "" : "justify-end")
      }
    >
      {isLeft ? (
        <>
          {variant === "text" ? <TextBubble /> : <ImageBubble />}
          {time && (
            <span className="text-body-regular-14 text-black-50">
              {time}
            </span>
          )}
        </>
      ) : (
        <>
          {time && (
            <span className="text-body-regular-14 text-black-50 text-right">
              {time}
            </span>
          )}
          {variant === "text" ? <TextBubble /> : <ImageBubble />}
        </>
      )}
    </div>
  );

  // 💬 왼쪽(상대)
  if (isLeft) {
    return (
      <div
        className={`w-full flex justify-start items-start gap-2 ${className}`} // items-end -> items-start
      >
        <Avatar /> {/* 아바타 표시 */}

        <div className="flex flex-col gap-1"> {/* gap-2 -> gap-1 */}
          {/* 이름/나이 라인 */}
          {(name || age) && (
            <div className="flex items-center">
              <span className="text-body-regular-14 text-black-70">
                {name}
                {age && <span className="text-body-regular-14 text-black-50">. {age}</span>}
              </span>
            </div>
          )}
          {/* 말풍선 + 시간 */}
          <BubbleRow />
        </div>
      </div>
    );
  }

  // 💬 오른쪽(내 메시지) – 아바타/이름 없이 말풍선 + 시간만 (🔥 복원된 로직 🔥)
  return (
    <div
      className={`w-full flex justify-end items-end ${className}`}
    >
      <BubbleRow />
    </div>
  );
}
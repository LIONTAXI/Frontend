import React, { useState } from "react";
import CheckedIcon from "../assets/icon/icon_checked2.svg";
import BlindIcon from "../assets/icon/icon_blind.svg";
import EyeIcon from "../assets/icon/icon_eye.svg";

const FieldBox = ({ children }) => (
  <div className="w-full h-12 bg-black-10 rounded-md px-4 flex items-center justify-between">
    {children}
  </div>
);

export default function InputInfo() {
  const domain = "@swu.ac.kr";

  const [blankValue, setBlankValue] = useState("");
  const [idValue, setIdValue] = useState("swuni123");
  const [pwValue, setPwValue] = useState("swun111!");
  const [showPw, setShowPw] = useState(false);
  const [finalId, setFinalId] = useState("swuni123");

  return (
    <div className="w-full flex flex-col gap-4 font-pretendard">
      <FieldBox>
        <span className="flex-1 text-right text-body-regular-16 text-black-50">
          {domain}
        </span>
      </FieldBox>

      <FieldBox>
        <input
          type="text"
          value={blankValue}
          onChange={(e) => setBlankValue(e.target.value)}
          placeholder="텍스트 입력"
          className="w-full bg-transparent outline-none text-body-regular-16 text-black-90 placeholder:text-black-40"
        />
      </FieldBox>

      <FieldBox>
        <input
          type="text"
          value={idValue}
          onChange={(e) => setIdValue(e.target.value)}
          className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
        />
        <span className="ml-2 text-body-regular-16 text-black-50">{domain}</span>
      </FieldBox>

      <FieldBox>
        <input
          type="text"
          value={pwValue}
          onChange={(e) => setPwValue(e.target.value)}
          className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
        />
        <button type="button" className="ml-2 w-5 h-5">
          <img src={BlindIcon} alt="blind icon" className="w-full h-full" />
        </button>
      </FieldBox>

      <FieldBox>
        <input
          type={showPw ? "text" : "password"}
          value={pwValue}
          onChange={(e) => setPwValue(e.target.value)}
          className="flex-1 bg-transparent outline-none text-body-semibold-16 text-black-90"
        />
        <button
          type="button"
          className="ml-2 w-5 h-5"
          onClick={() => setShowPw((prev) => !prev)}
        >
          <img
            src={showPw ? EyeIcon : BlindIcon}
            alt="toggle password"
            className="w-full h-full"
          />
        </button>
      </FieldBox>

      <FieldBox>
        <div className="flex items-center flex-1">
          <img src={CheckedIcon} alt="checked" className="w-5 h-5 mr-2" />
          <input
            type="text"
            value={finalId}
            onChange={(e) => setFinalId(e.target.value)}
            className="bg-transparent outline-none text-body-semibold-16 text-black-90"
          />
        </div>
        <span className="ml-2 text-body-regular-16 text-black-50">{domain}</span>
      </FieldBox>
    </div>
  );
}

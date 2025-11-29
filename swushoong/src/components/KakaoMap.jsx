// src/components/KakaoMap.jsx
import React, { useEffect, useRef } from "react";

export default function KakaoMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const kakaoAppKey = import.meta.env.VITE_KAKAO_MAP_APPKEY;
    console.log("[KakaoMap] appKey:", kakaoAppKey);

    if (!kakaoAppKey) {
      console.error("[KakaoMap] VITE_KAKAO_MAP_APPKEY 가 비어 있습니다.");
      return;
    }

    // 이미 로드된 경우 바로 지도 생성
    if (window.kakao && window.kakao.maps) {
      createMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      console.log("[KakaoMap] Kakao Map SDK 로드 완료");
      window.kakao.maps.load(createMap);
    };

    script.onerror = (e) => {
      console.error("[KakaoMap] Kakao Map 스크립트 로드 실패", e);
    };

    document.head.appendChild(script);

    function createMap() {
      if (!mapRef.current) return;

      const { kakao } = window;
      const center = new kakao.maps.LatLng(37.617735, 127.091526);
      const options = {
        center,
        level: 3,
      };

      new kakao.maps.Map(mapRef.current, options);
    }
  }, []);

  return <div ref={mapRef} className="mx-0 w-full h-[393px]" />;
}

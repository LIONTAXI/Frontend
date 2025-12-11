import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import MapPicker from "./MapPicker";

export default function KakaoMap({
  userLocation,
  taxiHosts = [],
  selectedTaxiPotId,
  onSelectTaxiPot,
  onAddressChange,
  isHostMe = false,
  centerOn = "user",
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const myOverlayRef = useRef(null);
  const hostOverlaysRef = useRef([]);

  const [mapReady, setMapReady] = useState(false);

  // SDK 로드 + 지도 생성
  useEffect(() => {
    const kakaoAppKey = import.meta.env.VITE_KAKAO_MAP_APPKEY;
    console.log("[KakaoMap] appKey:", kakaoAppKey);
    if (!kakaoAppKey) {
      console.error("[KakaoMap] VITE_KAKAO_MAP_APPKEY 가 비어 있습니다.");
      return;
    }

    const createMap = () => {
      if (!mapRef.current) return;
      const { kakao } = window;
      const center = new kakao.maps.LatLng(37.617735, 127.091526);
      const options = { center, level: 3 };
      mapInstanceRef.current = new kakao.maps.Map(mapRef.current, options);

      setMapReady(true);
    };

    if (window.kakao && window.kakao.maps) {
      createMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log("[KakaoMap] Kakao Map SDK 로드 완료");
      window.kakao.maps.load(createMap);
    };
    script.onerror = (e) => {
      console.error("[KakaoMap] Kakao Map 스크립트 로드 실패", e);
    };
    document.head.appendChild(script);
  }, []);

  // 내 위치 픽커 + 주소 텍스트
  useEffect(() => {
    if (!mapReady) return;
    if (!mapInstanceRef.current || !userLocation || !window.kakao) return;

    const { kakao } = window;
    const { latitude, longitude } = userLocation;
    const pos = new kakao.maps.LatLng(latitude, longitude);

    if (!myOverlayRef.current) {
      const container = document.createElement("div");
      const root = createRoot(container);

      root.render(
        <MapPicker
          emoji="👤"
          type={isHostMe ? "host" : "user"}
          selected={false}
        />
      );

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: container,
        yAnchor: 1,
      });

      overlay.__root = root; 
      overlay.setMap(mapInstanceRef.current);
      myOverlayRef.current = overlay;
    } else {
      myOverlayRef.current.setPosition(pos);

      const root = myOverlayRef.current.__root;
      if (root) {
        root.render(
          <MapPicker
            emoji="👤"
            type={isHostMe ? "host" : "user"}
            selected={false}
          />
        );
      }
    }

    if (centerOn === "user") {
      mapInstanceRef.current.setCenter(pos);
    }

    // 주소 → 헤더 텍스트
    if (onAddressChange) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(longitude, latitude, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          const addr =
            result[0].road_address?.building_name ||
            result[0].road_address?.address_name ||
            result[0].address?.address_name;
          onAddressChange(addr || "내 위치");
        }
      });
    }
  }, [userLocation, onAddressChange, isHostMe, centerOn, mapReady]);

  // 총대 픽커들(게시글 위치)
  useEffect(() => {
    if (!mapReady) return;
    if (!mapInstanceRef.current || !window.kakao) return;
    const { kakao } = window;

    hostOverlaysRef.current.forEach(({ overlay, root }) => {
      overlay.setMap(null);
      root.unmount();
    });
    hostOverlaysRef.current = [];

    if (!Array.isArray(taxiHosts)) return;

    taxiHosts.forEach((host) => {
      const lat = host.latitude;
      const lng = host.longitude;
      if (lat == null || lng == null) return; 

      const pos = new kakao.maps.LatLng(lat, lng);

      const container = document.createElement("div");
      container.style.cursor = "pointer";

      const root = createRoot(container);
      root.render(
        <MapPicker
          emoji={host.emoji}
          type="host"
          selected={host.id === selectedTaxiPotId}
        />
      );

      container.addEventListener("click", () => {
        if (onSelectTaxiPot) onSelectTaxiPot(host.id);
      });

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: container,
        yAnchor: 1,
      });
      overlay.setMap(mapInstanceRef.current);
      hostOverlaysRef.current.push({ overlay, root });
    });

    // 처음 한 번 호스트 기준으로 센터
    if (centerOn === "host" && taxiHosts.length > 0) {
      const targetHost =
        taxiHosts.find((h) => h.id === selectedTaxiPotId) || taxiHosts[0];

      if (targetHost.latitude != null && targetHost.longitude != null) {
        const centerPos = new kakao.maps.LatLng(
          targetHost.latitude,
          targetHost.longitude
        );
        mapInstanceRef.current.setCenter(centerPos);
      }
    }
  }, [taxiHosts, selectedTaxiPotId, onSelectTaxiPot, centerOn, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    if (!mapInstanceRef.current || !window.kakao) return;
    if (!selectedTaxiPotId) return;
    if (!Array.isArray(taxiHosts) || taxiHosts.length === 0) return;

    const { kakao } = window;
    const target = taxiHosts.find((h) => h.id === selectedTaxiPotId);
    if (!target) return;
    if (target.latitude == null || target.longitude == null) return;

    const pos = new kakao.maps.LatLng(target.latitude, target.longitude);
    mapInstanceRef.current.panTo(pos);
  }, [selectedTaxiPotId, taxiHosts, mapReady]);

  return <div ref={mapRef} className="mx-0 w-full h-[393px]" />;
}

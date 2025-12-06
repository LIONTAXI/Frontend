import React from "react";

const SvgArrowRight = ({ className }) => (
    <svg className={className} width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_206_6764)">
            <rect width="52" height="52" rx="26" transform="matrix(-1 0 0 1 56 4)" fill="white" shapeRendering="crispEdges"/>
            <path d="M26 38L34 30L26 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
            <filter id="filter0_d_206_6764" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_206_6764"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_206_6764" result="shape"/>
            </filter>
        </defs>
    </svg>
);

export default SvgArrowRight;
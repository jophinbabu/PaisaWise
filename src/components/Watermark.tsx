// components/Watermark.tsx
"use client";

import React from "react";

export function Watermark() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Main Watermark */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <h1 className="text-[140px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-50/80 to-purple-50/80 opacity-90 select-none tracking-tighter">
            PaisaWise
          </h1>
          {/* Subtle reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent opacity-30"></div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-100/30"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
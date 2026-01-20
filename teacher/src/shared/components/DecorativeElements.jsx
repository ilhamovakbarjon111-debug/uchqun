import React from 'react';

const DecorativeElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Stars - Yulduzchalar */}
      {[...Array(35)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="rgba(173, 216, 230, 0.6)"
              stroke="rgba(135, 206, 250, 0.8)"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      ))}

      {/* Butterflies - Kapalaklar */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`butterfly-${i}`}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
            transform: `scale(${0.5 + Math.random() * 0.5})`,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C8 2 5 5 5 9C5 11 6 13 7 14C6 15 5 17 5 19C5 21 7 23 9 23C10 23 11 22 12 21C13 22 14 23 15 23C17 23 19 21 19 19C19 17 18 15 17 14C18 13 19 11 19 9C19 5 16 2 12 2Z"
              fill="rgba(173, 216, 230, 0.5)"
              stroke="rgba(135, 206, 250, 0.7)"
              strokeWidth="0.5"
            />
            <circle cx="9" cy="9" r="1" fill="rgba(135, 206, 250, 0.8)" />
            <circle cx="15" cy="9" r="1" fill="rgba(135, 206, 250, 0.8)" />
          </svg>
        </div>
      ))}

      {/* Bears - Ayiqchalar */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`bear-${i}`}
          className="absolute animate-float-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 3}s`,
            transform: `scale(${0.4 + Math.random() * 0.3}) rotate(${Math.random() * 20 - 10}deg)`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="10" r="8" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <circle cx="9" cy="8" r="2" fill="rgba(135, 206, 250, 0.6)" />
            <circle cx="15" cy="8" r="2" fill="rgba(135, 206, 250, 0.6)" />
            <ellipse cx="12" cy="11" rx="2" ry="1.5" fill="rgba(135, 206, 250, 0.6)" />
            <ellipse cx="8" cy="12" rx="1.5" ry="2" fill="rgba(173, 216, 230, 0.5)" />
            <ellipse cx="16" cy="12" rx="1.5" ry="2" fill="rgba(173, 216, 230, 0.5)" />
          </svg>
        </div>
      ))}

      {/* Bubbles with strings - Pufakchalar ip bilan */}
      {[...Array(20)].map((_, i) => {
        const size = 15 + Math.random() * 25;
        const stringLength = 30 + Math.random() * 40;
        const leftPos = Math.random() * 100;
        const topPos = Math.random() * 100;
        return (
          <div
            key={`bubble-${i}`}
            className="absolute animate-bubble-with-string"
            style={{
              left: `${leftPos}%`,
              top: `${topPos}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <svg width={size + 10} height={size + stringLength + 10} viewBox={`0 0 ${size + 10} ${size + stringLength + 10}`} fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* String - Ip */}
              <line
                x1={(size + 10) / 2}
                y1={size + 5}
                x2={(size + 10) / 2}
                y2={size + stringLength + 5}
                stroke="rgba(135, 206, 250, 0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Bubble - Pufak */}
              <circle
                cx={(size + 10) / 2}
                cy={size / 2 + 5}
                r={size / 2}
                fill="rgba(173, 216, 230, 0.2)"
                stroke="rgba(173, 216, 230, 0.6)"
                strokeWidth="2"
              />
              {/* Bubble highlight */}
              <ellipse
                cx={(size + 10) / 2 - size / 6}
                cy={size / 2 - size / 6 + 5}
                rx={size / 6}
                ry={size / 6}
                fill="rgba(255, 255, 255, 0.3)"
              />
            </svg>
          </div>
        );
      })}

      {/* Clouds - Bulutchlar */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`cloud-${i}`}
          className="absolute animate-cloud"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            transform: `scale(${0.6 + Math.random() * 0.4})`,
          }}
        >
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M45 25C47.5 25 50 22.5 50 20C50 17.5 47.5 15 45 15C44 15 43 15.5 42.5 16C41.5 13 39 11 36 11C33.5 11 31.5 12.5 30.5 14.5C29.5 12.5 27 11 24.5 11C21 11 18 14 18 17.5C18 18 18 18.5 18.5 19C16.5 19 15 20.5 15 22.5C15 24.5 16.5 26 18.5 26H45Z"
              fill="rgba(173, 216, 230, 0.4)"
              stroke="rgba(135, 206, 250, 0.6)"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      ))}

      {/* Toy Cars - O'yinchoq mashinalar */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`car-${i}`}
          className="absolute animate-car-drive"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
            transform: `scale(${0.5 + Math.random() * 0.4}) rotate(${Math.random() * 360}deg)`,
          }}
        >
          <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Car body */}
            <rect x="5" y="10" width="40" height="12" rx="2" fill="rgba(173, 216, 230, 0.6)" stroke="rgba(135, 206, 250, 0.8)" strokeWidth="0.5" />
            {/* Car roof */}
            <path d="M15 10 L25 5 L35 5 L40 10 Z" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            {/* Windows */}
            <rect x="18" y="7" width="6" height="4" rx="1" fill="rgba(135, 206, 250, 0.3)" />
            <rect x="26" y="7" width="6" height="4" rx="1" fill="rgba(135, 206, 250, 0.3)" />
            {/* Wheels */}
            <circle cx="12" cy="22" r="4" fill="rgba(135, 206, 250, 0.7)" stroke="rgba(135, 206, 250, 0.9)" strokeWidth="0.5" />
            <circle cx="38" cy="22" r="4" fill="rgba(135, 206, 250, 0.7)" stroke="rgba(135, 206, 250, 0.9)" strokeWidth="0.5" />
            <circle cx="12" cy="22" r="2" fill="rgba(173, 216, 230, 0.5)" />
            <circle cx="38" cy="22" r="2" fill="rgba(173, 216, 230, 0.5)" />
          </svg>
        </div>
      ))}

      {/* Toy Balls - O'yinchoq to'plar */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`ball-${i}`}
          className="absolute animate-bounce-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            transform: `scale(${0.4 + Math.random() * 0.4})`,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <path d="M15 3 Q20 8 15 15 Q10 8 15 3" fill="rgba(135, 206, 250, 0.3)" />
            <path d="M15 15 Q20 22 15 27 Q10 22 15 15" fill="rgba(135, 206, 250, 0.3)" />
            <circle cx="15" cy="15" r="3" fill="rgba(135, 206, 250, 0.6)" />
          </svg>
        </div>
      ))}

      {/* Toy Blocks - O'yinchoq kubiklar */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`block-${i}`}
          className="absolute animate-rotate-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
            transform: `scale(${0.3 + Math.random() * 0.3})`,
          }}
        >
          <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 3D cube effect */}
            <path d="M5 20 L5 5 L20 5 L20 20 Z" fill="rgba(173, 216, 230, 0.6)" stroke="rgba(135, 206, 250, 0.8)" strokeWidth="0.5" />
            <path d="M20 5 L30 10 L30 25 L20 20 Z" fill="rgba(135, 206, 250, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <path d="M5 20 L20 20 L30 25 L15 25 Z" fill="rgba(173, 216, 230, 0.4)" stroke="rgba(135, 206, 250, 0.6)" strokeWidth="0.5" />
            {/* Decorative lines */}
            <line x1="12" y1="12" x2="12" y2="12" stroke="rgba(135, 206, 250, 0.6)" strokeWidth="1" />
            <circle cx="12" cy="12" r="2" fill="rgba(135, 206, 250, 0.5)" />
          </svg>
        </div>
      ))}

      {/* Toy Dolls - O'yinchoq qo'g'irchoqlar */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`doll-${i}`}
          className="absolute animate-sway"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            transform: `scale(${0.4 + Math.random() * 0.3})`,
          }}
        >
          <svg width="25" height="40" viewBox="0 0 25 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="12.5" cy="8" r="6" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            {/* Eyes */}
            <circle cx="10" cy="7" r="1" fill="rgba(135, 206, 250, 0.8)" />
            <circle cx="15" cy="7" r="1" fill="rgba(135, 206, 250, 0.8)" />
            {/* Smile */}
            <path d="M9 10 Q12.5 12 16 10" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" fill="none" />
            {/* Body */}
            <ellipse cx="12.5" cy="20" rx="5" ry="8" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            {/* Arms */}
            <ellipse cx="6" cy="20" rx="2" ry="6" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <ellipse cx="19" cy="20" rx="2" ry="6" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            {/* Legs */}
            <ellipse cx="10" cy="32" rx="2" ry="6" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <ellipse cx="15" cy="32" rx="2" ry="6" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
          </svg>
        </div>
      ))}

      {/* Toy Airplanes - O'yinchoq samolyotlar */}
      {[...Array(7)].map((_, i) => (
        <div
          key={`airplane-${i}`}
          className="absolute animate-fly"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 3}s`,
            transform: `scale(${0.4 + Math.random() * 0.3}) rotate(${Math.random() * 30 - 15}deg)`,
          }}
        >
          <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Fuselage */}
            <ellipse cx="20" cy="12.5" rx="8" ry="3" fill="rgba(173, 216, 230, 0.6)" stroke="rgba(135, 206, 250, 0.8)" strokeWidth="0.5" />
            {/* Wings */}
            <path d="M15 12.5 L5 8 L5 12.5 Z" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <path d="M15 12.5 L5 17 L5 12.5 Z" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <path d="M25 12.5 L35 10 L35 12.5 Z" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <path d="M25 12.5 L35 15 L35 12.5 Z" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            {/* Tail */}
            <path d="M12 12.5 L8 5 L8 12.5 Z" fill="rgba(173, 216, 230, 0.5)" stroke="rgba(135, 206, 250, 0.7)" strokeWidth="0.5" />
            <circle cx="20" cy="12.5" r="2" fill="rgba(135, 206, 250, 0.6)" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default DecorativeElements;

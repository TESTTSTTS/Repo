import React from 'react';

const GridBackground = () => {
  const patternId = `grid-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <pattern id={patternId} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            {/* Основные точки */}
            <circle cx="15" cy="15" r="1" fill="#3AAFA9" fillOpacity="0.5"/>
            
            {/* Угловые точки */}
            <circle cx="0" cy="0" r="1" fill="#3AAFA9" fillOpacity="0.3"/>
            <circle cx="30" cy="0" r="1" fill="#3AAFA9" fillOpacity="0.3"/>
            <circle cx="0" cy="30" r="1" fill="#3AAFA9" fillOpacity="0.3"/>
            <circle cx="30" cy="30" r="1" fill="#3AAFA9" fillOpacity="0.3"/>
            
            {/* Соединительные линии */}
            <line x1="15" y1="15" x2="30" y2="30" stroke="#3AAFA9" strokeWidth="0.5" strokeOpacity="0.2"/>
            <line x1="15" y1="15" x2="0" y2="30" stroke="#3AAFA9" strokeWidth="0.5" strokeOpacity="0.2"/>
            <line x1="15" y1="15" x2="30" y2="0" stroke="#3AAFA9" strokeWidth="0.5" strokeOpacity="0.2"/>
            <line x1="15" y1="15" x2="0" y2="0" stroke="#3AAFA9" strokeWidth="0.5" strokeOpacity="0.2"/>
          </pattern>
          <rect width="100%" height="100%" fill={`url(#${patternId})`}/>
        </svg>
      </div>
    </div>
  );
};

export default GridBackground; 
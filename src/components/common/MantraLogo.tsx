import React from 'react';

interface MantraLogoProps {
  height?: number;
  width?: number;
  className?: string;
  isDark?: boolean;
}

export const KIDMANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1792489668/kidmantra_logo_xjm847.png';

export default function MantraLogo({ height = 36, width, className = '', isDark = false }: MantraLogoProps) {
  return (
    <img
      src={KIDMANTRA_LOGO_URL}
      alt="KidMantra"
      height={height}
      width={width}
      className={`object-contain ${className}`}
      style={{
        height: `${height}px`,
        width: width ? `${width}px` : 'auto',
        display: 'inline-block'
      }}
    />
  );
}

import React from 'react';

export const KorunaLogoSvg: React.FC<{
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  useGradient?: boolean;
}> = ({
  width = 30,
  height = 22,
  className = '',
  color = '#AF1F60',
  useGradient = false
}) => {
  const gradientId = React.useId ? React.useId() : 'koruna-logo-grad';
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 122 91"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      shapeRendering="geometricPrecision"
      style={{ imageRendering: 'crisp-edges' }}
    >
      {useGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C41E66" />
            <stop offset="50%" stopColor="#AF1F60" />
            <stop offset="100%" stopColor="#7E1243" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M0.0124696 59.0257C-0.199315 68.0078 1.53234 76.7907 5.08285 84.8634C6.66501 88.4638 10.2653 90.7685 14.2021 90.7685C14.1148 90.6439 14.0401 90.5069 13.9529 90.3823C13.9529 90.3823 10.7637 86.3584 8.72056 79.9675C6.40339 73.8008 5.19497 67.2355 5.19497 60.5206C5.20743 30.0236 30.0236 5.20742 60.5206 5.20742C91.0177 5.20742 115.834 30.0236 115.834 60.5206C115.834 64.3203 115.51 68.12 114.8 71.8573C114.439 73.7634 113.978 75.6446 113.392 77.5008C112.981 78.8338 111.125 82.5089 109.53 82.5961C104.784 82.8452 100.274 73.1654 98.7914 69.5277C98.4675 68.7304 98.181 67.9206 97.9194 67.1109C97.6204 66.1516 97.3588 65.1799 97.1221 64.2082C96.3497 60.8695 95.9136 57.4684 95.4776 54.0799C95.2907 52.6472 94.3813 49.8442 92.1513 50.2179C91.5907 50.3051 91.1173 50.6415 90.6813 50.9654C86.1342 54.3913 83.4059 59.3994 80.1294 63.7099C77.7001 66.9115 72.6796 73.5392 67.4722 72.8166C65.317 72.5052 63.8843 70.6988 62.9749 68.9422C59.0631 61.3429 60.4085 52.5226 59.0132 44.2506C58.652 42.1203 57.593 39.5539 55.1637 39.2923C53.6688 39.1304 52.286 39.9526 51.1274 40.7997C44.7489 45.4341 39.8529 51.389 35.4055 57.4934C31.7428 62.5264 28.0304 67.5469 24.5546 72.692C21.4027 77.3513 18.3256 82.2722 18.7617 87.9156C18.7741 88.0527 18.9734 88.7877 18.8987 88.8998C25.8876 79.4941 33.7859 70.8732 44.1758 64.258C47.1533 62.3644 50.2304 62.1152 52.2361 65.1674C55.5126 70.2004 55.0142 76.4045 56.4344 82.0728C57.1695 84.9755 59.2749 88.3143 62.6385 88.1399C63.8345 88.0776 64.9308 87.5419 65.9274 86.9688C72.3432 83.2688 76.691 77.1769 83.2439 73.6637C84.552 72.9661 86.0843 72.3557 87.5793 72.6547C90.3948 73.2028 91.7278 76.5664 93.1604 78.7092C95.7143 82.4964 98.9783 87.2554 103.052 89.5352C105.469 90.8806 108.409 91.1173 111.013 90.1954C113.704 89.2486 115.473 87.0311 116.631 84.4648C118.089 81.2257 118.786 77.3264 119.571 73.8631C120.456 69.9637 120.942 65.9772 121.041 61.9907C121.054 61.5048 121.054 61.0065 121.054 60.5206C121.041 27.7314 94.8298 0.946803 62.2523 0.0249159C61.6792 0.0124579 61.1062 0 60.5331 0C27.9432 0 0.809777 26.2364 0.0124696 59.0257Z"
        fill={useGradient ? `url(#${gradientId})` : color}
      />
    </svg>
  );
};

interface KorunaLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const KorunaLogo: React.FC<KorunaLogoProps> = ({ size = 'md' }) => {
  const fontSizes = {
    sm: '1.2rem',
    md: '1.5rem',
    lg: '1.85rem',
  };

  const svgDimensions = {
    sm: { width: 24, height: 18 },
    md: { width: 30, height: 22 },
    lg: { width: 36, height: 27 },
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
      <KorunaLogoSvg width={svgDimensions[size].width} height={svgDimensions[size].height} color="#AF1F60" />

      <span style={{ fontSize: fontSizes[size], fontWeight: 800, color: 'var(--udemy-dark)', letterSpacing: '-0.03em' }}>
        koruna<span style={{ color: '#AF1F60' }}>academy</span>
      </span>
    </div>
  );
};

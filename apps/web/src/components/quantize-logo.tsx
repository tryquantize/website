interface QuantizeLogoProps {
  size?: number;
  className?: string;
}

export function QuantizeLogo({ size = 48, className = "" }: QuantizeLogoProps) {
  return (
    <img
      src="/quantizenobg.png"
      alt="Quantize Logo"
      width={size * 1.56}
      height={size * 1.56}
      className={className}
    />
  );
}
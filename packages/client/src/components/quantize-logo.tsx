type QuantizeLogoProps = {
  size?: number; // px
  className?: string;
};

export function QuantizeLogo({ size = 28, className = "" }: QuantizeLogoProps) {
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
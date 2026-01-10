interface ProductHuntBadgeProps {
  className?: string;
}

export function ProductHuntBadge({ className = "" }: ProductHuntBadgeProps) {
  return (
    <a 
      href="https://www.producthunt.com/products/quantize-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-quantize-2" 
      target="_blank" 
      rel="noopener noreferrer"
      className={className}
    >
      <img 
        alt="Quantize - AI Search Engine for B2B Discovery | Product Hunt" 
        width="250" 
        height="54" 
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1060869&theme=light&t=1768037159175"
        className="transition-transform hover:scale-105"
      />
    </a>
  );
}
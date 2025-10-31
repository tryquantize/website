import type { Product } from "@/types";

export async function fetchProducts(): Promise<Product[]> {
  return [
    { id: "p1", name: "VisionPro AI", category: "Computer Vision", description: "Image recognition at scale with simple APIs." },
    { id: "p2", name: "ChatFlow Studio", category: "Conversational AI", description: "Design, test, and deploy chat automations easily." },
    { id: "p3", name: "ForecastIQ", category: "Time Series", description: "Accurate demand forecasts powered by ML." },
  ];
}


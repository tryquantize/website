import styles from "./styles.module.css";

export default function HeroSection() {
  return (
    <section className={"container mx-auto px-6 py-16 " + styles.hero}>
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          The Future of Search is Here with <span className="text-blue-400">Quantize</span>
        </h1>
        <p className="text-white/80 text-lg mb-8">
          Experience AI-powered search that understands context, provides intelligent insights, and delivers exactly what you're looking for.
        </p>
        <div className="flex gap-3">
          <a href="/products" className="px-5 py-3 bg-primary text-primary-foreground rounded-md">
            Try Quantize
          </a>
        </div>
      </div>
    </section>
  );
}


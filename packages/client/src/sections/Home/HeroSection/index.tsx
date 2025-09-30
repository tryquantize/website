import styles from "./styles.module.css";

export default function HeroSection() {
  return (
    <section className={"container mx-auto px-6 py-16 " + styles.hero}>
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Discover the right AI tools for your business
        </h1>
        <p className="text-white/80 text-lg mb-8">
          Search, compare, and evaluate AI products with a beautiful, fast interface.
        </p>
        <div className="flex gap-3">
          <a href="/products" className="px-5 py-3 bg-primary text-primary-foreground rounded-md">
            Explore Products
          </a>
          <a href="/onboarding" className="px-5 py-3 border border-border rounded-md">
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}


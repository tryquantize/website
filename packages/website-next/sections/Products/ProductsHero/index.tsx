import styles from "./styles.module.css";

export default function ProductsHero() {
  return (
    <section className={"container mx-auto px-6 py-12 " + styles.hero}>
      <h1 className="text-3xl md:text-5xl font-bold mb-4">Explore AI Products</h1>
      <p className="text-white/80 max-w-2xl">
        Browse curated products, compare features, and discover the best fit.
      </p>
    </section>
  );
}


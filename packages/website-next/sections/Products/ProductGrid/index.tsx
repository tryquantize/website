import { sampleProducts } from "./data";

export default function ProductGrid() {
  return (
    <section className="container mx-auto px-6 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProducts.map((p) => (
          <article key={p.id} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <span className="text-sm text-white/60">{p.category}</span>
            </div>
            <p className="text-sm text-white/70 mb-4">{p.description}</p>
            <a href={"/results?product=" + encodeURIComponent(p.name)} className="text-primary hover:underline">
              View details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}


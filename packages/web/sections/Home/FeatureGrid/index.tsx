import { features } from "./data";

export default function FeatureGrid() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-card border border-border rounded-xl p-6">
            <div className="text-xl font-semibold mb-2">{f.title}</div>
            <p className="text-white/70 text-sm">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


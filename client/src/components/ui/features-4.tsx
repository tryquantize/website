import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">The foundation for AI-powered business intelligence</h2>
                    <p>Quantize is evolving to be more than just search. It supports an entire ecosystem of AI tools and platforms helping businesses discover, analyze, and innovate with intelligent data insights.</p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Lightning Fast</h3>
                        </div>
                        <p className="text-sm">Instant AI-powered search and analysis across millions of data points to deliver results in seconds.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">AI-Powered</h3>
                        </div>
                        <p className="text-sm">Advanced machine learning algorithms that understand context and deliver intelligent business insights.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />
                            <h3 className="text-sm font-medium">Secure & Private</h3>
                        </div>
                        <p className="text-sm">Enterprise-grade security with end-to-end encryption protecting your sensitive business data.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />
                            <h3 className="text-sm font-medium">Customizable</h3>
                        </div>
                        <p className="text-sm">Tailor the platform to your specific industry needs with custom workflows and integrations.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />
                            <h3 className="text-sm font-medium">Full Control</h3>
                        </div>
                        <p className="text-sm">Complete control over your data sources, search parameters, and analytical outputs.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">Built for Scale</h3>
                        </div>
                        <p className="text-sm">Designed to grow with your business, from startup to enterprise-level operations.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
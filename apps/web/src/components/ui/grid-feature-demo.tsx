'use client';
import { Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { FeatureCard } from '@/components/ui/grid-feature-cards';

const features = [
	{
		title: 'Lightning Fast',
		icon: Zap,
		description: 'AI-powered search that delivers instant, precise results from across the web.',
	},
	{
		title: 'Intelligent Processing',
		icon: Cpu,
		description: 'Advanced algorithms that understand context and provide relevant answers.',
	},
	{
		title: 'Secure & Private',
		icon: Fingerprint,
		description: 'Your searches are protected with enterprise-grade security and privacy.',
	},
	{
		title: 'Customizable Experience',
		icon: Pencil,
		description: 'Tailor your search experience with personalized filters and preferences.',
	},
	{
		title: 'Full Control',
		icon: Settings2,
		description: 'Complete control over your data, search history, and privacy settings.',
	},
	{
		title: 'AI-First Design',
		icon: Sparkles,
		description: 'Built from the ground up to harness the power of artificial intelligence.',
	},
];

export default function GridFeatureDemo() {
	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto w-full max-w-5xl space-y-8 px-4">
				<AnimatedContainer className="mx-auto max-w-3xl text-center">
					<h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold">
						Power. Speed. Intelligence.
					</h2>
					<p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
						Everything you need for intelligent search and discovery.
					</p>
				</AnimatedContainer>

				<AnimatedContainer
					delay={0.4}
					className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3"
				>
					{features.map((feature, i) => (
						<FeatureCard key={i} feature={feature} />
					))}
				</AnimatedContainer>
			</div>
		</section>
	);
}

type ViewAnimationProps = {
	delay?: number;
	className?: React.ComponentProps<typeof motion.div>['className'];
	children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
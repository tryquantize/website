import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

function InteractiveHoverButtonDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Interactive Hover Button Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InteractiveHoverButton text="Get Started" />
        <InteractiveHoverButton text="Learn More" />
        <InteractiveHoverButton text="Contact Us" />
        <InteractiveHoverButton text="Sign Up" />
        <InteractiveHoverButton text="Try Now" />
        <InteractiveHoverButton text="Explore" />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-white/70 mb-4">
          Hover over the buttons to see the interactive effect with sliding text and arrow animation.
        </p>
        <p className="text-white/50 text-sm">
          This effect is now available on all Button and AnimatedButton components with the `interactive` prop.
        </p>
      </div>
    </div>
  );
}

export { InteractiveHoverButtonDemo };
import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        THREE: any;
        VANTA: any;
    }
}

export const VantaRingsBackground = () => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    useEffect(() => {
        if (!vantaRef.current) return;

        const loadScripts = async () => {
            // Load Three.js
            if (!window.THREE) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
            }

            // Load Vanta Rings
            if (!window.VANTA) {
                await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js');
            }

            // Initialize Vanta after scripts are loaded
            if (vantaRef.current && window.VANTA && !vantaEffect.current) {
                vantaEffect.current = window.VANTA.RINGS({
                    el: vantaRef.current,
                    mouseControls: !isMobile, // Disable mouse control on mobile
                    touchControls: isMobile, // Enable only on mobile
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: isMobile ? 0.8 : 1.00, // Smaller scale on mobile
                    scaleMobile: 0.7, // Even smaller on very small screens
                    backgroundColor: 0x0,
                    color: 0x1e3a8a, // Dark blue
                    color2: 0x4c1d95, // Dark purple
                    backgroundAlpha: isMobile ? 0.3 : 0.5, // Less intense on mobile
                });
            }
        };

        loadScripts();

        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
                vantaEffect.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={vantaRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: isMobile ? 0.5 : 0.65 }}
        />
    );
};

// Helper function to load external scripts
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

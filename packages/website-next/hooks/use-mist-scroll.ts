/* File Overview
  Path: client/src/hooks/use-mist-scroll.ts
  Purpose: Custom React hook encapsulating reusable logic.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useEffect } from "react";

type UseMistScrollOptions = {
  selector?: string;
  intensityViewportFactor?: number; // higher = fades slower
  groupByRow?: boolean; // when true, elements at similar top positions share the same fade (row-wise)
};

/**
 * Adds a gentle "mist" fade/blur to elements as they scroll out of view upward.
 * Elements regain clarity when scrolling back up.
 *
 * Apply the class "mist-on-scroll" to your target elements for CSS, and
 * pass a container ref so the hook can track child elements matching selector.
 */
export function useMistScroll(
  containerRef: React.RefObject<HTMLElement>,
  { selector = ".mist-target", intensityViewportFactor = 0.8, groupByRow = false }: UseMistScrollOptions = {}
) {
  useEffect(() => {
    const container = containerRef.current || document.body;
    if (!container) return;

    let frame = 0;

    const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

    const update = () => {
      const targets = Array.from(container.querySelectorAll<HTMLElement>(selector));
      const vh = window.innerHeight || 800;

      if (groupByRow) {
        // Group by approximate top position to create row behavior
        const groups = new Map<number, HTMLElement[]>();
        const tolerance = 12; // px tolerance for grouping rows
        targets.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          const key = Math.round(top / tolerance);
          const arr = groups.get(key) || [];
          arr.push(el);
          groups.set(key, arr);
        });

        groups.forEach((els) => {
          let minTop = Infinity;
          els.forEach((el) => {
            const t = el.getBoundingClientRect().top;
            if (t < minTop) minTop = t;
          });
          const passed = 0 - minTop;
          const intensity = passed > 0 ? clamp(passed / (vh * intensityViewportFactor), 0, 1) : 0;
          els.forEach((el) => el.style.setProperty("--mist", intensity.toFixed(3)));
        });
      } else {
        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const passed = 0 - rect.top;
          const intensity = passed > 0 ? clamp(passed / (vh * intensityViewportFactor), 0, 1) : 0;
          el.style.setProperty("--mist", intensity.toFixed(3));
        });
      }
    };

    const onScroll = () => {
      // throttle via rAF for perf
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [containerRef, selector, intensityViewportFactor, groupByRow]);
}


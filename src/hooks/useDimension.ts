import { useEffect, useRef, useState } from "react";

export const useDimension = () => {
  const divRef = useRef<HTMLDivElement>(null); // Create a ref
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [remainingHeight, setRemainingHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (divRef.current) {
        const { height } = divRef.current.getBoundingClientRect();
        setRemainingHeight(window.innerHeight - height);
      }
    };

    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.target === divRef.current) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
          setRemainingHeight(window.innerHeight - height);
        }
      }
    });

    if (divRef.current) {
      resizeObserver.observe(divRef.current); // Start observing
      handleResize(); // Initial calculation
    }

    window.addEventListener("resize", handleResize); // Listen for window resize

    return () => {
      // Cleanup observer and event listener
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [divRef]);

  return { divRef, dimensions, remainingHeight };
};

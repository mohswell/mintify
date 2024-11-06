import { useEffect, useState, useRef } from "react";

export function useElementSize(...dependencies: any): {
  ref: React.MutableRefObject<any>;
  width: number;
  height: number;
} {
  const ref = useRef<any>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (ref && ref.current) {
        setWidth(ref.current.offsetWidth);
        setHeight(ref.current.offsetHeight);
      }
    };

    if (ref && ref.current) {
      handleResize();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref, dependencies]);

  return { ref, width, height };
}

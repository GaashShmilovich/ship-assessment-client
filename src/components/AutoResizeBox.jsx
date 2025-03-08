import React, { useRef, useEffect } from "react";

const AutoResizeBox = ({ children, onResize }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        onResize(entry.contentRect.height);
      }
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, [onResize]);

  return <div ref={ref}>{children}</div>;
};

export default AutoResizeBox;

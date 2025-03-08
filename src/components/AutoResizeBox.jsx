// src/components/AutoResizeBox.jsx
import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";

/**
 * A component that wraps content and detects size changes
 * It doesn't rely on an onResize callback anymore to be more flexible
 */
const AutoResizeBox = ({ children, sx = {} }) => {
  const containerRef = useRef(null);

  // Set up the ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    // Create new ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      // We'll just let the component render naturally
      // No need to call an external callback that could be missing
    });

    // Start observing the container
    resizeObserver.observe(containerRef.current);

    // Clean up observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default AutoResizeBox;

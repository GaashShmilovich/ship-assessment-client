// src/components/AutoResizeBox.jsx
import React, { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";

/**
 * A component that wraps content and detects size changes
 * Properly handles resize events and notifies children through props
 */
const AutoResizeBox = ({ children, sx = {}, onResize }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up the ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    // Create new ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;

      const { width, height } = entries[0].contentRect;

      // Only update if dimensions actually changed
      if (width !== dimensions.width || height !== dimensions.height) {
        setDimensions({ width, height });

        // Call onResize prop if provided
        if (onResize) {
          onResize({ width, height });
        }
      }
    });

    // Start observing the container
    resizeObserver.observe(containerRef.current);

    // Clean up observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [dimensions, onResize]);

  // Clone children and pass dimensions as props if they're a valid React element
  const childrenWithProps = React.Children.map(children, (child) => {
    // Check if valid React element and not a DOM element (lowercase tag name)
    if (React.isValidElement(child)) {
      // Only pass props to custom components (uppercase first letter)
      const componentName =
        child.type?.displayName ||
        child.type?.name ||
        (typeof child.type === "string" ? child.type : "");
      const isCustomComponent = componentName && /^[A-Z]/.test(componentName);

      // Don't pass containerDimensions to Fragment (React.Fragment or <>)
      const isFragment =
        child.type === React.Fragment ||
        child.type?.toString() === "Symbol(react.fragment)";

      if (isCustomComponent && !isFragment) {
        return React.cloneElement(child, { containerDimensions: dimensions });
      }
    }
    return child;
  });

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
      {childrenWithProps}
    </Box>
  );
};

export default AutoResizeBox;

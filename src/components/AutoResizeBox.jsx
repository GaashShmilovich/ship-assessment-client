// src/components/AutoResizeBox.jsx - Fixed version
import React, { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";

/**
 * A component that wraps content and detects size changes
 * Properly handles resize events and notifies children through props
 */
const AutoResizeBox = ({ children, sx = {}, onResize }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

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

      // Mark as initialized after first measurement
      if (!isInitialized) {
        setIsInitialized(true);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onResize, dimensions, isInitialized]);

  // Force a measurement update after a short delay to ensure children have rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        if (
          width > 0 &&
          height > 0 &&
          (width !== dimensions.width || height !== dimensions.height)
        ) {
          setDimensions({ width, height });
          if (onResize) {
            onResize({ width, height });
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onResize]);

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
        return React.cloneElement(child, {
          containerDimensions: dimensions,
          style: {
            ...child.props.style,
            width: "100%",
            height: "100%",
            minHeight: 300, // Ensure minimum height for charts
          },
        });
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
        minHeight: 300, // Ensure component has minimum height
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...sx,
      }}
      data-dimensions={`${dimensions.width}x${dimensions.height}`}
    >
      {childrenWithProps}
    </Box>
  );
};

export default AutoResizeBox;

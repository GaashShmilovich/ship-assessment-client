// src/components/AutoResizeBox.jsx
// Enhanced with better resize handling and overflow control

import React, { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";

const AutoResizeBox = ({ children, sx = {}, onResize }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const rafRef = useRef(null);

  // Set up the ResizeObserver with throttling
  useEffect(() => {
    if (!containerRef.current) return;

    // Helper function with throttling to prevent too many updates
    const updateDimensions = (entries) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!entries || !entries[0]) return;

        const { width, height } = entries[0].contentRect;

        // Only update if dimensions actually changed and are valid
        if (
          (width !== dimensions.width || height !== dimensions.height) &&
          width > 0 &&
          height > 0
        ) {
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
    };

    // Create new ResizeObserver
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
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
  }, [onResize, dimensions]);

  const childrenWithProps = React.Children.map(children, (child) => {
    // If not a valid React element, return as is
    if (!React.isValidElement(child)) return child;

    // Don't pass props to DOM elements
    if (typeof child.type === "string") return child;

    // Check if the child is a custom component (uppercase first letter)
    const componentName =
      child.type?.displayName ||
      child.type?.name ||
      (typeof child.type === "string" ? child.type : "");

    const isCustomComponent = componentName && /^[A-Z]/.test(componentName);

    // Don't pass containerDimensions to Fragment
    const isFragment =
      child.type === React.Fragment ||
      child.type?.toString() === "Symbol(react.fragment)";

    if (isCustomComponent && !isFragment) {
      // Pass containerDimensions and ensure it has proper style
      return React.cloneElement(child, {
        containerDimensions: dimensions,
        style: {
          ...child.props.style,
          width: "100%",
          height: "100%",
          // No minHeight to avoid overflow issues
        },
      });
    }

    return child;
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100%",
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden", // Prevent content from overflowing
        ...sx,
      }}
      data-dimensions={`${dimensions.width}x${dimensions.height}`}
    >
      {childrenWithProps}
    </Box>
  );
};

export default AutoResizeBox;

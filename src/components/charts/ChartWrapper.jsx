// src/components/charts/ChartWrapper.jsx - Enhanced version with Chart.js error fixes
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Skeleton,
  CircularProgress,
  Button,
  Alert,
  Paper,
  Fade,
  useTheme,
  IconButton,
  Tooltip,
  Backdrop,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoResizeBox from "../AutoResizeBox";

/**
 * An enhanced wrapper for all chart components
 * Handles loading, error states, resizing, and provides export functionality
 * Now with safer mounting/unmounting logic
 */
const ChartWrapper = ({
  title,
  isLoading,
  error,
  onRefetch,
  children,
  exportChart,
  height = 300,
  description,
  containerDimensions,
  showFullscreenButton = false,
  onFullscreen = null,
}) => {
  const theme = useTheme();
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hasRendered, setHasRendered] = useState(false);
  const [showRetryBackdrop, setShowRetryBackdrop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [canRenderCharts, setCanRenderCharts] = useState(false);

  // Set mounted status with improved cleanup
  useEffect(() => {
    setIsMounted(true);

    // Delay chart rendering to prevent ownerDocument errors
    const renderTimer = setTimeout(() => {
      if (wrapperRef.current) {
        setCanRenderCharts(true);
      }
    }, 300); // Increased delay to ensure DOM is fully ready

    return () => {
      setIsMounted(false);
      clearTimeout(renderTimer);
      setCanRenderCharts(false);
    };
  }, []);

  // Track if component has rendered successfully
  useEffect(() => {
    if (!isLoading && !error && isMounted && canRenderCharts) {
      // Only set hasRendered to true after a short delay to ensure chart has time to render
      const timer = setTimeout(() => {
        if (isMounted) {
          setHasRendered(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, isMounted, canRenderCharts]);

  // Handle container dimension updates - now with safety checks
  useEffect(() => {
    if (containerDimensions && isMounted) {
      // Only update dimensions if they're actually valid numbers
      if (
        typeof containerDimensions.width === "number" &&
        typeof containerDimensions.height === "number" &&
        containerDimensions.width > 0 &&
        containerDimensions.height > 0
      ) {
        setDimensions(containerDimensions);
      }
    }
  }, [containerDimensions, isMounted]);

  // Handle resize from parent with improved safety
  const handleResize = (newDimensions) => {
    if (isMounted && newDimensions) {
      // Validate dimensions before updating state
      if (
        typeof newDimensions.width === "number" &&
        typeof newDimensions.height === "number" &&
        newDimensions.width > 0 &&
        newDimensions.height > 0
      ) {
        setDimensions(newDimensions);
      }
    }
  };

  // Handle retry with backdrop
  const handleRetryWithFeedback = () => {
    if (!onRefetch || !isMounted) return;

    setShowRetryBackdrop(true);
    // Call refetch
    Promise.resolve(onRefetch()).finally(() => {
      // Hide backdrop after a minimum delay to show the loading state
      if (isMounted) {
        setTimeout(() => {
          setShowRetryBackdrop(false);
        }, 800);
      }
    });
  };

  // Safety wrapper for chart components
  const renderSafeChildren = () => {
    // Don't render children until we're ready
    if (!canRenderCharts) {
      return (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Invisible placeholder while waiting for DOM to be ready */}
        </Box>
      );
    }

    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Only pass props to custom components (uppercase first letter)
        const componentName =
          child.type?.displayName ||
          child.type?.name ||
          (typeof child.type === "string" ? child.type : "");
        const isCustomComponent = componentName && /^[A-Z]/.test(componentName);

        // Don't pass props to Fragment
        const isFragment =
          child.type === React.Fragment ||
          child.type?.toString() === "Symbol(react.fragment)";

        if (isCustomComponent && !isFragment) {
          return React.cloneElement(child, {
            containerDimensions: dimensions,
            parentHeight: height,
            isMounted: isMounted && canRenderCharts, // Only pass true when fully ready
            style: {
              ...child.props.style,
              width: "100%",
              height: "100%",
              minHeight: 250, // Ensure minimum height for charts
            },
          });
        }
      }
      return child;
    });
  };

  return (
    <Box
      ref={wrapperRef}
      sx={{
        flexGrow: 1,
        position: "relative",
        border: error ? `1px solid ${theme.palette.error.light}` : "none",
        borderRadius: 1,
        height: "100%",
        // Set a minimum height to ensure charts don't collapse
        minHeight: "300px",
      }}
    >
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom={!!description}>
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: -1, mb: 1 }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {exportChart && (
              <Tooltip title="Export chart as image">
                <span>
                  <IconButton
                    size="small"
                    onClick={exportChart}
                    disabled={isLoading || !!error || !hasRendered}
                    color="primary"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {onRefetch && (
              <Tooltip title="Refresh data">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleRetryWithFeedback}
                    disabled={isLoading}
                    color="primary"
                  >
                    <RefreshIcon
                      fontSize="small"
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {showFullscreenButton && onFullscreen && (
              <Tooltip title="View fullscreen">
                <span>
                  <IconButton
                    size="small"
                    onClick={onFullscreen}
                    disabled={isLoading || !!error}
                    color="primary"
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      {/* Increased minimum height to ensure visibility */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: height,
          position: "relative",
          border: error ? `1px solid ${theme.palette.error.light}` : "none",
          borderRadius: 1,
          // Use hidden to prevent overflow but allow scrolling when needed
          overflow: "auto",
          // Add some padding to ensure chart labels don't get cut off
          p: 1,
        }}
      >
        {isLoading ? (
          <Fade in={true}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: height - 30, // Account for padding
              }}
            >
              <CircularProgress size={36} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading chart data...
              </Typography>
            </Box>
          </Fade>
        ) : error ? (
          <Fade in={true}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                minHeight: height - 30, // Account for padding
              }}
            >
              <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
              <Typography
                variant="body1"
                color="error"
                gutterBottom
                align="center"
              >
                {error.message || "Error loading chart data"}
              </Typography>
              {onRefetch && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetryWithFeedback}
                  sx={{ mt: 2 }}
                >
                  Retry
                </Button>
              )}
            </Box>
          </Fade>
        ) : (
          <Box
            className="chart-container"
            sx={{
              height: "100%",
              width: "100%",
              // Ensure this element has dimensions before charts render
              minHeight: height,
              position: "relative",
            }}
          >
            <AutoResizeBox onResize={handleResize}>
              {/* Use the safety wrapper function instead of direct rendering */}
              {renderSafeChildren()}
            </AutoResizeBox>
          </Box>
        )}
      </Box>

      {/* Retry backdrop with loading indicator */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: theme.zIndex.drawer + 1,
          position: "absolute",
          borderRadius: 1,
        }}
        open={showRetryBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default ChartWrapper;

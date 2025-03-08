// src/components/charts/ChartWrapper.jsx
import React, { useState, useEffect } from "react";
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hasRendered, setHasRendered] = useState(false);
  const [showRetryBackdrop, setShowRetryBackdrop] = useState(false);

  // Track if component has rendered successfully
  useEffect(() => {
    if (!isLoading && !error) {
      // Only set hasRendered to true after a short delay to ensure chart has time to render
      const timer = setTimeout(() => {
        setHasRendered(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error]);

  // Handle container dimension updates
  useEffect(() => {
    if (containerDimensions) {
      setDimensions(containerDimensions);
    }
  }, [containerDimensions]);

  // Handle resize from parent
  const handleResize = (newDimensions) => {
    setDimensions(newDimensions);
  };

  // Handle retry with backdrop
  const handleRetryWithFeedback = () => {
    if (!onRefetch) return;

    setShowRetryBackdrop(true);
    // Call refetch
    Promise.resolve(onRefetch()).finally(() => {
      // Hide backdrop after a minimum delay to show the loading state
      setTimeout(() => {
        setShowRetryBackdrop(false);
      }, 800);
    });
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
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
                {" "}
                {/* Added span wrapper */}
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
                {" "}
                {/* Added span wrapper */}
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
                {" "}
                {/* Added span wrapper */}
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

      <Box
        sx={{
          flexGrow: 1,
          minHeight: height,
          position: "relative",
          border: error ? `1px solid ${theme.palette.error.light}` : "none",
          borderRadius: 1,
          overflow: "hidden",
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
          <AutoResizeBox onResize={handleResize}>
            {/* Clone children and pass dimensions - THIS IS THE PROBLEM PART */}
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // Only pass props to custom components (uppercase first letter)
                const componentName =
                  child.type?.displayName ||
                  child.type?.name ||
                  (typeof child.type === "string" ? child.type : "");
                const isCustomComponent =
                  componentName && /^[A-Z]/.test(componentName);

                // Don't pass props to Fragment
                const isFragment =
                  child.type === React.Fragment ||
                  child.type?.toString() === "Symbol(react.fragment)";

                if (isCustomComponent && !isFragment) {
                  return React.cloneElement(child, {
                    containerDimensions: dimensions,
                    parentHeight: height,
                  });
                }
              }
              return child;
            })}
          </AutoResizeBox>
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

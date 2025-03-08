// src/components/charts/ChartWrapper.jsx
import React from "react";
import {
  Box,
  Typography,
  Skeleton,
  CircularProgress,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

/**
 * A consistent wrapper for all chart components
 * Handles loading, error states, and provides export functionality
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
}) => {
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
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportChart}
              disabled={isLoading || !!error}
            >
              Export
            </Button>
          )}
          {onRefetch && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefetch}
              disabled={isLoading}
            >
              Refresh
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: height,
          position: "relative",
        }}
      >
        {isLoading ? (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={height * 0.6} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            action={
              onRefetch && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={onRefetch}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              )
            }
            sx={{ width: "100%" }}
          >
            {error.message || "Error loading chart data"}
          </Alert>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};

export default ChartWrapper;

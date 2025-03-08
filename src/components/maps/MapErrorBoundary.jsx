// src/components/maps/MapErrorBoundary.jsx
import React, { Component } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * Error boundary specifically designed for map components
 * Catches errors in map initialization and rendering
 */
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Map Error:", error);
    console.error("Error Info:", errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call parent reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when map fails to load
      return (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              maxWidth: 500,
              backgroundColor: "#f9f9ff",
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 60, color: "error.main", mb: 2 }}
            />

            <Typography variant="h6" gutterBottom>
              Map Failed to Load
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              {this.state.error?.message ||
                "There was an error loading the map component."}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              This could be due to a connection issue or a problem with the map
              library.
            </Typography>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    // Normal component rendering when no error
    return this.props.children;
  }
}

export default MapErrorBoundary;

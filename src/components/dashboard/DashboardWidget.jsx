// src/components/dashboard/DashboardWidget.jsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Slide,
  Dialog,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CloseIcon from "@mui/icons-material/Close";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

/**
 * Reusable dashboard widget component with fullscreen capability
 */
const DashboardWidget = ({
  title,
  icon: IconComponent,
  children,
  // Fullscreen mode options
  allowFullscreen = true,
  fullscreenPadding = true,
  // Draggable handle for grid layout
  draggableHandle = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Add effect to handle widget initialization
  useEffect(() => {
    // Simulate widget content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Short timeout to ensure component is fully mounted

    return () => clearTimeout(timer);
  }, []);

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const WidgetHeader = () => (
    <Box
      className={draggableHandle ? "drag-handle" : ""}
      sx={{
        cursor: draggableHandle ? "move" : "default",
        px: 2,
        py: 1.5,
        bgcolor: "primary.main",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {IconComponent && <IconComponent sx={{ mr: 1 }} />}
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
      </Box>
      {allowFullscreen && (
        <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
          <IconButton
            size="small"
            sx={{ color: "white" }}
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // Render in fullscreen dialog when in fullscreen mode
  if (isFullscreen) {
    return (
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={handleToggleFullscreen}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              {IconComponent && <IconComponent sx={{ mr: 1 }} />}
              <Typography sx={{ ml: 1 }} variant="h6">
                {title}
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleToggleFullscreen}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            height: "calc(100vh - 64px)",
            width: "100%",
            overflow: "auto",
            p: fullscreenPadding ? 2 : 0,
          }}
        >
          {children}
        </Box>
      </Dialog>
    );
  }

  // Render as normal widget when not in fullscreen
  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <WidgetHeader />
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          position: "relative",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : (
          <>
            {isSmall && allowFullscreen && (
              <Tooltip title="Expand">
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    zIndex: 1,
                    bgcolor: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.9)",
                    },
                  }}
                  onClick={handleToggleFullscreen}
                >
                  <ZoomOutMapIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {children}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default DashboardWidget;

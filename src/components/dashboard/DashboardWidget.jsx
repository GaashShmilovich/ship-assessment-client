// src/components/dashboard/DashboardWidget.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Backdrop,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CloseIcon from "@mui/icons-material/Close";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoResizeBox from "../AutoResizeBox";

/**
 * Enhanced dashboard widget component with fullscreen capability,
 * improved error handling, responsive design, and widget controls
 */
const DashboardWidget = ({
  title,
  icon: IconComponent,
  children,
  onRefresh,
  onHide,
  // Fullscreen mode options
  allowFullscreen = true,
  fullscreenPadding = true,
  // Draggable handle for grid layout
  draggableHandle = true,
  // Error and loading states
  isLoading = false,
  error = null,
  additionalControls = null,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);
  const [dimensions, setDimensions] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Add effect to handle widget initialization
  useEffect(() => {
    // Simulate widget content loading
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 300); // Short timeout to ensure component is fully mounted

    return () => clearTimeout(timer);
  }, []);

  // Combined loading state - either internal or passed from parent
  const isWidgetLoading = internalLoading || isLoading;

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleOpenMenu = useCallback((event) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handleRefresh = useCallback(() => {
    if (!onRefresh) return;

    setRefreshing(true);

    // Call parent's refresh function
    Promise.resolve(onRefresh()).finally(() => {
      // Ensure we show loading state for at least 500ms
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    });

    handleCloseMenu();
  }, [onRefresh, handleCloseMenu]);

  const handleHide = useCallback(() => {
    if (onHide) {
      onHide();
    }
    handleCloseMenu();
  }, [onHide, handleCloseMenu]);

  // Handle dimension changes from AutoResizeBox
  const handleResize = useCallback((newDimensions) => {
    setDimensions(newDimensions);
  }, []);

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
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {IconComponent && <IconComponent sx={{ mr: 1 }} />}
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Controls for non-fullscreen mode */}
        {!isFullscreen && (
          <>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  sx={{ color: "white", mr: 0.5 }}
                  onClick={handleRefresh}
                  disabled={refreshing || isWidgetLoading}
                >
                  <RefreshIcon
                    fontSize="small"
                    className={refreshing ? "animate-spin" : ""}
                  />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="More options">
              <IconButton
                size="small"
                sx={{ color: "white", mr: 0.5 }}
                onClick={handleOpenMenu}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {allowFullscreen && (
              <Tooltip
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
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
          </>
        )}

        {/* Specific controls for fullscreen mode */}
        {isFullscreen && (
          <Tooltip title="Exit fullscreen">
            <IconButton
              size="small"
              sx={{ color: "white" }}
              onClick={handleToggleFullscreen}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Widget menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {onRefresh && (
          <MenuItem onClick={handleRefresh}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Refresh" />
          </MenuItem>
        )}

        {allowFullscreen && (
          <MenuItem onClick={handleToggleFullscreen}>
            <ListItemIcon>
              <FullscreenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Fullscreen" />
          </MenuItem>
        )}

        {/* Additional controls provided by parent */}
        {additionalControls && (
          <>
            <Divider />
            {additionalControls.map((control, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  control.onClick();
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>{control.icon}</ListItemIcon>
                <ListItemText primary={control.label} />
              </MenuItem>
            ))}
          </>
        )}

        {onHide && (
          <>
            <Divider />
            <MenuItem onClick={handleHide}>
              <ListItemIcon>
                <VisibilityOffIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Hide Widget" />
            </MenuItem>
          </>
        )}
      </Menu>
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

            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton
                  color="inherit"
                  onClick={handleRefresh}
                  disabled={refreshing || isWidgetLoading}
                  sx={{ mr: 1 }}
                >
                  <RefreshIcon className={refreshing ? "animate-spin" : ""} />
                </IconButton>
              </Tooltip>
            )}

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
          <AutoResizeBox onResize={handleResize}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  containerDimensions: dimensions,
                  isFullscreen: true,
                });
              }
              return child;
            })}
          </AutoResizeBox>
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
          p: 0,
          position: "relative",
        }}
      >
        {isWidgetLoading ? (
          <Fade in={true}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
                p: 3,
              }}
            >
              <CircularProgress size={36} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading widget...
              </Typography>
            </Box>
          </Fade>
        ) : error ? (
          <Fade in={true}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
                p: 3,
              }}
            >
              <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
              <Typography
                variant="body1"
                color="error"
                align="center"
                gutterBottom
              >
                {typeof error === "string"
                  ? error
                  : "Error loading widget data"}
              </Typography>
              {onRefresh && (
                <Tooltip title="Try again">
                  <IconButton
                    color="primary"
                    onClick={handleRefresh}
                    sx={{ mt: 1 }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Fade>
        ) : (
          <AutoResizeBox onResize={handleResize}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  containerDimensions: dimensions,
                });
              }
              return child;
            })}
          </AutoResizeBox>
        )}

        {/* Mobile fullscreen button overlay */}
        {isSmall && allowFullscreen && !isWidgetLoading && !error && (
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

        {/* Refreshing overlay */}
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: theme.zIndex.drawer + 1,
            position: "absolute",
          }}
          open={refreshing}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Paper>
  );
};

export default DashboardWidget;

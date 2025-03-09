// src/pages/CustomDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
  Button,
  Fade,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ShipMap from "../components/ShipMap";
import ShipInfoChart from "../components/charts/ShipInfoChart";
import SSAAssessmentsChart from "../components/charts/SSAAssessmentsChart";
import InfractionsChart from "../components/charts/InfractionsChart";
import CargoCapacityChart from "../components/charts/CargoCapacityChart";
import AutoResizeBox from "../components/AutoResizeBox";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarningIcon from "@mui/icons-material/Warning";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { useQueryClient } from "@tanstack/react-query";

// Widget configuration
const widgetConfig = {
  shipMap: {
    label: "Ship Map View",
    icon: DirectionsBoatIcon,
    description: "Interactive map showing all vessels in the port area",
  },
  shipInfo: {
    label: "Ship Status",
    icon: AssessmentIcon,
    description: "Overview of ship statuses across the fleet",
  },
  ssa: {
    label: "Security Assessments",
    icon: WarningIcon,
    description: "Distribution of ship security assessment types",
  },
  infractions: {
    label: "Infractions",
    icon: WarningIcon,
    description: "Breakdown of reported infractions by type",
  },
  cargo: {
    label: "Cargo Capacity",
    icon: LocalShippingIcon,
    description: "Analysis of fleet cargo capacity distribution",
  },
};

const getDefaultLayout = (width) => {
  const cols = width < 600 ? 1 : width < 960 ? 2 : 12;

  // For mobile: Stack all widgets with fixed heights
  if (cols === 1) {
    return [
      { i: "shipMap", x: 0, y: 0, w: 1, h: 16, static: false }, // Map
      { i: "shipInfo", x: 0, y: 16, w: 1, h: 14, static: false }, // Ship status
      { i: "ssa", x: 0, y: 30, w: 1, h: 14, static: false }, // SSA pie chart
      { i: "infractions", x: 0, y: 44, w: 1, h: 14, static: false }, // Infractions
      { i: "cargo", x: 0, y: 58, w: 1, h: 14, static: false }, // Cargo
    ];
  }

  // For tablet: Two column layout
  if (cols === 2) {
    return [
      { i: "shipMap", x: 0, y: 0, w: 2, h: 16, static: false }, // Full width map
      { i: "shipInfo", x: 0, y: 16, w: 1, h: 14, static: false }, // Left column
      { i: "ssa", x: 1, y: 16, w: 1, h: 14, static: false }, // Right column
      { i: "infractions", x: 0, y: 30, w: 1, h: 14, static: false }, // Left column
      { i: "cargo", x: 1, y: 30, w: 1, h: 14, static: false }, // Right column
    ];
  }

  // Default (desktop) layout
  return [
    { i: "shipMap", x: 0, y: 0, w: 12, h: 16, static: false }, // Full width map
    { i: "shipInfo", x: 0, y: 16, w: 6, h: 14, static: false }, // Left half
    { i: "ssa", x: 6, y: 16, w: 6, h: 14, static: false }, // Right half
    { i: "infractions", x: 0, y: 30, w: 6, h: 14, static: false }, // Left half
    { i: "cargo", x: 6, y: 30, w: 6, h: 14, static: false }, // Right half
  ];
};

const initialWidgets = {
  shipMap: true,
  shipInfo: true,
  ssa: true,
  infractions: true,
  cargo: true,
};

// Local storage key for saving dashboard state
const DASHBOARD_STATE_KEY = "maritime_dashboard_state";

const SimpleWidget = ({ title, icon: IconComponent, children }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 2,
        overflow: "hidden", // Changed back to hidden to prevent overflow
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": { boxShadow: 4 },
      }}
    >
      {/* Header */}
      <Box
        className="drag-handle"
        sx={{
          cursor: "move",
          px: 2,
          py: 1.5,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {IconComponent && <IconComponent sx={{ mr: 1 }} />}
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
        </Box>
        {/* Remove resize button since resizing is disabled */}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto", // Allow scrolling if content is too large
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
          <>{children}</>
        )}
      </Box>
    </Paper>
  );
};

const CustomDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const queryClient = useQueryClient();

  // Each widget has its own mounting counter
  const [mountCounters, setMountCounters] = useState({
    shipMap: 1,
    shipInfo: 1,
    ssa: 1,
    infractions: 1,
    cargo: 1,
  });

  // Track visibility separately for cleaner logic
  const [visibleWidgets, setVisibleWidgets] = useState({ ...initialWidgets });

  // Custom snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Calculate container width
  const getContainerWidth = () => {
    if (isMobile) return window.innerWidth - 32;
    if (isTablet) return window.innerWidth - 48;
    return Math.min(1200, window.innerWidth - 48);
  };

  const [containerWidth, setContainerWidth] = useState(getContainerWidth());
  const [layout, setLayout] = useState(getDefaultLayout(getContainerWidth()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleToggleWidget = useCallback(
    (widgetKey) => {
      setVisibleWidgets((prev) => ({
        ...prev,
        [widgetKey]: !prev[widgetKey],
      }));

      if (!visibleWidgets[widgetKey]) {
        setMountCounters((prev) => ({
          ...prev,
          [widgetKey]: prev[widgetKey] + 1,
        }));

        setTimeout(() => {
          switch (widgetKey) {
            case "shipMap":
            case "shipInfo":
              queryClient.invalidateQueries({ queryKey: ["ships"] });
              queryClient.refetchQueries({ queryKey: ["ships"] });
              break;
            case "ssa":
              queryClient.invalidateQueries({ queryKey: ["assessments"] });
              queryClient.refetchQueries({ queryKey: ["assessments"] });
              break;
            case "infractions":
              queryClient.invalidateQueries({ queryKey: ["infractions"] });
              queryClient.refetchQueries({ queryKey: ["infractions"] });
              break;
            case "cargo":
              queryClient.invalidateQueries({ queryKey: ["ships"] });
              queryClient.refetchQueries({ queryKey: ["ships"] });
              break;
          }
        }, 100);
      }

      setHasUnsavedChanges(true);
    },
    [visibleWidgets, queryClient]
  );

  const showSnackbar = (message, options = {}) => {
    setSnackbar({
      open: true,
      message,
      severity: options.variant || "info",
      autoHideDuration: options.autoHideDuration || 4000,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Update layout and container width on resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = getContainerWidth();
      setContainerWidth(newWidth);

      // Only reset layout on major breakpoint changes
      const oldCols = layout[0]?.w === 1 ? 1 : layout[0]?.w === 2 ? 2 : 12;
      const newCols = newWidth < 600 ? 1 : newWidth < 960 ? 2 : 12;

      if (oldCols !== newCols) {
        setLayout(getDefaultLayout(newWidth));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [layout]);

  // Save current dashboard state to localStorage
  const saveDashboardState = useCallback(() => {
    try {
      localStorage.setItem(
        DASHBOARD_STATE_KEY,
        JSON.stringify({
          layout,
          activeWidgets: visibleWidgets,
        })
      );

      setHasUnsavedChanges(false);
      showSnackbar("Dashboard layout saved successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving dashboard state:", error);
      showSnackbar("Failed to save dashboard layout", {
        variant: "error",
      });
    }
  }, [layout, visibleWidgets]);

  // Reset dashboard to default state
  const resetDashboard = useCallback(() => {
    setVisibleWidgets({ ...initialWidgets });
    setLayout(getDefaultLayout(getContainerWidth()));

    // Increment all counters to force remount
    setMountCounters((prev) => {
      const newCounters = {};
      Object.keys(prev).forEach((key) => {
        newCounters[key] = prev[key] + 1;
      });
      return newCounters;
    });

    setHasUnsavedChanges(true);
    showSnackbar("Dashboard reset to default layout", {
      variant: "info",
    });

    // Refresh all data
    queryClient.invalidateQueries({ queryKey: ["ships"] });
    queryClient.invalidateQueries({ queryKey: ["assessments"] });
    queryClient.invalidateQueries({ queryKey: ["infractions"] });
  }, [queryClient]);

  // Load saved dashboard state on first render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(DASHBOARD_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);

        if (parsed.layout) {
          setLayout(parsed.layout);
        }

        if (parsed.activeWidgets) {
          setVisibleWidgets(parsed.activeWidgets);
        }
      }
    } catch (error) {
      console.error("Error loading saved layout:", error);
    }
  }, []);

  // Function to refresh all data
  const refreshAllData = useCallback(() => {
    setIsRefreshing(true);

    // Invalidate queries to force a refresh
    queryClient.invalidateQueries({ queryKey: ["ships"] });
    queryClient.invalidateQueries({ queryKey: ["assessments"] });
    queryClient.invalidateQueries({ queryKey: ["infractions"] });

    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
      showSnackbar("Dashboard data refreshed", { variant: "info" });
    }, 1000);
  }, [queryClient]);

  // Filter layout items based on visible widgets
  const filteredLayout = layout.filter((item) => visibleWidgets[item.i]);

  // Handle layout change
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    setHasUnsavedChanges(true);
  };

  // Get the number of active widgets
  const activeWidgetCount =
    Object.values(visibleWidgets).filter(Boolean).length;

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[100],
        minHeight: "calc(100vh - 64px - 80px)",
        py: 3,
      }}
    >
      {/* Custom snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Dashboard Controls */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            background: "linear-gradient(to right, #ffffff, #f9f9ff)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: { xs: 2, sm: 0 },
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 1 }}>
              Dashboard Controls
            </Typography>

            <Tooltip title="Refresh all data">
              <IconButton
                color="primary"
                onClick={refreshAllData}
                disabled={isRefreshing}
                size="small"
                sx={{ mr: 1 }}
              >
                <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save layout">
              <span>
                <IconButton
                  color="success"
                  onClick={saveDashboardState}
                  disabled={!hasUnsavedChanges}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Reset to default">
              <IconButton color="warning" onClick={resetDashboard} size="small">
                <RestoreIcon />
              </IconButton>
            </Tooltip>

            <Chip
              label={`${activeWidgetCount} active widgets`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: { xs: 0, sm: 1 } }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              maxWidth: { xs: "100%", md: "60%" },
            }}
          >
            {Object.keys(initialWidgets).map((key) => (
              <Chip
                key={key}
                icon={
                  visibleWidgets[key] ? (
                    <VisibilityIcon fontSize="small" />
                  ) : (
                    <VisibilityOffIcon fontSize="small" />
                  )
                }
                label={widgetConfig[key].label}
                variant={visibleWidgets[key] ? "default" : "outlined"}
                onClick={() => handleToggleWidget(key)}
                color={visibleWidgets[key] ? "primary" : "default"}
                sx={{ borderRadius: "4px" }}
              />
            ))}
          </Box>
        </Paper>

        {/* Responsive Grid Layout */}
        <Box
          sx={{
            position: "relative",
            ".react-grid-item.react-grid-placeholder": {
              backgroundColor: theme.palette.primary.light,
              opacity: 0.3,
              borderRadius: 2,
            },
          }}
        >
          <style>{`
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .react-grid-item {
              transition: all 200ms ease;
              transition-property: left, top, width, height;
            }
          `}</style>

          {activeWidgetCount === 0 ? (
            <Fade in={true} timeout={500}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: theme.palette.grey[300],
                }}
              >
                <DirectionsBoatIcon
                  sx={{
                    fontSize: 60,
                    color: "text.secondary",
                    opacity: 0.5,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" color="text.secondary">
                  No active widgets
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Enable widgets using the controls above to populate your
                  dashboard
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<VisibilityIcon />}
                  sx={{ mt: 3 }}
                  onClick={resetDashboard}
                >
                  Show All Widgets
                </Button>
              </Paper>
            </Fade>
          ) : (
            <GridLayout
              className="layout"
              layout={filteredLayout}
              cols={isMobile ? 1 : isTablet ? 2 : 12}
              rowHeight={50}
              width={containerWidth}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              isResizable={false}
              isDraggable={true}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              autoSize={true}
              verticalCompact={true}
              useCSSTransforms={true}
            >
              {/* Ship Map Widget */}
              {visibleWidgets.shipMap && (
                <div key="shipMap" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.shipMap.label}
                    icon={widgetConfig.shipMap.icon}
                  >
                    {/* Force remount with key */}
                    <div
                      key={`shipMap-content-${mountCounters.shipMap}`}
                      style={{ height: "100%" }}
                    >
                      <ShipMap />
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Ship Info Widget */}
              {visibleWidgets.shipInfo && (
                <div key="shipInfo" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.shipInfo.label}
                    icon={widgetConfig.shipInfo.icon}
                  >
                    {/* Force remount with key */}
                    <div
                      key={`shipInfo-content-${mountCounters.shipInfo}`}
                      style={{ height: "100%" }}
                    >
                      <AutoResizeBox>
                        <ShipInfoChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* SSA Widget */}
              {visibleWidgets.ssa && (
                <div key="ssa" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.ssa.label}
                    icon={widgetConfig.ssa.icon}
                  >
                    {/* Force remount with key */}
                    <div
                      key={`ssa-content-${mountCounters.ssa}`}
                      style={{ height: "100%" }}
                    >
                      <AutoResizeBox>
                        <SSAAssessmentsChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Infractions Widget */}
              {visibleWidgets.infractions && (
                <div
                  key="infractions"
                  style={{ width: "100%", height: "100%" }}
                >
                  <SimpleWidget
                    title={widgetConfig.infractions.label}
                    icon={widgetConfig.infractions.icon}
                  >
                    {/* Force remount with key */}
                    <div
                      key={`infractions-content-${mountCounters.infractions}`}
                      style={{ height: "100%" }}
                    >
                      <AutoResizeBox>
                        <InfractionsChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Cargo Widget */}
              {visibleWidgets.cargo && (
                <div key="cargo" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.cargo.label}
                    icon={widgetConfig.cargo.icon}
                  >
                    {/* Force remount with key */}
                    <div
                      key={`cargo-content-${mountCounters.cargo}`}
                      style={{ height: "100%" }}
                    >
                      <AutoResizeBox>
                        <CargoCapacityChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}
            </GridLayout>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CustomDashboard;

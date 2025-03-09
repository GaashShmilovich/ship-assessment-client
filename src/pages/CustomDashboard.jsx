// src/pages/CustomDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Box,
  Typography,
  Paper,
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
import DashboardControls from "../components/dashboard/DashboardControls";

// Import new components
import RiskAlertsWidget from "../components/dashboard/RiskAlertsWidget";
import DocumentExpiryTracker from "../components/dashboard/DocumentExpiryTracker";
import PortActivityTimeline from "../components/dashboard/PortActivityTimeline";
import SecurityMetricsChart from "../components/charts/SecurityMetricsChart";

// Import icons
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarningIcon from "@mui/icons-material/Warning";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SecurityIcon from "@mui/icons-material/Security";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";

import { useQueryClient } from "@tanstack/react-query";
import { useTheme, useMediaQuery } from "@mui/material";

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
  // New widgets
  riskAlerts: {
    label: "Risk Alerts",
    icon: SecurityIcon,
    description: "Current security alerts requiring attention",
  },
  docExpiry: {
    label: "Document Expiry",
    icon: DescriptionIcon,
    description: "Track expiring ship documentation",
  },
  timeline: {
    label: "Port Activity",
    icon: EventIcon,
    description: "Timeline of recent port activities",
  },
  securityMetrics: {
    label: "Security Metrics",
    icon: AssessmentIcon,
    description: "Comprehensive security metrics dashboard",
  },
};

// UPDATED LAYOUT: Map first, Document Expiry second, then 2 widgets per row (1 per column)
const getDefaultLayout = (width) => {
  const cols = width < 600 ? 1 : width < 960 ? 2 : 12;

  // For mobile: Stack all widgets
  if (cols === 1) {
    return [
      { i: "shipMap", x: 0, y: 0, w: 1, h: 14, static: false },
      { i: "docExpiry", x: 0, y: 14, w: 1, h: 8, static: false },
      { i: "riskAlerts", x: 0, y: 22, w: 1, h: 8, static: false },
      { i: "shipInfo", x: 0, y: 30, w: 1, h: 8, static: false },
      { i: "securityMetrics", x: 0, y: 38, w: 1, h: 8, static: false },
      { i: "timeline", x: 0, y: 46, w: 1, h: 8, static: false },
      { i: "ssa", x: 0, y: 54, w: 1, h: 8, static: false },
      { i: "infractions", x: 0, y: 62, w: 1, h: 8, static: false },
      { i: "cargo", x: 0, y: 70, w: 1, h: 8, static: false },
    ];
  }

  // For tablet: Two column layout
  if (cols === 2) {
    return [
      { i: "shipMap", x: 0, y: 0, w: 2, h: 14, static: false }, // Full width
      { i: "docExpiry", x: 0, y: 14, w: 2, h: 8, static: false }, // Full width
      { i: "riskAlerts", x: 0, y: 22, w: 1, h: 8, static: false }, // Left column
      { i: "shipInfo", x: 1, y: 22, w: 1, h: 8, static: false }, // Right column
      { i: "securityMetrics", x: 0, y: 30, w: 1, h: 8, static: false }, // Left column
      { i: "timeline", x: 1, y: 30, w: 1, h: 8, static: false }, // Right column
      { i: "ssa", x: 0, y: 38, w: 1, h: 8, static: false }, // Left column
      { i: "infractions", x: 1, y: 38, w: 1, h: 8, static: false }, // Right column
      { i: "cargo", x: 0, y: 46, w: 1, h: 8, static: false }, // Left column
    ];
  }

  // Default (desktop) layout - Map first, DocExpiry second, then 2 per row
  return [
    { i: "shipMap", x: 0, y: 0, w: 12, h: 10, static: false }, // Full width
    { i: "docExpiry", x: 0, y: 10, w: 12, h: 6, static: false }, // Full width
    { i: "riskAlerts", x: 0, y: 16, w: 6, h: 6, static: false }, // Left column
    { i: "shipInfo", x: 6, y: 16, w: 6, h: 6, static: false }, // Right column
    { i: "securityMetrics", x: 0, y: 22, w: 6, h: 6, static: false }, // Left column
    { i: "timeline", x: 6, y: 22, w: 6, h: 6, static: false }, // Right column
    { i: "ssa", x: 0, y: 28, w: 6, h: 6, static: false }, // Left column
    { i: "infractions", x: 6, y: 28, w: 6, h: 6, static: false }, // Right column
    { i: "cargo", x: 0, y: 34, w: 6, h: 6, static: false }, // Left column (last row)
  ];
};

const initialWidgets = {
  shipMap: true,
  shipInfo: true,
  ssa: true,
  infractions: true,
  cargo: true,
  riskAlerts: true,
  docExpiry: true,
  timeline: true,
  securityMetrics: true,
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
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": { boxShadow: 4 },
        overflow: "hidden",
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
          height: "56px", // Fixed header height
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {IconComponent && <IconComponent sx={{ mr: 1 }} />}
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          position: "relative",
          height: "calc(100% - 56px)", // Subtract header height
          display: "flex", // Add flex display
          flexDirection: "column", // Stack children vertically
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
          <Box
            sx={{
              flexGrow: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </Box>
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
    riskAlerts: 1,
    docExpiry: 1,
    timeline: 1,
    securityMetrics: 1,
  });

  // Track visibility separately for cleaner logic
  const [visibleWidgets, setVisibleWidgets] = useState({ ...initialWidgets });

  // Custom snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Calculate container width - IMPORTANT FOR ALIGNMENT
  const getContainerWidth = () => {
    if (isMobile) return window.innerWidth - 32;
    if (isTablet) return window.innerWidth - 48;
    return Math.min(1200, window.innerWidth - 48);
  };

  const [containerWidth, setContainerWidth] = useState(getContainerWidth());
  const [layout, setLayout] = useState(getDefaultLayout(getContainerWidth()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Force all widgets to be visible by default
  useEffect(() => {
    setVisibleWidgets({ ...initialWidgets });
  }, []);

  // Toggle visibility of widgets
  const handleToggleWidget = useCallback(
    (widgetKey) => {
      // Get the current visibility state
      const isCurrentlyVisible = visibleWidgets[widgetKey];

      // Update visibility state
      setVisibleWidgets((prev) => ({
        ...prev,
        [widgetKey]: !prev[widgetKey],
      }));

      // If we're making the widget visible again
      if (!isCurrentlyVisible) {
        // Increment the mount counter to force remount
        setMountCounters((prev) => ({
          ...prev,
          [widgetKey]: (prev[widgetKey] || 0) + 1,
        }));

        // Find the default layout for this widget
        const defaultWidgetLayout = getDefaultLayout(containerWidth).find(
          (item) => item.i === widgetKey
        );

        // Update the layout with the default size/position for this widget
        if (defaultWidgetLayout) {
          setLayout((currentLayout) => {
            // Check if widget exists in current layout
            const existingWidgetIndex = currentLayout.findIndex(
              (item) => item.i === widgetKey
            );

            if (existingWidgetIndex >= 0) {
              // Update existing widget with default height and width
              const newLayout = [...currentLayout];
              newLayout[existingWidgetIndex] = {
                ...newLayout[existingWidgetIndex],
                w: defaultWidgetLayout.w,
                h: defaultWidgetLayout.h,
                x: defaultWidgetLayout.x,
                y: defaultWidgetLayout.y,
              };
              return newLayout;
            } else {
              // Add widget with default layout
              return [...currentLayout, defaultWidgetLayout];
            }
          });
        }

        // Refresh the relevant queries
        setTimeout(() => {
          switch (widgetKey) {
            case "shipMap":
            case "shipInfo":
            case "cargo":
            case "riskAlerts":
            case "securityMetrics":
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
            case "docExpiry":
            case "timeline":
              // These widgets need multiple data sources
              queryClient.invalidateQueries({ queryKey: ["ships"] });
              queryClient.invalidateQueries({ queryKey: ["assessments"] });
              queryClient.invalidateQueries({ queryKey: ["infractions"] });
              queryClient.refetchQueries({ queryKey: ["ships"] });
              queryClient.refetchQueries({ queryKey: ["assessments"] });
              queryClient.refetchQueries({ queryKey: ["infractions"] });
              break;
            default:
              break;
          }
        }, 100);
      }

      setHasUnsavedChanges(true);
    },
    [visibleWidgets, queryClient, containerWidth]
  );

  // Show snackbar notifications
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
    queryClient.invalidateQueries({ queryKey: ["harborHistory"] });
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

        // Modify this part to ensure all widgets are visible by default
        // This combines saved widget visibility with initialWidgets, favoring "true" values
        if (parsed.activeWidgets) {
          setVisibleWidgets((prev) => {
            const combinedWidgets = { ...initialWidgets };
            // Only take saved widget state if it's "true", otherwise use the initialWidgets value
            Object.keys(initialWidgets).forEach((key) => {
              combinedWidgets[key] =
                parsed.activeWidgets[key] === false
                  ? true
                  : initialWidgets[key];
            });
            return combinedWidgets;
          });
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
    queryClient.invalidateQueries({ queryKey: ["harborHistory"] });

    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
      showSnackbar("Dashboard data refreshed", { variant: "info" });
    }, 1000);
  }, [queryClient]);

  // Filter layout items based on visible widgets
  const filteredLayout = layout
    .map((item) => {
      // If this widget is in the default layout, use those dimensions
      const defaultItem = getDefaultLayout(containerWidth).find(
        (defaultItem) => defaultItem.i === item.i
      );

      if (defaultItem && visibleWidgets[item.i]) {
        // Ensure minimum dimensions
        return {
          ...item,
          w: Math.max(item.w, defaultItem.w),
          h: Math.max(item.h, defaultItem.h),
        };
      }
      return item;
    })
    .filter((item) => visibleWidgets[item.i]);
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

      {/* Main Content Container - IMPORTANT FOR ALIGNMENT */}
      <Box
        sx={{
          maxWidth: containerWidth,
          mx: "auto",
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Dashboard Controls - Using the same width constraints as the GridLayout */}
        <DashboardControls
          theme={theme}
          widgetConfig={widgetConfig}
          initialWidgets={initialWidgets}
          visibleWidgets={visibleWidgets}
          isRefreshing={isRefreshing}
          hasUnsavedChanges={hasUnsavedChanges}
          refreshAllData={refreshAllData}
          saveDashboardState={saveDashboardState}
          resetDashboard={resetDashboard}
          handleToggleWidget={handleToggleWidget}
          activeWidgetCount={activeWidgetCount}
        />

        {/* Responsive Grid Layout */}
        <Box
          sx={{
            position: "relative",
            ".react-grid-item.react-grid-placeholder": {
              backgroundColor: theme.palette.primary.light,
              opacity: 0.3,
              borderRadius: 2,
            },
            ".react-grid-item": {
              padding: "8px",
            },
            // Add styles to ensure grid items fill their space correctly
            ".react-grid-item > div": {
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
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
            .react-grid-item > div {
              height: 100%;
              width: 100%;
              overflow: visible;
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
              rowHeight={70}
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
              {/* Ship Map Widget - FIXED */}
              {visibleWidgets.shipMap && (
                <div key="shipMap" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.shipMap.label}
                    icon={widgetConfig.shipMap.icon}
                  >
                    <div
                      key={`shipMap-content-${mountCounters.shipMap}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <ShipMap />
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Risk Alerts Widget - FIXED */}
              {visibleWidgets.riskAlerts && (
                <div key="riskAlerts" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.riskAlerts.label}
                    icon={widgetConfig.riskAlerts.icon}
                  >
                    <div
                      key={`riskAlerts-content-${mountCounters.riskAlerts}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <RiskAlertsWidget />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Document Expiry Widget - FIXED */}
              {visibleWidgets.docExpiry && (
                <div key="docExpiry" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.docExpiry.label}
                    icon={widgetConfig.docExpiry.icon}
                  >
                    <div
                      key={`docExpiry-content-${mountCounters.docExpiry}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <DocumentExpiryTracker />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Ship Info Widget - FIXED */}
              {visibleWidgets.shipInfo && (
                <div key="shipInfo" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.shipInfo.label}
                    icon={widgetConfig.shipInfo.icon}
                  >
                    <div
                      key={`shipInfo-content-${mountCounters.shipInfo}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <ShipInfoChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Security Metrics Widget - FIXED */}
              {visibleWidgets.securityMetrics && (
                <div
                  key="securityMetrics"
                  style={{ width: "100%", height: "100%" }}
                >
                  <SimpleWidget
                    title={widgetConfig.securityMetrics.label}
                    icon={widgetConfig.securityMetrics.icon}
                  >
                    <div
                      key={`securityMetrics-content-${mountCounters.securityMetrics}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <SecurityMetricsChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Port Activity Timeline Widget - FIXED */}
              {visibleWidgets.timeline && (
                <div key="timeline" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.timeline.label}
                    icon={widgetConfig.timeline.icon}
                  >
                    <div
                      key={`timeline-content-${mountCounters.timeline}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <PortActivityTimeline />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* SSA Widget - FIXED */}
              {visibleWidgets.ssa && (
                <div key="ssa" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.ssa.label}
                    icon={widgetConfig.ssa.icon}
                  >
                    <div
                      key={`ssa-content-${mountCounters.ssa}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <SSAAssessmentsChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Infractions Widget - FIXED */}
              {visibleWidgets.infractions && (
                <div
                  key="infractions"
                  style={{ width: "100%", height: "100%" }}
                >
                  <SimpleWidget
                    title={widgetConfig.infractions.label}
                    icon={widgetConfig.infractions.icon}
                  >
                    <div
                      key={`infractions-content-${mountCounters.infractions}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <InfractionsChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}

              {/* Cargo Widget - FIXED */}
              {visibleWidgets.cargo && (
                <div key="cargo" style={{ width: "100%", height: "100%" }}>
                  <SimpleWidget
                    title={widgetConfig.cargo.label}
                    icon={widgetConfig.cargo.icon}
                  >
                    <div
                      key={`cargo-content-${mountCounters.cargo}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <AutoResizeBox sx={{ flex: 1, minHeight: 0 }}>
                        <CargoCapacityChart />
                      </AutoResizeBox>
                    </div>
                  </SimpleWidget>
                </div>
              )}
            </GridLayout>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CustomDashboard;

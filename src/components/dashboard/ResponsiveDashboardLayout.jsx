import React, { useState, useEffect, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useTheme, useMediaQuery, Box } from "@mui/material";
import DashboardWidget from "./DashboardWidget";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ResponsiveDashboardLayout = ({
  widgets,
  layouts,
  onLayoutChange,
  isDraggable = true,
  isResizable = true,
  compactType = "vertical",
  preventCollision = false,
  containerPadding = [10, 10],
  margin = [10, 10],
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight = 30,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const [currentBreakpoint, setCurrentBreakpoint] = useState(() => {
    if (isXs) return "xs";
    if (isSm) return "sm";
    if (isMd) return "md";
    return "lg";
  });

  useEffect(() => {
    if (isXs) setCurrentBreakpoint("xs");
    else if (isSm) setCurrentBreakpoint("sm");
    else if (isMd) setCurrentBreakpoint("md");
    else setCurrentBreakpoint("lg");
  }, [isXs, isSm, isMd]);

  const handleLayoutChange = useCallback(
    (currentLayout, allLayouts) => {
      if (onLayoutChange) {
        onLayoutChange(allLayouts);
      }
    },
    [onLayoutChange]
  );

  const defaultLayouts = {
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  };

  useEffect(() => {
    if (!layouts.xxs || !layouts.xxs.length) {
      const stackedLayout = widgets.map((widget, index) => ({
        ...widget,
        x: 0,
        y: index * 2,
        w: 2,
        h: widget.defaultHeight || 4,
      }));

      if (layouts.xxs !== stackedLayout) {
        const updatedLayouts = {
          ...layouts,
          xxs: stackedLayout,
        };
        onLayoutChange(updatedLayouts);
      }
    }
  }, [widgets, layouts, onLayoutChange]);

  return (
    <Box
      sx={{
        "& .react-grid-item.react-grid-placeholder": {
          backgroundColor: theme.palette.primary.light,
          opacity: 0.3,
          borderRadius: theme.shape.borderRadius,
        },
        "& .react-grid-item": {
          transition: "all 200ms ease",
          transitionProperty: "left, top, width, height",
        },
      }}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts || defaultLayouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={setCurrentBreakpoint}
        draggableHandle=".drag-handle"
        isDraggable={isDraggable && !isXs}
        isResizable={isResizable && !isXs}
        compactType={compactType}
        preventCollision={preventCollision}
        containerPadding={containerPadding}
        margin={margin}
        autoSize={true}
        verticalCompact={true}
        useCSSTransforms={true}
      >
        {widgets.map((widget) => (
          <div key={widget.id} data-grid={widget}>
            <DashboardWidget
              title={widget.title}
              icon={widget.icon}
              allowFullscreen={widget.allowFullscreen !== false}
              onRefresh={widget.onRefresh}
              onHide={widget.onHide}
              isLoading={widget.isLoading}
              error={widget.error}
              additionalControls={widget.additionalControls}
            >
              {widget.component}
            </DashboardWidget>
          </div>
        ))}
      </ResponsiveGridLayout>
    </Box>
  );
};

export default ResponsiveDashboardLayout;

// src/components/charts/ShipInfoChart.jsx
import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { Bar } from "react-chartjs-2";
import { getAllShips } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartWrapper from "./ChartWrapper";
import {
  useChartColors,
  animationOptions,
  exportChartToImage,
  getResponsiveOptions,
  createGradientBackground,
} from "./chartConfig";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Fade,
  Paper,
  Divider,
  IconButton,
  Stack,
  Tooltip as MuiTooltip,
  Button,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import BarChartIcon from "@mui/icons-material/BarChart";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DoneIcon from "@mui/icons-material/Done";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ShipInfoChart = ({ containerDimensions }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const { getStatusColor } = useChartColors();
  const [sortBy, setSortBy] = useState("status"); // "status", "count"
  const [chartInstance, setChartInstance] = useState(null);

  const {
    data: ships,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
    staleTime: 60000,
  });

  // Helper function to format status labels
  const formatStatusLabel = (status) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Create gradient backgrounds when chart is rendered
  useEffect(() => {
    if (chartInstance && chartInstance.ctx) {
      // Get the chart's rendering context
      const ctx = chartInstance.ctx;
      const datasets = chartInstance.data.datasets;

      if (
        datasets.length > 0 &&
        datasets[0].backgroundColor &&
        Array.isArray(datasets[0].backgroundColor)
      ) {
        // Apply gradients
        const newBackgrounds = createGradientBackground(
          ctx,
          datasets[0].backgroundColor
        );
        datasets[0].backgroundColor = newBackgrounds;
        chartInstance.update();
      }
    }
  }, [chartInstance]);

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!ships) return null;

    // Count ships by status
    const statusCounts = ships.reduce((acc, ship) => {
      const status = ship.shipStatus || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Create array of [status, count] pairs for sorting
    let statusItems = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      formattedStatus: formatStatusLabel(status),
    }));

    // Sort based on selection
    if (sortBy === "count") {
      statusItems.sort((a, b) => b.count - a.count);
    } else if (sortBy === "status") {
      // Priority order for status
      const priority = {
        ACTIVE: 1,
        UNDER_REVIEW: 2,
        QUARANTINE: 3,
        MAINTENANCE: 4,
      };

      statusItems.sort((a, b) => {
        const priorityA = priority[a.status] || 999;
        const priorityB = priority[b.status] || 999;
        return priorityA - priorityB;
      });
    }

    // Extract sorted statuses and counts
    const orderedStatuses = statusItems.map((item) => item.status);
    const formattedLabels = statusItems.map((item) => item.formattedStatus);
    const counts = statusItems.map((item) => item.count);

    // Create enhanced background and border colors with higher contrast
    const backgroundColors = orderedStatuses.map(
      (status) => getStatusColor(status, 0.85) // Increased opacity for better contrast
    );

    const borderColors = orderedStatuses.map((status) =>
      getStatusColor(status, 1)
    );

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: "Ship Count",
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5, // Slightly thicker border
          borderRadius: 6, // Increased radius for more modern look
          barThickness: 40,
          maxBarThickness: 60,
        },
      ],
      // Store metadata for summary
      _summary: {
        total: ships.length,
        statusCounts: statusItems,
        activeCount: statusCounts["ACTIVE"] || 0,
        quarantineCount: statusCounts["QUARANTINE"] || 0,
        reviewCount: statusCounts["UNDER_REVIEW"] || 0,
        maintenanceCount: statusCounts["MAINTENANCE"] || 0,
      },
    };
  }, [ships, getStatusColor, sortBy]);

  // Configure chart options with responsiveness
  const options = useMemo(() => {
    // Determine if we're in a narrow container
    const isNarrow = containerDimensions && containerDimensions.width < 400;

    // Base options
    const baseOptions = {
      ...animationOptions,
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y", // Always horizontal bar for this chart
      layout: {
        padding: {
          top: 20,
          bottom: 10,
          right: 40, // Extra padding for value labels on bars
          left: isNarrow ? 100 : 20, // More padding for labels in narrow view
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            precision: 0,
            font: {
              size: isNarrow ? 11 : 13,
              weight: "bold", // Make status labels bold
            },
            color: theme.palette.text.primary, // Use theme colors
          },
        },
        x: {
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)", // Lighter grid lines
            drawBorder: false,
          },
          ticks: {
            precision: 0,
            font: {
              size: isNarrow ? 10 : 12,
            },
            color: theme.palette.text.secondary,
          },
          border: {
            display: false, // Remove border
          },
        },
      },
      plugins: {
        ...animationOptions.plugins,
        legend: {
          display: false,
        },
        tooltip: {
          ...animationOptions.plugins.tooltip,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          titleFont: {
            size: 14,
            weight: "bold",
          },
          padding: 12,
          cornerRadius: 6,
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = chartData?._summary?.total || 0;
              const percentage = total ? Math.round((value / total) * 100) : 0;
              return `${value} ships (${percentage}% of fleet)`;
            },
          },
        },
      },
    };

    // Apply responsive options based on container dimensions
    return getResponsiveOptions(containerDimensions, baseOptions);
  }, [containerDimensions, chartData, theme]);

  // Render the data values on the bars with enhanced styling
  const plugins = useMemo(
    () => [
      {
        id: "valueLabels",
        afterDatasetsDraw(chart) {
          // Save the chart instance for gradient creation
          if (!chartInstance) {
            setChartInstance(chart);
          }

          const { ctx } = chart;

          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            if (!meta.hidden) {
              meta.data.forEach((element, index) => {
                const value = dataset.data[index];
                const total = chartData?._summary?.total || 0;
                const percentage = total
                  ? Math.round((value / total) * 100)
                  : 0;

                ctx.save();
                const { x, y, width, height } = element.getCenterPoint
                  ? {
                      x: element.getCenterPoint().x,
                      y: element.getCenterPoint().y,
                      width: element.width,
                      height: element.height,
                    }
                  : element;

                ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                ctx.font = `bold ${
                  containerDimensions && containerDimensions.width < 400
                    ? "10px"
                    : "12px"
                } sans-serif`;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";

                // For horizontal bar chart
                const xPos = x + width / 2 + 10; // Position right of the bar
                const yPos = y;

                // Add subtle text shadow for better readability
                ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.fillText(`${value} (${percentage}%)`, xPos, yPos);
                ctx.restore();
              });
            }
          });
        },
      },
    ],
    [chartData, chartInstance, containerDimensions]
  );

  // Export chart as PNG image
  const handleExport = useCallback(() => {
    exportChartToImage(chartRef, "ship-status.png");
  }, []);

  // Handle sorting change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <DoneIcon fontSize="small" />;
      case "MAINTENANCE":
        return <BuildIcon fontSize="small" />;
      case "UNDER_REVIEW":
        return <WarningIcon fontSize="small" />;
      case "QUARANTINE":
        return <ErrorIcon fontSize="small" />;
      default:
        return <DirectionsBoatIcon fontSize="small" />;
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 0.5, // Add slight padding for better spacing
      }}
    >
      {/* Enhanced header with visual separation */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BarChartIcon
            sx={{
              mr: 1.5,
              color: theme.palette.primary.main,
              fontSize: 24,
            }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Ship Status Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current status distribution across the fleet
            </Typography>
          </Box>
        </Box>

        {/* Enhanced sort selector */}
        <MuiTooltip title="Change sorting method">
          <FormControl
            size="small"
            sx={{
              minWidth: 140,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <InputLabel
              id="sort-select-label"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <SortIcon sx={{ mr: 0.5, fontSize: 18 }} /> Sort By
            </InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="status">Status Priority</MenuItem>
              <MenuItem value="count">Count (Descending)</MenuItem>
            </Select>
          </FormControl>
        </MuiTooltip>
      </Paper>

      {/* Chart in enhanced wrapper */}
      <ChartWrapper
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        exportChart={handleExport}
        containerDimensions={containerDimensions}
      >
        <Box
          sx={{
            height: "calc(100% - 40px)",
            display: "flex",
            flexDirection: "column",
            pt: 1,
          }}
        >
          <Bar
            ref={chartRef}
            data={chartData}
            options={{
              ...options,
              maintainAspectRatio: false,
              responsive: true,
            }}
            plugins={plugins}
          />
        </Box>
      </ChartWrapper>

      {/* Enhanced Summary Cards */}
      {chartData && chartData._summary && (
        <Fade in={true} timeout={800}>
          <Grid
            container
            spacing={2}
            sx={{
              mt: 2,
              "& .MuiCard-root": {
                overflow: "visible", // Allow shadow to be visible on hover
              },
            }}
          >
            <Grid item xs={6} md={3}>
              <Card
                elevation={1} // Using elevation instead of variant outlined
                sx={{
                  background: `linear-gradient(145deg, ${theme.palette.success.light}, ${theme.palette.success.main}90)`,
                  color: theme.palette.success.contrastText,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    left: 10,
                    bgcolor: theme.palette.success.dark,
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <DoneIcon sx={{ color: "#fff" }} />
                </Box>
                <CardContent
                  sx={{ p: 1.5, pt: 2, "&:last-child": { pb: 1.5 } }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ opacity: 0.85 }}
                  >
                    Active Ships
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5, fontWeight: "bold" }}>
                    {chartData._summary.activeCount}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {Math.round(
                      (chartData._summary.activeCount /
                        chartData._summary.total) *
                        100
                    )}
                    % of fleet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={3}>
              <Card
                elevation={1}
                sx={{
                  background: `linear-gradient(145deg, ${theme.palette.warning.light}, ${theme.palette.warning.main}90)`,
                  color: theme.palette.warning.contrastText,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    left: 10,
                    bgcolor: theme.palette.warning.dark,
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <WarningIcon sx={{ color: "#fff" }} />
                </Box>
                <CardContent
                  sx={{ p: 1.5, pt: 2, "&:last-child": { pb: 1.5 } }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ opacity: 0.85 }}
                  >
                    Under Review
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5, fontWeight: "bold" }}>
                    {chartData._summary.reviewCount}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {Math.round(
                      (chartData._summary.reviewCount /
                        chartData._summary.total) *
                        100
                    )}
                    % of fleet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={3}>
              <Card
                elevation={1}
                sx={{
                  background: `linear-gradient(145deg, ${theme.palette.error.light}, ${theme.palette.error.main}90)`,
                  color: theme.palette.error.contrastText,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    left: 10,
                    bgcolor: theme.palette.error.dark,
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <ErrorIcon sx={{ color: "#fff" }} />
                </Box>
                <CardContent
                  sx={{ p: 1.5, pt: 2, "&:last-child": { pb: 1.5 } }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ opacity: 0.85 }}
                  >
                    In Quarantine
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5, fontWeight: "bold" }}>
                    {chartData._summary.quarantineCount}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {Math.round(
                      (chartData._summary.quarantineCount /
                        chartData._summary.total) *
                        100
                    )}
                    % of fleet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} md={3}>
              <Card
                elevation={1}
                sx={{
                  background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main}90)`,
                  color: theme.palette.primary.contrastText,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "visible",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -10,
                    left: 10,
                    bgcolor: theme.palette.primary.dark,
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 2,
                  }}
                >
                  <BuildIcon sx={{ color: "#fff" }} />
                </Box>
                <CardContent
                  sx={{ p: 1.5, pt: 2, "&:last-child": { pb: 1.5 } }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ opacity: 0.85 }}
                  >
                    Maintenance
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 0.5, fontWeight: "bold" }}>
                    {chartData._summary.maintenanceCount}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {Math.round(
                      (chartData._summary.maintenanceCount /
                        chartData._summary.total) *
                        100
                    )}
                    % of fleet
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}
    </Box>
  );
};

export default ShipInfoChart;

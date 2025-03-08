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
} from "@mui/material";

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

    // Create background and border colors
    const backgroundColors = orderedStatuses.map((status) =>
      getStatusColor(status, 0.7)
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
          borderWidth: 1,
          borderRadius: 4,
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
      indexAxis: isNarrow ? "y" : "y", // Always horizontal bar for this chart
      layout: {
        padding: {
          top: 20,
          bottom: 10,
          right: 30, // Extra padding for value labels on bars
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
              size: isNarrow ? 10 : 12,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            precision: 0,
            font: {
              size: isNarrow ? 10 : 12,
            },
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
  }, [containerDimensions, chartData]);

  // Render the data values on the bars
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

                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                ctx.font =
                  containerDimensions && containerDimensions.width < 400
                    ? "10px sans-serif"
                    : "11px sans-serif";
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";

                // For horizontal bar chart
                const xPos = x + width / 2 + 10; // Position right of the bar
                const yPos = y;

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

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          mb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            Ship Status Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current status distribution across the fleet
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
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
      </Box>

      <ChartWrapper
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        exportChart={handleExport}
        containerDimensions={containerDimensions}
      >
        <Box sx={{ flex: 1, minHeight: "220px", position: "relative" }}>
          {chartData && (
            <Bar
              ref={chartRef}
              data={chartData}
              options={options}
              plugins={plugins}
              style={{ maxHeight: "100%" }}
            />
          )}
        </Box>
      </ChartWrapper>

      {/* Summary Cards */}
      {chartData && chartData._summary && (
        <Fade in={true} timeout={800}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} md={3}>
              <Card
                variant="outlined"
                sx={{
                  backgroundColor: "success.light",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography color="text.secondary" variant="caption">
                    Active Ships
                  </Typography>
                  <Typography variant="h6">
                    {chartData._summary.activeCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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
                variant="outlined"
                sx={{
                  backgroundColor: "warning.light",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography color="text.secondary" variant="caption">
                    Under Review
                  </Typography>
                  <Typography variant="h6">
                    {chartData._summary.reviewCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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
                variant="outlined"
                sx={{
                  backgroundColor: "error.light",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography color="text.secondary" variant="caption">
                    In Quarantine
                  </Typography>
                  <Typography variant="h6">
                    {chartData._summary.quarantineCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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
                variant="outlined"
                sx={{
                  backgroundColor: "primary.light",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography color="text.secondary" variant="caption">
                    Maintenance
                  </Typography>
                  <Typography variant="h6">
                    {chartData._summary.maintenanceCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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

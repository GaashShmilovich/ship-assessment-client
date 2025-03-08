// src/components/charts/ShipInfoChart.jsx
import React, { useRef, useMemo, useCallback, useState } from "react";
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
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ShipInfoChart = () => {
  const chartRef = useRef(null);
  const { getStatusColor } = useChartColors();
  const [sortBy, setSortBy] = useState("status"); // "status", "count"

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
      },
    };
  }, [ships, getStatusColor, sortBy]);

  // Configure chart options
  const options = useMemo(
    () => ({
      ...animationOptions,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,
          bottom: 10,
          right: 30, // Extra padding for value labels on bars
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
          },
          ticks: {
            precision: 0,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            precision: 0,
          },
        },
      },
      indexAxis: "y", // Horizontal bar chart
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
    }),
    [chartData]
  );

  // Render the data values on the bars
  const plugins = useMemo(
    () => [
      {
        id: "valueLabels",
        afterDatasetsDraw(chart) {
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
                ctx.font = "11px sans-serif";
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
    [chartData]
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
      >
        <Box sx={{ flex: 1, minHeight: "220px" }}>
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
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} md={3}>
            <Card variant="outlined" sx={{ backgroundColor: "success.light" }}>
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
            <Card variant="outlined" sx={{ backgroundColor: "warning.light" }}>
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
            <Card variant="outlined" sx={{ backgroundColor: "error.light" }}>
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
            <Card variant="outlined" sx={{ backgroundColor: "grey.100" }}>
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Typography color="text.secondary" variant="caption">
                  Total Ships
                </Typography>
                <Typography variant="h6">{chartData._summary.total}</Typography>
                <Typography variant="caption" color="text.secondary">
                  In the monitoring system
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ShipInfoChart;

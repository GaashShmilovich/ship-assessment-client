// src/components/charts/SSAAssessmentsChart.jsx
import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { Pie } from "react-chartjs-2";
import { getAllAssessments } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartWrapper from "./ChartWrapper";
import {
  useChartColors,
  animationOptions,
  exportChartToImage,
  getResponsiveOptions,
} from "./chartConfig";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const SSAAssessmentsChart = ({ containerDimensions }) => {
  const chartRef = useRef(null);
  const { getChartColorSet } = useChartColors();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    data: assessments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => getAllAssessments().then((res) => res.data),
    staleTime: 60000, // 1 minute stale time
  });

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!assessments) return null;

    // Count assessments by type
    const typeCounts = assessments.reduce((acc, assessment) => {
      const type = assessment.ssaType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Create an array of statuses and corresponding counts
    const statuses = Object.keys(typeCounts);
    const counts = statuses.map((status) => typeCounts[status]);
    const total = counts.reduce((sum, count) => sum + count, 0);

    // Use color set from our chart config
    const backgroundColors = getChartColorSet("primary", statuses.length);
    const borderColors = backgroundColors.map((color) =>
      color.replace(/[^,]+(?=\))/, "1")
    );

    return {
      labels: statuses,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
      // Store total for percentage calculations
      _total: total,
    };
  }, [assessments, getChartColorSet]);

  // Configure chart options with responsiveness
  const options = useMemo(() => {
    // Base options
    const baseOptions = {
      ...animationOptions,
      maintainAspectRatio: false,
      layout: {
        padding: 16,
      },
      plugins: {
        ...animationOptions.plugins,
        legend: {
          ...animationOptions.plugins.legend,
          position: "bottom",
        },
        datalabels: {
          display: (context) => {
            // Only show data labels if segment is large enough
            const dataset = context.dataset;
            const value = dataset.data[context.dataIndex];
            const total = chartData?._total || 0;
            const percentage = total ? (value / total) * 100 : 0;
            return percentage > 5; // Only show labels for segments > 5%
          },
          formatter: (value, context) => {
            const total = chartData?._total || 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return percentage > 10 ? `${percentage}%` : "";
          },
          color: "#fff",
          font: {
            weight: "bold",
          },
          textStrokeColor: "rgba(0,0,0,0.3)",
          textStrokeWidth: 2,
        },
        tooltip: {
          ...animationOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw;
              const total = chartData?._total || 0;
              const percentage = total ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };

    // Apply responsive options based on container dimensions
    return getResponsiveOptions(containerDimensions, baseOptions);
  }, [chartData, containerDimensions]);

  // Export chart as PNG image
  const handleExport = useCallback(() => {
    exportChartToImage(chartRef, "ssa-assessments.png");
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <>
      <ChartWrapper
        title="SSA Assessment Types"
        description="Distribution of ship security assessment types"
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        exportChart={handleExport}
        containerDimensions={containerDimensions}
        showFullscreenButton={true}
        onFullscreen={toggleFullscreen}
      >
        {chartData && (
          <Box
            sx={{
              height: "calc(100%)", // Leave space for any stats or legends at bottom
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pie
              ref={chartRef}
              data={chartData}
              options={{
                ...options,
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          </Box>
        )}
      </ChartWrapper>

      {/* Fullscreen dialog */}
      <Dialog
        open={isFullscreen}
        onClose={toggleFullscreen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          SSA Assessment Types
          <IconButton
            aria-label="close"
            onClick={toggleFullscreen}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: 400, position: "relative" }}>
            {chartData && (
              <Pie
                data={chartData}
                options={{
                  ...options,
                  maintainAspectRatio: false,
                  plugins: {
                    ...options.plugins,
                    legend: {
                      ...options.plugins.legend,
                      position: "bottom",
                      labels: {
                        ...options.plugins.legend.labels,
                        font: {
                          size: 14,
                        },
                        padding: 20,
                      },
                    },
                    datalabels: {
                      ...options.plugins.datalabels,
                      font: {
                        weight: "bold",
                        size: 14,
                      },
                    },
                  },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleExport} startIcon={<CloseIcon />}>
              Export
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SSAAssessmentsChart;

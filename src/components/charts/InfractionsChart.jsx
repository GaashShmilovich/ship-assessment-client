// src/components/charts/InfractionsChart.jsx
import React, { useRef, useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { getAllInfractions } from "../../services/api";
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
} from "./chartConfig";
import { Box, Typography, Tooltip as MuiTooltip } from "@mui/material";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Map to format infraction type labels
const infractionLabels = {
  documentation_issue: "Documentation Issues",
  physical_dmg: "Physical Damage",
  custom: "Custom Violations",
  Unknown: "Unknown Issues",
};

// Infraction type info for tooltips
const infractionInfo = {
  documentation_issue:
    "Missing or incomplete documentation, expired certificates, or regulatory paperwork issues",
  physical_dmg:
    "Damage to the ship structure, equipment malfunction, or safety hazards",
  custom:
    "Custom violations specific to port regulations or non-standard infractions",
  Unknown: "Unclassified or miscellaneous infractions",
};

const InfractionsChart = ({ containerDimensions }) => {
  const chartRef = useRef(null);
  const { getChartColorSet } = useChartColors();

  const {
    data: infractions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["infractions"],
    queryFn: () => getAllInfractions().then((res) => res.data),
    staleTime: 60000, // 1 minute stale time
  });

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!infractions || !infractions.length) return null;

    // Count infractions by type
    const infractionCounts = infractions.reduce((acc, infraction) => {
      // Handle both camelCase and snake_case property names
      const type =
        infraction.infractionType || infraction.infraction_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Order from highest to lowest count
    const sortedTypes = Object.keys(infractionCounts).sort(
      (a, b) => infractionCounts[b] - infractionCounts[a]
    );

    // Get display labels
    const labels = sortedTypes.map((type) => infractionLabels[type] || type);

    // Get data values
    const data = sortedTypes.map((type) => infractionCounts[type]);

    // Get colors
    const colors = getChartColorSet("warning", sortedTypes.length);

    // Store metadata for tooltip info
    const typeInfo = sortedTypes.map((type) => infractionInfo[type] || "");

    return {
      labels,
      datasets: [
        {
          label: "Infractions",
          data,
          backgroundColor: colors,
          borderColor: colors.map((c) => c.replace(/[^,]+(?=\))/, "1")),
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 40,
          maxBarThickness: 60,
        },
      ],
      _meta: {
        types: sortedTypes,
        info: typeInfo,
        total: infractions.length,
      },
    };
  }, [infractions, getChartColorSet]);

  // Configure chart options with responsiveness
  const options = useMemo(() => {
    // Determine if we should rotate labels based on container width
    const isNarrow = containerDimensions && containerDimensions.width < 350;

    // Base options
    const baseOptions = {
      ...animationOptions,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 20,
          bottom: 10,
        },
      },
      indexAxis: isNarrow ? "y" : "x", // Switch to horizontal bar for narrow containers
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            drawBorder: false,
            color: "rgba(0, 0, 0, 0.05)",
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
            maxRotation: isNarrow ? 0 : 45,
            minRotation: isNarrow ? 0 : 45,
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
            title: function (tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function (context) {
              const value = context.raw;
              const total = chartData?._meta?.total || 0;
              const percentage = total ? Math.round((value / total) * 100) : 0;

              // Get the original type for additional info
              const typeIndex = context.dataIndex;
              const typeKey = chartData?._meta?.types[typeIndex];

              return [
                `Count: ${value} (${percentage}% of total)`,
                typeKey && infractionInfo[typeKey]
                  ? `Info: ${infractionInfo[typeKey]}`
                  : "",
              ].filter(Boolean);
            },
          },
        },
      },
    };

    // Apply responsive options based on container dimensions
    return getResponsiveOptions(containerDimensions, baseOptions);
  }, [containerDimensions, chartData]);

  // Export chart as PNG image
  const handleExport = useCallback(() => {
    exportChartToImage(chartRef, "infractions-chart.png");
  }, []);

  return (
    <ChartWrapper
      title="Infractions by Type"
      description="Distribution of reported infractions by category"
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
      exportChart={handleExport}
      containerDimensions={containerDimensions}
    >
      {chartData ? (
        <>
          <Box sx={{ height: "calc(100% - 35px)" }}>
            <Bar
              ref={chartRef}
              data={chartData}
              options={options}
              style={{ maxHeight: "100%" }}
            />
          </Box>

          {/* Add a legend with tooltips for more info */}
          {chartData._meta && chartData._meta.types && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
                mt: 1,
                px: 1,
              }}
            >
              {chartData._meta.types.map((type, index) => (
                <MuiTooltip key={type} title={infractionInfo[type] || ""} arrow>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        mr: 0.5,
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[index],
                      }}
                    />
                    <Typography variant="caption" noWrap>
                      {infractionLabels[type] || type}
                    </Typography>
                  </Box>
                </MuiTooltip>
              ))}
            </Box>
          )}
        </>
      ) : null}
    </ChartWrapper>
  );
};

export default InfractionsChart;

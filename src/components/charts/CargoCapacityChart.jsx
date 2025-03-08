// src/components/charts/CargoCapacityChart.jsx
import React, { useRef, useMemo, useCallback } from "react";
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
  animationOptions,
  exportChartToImage,
  getResponsiveOptions,
} from "./chartConfig";
import { Box, Typography } from "@mui/material";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CargoCapacityChart = ({ containerDimensions }) => {
  const chartRef = useRef(null);

  // Fetch ships using React Query
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

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!ships || !ships.length) return null;

    // Define capacity ranges
    const capacityRanges = [
      { label: "<50k tons", min: 0, max: 49999, color: "rgba(54,162,235,0.7)" },
      {
        label: "50k-100k tons",
        min: 50000,
        max: 99999,
        color: "rgba(255,206,86,0.7)",
      },
      {
        label: "100k-150k tons",
        min: 100000,
        max: 149999,
        color: "rgba(75,192,192,0.7)",
      },
      {
        label: ">150k tons",
        min: 150000,
        max: Infinity,
        color: "rgba(153,102,255,0.7)",
      },
    ];

    // Initialize counts for each range
    const counts = capacityRanges.map(() => 0);

    // Calculate total tonnage for fleet stats
    let totalTonnage = 0;
    let maxCapacity = 0;
    let minCapacity = Infinity;

    // Count ships in each capacity range
    ships.forEach((ship) => {
      const capacity = ship.cargoCapacityTonnage;
      totalTonnage += capacity;

      if (capacity > maxCapacity) maxCapacity = capacity;
      if (capacity < minCapacity) minCapacity = capacity;

      // Determine which range this ship belongs to
      for (let i = 0; i < capacityRanges.length; i++) {
        const range = capacityRanges[i];
        if (capacity >= range.min && capacity <= range.max) {
          counts[i]++;
          break;
        }
      }
    });

    // Prepare data for the chart
    return {
      labels: capacityRanges.map((range) => range.label),
      datasets: [
        {
          label: "Ship Count",
          data: counts,
          backgroundColor: capacityRanges.map((range) => range.color),
          borderColor: capacityRanges.map((range) =>
            range.color.replace("0.7", "1")
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
      _meta: {
        totalShips: ships.length,
        totalTonnage,
        avgTonnage: Math.round(totalTonnage / ships.length),
        maxCapacity,
        minCapacity,
        ranges: capacityRanges,
      },
    };
  }, [ships]);

  // Configure chart options with responsiveness
  const options = useMemo(() => {
    // Base options
    const baseOptions = {
      ...animationOptions,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 16,
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Ships",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            precision: 0,
          },
        },
        x: {
          grid: {
            display: false,
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
              const total = chartData?._meta?.totalShips || 0;
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

  // Export chart as PNG image
  const handleExport = useCallback(() => {
    exportChartToImage(chartRef, "cargo-capacity-distribution.png");
  }, []);

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <ChartWrapper
      title="Cargo Capacity Distribution"
      description="Analysis of fleet cargo capacity by tonnage range"
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
      exportChart={handleExport}
      containerDimensions={containerDimensions}
    >
      {chartData ? (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Chart */}
          <Box sx={{ flexGrow: 1, height: "calc(100% - 50px)" }}>
            <Bar ref={chartRef} data={chartData} options={options} />
          </Box>

          {/* Fleet capacity stats */}
          {chartData._meta && (
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 1,
                p: 1,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ textAlign: "center", minWidth: 80 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Fleet
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatNumber(chartData._meta.totalTonnage)} tons
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", minWidth: 80 }}>
                <Typography variant="caption" color="text.secondary">
                  Average
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatNumber(chartData._meta.avgTonnage)} tons
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", minWidth: 80 }}>
                <Typography variant="caption" color="text.secondary">
                  Largest Ship
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatNumber(chartData._meta.maxCapacity)} tons
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ) : null}
    </ChartWrapper>
  );
};

export default CargoCapacityChart;

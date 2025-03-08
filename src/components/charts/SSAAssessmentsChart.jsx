// src/components/charts/SSAAssessmentsChart.jsx
import React, { useRef, useMemo, useCallback } from "react";
import { Pie } from "react-chartjs-2";
import { getAllAssessments } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartWrapper from "./ChartWrapper";
import {
  useChartColors,
  animationOptions,
  exportChartToImage,
} from "./chartConfig";

ChartJS.register(ArcElement, Tooltip, Legend);

const SSAAssessmentsChart = () => {
  const chartRef = useRef(null);
  const { getChartColorSet } = useChartColors();

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

  // Configure chart options
  const options = useMemo(
    () => ({
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
        // Note: Using custom tooltips instead of datalabels plugin
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
    }),
    [chartData]
  );

  // Export chart as PNG image
  const handleExport = useCallback(() => {
    exportChartToImage(chartRef, "ssa-assessments.png");
  }, []);

  return (
    <ChartWrapper
      title="SSA Assessment Types"
      description="Distribution of ship security assessment types"
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
      exportChart={handleExport}
    >
      {chartData && (
        <Pie
          ref={chartRef}
          data={chartData}
          options={options}
          style={{ maxHeight: "100%" }}
        />
      )}
    </ChartWrapper>
  );
};

export default SSAAssessmentsChart;

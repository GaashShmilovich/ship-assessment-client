import React from "react";
import { Pie } from "react-chartjs-2";
import { getAllAssessments } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Typography } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

const SSAAssessmentsChart = () => {
  const {
    data: assessments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => getAllAssessments().then((res) => res.data),
    staleTime: 60000, // 1 minute stale time
  });

  if (isLoading) return <p>Loading SSA Assessment data...</p>;
  if (error)
    return <p>Error loading SSA Assessment data. Please try again later.</p>;

  // Count assessments by type (using camelCased properties)
  const typeCounts = assessments.reduce((acc, assessment) => {
    const type = assessment.ssaType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Create an array of statuses and corresponding counts.
  const statuses = Object.keys(typeCounts);
  const counts = statuses.map((status) => typeCounts[status]);

  // Generate dynamic colors using HSL.
  const numStatuses = statuses.length;
  const backgroundColors = statuses.map((_, index) => {
    const hue = Math.round((index * 360) / numStatuses);
    return `hsla(${hue}, 70%, 70%, 0.6)`;
  });
  const borderColors = statuses.map((_, index) => {
    const hue = Math.round((index * 360) / numStatuses);
    return `hsla(${hue}, 70%, 50%, 1)`;
  });

  // Build chart data for a Pie chart with one dataset per assessment type.
  const chartData = {
    labels: statuses,
    datasets: [
      {
        label: "SSA Assessment Types",
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Chart will fill its container
    aspectRatio: 1.2, // Adjust as needed
    layout: {
      padding: 20, // Extra padding to prevent arcs from overflowing
    },
    plugins: {
      legend: {
        position: "bottom", // Place legend below the chart
        labels: {
          boxWidth: 14,
          font: { size: 12 },
          padding: 10,
        },
      },
      title: {
        display: true,
        text: "SSA Assessment Types",
      },
    },
  };

  return (
    <Box
      sx={{
        height: { xs: 300, md: 400 },
        width: "100%",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Pie
        data={chartData}
        options={options}
        style={{ height: "100%", width: "100%", maxHeight: "100%" }}
      />
    </Box>
  );
};

export default SSAAssessmentsChart;

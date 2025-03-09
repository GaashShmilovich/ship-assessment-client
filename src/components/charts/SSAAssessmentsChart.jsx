import React, { useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { getAllAssessments } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartWrapper from "./ChartWrapper";
import { Box, Chip } from "@mui/material";

// Register necessary Chart.js components - simplifying to just the essentials
ChartJS.register(ArcElement, Tooltip, Legend);

const SimplifiedSSAChart = ({ containerDimensions }) => {
  const chartRef = useRef(null);

  const {
    data: assessments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => getAllAssessments().then((res) => res.data),
    staleTime: 60000,
  });

  // Define descriptive labels for assessment types
  const typeLabels = {
    violence: "Violence Risk",
    health: "Health & Safety",
    cyber: "Cyber Security",
    illegal: "Illegal Activity",
    other: "Other Issues",
    physical_dmg: "Physical Damage",
  };

  // Mock data for testing
  const mockData = {
    labels: [
      "Violence Risk",
      "Health & Safety",
      "Cyber Security",
      "Illegal Activity",
      "Other Issues",
      "Physical Damage",
    ],
    datasets: [
      {
        data: [20, 15, 32, 13, 15, 5],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Simple chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw;
            const total = mockData.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Process the real data if available
  let chartData = mockData;
  if (assessments && assessments.length > 0) {
    try {
      // Count assessments by type
      const typeCounts = assessments.reduce((acc, assessment) => {
        const type = assessment.ssaType || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Create arrays for chart
      const types = Object.keys(typeCounts);
      const counts = types.map((type) => typeCounts[type]);
      const labels = types.map((type) => typeLabels[type] || type);

      chartData = {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: mockData.datasets[0].backgroundColor,
            borderColor: mockData.datasets[0].borderColor,
            borderWidth: 1,
          },
        ],
      };
    } catch (err) {
      console.error("Error processing assessment data:", err);
      // Fall back to mock data
    }
  }

  return (
    <ChartWrapper
      title="Security Assessments"
      description="Distribution of ship security assessment types"
      isLoading={isLoading}
      error={error}
      onRefetch={refetch}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Doughnut ref={chartRef} data={chartData} options={options} />
        </Box>

        {/* Simple tag display */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {chartData.labels.map((label, index) => (
            <Chip
              key={index}
              size="small"
              label={`${label}: ${chartData.datasets[0].data[index]}`}
              sx={{
                bgcolor: chartData.datasets[0].backgroundColor[index],
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            />
          ))}
        </Box>
      </Box>
    </ChartWrapper>
  );
};

export default SimplifiedSSAChart;

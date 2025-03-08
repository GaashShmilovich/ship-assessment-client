// src/components/charts/ShipInfoChart.jsx
import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ShipInfoChart = () => {
  const {
    data: ships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
    staleTime: 60000,
  });

  if (isLoading) return <p>Loading ship status data...</p>;
  if (error)
    return <p>Error loading ship status data. Please try again later.</p>;

  // Count ships by status (using camelCase)
  const statusCounts = ships.reduce((acc, ship) => {
    const status = ship.shipStatus || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // For a single x-axis category "Ship Status"
  const labels = ["Ship Status"];

  // Predefined colors for some statuses
  const colors = {
    quarantine: {
      bg: "rgba(255, 99, 132, 0.2)",
      border: "rgba(255, 99, 132, 1)",
    },
    active: { bg: "rgba(75, 192, 192, 0.2)", border: "rgba(75, 192, 192, 1)" },
    Unknown: { bg: "rgba(255, 205, 86, 0.2)", border: "rgba(255, 205, 86, 1)" },
  };

  // Default color palette if a status is not predefined
  const defaultColors = [
    { bg: "rgba(153, 102, 255, 0.2)", border: "rgba(153, 102, 255, 1)" },
    { bg: "rgba(54, 162, 235, 0.2)", border: "rgba(54, 162, 235, 1)" },
    { bg: "rgba(201, 203, 207, 0.2)", border: "rgba(201, 203, 207, 1)" },
  ];

  // Create datasets: one for each status
  const statuses = Object.keys(statusCounts);
  const datasets = statuses.map((status, index) => {
    const color = colors[status] || defaultColors[index % defaultColors.length];
    return {
      label: status,
      data: [statusCounts[status]],
      backgroundColor: color.bg,
      borderColor: color.border,
      borderWidth: 1,
    };
  });

  const chartData = { labels, datasets };

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Ship Status Overview" },
          },
        }}
      />
    </div>
  );
};

export default ShipInfoChart;

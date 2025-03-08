// src/components/charts/InfractionsChart.jsx
import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InfractionsChart = () => {
  const {
    data: infractions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["infractions"],
    queryFn: () => getAllInfractions().then((res) => res.data),
    staleTime: 60000, // 1 minute stale time
  });

  if (isLoading) return <p>Loading infractions data...</p>;
  if (error)
    return <p>Error loading infractions data. Please try again later.</p>;

  // Count infractions by type.
  // Check for both camelCase and snake_case property names.
  const infractionCounts = infractions.reduce((acc, infraction) => {
    const type =
      infraction.infractionType || infraction.infraction_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // For a single x-axis category "Infractions" we create one dataset per type.
  const labels = ["Infractions"];

  // Define a mapping for known infraction types with their colors.
  // Adjust the keys based on your API's returned property values.
  const mappedColors = {
    documentation_issue: {
      bg: "rgba(255,159,64,0.6)",
      border: "rgba(255,159,64,1)",
    },
    physical_dmg: {
      bg: "rgba(255,99,132,0.6)",
      border: "rgba(255,99,132,1)",
    },
    custom: {
      bg: "rgba(54,162,235,0.6)",
      border: "rgba(54,162,235,1)",
    },
    Unknown: {
      bg: "rgba(153,102,255,0.6)",
      border: "rgba(153,102,255,1)",
    },
  };

  // Create datasets: one per infraction type.
  const datasets = Object.keys(infractionCounts).map((type) => {
    // If the type isn't found in our mappedColors, generate a random HSL color.
    const color = mappedColors[type] || {
      bg: `hsla(${Math.floor(Math.random() * 360)}, 70%, 70%, 0.6)`,
      border: `hsla(${Math.floor(Math.random() * 360)}, 70%, 50%, 1)`,
    };

    return {
      label: type,
      data: [infractionCounts[type]], // one data point per type
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
            title: { display: true, text: "Infractions Frequency" },
          },
        }}
      />
    </div>
  );
};

export default InfractionsChart;

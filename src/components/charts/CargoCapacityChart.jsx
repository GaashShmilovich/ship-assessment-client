// src/components/charts/CargoCapacityChart.jsx
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

const CargoCapacityChart = () => {
  // Fetch ships using React Query
  const {
    data: ships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
    staleTime: 60000,
  });

  if (isLoading) return <p>Loading cargo capacity data...</p>;
  if (error)
    return <p>Error loading cargo capacity data. Please try again later.</p>;

  // Define buckets based on cargo capacity (using camelCased property)
  const buckets = {
    "<50k": 0,
    "50k-100k": 0,
    ">100k": 0,
  };

  ships.forEach((ship) => {
    const capacity = ship.cargoCapacityTonnage;
    if (capacity < 50000) {
      buckets["<50k"]++;
    } else if (capacity < 100000) {
      buckets["50k-100k"]++;
    } else {
      buckets[">100k"]++;
    }
  });

  // Use a single x-axis label "Cargo Capacity"
  const labels = ["Cargo Capacity"];

  // Predefined colors for each bucket
  const colors = {
    "<50k": { bg: "rgba(54,162,235,0.6)", border: "rgba(54,162,235,1)" },
    "50k-100k": { bg: "rgba(255,206,86,0.6)", border: "rgba(255,206,86,1)" },
    ">100k": { bg: "rgba(75,192,192,0.6)", border: "rgba(75,192,192,1)" },
  };

  // Create one dataset per bucket
  const datasets = Object.keys(buckets).map((bucket) => ({
    label: bucket,
    data: [buckets[bucket]], // one data point for "Cargo Capacity"
    backgroundColor: colors[bucket]
      ? colors[bucket].bg
      : "rgba(153,102,255,0.6)",
    borderColor: colors[bucket] ? colors[bucket].border : "rgba(153,102,255,1)",
    borderWidth: 1,
  }));

  const chartData = { labels, datasets };

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Cargo Capacity Distribution" },
          },
        }}
      />
    </div>
  );
};

export default CargoCapacityChart;

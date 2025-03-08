// src/components/charts/DashboardChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const DashboardChart = () => {
  const data = {
    labels: ["8AM", "10AM", "12PM", "2PM", "4PM"],
    datasets: [
      {
        label: "Ship Movements",
        data: [5, 15, 8, 12, 20],
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  return <Line data={data} />;
};

export default DashboardChart;

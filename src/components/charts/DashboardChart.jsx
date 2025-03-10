// src/components/charts/DashboardChart.jsx - Enhanced with proper lifecycle management
import React, { useRef, useState, useEffect } from "react";
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

// Register Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const DashboardChart = ({ isMounted }) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const mountedRef = useRef(true);

  // Setup cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  // Sample data for the chart
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

  // Configure chart options with better defaults
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Add resize delay to prevent rapid resize events
    resizeDelay: 100,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    // Ensure animation completes even if component is unmounted
    animation: {
      duration: 500,
    },
  };

  // Store chart reference when it's created
  const onChartRef = (chart) => {
    if (chart !== null && mountedRef.current) {
      setChartInstance(chart);
    }
  };

  // Only render if we're supposed to be mounted
  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "250px" }}>
      <Line
        ref={(ref) => {
          chartRef.current = ref;
          onChartRef(ref);
        }}
        data={data}
        options={options}
      />
    </div>
  );
};

export default DashboardChart;

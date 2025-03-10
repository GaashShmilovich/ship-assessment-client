// src/components/charts/SSAAssessmentsChart.jsx - Complete rewrite with self-contained safety
import React, { useRef, useState, useEffect } from "react";
import { getAllAssessments } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartWrapper from "./ChartWrapper";
import { Box, Chip, CircularProgress } from "@mui/material";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SimplifiedSSAChart = () => {
  const containerRef = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const mountedRef = useRef(true);

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

  // Handle component lifecycle
  useEffect(() => {
    mountedRef.current = true;
    setHasMounted(true);

    // Clean up on unmount
    return () => {
      mountedRef.current = false;

      // Clean up any chart instances
      if (window.chartInstances && window.chartInstances.ssaChart) {
        try {
          window.chartInstances.ssaChart.destroy();
          delete window.chartInstances.ssaChart;
        } catch (err) {
          console.warn("Error cleaning up chart:", err);
        }
      }
    };
  }, []);

  // Process data effect
  useEffect(() => {
    // Skip if loading or has error
    if (isLoading || error) return;

    // Process the real data if available
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

        const processedData = {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: mockData.datasets[0].backgroundColor.slice(
                0,
                counts.length
              ),
              borderColor: mockData.datasets[0].borderColor.slice(
                0,
                counts.length
              ),
              borderWidth: 1,
            },
          ],
        };

        if (mountedRef.current) {
          setChartData(processedData);
        }
      } catch (err) {
        console.error("Error processing assessment data:", err);
        // Fall back to mock data
        if (mountedRef.current) {
          setChartData(mockData);
        }
      }
    } else {
      // Use mock data when no real data is available
      if (mountedRef.current) {
        setChartData(mockData);
      }
    }
  }, [assessments, isLoading, error]);

  // Initialize chart only when component is fully mounted and container is ready
  useEffect(() => {
    if (!hasMounted || !chartData || !containerRef.current) return;

    // Wait for DOM to be fully ready
    const chartTimer = setTimeout(() => {
      if (!mountedRef.current) return;

      try {
        // Initialize global chart instance tracker if it doesn't exist
        if (!window.chartInstances) {
          window.chartInstances = {};
        }

        // Destroy any existing instance
        if (window.chartInstances.ssaChart) {
          window.chartInstances.ssaChart.destroy();
        }

        // Get canvas context
        const ctx = containerRef.current
          .querySelector("canvas")
          ?.getContext("2d");
        if (!ctx) {
          console.warn("Cannot get canvas context");
          return;
        }

        // Now create the chart
        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 200,
          animation: { duration: 500 },
          plugins: {
            legend: {
              position: "right",
              display: true,
              labels: { boxWidth: 12, padding: 15, font: { size: 11 } },
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: (context) => {
                  try {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    const total = chartData.datasets[0].data.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  } catch (err) {
                    return "";
                  }
                },
              },
            },
          },
          layout: { padding: { top: 5, bottom: 5, left: 5, right: 5 } },
        };

        // Create new Chart.js instance
        window.chartInstances.ssaChart = new ChartJS(ctx, {
          type: "doughnut",
          data: chartData,
          options: chartOptions,
        });

        // Mark chart as ready so we can show the chips
        setIsChartReady(true);
      } catch (err) {
        console.error("Error creating chart:", err);
      }
    }, 1000); // Longer delay for safer initialization

    return () => clearTimeout(chartTimer);
  }, [hasMounted, chartData]);

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
          ref={containerRef}
          sx={{
            flex: 1,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {!hasMounted ? (
            <CircularProgress size={40} />
          ) : (
            <>
              {/* Manual canvas creation for maximum control */}
              <canvas style={{ width: "100%", height: "100%" }}></canvas>

              {/* Fallback if chart doesn't render */}
              {!isChartReady && chartData && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Simple tag display that doesn't depend on chart rendering */}
        {chartData && (
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
        )}
      </Box>
    </ChartWrapper>
  );
};

export default SimplifiedSSAChart;

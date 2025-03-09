// src/components/charts/SecurityMetricsChart.jsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Radar } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShips,
  getAllAssessments,
  getAllInfractions,
} from "../../services/api";
import ChartWrapper from "./ChartWrapper";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const SecurityMetricsChart = ({ containerDimensions, isFullscreen }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const { data: ships = [], isLoading: shipsLoading } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => getAllAssessments().then((res) => res.data),
  });

  const { data: infractions = [], isLoading: infractionsLoading } = useQuery({
    queryKey: ["infractions"],
    queryFn: () => getAllInfractions().then((res) => res.data),
  });

  const isLoading = shipsLoading || assessmentsLoading || infractionsLoading;

  const shipStatusData = useMemo(() => {
    if (!ships.length) return null;

    const statusCounts = ships.reduce((acc, ship) => {
      const status = ship.shipStatus || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCounts).map((status) =>
      status === "UNDER_REVIEW"
        ? "Under Review"
        : status.charAt(0) + status.slice(1).toLowerCase()
    );

    const data = Object.values(statusCounts);

    const backgroundColor = [
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 159, 64, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(201, 203, 207, 0.8)",
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [ships]);

  const assessmentScoreData = useMemo(() => {
    if (!assessments.length) return null;

    const avgScoresByType = {};
    const countByType = {};

    assessments.forEach((assessment) => {
      const type = assessment.ssaType || "other";

      if (!avgScoresByType[type]) {
        avgScoresByType[type] = 0;
        countByType[type] = 0;
      }

      avgScoresByType[type] += assessment.ssaScore || 0;
      countByType[type]++;
    });

    Object.keys(avgScoresByType).forEach((type) => {
      avgScoresByType[type] = Math.round(
        avgScoresByType[type] / countByType[type]
      );
    });

    const formattedLabels = Object.keys(avgScoresByType).map(
      (type) => type.charAt(0).toUpperCase() + type.slice(1)
    );

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: "Average Security Assessment Score",
          data: Object.values(avgScoresByType),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          pointBackgroundColor: "rgba(54, 162, 235, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(54, 162, 235, 1)",
        },
      ],
    };
  }, [assessments]);

  // Process data for infractions by type chart
  const infractionsByTypeData = useMemo(() => {
    if (!infractions.length) return null;

    const infractionCounts = infractions.reduce((acc, infraction) => {
      const type = infraction.infractionType || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const formattedLabels = Object.keys(infractionCounts).map((type) =>
      type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

    const backgroundColor = [
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
    ];

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: "Number of Infractions",
          data: Object.values(infractionCounts),
          backgroundColor,
          borderColor: backgroundColor.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [infractions]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ChartWrapper
      title="Security Metrics Overview"
      description="Comprehensive view of maritime security metrics"
      containerDimensions={containerDimensions}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Ship Status" />
          <Tab label="Assessment Scores" />
          <Tab label="Infractions" />
        </Tabs>

        <Box
          sx={{
            height: isFullscreen ? "calc(100% - 100px)" : "calc(100% - 60px)",
          }}
        >
          {activeTab === 0 && shipStatusData && (
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "center", flexGrow: 1 }}
              >
                <Doughnut data={shipStatusData} options={doughnutOptions} />
              </Box>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Chip label={`Total Ships: ${ships.length}`} color="primary" />
                <Chip
                  label={`High Risk: ${
                    ships.filter((s) => s.isHighRiskCrew).length
                  }`}
                  color="error"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}

          {activeTab === 1 && assessmentScoreData && (
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Radar data={assessmentScoreData} options={radarOptions} />
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  Higher scores indicate higher risk levels (0-100 scale)
                </Typography>
              </Box>
            </Box>
          )}

          {activeTab === 2 && infractionsByTypeData && (
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Bar data={infractionsByTypeData} options={barOptions} />
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Chip
                  label={`Total Infractions: ${infractions.length}`}
                  color="warning"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </ChartWrapper>
  );
};

export default SecurityMetricsChart;

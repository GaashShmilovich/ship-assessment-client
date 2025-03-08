// src/pages/DashboardPage.jsx
import React from "react";
import { Typography, Box, Paper } from "@mui/material";
import ShipInfoChart from "../components/charts/ShipInfoChart";
import SSAAssessmentsChart from "../components/charts/SSAAssessmentsChart";
import InfractionsChart from "../components/charts/InfractionsChart";
import CargoCapacityChart from "../components/charts/CargoCapacityChart";
import ShipMap from "../components/ShipMap";

const DashboardPage = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Security Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <Paper
          sx={{
            p: 2,
            gridColumn: { xs: "1", md: "1 / span 2" },
            height: { xs: 400, md: 600 }, // Adjust container height as desired
          }}
        >
          <ShipMap />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Ship Status Overview
          </Typography>
          <ShipInfoChart />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            SSA Assessments
          </Typography>
          <SSAAssessmentsChart />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Infractions
          </Typography>
          <InfractionsChart />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Cargo Capacity Distribution
          </Typography>
          <CargoCapacityChart />
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;

// src/components/dashboard/RiskAlertsWidget.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShips,
  getAllAssessments,
  getAllInfractions,
} from "../../services/api";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Badge,
  Card,
  CardContent,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityIcon from "@mui/icons-material/Security";

const RiskAlertsWidget = ({ containerDimensions }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  // Fetch data
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

  // Process data to generate alerts
  useEffect(() => {
    if (isLoading) return;

    const newAlerts = [];

    // Check for high-risk crew ships
    ships.forEach((ship) => {
      if (ship.isHighRiskCrew) {
        newAlerts.push({
          id: `high-risk-crew-${ship.fileId}`,
          type: "high-risk-crew",
          severity: "high",
          shipId: ship.fileId,
          shipName: ship.shipName,
          message: "Ship flagged for high-risk crew",
          date: new Date().toISOString(),
        });
      }

      // Ships in quarantine or under review
      if (
        ship.shipStatus === "UNDER_REVIEW" ||
        ship.shipStatus === "QUARANTINE"
      ) {
        newAlerts.push({
          id: `status-${ship.fileId}`,
          type: "status",
          severity: ship.shipStatus === "QUARANTINE" ? "high" : "medium",
          shipId: ship.fileId,
          shipName: ship.shipName,
          message: `Ship status: ${ship.shipStatus
            .replace("_", " ")
            .toLowerCase()}`,
          date: new Date().toISOString(),
        });
      }
    });

    // Check for suspect SSA assessments
    assessments.forEach((assessment) => {
      if (assessment.isSuspect) {
        const ship = ships.find((s) => s.fileId === assessment.fileId);
        if (ship) {
          newAlerts.push({
            id: `ssa-${assessment.ssaId}`,
            type: "assessment",
            severity: "medium",
            shipId: ship.fileId,
            shipName: ship.shipName,
            message: `Security concern: ${assessment.ssaType} (score: ${assessment.ssaScore})`,
            date: new Date().toISOString(),
          });
        }
      }
    });

    // Check for recent infractions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    infractions.forEach((infraction) => {
      const infractionDate = new Date(infraction.infractionDate);
      if (infractionDate >= thirtyDaysAgo) {
        const ship = ships.find((s) => s.fileId === infraction.fileId);
        if (ship) {
          newAlerts.push({
            id: `infraction-${infraction.infractionId}`,
            type: "infraction",
            severity: "medium",
            shipId: ship.fileId,
            shipName: ship.shipName,
            message: `Recent infraction: ${infraction.infractionType.replace(
              "_",
              " "
            )}`,
            date: infraction.infractionDate,
          });
        }
      }
    });

    // Sort by severity (high to low)
    newAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    setAlerts(newAlerts);
  }, [ships, assessments, infractions, isLoading]);

  const handleAlertClick = (shipId) => {
    navigate(`/ship/${shipId}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
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
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Security Alerts
          {alerts.length > 0 && (
            <Badge badgeContent={alerts.length} color="error" sx={{ ml: 1 }}>
              <WarningIcon color="action" />
            </Badge>
          )}
        </Typography>
      </Box>

      {alerts.length === 0 ? (
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Alert severity="success" sx={{ mb: 2 }}>
            No active security alerts at this time
          </Alert>
          <Typography variant="body2" color="text.secondary">
            All ships are operating within normal security parameters
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            overflow: "auto",
            flexGrow: 1,
            maxHeight: containerDimensions?.height || "auto",
          }}
        >
          <List>
            {alerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  onClick={() => handleAlertClick(alert.shipId)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          getSeverityColor(alert.severity) === "error"
                            ? "#f44336"
                            : "#ff9800",
                      }}
                    >
                      {alert.severity === "high" ? (
                        <ErrorIcon />
                      ) : (
                        <WarningIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {alert.shipName}
                      </Typography>
                      <Chip
                        size="small"
                        label={alert.severity.toUpperCase()}
                        color={getSeverityColor(alert.severity)}
                        sx={{ ml: 1, height: 20 }}
                      />
                    </Box>
                    <Box component="div" sx={{ mt: 0.5 }}>
                      <Box
                        component="span"
                        sx={{
                          display: "block",
                          color: "text.primary",
                          fontSize: "0.875rem",
                        }}
                      >
                        {alert.message}
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        {new Date(alert.date).toLocaleDateString()}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/ships")}
        >
          View All Ships
        </Button>
      </Box>
    </Box>
  );
};

export default RiskAlertsWidget;

// src/pages/ShipDetailPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getShipById,
  getAssessmentsByShipId,
  getInfractionsByShipId,
  getHistoriesByShipId,
} from "../services/api";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Container,
  Grid2,
} from "@mui/material";

const ShipDetailPage = () => {
  const { file_id } = useParams();
  const navigate = useNavigate();

  // Fetch ship info
  const {
    data: ship,
    isLoading: shipLoading,
    error: shipError,
  } = useQuery({
    queryKey: ["ship", file_id],
    queryFn: () => getShipById(file_id).then((res) => res.data),
  });

  // Fetch SSA assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["assessments", file_id],
    queryFn: () => getAssessmentsByShipId(file_id).then((res) => res.data),
  });

  // Fetch infractions
  const { data: infractions, isLoading: infractionsLoading } = useQuery({
    queryKey: ["infractions", file_id],
    queryFn: () => getInfractionsByShipId(file_id).then((res) => res.data),
  });

  // Fetch harbor history
  const { data: harborHistory, isLoading: harborHistoryLoading } = useQuery({
    queryKey: ["harborHistory", file_id],
    queryFn: () => getHistoriesByShipId(file_id).then((res) => res.data),
  });

  if (shipLoading)
    return (
      <Typography variant="h6" sx={{ p: 2 }}>
        Loading ship details...
      </Typography>
    );
  if (shipError)
    return (
      <Typography variant="h6" sx={{ p: 2 }}>
        Error loading ship details.
      </Typography>
    );

  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      {/* Back Button */}
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back to Ship List
      </Button>

      {/* Ship Basic Info Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {ship.shipName}
        </Typography>
        <Grid2 container spacing={2} columns={12}>
          <Grid2 sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
            <Typography variant="body1">
              <strong>Type:</strong> {ship.shipType}
            </Typography>
            <Typography variant="body1">
              <strong>Flag:</strong> {ship.shipFlag}
            </Typography>
            <Typography variant="body1">
              <strong>Owner:</strong> {ship.shipOwner}
            </Typography>
          </Grid2>
          <Grid2 sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
            <Typography variant="body1">
              <strong>Status:</strong> {ship.shipStatus}
            </Typography>
            <Typography variant="body1">
              <strong>Capacity:</strong> {ship.cargoCapacityTonnage} tons
            </Typography>
            <Typography variant="body1">
              <strong>Port of Registry:</strong> {ship.portOfRegistry}
            </Typography>
          </Grid2>
        </Grid2>
      </Paper>

      {/* Combined Section for Additional Details */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Additional Details
        </Typography>
        <Grid2 container spacing={2} columns={12}>
          {/* SSA Assessments */}
          <Grid2 sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
            <Typography variant="h6" gutterBottom>
              SSA Assessments
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {assessmentsLoading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : assessments && assessments.length > 0 ? (
              assessments.map((a) => (
                <Box key={a.ssaId} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{a.ssaType}</strong>: {a.ssaScore}{" "}
                    {a.ssaComments && `- ${a.ssaComments}`}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No assessments available.</Typography>
            )}
          </Grid2>
          {/* Infractions */}
          <Grid2 sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
            <Typography variant="h6" gutterBottom>
              Infractions
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {infractionsLoading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : infractions && infractions.length > 0 ? (
              infractions.map((inf) => (
                <Box key={inf.infractionId} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{inf.infractionType}</strong>: {inf.details}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No infractions available.</Typography>
            )}
          </Grid2>
          {/* Harbor History */}
          <Grid2 sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
            <Typography variant="h6" gutterBottom>
              Harbor History
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {harborHistoryLoading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : harborHistory && harborHistory.length > 0 ? (
              harborHistory.map((h) => (
                <Box key={h.historyId} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{h.portVisited}</strong> ({h.country}) from{" "}
                    {h.arrivalDate} to {h.departureDate || "present"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">
                No harbor history available.
              </Typography>
            )}
          </Grid2>
        </Grid2>
      </Paper>
    </Container>
  );
};

export default ShipDetailPage;

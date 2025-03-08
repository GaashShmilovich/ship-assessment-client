// src/pages/ShipDetails.jsx
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
  Grid,
  Skeleton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  Alert,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StatusIndicator from "../components/common/StatusIndicator";

// TabPanel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ship-tabpanel-${index}`}
      aria-labelledby={`ship-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ShipDetails = () => {
  const { file_id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["assessments", file_id],
    queryFn: () => getAssessmentsByShipId(file_id).then((res) => res.data),
    enabled: !shipLoading,
  });

  // Fetch infractions
  const { data: infractions = [], isLoading: infractionsLoading } = useQuery({
    queryKey: ["infractions", file_id],
    queryFn: () => getInfractionsByShipId(file_id).then((res) => res.data),
    enabled: !shipLoading,
  });

  // Fetch harbor history
  const { data: harborHistory = [], isLoading: harborHistoryLoading } =
    useQuery({
      queryKey: ["harborHistory", file_id],
      queryFn: () => getHistoriesByShipId(file_id).then((res) => res.data),
      enabled: !shipLoading,
    });

  // Loading state
  if (shipLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Skeleton variant="text" width={300} height={40} />
        </Box>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  // Error state
  if (shipError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back to Ship List
        </Button>
        <Alert severity="error">
          Error loading ship details. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to Ship List
      </Button>

      {/* Ship Basic Info Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {ship.shipName}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip
                label={ship.shipType}
                size="small"
                sx={{ borderRadius: 1 }}
              />
              <Chip
                label={`Flag: ${ship.shipFlag}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
              <Chip
                label={`Capacity: ${ship.cargoCapacityTonnage.toLocaleString()} tons`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", mt: { xs: 2, sm: 0 } }}
          >
            <StatusIndicator status={ship.shipStatus} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="textSecondary">
              Owner
            </Typography>
            <Typography variant="body1">{ship.shipOwner || "N/A"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="textSecondary">
              Port of Registry
            </Typography>
            <Typography variant="body1">{ship.portOfRegistry}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="textSecondary">
              Registry Number
            </Typography>
            <Typography variant="body1">
              {ship.officialRegistryNumber || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="textSecondary">
              Working Languages
            </Typography>
            <Typography variant="body1">
              {ship.workingLanguages || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="textSecondary">
              Call Sign
            </Typography>
            <Typography variant="body1">{ship.callSign || "N/A"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="textSecondary">
              Class
            </Typography>
            <Typography variant="body1">{ship.class || "N/A"}</Typography>
          </Grid>
          {ship.isHighRiskCrew && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mt: 1 }}>
                This ship has been flagged for high-risk crew. Additional
                monitoring may be required.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="SSA Assessments" />
            <Tab label="Infractions" />
            <Tab label="Harbor History" />
          </Tabs>
        </Box>

        {/* Assessments Tab */}
        <TabPanel value={tabValue} index={0}>
          {assessmentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>Loading assessments...</Typography>
            </Box>
          ) : assessments.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>No assessments available for this ship.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {assessments.map((assessment) => (
                <Grid item xs={12} sm={6} key={assessment.ssaId}>
                  <Card variant="outlined">
                    <CardHeader
                      title={assessment.ssaType}
                      subheader={`Score: ${assessment.ssaScore} / 100`}
                      titleTypographyProps={{ variant: "h6" }}
                      subheaderTypographyProps={{ variant: "subtitle2" }}
                      sx={{
                        pb: 1,
                        "& .MuiCardHeader-title": { fontSize: "1rem" },
                      }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        {assessment.ssaComments || "No additional comments."}
                      </Typography>
                      {assessment.isSuspect && (
                        <Chip
                          label="Suspect"
                          color="error"
                          size="small"
                          sx={{ mt: 2 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Infractions Tab */}
        <TabPanel value={tabValue} index={1}>
          {infractionsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>Loading infractions...</Typography>
            </Box>
          ) : infractions.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>No infractions reported for this ship.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {infractions.map((infraction) => (
                <Grid item xs={12} key={infraction.infractionId}>
                  <Card variant="outlined">
                    <CardHeader
                      title={infraction.infractionType}
                      subheader={`Date: ${infraction.infractionDate || "N/A"}`}
                      titleTypographyProps={{ variant: "h6" }}
                      subheaderTypographyProps={{ variant: "subtitle2" }}
                      sx={{
                        pb: 1,
                        "& .MuiCardHeader-title": { fontSize: "1rem" },
                      }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2">
                        {infraction.details || "No details provided."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Harbor History Tab */}
        <TabPanel value={tabValue} index={2}>
          {harborHistoryLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>Loading harbor history...</Typography>
            </Box>
          ) : harborHistory.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Typography>
                No harbor history available for this ship.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {harborHistory.map((entry, index) => (
                <Card
                  key={entry.historyId || index}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderColor: entry.isHighRisk ? "error.main" : "divider",
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: -12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: entry.isHighRisk ? "error.main" : "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "bold",
                      border: "4px solid white",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                    }}
                  >
                    {index + 1}
                  </Box>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {entry.portVisited}, {entry.country}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {entry.arrivalDate}{" "}
                      {entry.departureDate
                        ? ` to ${entry.departureDate}`
                        : " to present"}
                    </Typography>
                    {entry.isHighRisk && (
                      <Chip
                        label={`High Risk: ${entry.riskReason || "Unknown"}`}
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ShipDetails;

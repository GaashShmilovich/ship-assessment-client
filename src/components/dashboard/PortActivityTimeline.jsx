// src/components/dashboard/PortActivityTimeline.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllHistories, getAllInfractions } from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import ErrorIcon from "@mui/icons-material/Error";
import AnchorIcon from "@mui/icons-material/Anchor";
import SailingIcon from "@mui/icons-material/Sailing";
import WarningIcon from "@mui/icons-material/Warning";
import EventIcon from "@mui/icons-material/Event";

// Using a standard card-based timeline instead of MUI Timeline components
const PortActivityTimeline = () => {
  const navigate = useNavigate();

  // Fetch harbor history and infractions
  const { data: harborHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["harborHistory"],
    queryFn: () => getAllHistories().then((res) => res.data),
  });

  const { data: infractions = [], isLoading: infractionsLoading } = useQuery({
    queryKey: ["infractions"],
    queryFn: () => getAllInfractions().then((res) => res.data),
  });

  const isLoading = historyLoading || infractionsLoading;

  // Create a merged timeline of port visits and infractions
  const timelineEvents = React.useMemo(() => {
    const events = [];

    // Add harbor history events
    harborHistory.forEach((entry) => {
      // Arrival event
      events.push({
        type: "arrival",
        date: new Date(entry.arrivalDate),
        ship: { id: entry.fileId },
        port: entry.portVisited,
        country: entry.country,
        isHighRisk: entry.isHighRisk,
        riskReason: entry.riskReason,
      });

      // Departure event (if ship has departed)
      if (entry.departureDate) {
        events.push({
          type: "departure",
          date: new Date(entry.departureDate),
          ship: { id: entry.fileId },
          port: entry.portVisited,
          country: entry.country,
          isHighRisk: entry.isHighRisk,
          riskReason: entry.riskReason,
        });
      }
    });

    // Add infraction events
    infractions.forEach((infraction) => {
      events.push({
        type: "infraction",
        date: new Date(infraction.infractionDate),
        ship: { id: infraction.fileId },
        infractionType: infraction.infractionType,
        details: infraction.details,
      });
    });

    // Sort by date (newest first)
    return events.sort((a, b) => b.date - a.date).slice(0, 10); // Limit to last 10 events
  }, [harborHistory, infractions]);

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

  // THIS IS THE CRUCIAL FIX - create a custom render function for each timeline item
  const renderTimelineItem = (event, index) => {
    // Create the secondary content separately so we can control the HTML structure
    const secondaryContent = (
      <>
        <Typography
          variant="body2"
          color="textSecondary"
          component="span"
          sx={{ display: "block" }}
        >
          {event.date.toLocaleString()}
        </Typography>

        <Card variant="outlined" sx={{ mt: 1, borderRadius: 2 }}>
          <CardContent sx={{ py: 1, px: 2, "&:last-child": { pb: 1 } }}>
            {event.type === "infraction" ? (
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
              >
                {event.details || "No details available"}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="div"
                >
                  {`Port: ${event.port}, ${event.country}`}
                </Typography>
                {event.isHighRisk && (
                  <Chip
                    icon={<WarningIcon />}
                    label="High Risk Port"
                    size="small"
                    color="error"
                    sx={{ mt: 1 }}
                  />
                )}
                {event.riskReason && (
                  <Typography
                    variant="body2"
                    color="error"
                    component="div"
                    sx={{ mt: 1 }}
                  >
                    {event.riskReason}
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </>
    );

    return (
      <ListItem key={index} sx={{ mb: 2, p: 0, alignItems: "flex-start" }}>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: getEventColor(event) }}>
            {getEventIcon(event)}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography variant="body1" color="textPrimary">
              {getEventTitle(event)}
            </Typography>
          }
          // THE CRITICAL FIX: Use a wrapper span for secondary content and set disableTypography to true
          secondary={<span>{secondaryContent}</span>}
          disableTypography={true}
        />
      </ListItem>
    );
  };

  return (
    <List sx={{ width: "100%", py: 0 }}>
      {timelineEvents.slice(0, 5).map(renderTimelineItem)}
    </List>
  );
};

// Helper functions for timeline events
const getEventColor = (event) => {
  switch (event.type) {
    case "arrival":
      return event.isHighRisk ? "#f44336" : "#1976d2";
    case "departure":
      return event.isHighRisk ? "#ff9800" : "#4caf50";
    case "infraction":
      return "#f44336";
    default:
      return "#9e9e9e";
  }
};

const getEventIcon = (event) => {
  switch (event.type) {
    case "arrival":
      return <AnchorIcon />;
    case "departure":
      return <SailingIcon />;
    case "infraction":
      return <ErrorIcon />;
    default:
      return <DirectionsBoatIcon />;
  }
};

const getEventTitle = (event) => {
  switch (event.type) {
    case "arrival":
      return "Ship Arrived at Port";
    case "departure":
      return "Ship Departed Port";
    case "infraction":
      return `Infraction: ${formatInfractionType(event.infractionType)}`;
    default:
      return "Port Activity";
  }
};

const formatInfractionType = (type) => {
  if (!type) return "Unknown";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default PortActivityTimeline;

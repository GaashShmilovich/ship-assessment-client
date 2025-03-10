// src/components/dashboard/PortActivityTimeline.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllHistories } from "../../services/api";
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  Chip,
  Paper,
} from "@mui/material";
import AnchorIcon from "@mui/icons-material/Anchor";
import SailingIcon from "@mui/icons-material/Sailing";
import WarningIcon from "@mui/icons-material/Warning";

const PortActivityTimeline = ({ maxHeight = 400 }) => {
  // Fetch harbor history
  const { data: harborHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["harborHistory"],
    queryFn: () => getAllHistories().then((res) => res.data),
  });

  // Create a timeline of port visits
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

    // Sort by date (newest first)
    return events.sort((a, b) => b.date - a.date);
  }, [harborHistory]);

  if (historyLoading) {
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
    <Paper
      elevation={0}
      sx={{
        maxHeight: maxHeight,
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(0,0,0,0.05)",
        },
      }}
    >
      <List sx={{ width: "100%", py: 0 }}>
        {timelineEvents.map((event, index) => (
          <ListItem key={index} sx={{ mb: 2, p: 0, alignItems: "flex-start" }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getEventColor(event) }}>
                {getEventIcon(event)}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Typography variant="body1" color="textPrimary" component="div">
                  {getEventTitle(event)}
                </Typography>
              }
              disableTypography
              secondary={
                <React.Fragment>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="div"
                    sx={{ mt: 1 }}
                  >
                    {event.date.toLocaleString()}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Card variant="outlined" sx={{ mt: 1, borderRadius: 2 }}>
                      <CardContent
                        sx={{ py: 1, px: 2, "&:last-child": { pb: 1 } }}
                      >
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
                      </CardContent>
                    </Card>
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

// Helper functions for timeline events
const getEventColor = (event) => {
  switch (event.type) {
    case "arrival":
      return event.isHighRisk ? "#f44336" : "#1976d2";
    case "departure":
      return event.isHighRisk ? "#ff9800" : "#4caf50";
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
    default:
      return null;
  }
};

const getEventTitle = (event) => {
  switch (event.type) {
    case "arrival":
      return "Ship Arrived at Port";
    case "departure":
      return "Ship Departed Port";
    default:
      return "Port Activity";
  }
};

export default PortActivityTimeline;

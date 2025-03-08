import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const StatusIndicator = ({ status }) => {
  const theme = useTheme();

  const statusConfig = {
    ACTIVE: {
      color: theme.palette.status.active,
      label: "Active",
      tooltip: "The ship is currently active and operational",
    },
    MAINTENANCE: {
      color: theme.palette.status.maintenance,
      label: "Maintenance",
      tooltip: "The ship is undergoing scheduled maintenance",
    },
    UNDER_REVIEW: {
      color: theme.palette.status.underReview,
      label: "Under Review",
      tooltip: "The ship is currently under security or regulatory review",
    },
    QUARANTINE: {
      color: theme.palette.status.quarantine || theme.palette.error.main,
      label: "Quarantine",
      tooltip: "The ship is under quarantine and restricted from movement",
    },
  };

  // Default for unknown status
  const defaultConfig = {
    color: theme.palette.grey[500],
    label: status || "Unknown",
    tooltip: "Status information unavailable",
  };

  // Get the config for this status (or default if not found)
  const config = statusConfig[status] || defaultConfig;

  return (
    <Tooltip title={config.tooltip}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: config.color,
            mr: 1,
            boxShadow: `0 0 0 2px ${config.color}22`, // Add subtle glow
          }}
        />
        <Typography variant="body2" fontWeight="medium">
          {config.label}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default StatusIndicator;

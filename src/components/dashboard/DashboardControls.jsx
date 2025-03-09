import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";

const DashboardControls = ({
  theme,
  widgetConfig,
  initialWidgets,
  visibleWidgets,
  isRefreshing,
  hasUnsavedChanges,
  refreshAllData,
  saveDashboardState,
  resetDashboard,
  handleToggleWidget,
  activeWidgetCount,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        background: "linear-gradient(to right, #ffffff, #f9f9ff)",
        width: "100%", // Take full width of parent container
        mx: "auto", // Center horizontally
        boxSizing: "border-box", // Include padding in width calculation
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: { xs: 2, sm: 0 },
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 1 }}>
          Dashboard Controls
        </Typography>

        <Tooltip title="Refresh all data">
          <IconButton
            color="primary"
            onClick={refreshAllData}
            disabled={isRefreshing}
            size="small"
            sx={{ mr: 1 }}
          >
            <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save layout">
          <span>
            <IconButton
              color="success"
              onClick={saveDashboardState}
              disabled={!hasUnsavedChanges}
              size="small"
              sx={{ mr: 1 }}
            >
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Reset to default">
          <IconButton color="warning" onClick={resetDashboard} size="small">
            <RestoreIcon />
          </IconButton>
        </Tooltip>

        <Chip
          label={`${activeWidgetCount} active widgets`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: { xs: 0, sm: 1 } }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          maxWidth: { xs: "100%", md: "60%" },
        }}
      >
        {Object.keys(initialWidgets).map((key) => (
          <Chip
            key={key}
            icon={
              visibleWidgets[key] ? (
                <VisibilityIcon fontSize="small" />
              ) : (
                <VisibilityOffIcon fontSize="small" />
              )
            }
            label={widgetConfig[key].label}
            variant={visibleWidgets[key] ? "default" : "outlined"}
            onClick={() => handleToggleWidget(key)}
            color={visibleWidgets[key] ? "primary" : "default"}
            sx={{ borderRadius: "4px" }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DashboardControls;

import React, { useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import ChartWrapper from "./ChartWrapper";
import { getAllShips } from "../../services/api";
import { useQuery } from "@tanstack/react-query";

const ShipInfoChart = ({ containerDimensions }) => {
  const theme = useTheme();
  const chartRef = useRef(null);

  const {
    data: ships,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
    staleTime: 60000,
  });

  // Format status labels
  const formatStatusLabel = (status) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Process data with fixed ordering
  const processData = () => {
    if (!ships || !ships.length) return null;

    // Count ships by status
    const statusCounts = ships.reduce((acc, ship) => {
      const status = ship.shipStatus || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Fixed order priority for status (no user sorting)
    const orderedStatuses = [
      "ACTIVE",
      "UNDER_REVIEW",
      "QUARANTINE",
      "MAINTENANCE",
    ];

    // Create ordered array of status items
    let statusItems = orderedStatuses
      .filter((status) => statusCounts[status] !== undefined)
      .map((status) => ({
        status,
        count: statusCounts[status] || 0,
        formattedStatus: formatStatusLabel(status),
      }));

    // Add any other statuses not in the predefined order
    Object.keys(statusCounts)
      .filter((status) => !orderedStatuses.includes(status))
      .forEach((status) => {
        statusItems.push({
          status,
          count: statusCounts[status],
          formattedStatus: formatStatusLabel(status),
        });
      });

    const total = statusItems.reduce((sum, item) => sum + item.count, 0);

    return {
      items: statusItems,
      total,
      activeCount: statusCounts["ACTIVE"] || 0,
      quarantineCount: statusCounts["QUARANTINE"] || 0,
      reviewCount: statusCounts["UNDER_REVIEW"] || 0,
      maintenanceCount: statusCounts["MAINTENANCE"] || 0,
    };
  };

  const chartData = processData();

  // Get color for status
  const getStatusColor = (status, opacity = 1) => {
    switch (status) {
      case "ACTIVE":
        return `rgba(46, 125, 50, ${opacity})`;
      case "UNDER_REVIEW":
        return `rgba(237, 108, 2, ${opacity})`;
      case "QUARANTINE":
        return `rgba(211, 47, 47, ${opacity})`;
      case "MAINTENANCE":
        return `rgba(25, 118, 210, ${opacity})`;
      default:
        return `rgba(158, 158, 158, ${opacity})`;
    }
  };

  // Use fixed width for bars to prevent scrolling
  const getBarWidth = (count, maxCount) => {
    return `${Math.max((count / maxCount) * 65, 5)}%`; // Use percentage with lower max value
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ChartWrapper
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        containerDimensions={containerDimensions}
      >
        {chartData && (
          <>
            {/* Simplified bar chart - match screenshot layout */}
            <Box
              sx={{ display: "flex", flexDirection: "column", mt: 1, mb: 0.5 }}
            >
              {chartData.items.map((item, index) => (
                <Box
                  key={item.status}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 0.5,
                    height: 24,
                    overflow: "visible",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 80,
                      textAlign: "left",
                      fontSize: "0.75rem",
                      pr: 0.5,
                    }}
                  >
                    {item.formattedStatus}
                  </Typography>
                  <Box
                    sx={{
                      position: "relative",
                      height: "100%",
                      width: getBarWidth(
                        item.count,
                        Math.max(...chartData.items.map((i) => i.count))
                      ),
                      minWidth: "20px",
                      background: getStatusColor(item.status, 0.9),
                      borderRadius: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      pr: 1,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "500",
                      ml: 1,
                      minWidth: "15px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Compact status summary strip - match screenshot layout */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                pt: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
                fontSize: "0.75rem",
              }}
            >
              {[
                {
                  status: "ACTIVE",
                  count: chartData.activeCount,
                  color: theme.palette.success.main,
                },
                {
                  status: "UNDER_REVIEW",
                  count: chartData.reviewCount,
                  color: theme.palette.warning.main,
                },
                {
                  status: "QUARANTINE",
                  count: chartData.quarantineCount,
                  color: theme.palette.error.main,
                },
                {
                  status: "MAINTENANCE",
                  count: chartData.maintenanceCount,
                  color: theme.palette.primary.main,
                },
              ].map((item) => (
                <Box
                  key={item.status}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      height: "14px",
                      width: "3px",
                      backgroundColor: item.color,
                      mr: 0.5,
                      borderRadius: "1px",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.75rem", fontWeight: "500" }}
                  >
                    {formatStatusLabel(item.status)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                    }}
                  >
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </ChartWrapper>
    </Box>
  );
};

export default ShipInfoChart;

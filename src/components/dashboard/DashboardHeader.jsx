// Fix for DashboardHeader.jsx
// Replace the Box container at the top with this improved version
// src/components/dashboard/DashboardHeader.jsx

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAllShips, getAllInfractions } from "../../services/api";

const DashboardHeader = () => {
  // Data fetching remains the same
  const { data: ships = [], isLoading: shipsLoading } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data || []),
  });

  const { data: infractions = [], isLoading: infractionsLoading } = useQuery({
    queryKey: ["infractions"],
    queryFn: () => getAllInfractions().then((res) => res.data || []),
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (shipsLoading) return null;

    const shipsArray = Array.isArray(ships) ? ships : [];
    const infractionsArray = Array.isArray(infractions) ? infractions : [];

    const totalShips = shipsArray.length;
    const activeShips = shipsArray.filter(
      (s) => s.shipStatus === "ACTIVE"
    ).length;
    const underReview = shipsArray.filter(
      (s) => s.shipStatus === "UNDER_REVIEW"
    ).length;
    const inQuarantine = shipsArray.filter(
      (s) => s.shipStatus === "QUARANTINE"
    ).length;
    const totalInfractions = infractionsArray.length;

    return {
      totalShips,
      activeShips,
      underReview,
      inQuarantine,
      totalInfractions,
    };
  }, [ships, infractions, shipsLoading, infractionsLoading]);

  if (shipsLoading) {
    return (
      <Box sx={{ width: "100%", mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            textAlign: "left",
            fontWeight: 500,
          }}
        >
          <Skeleton width={300} />
        </Typography>

        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton animation="wave" height={24} width="60%" />
                  <Skeleton animation="wave" height={40} width="40%" />
                  <Skeleton animation="wave" height={20} width="70%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mb: 3, overflow: "hidden" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: "left",
          fontWeight: 500,
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        Maritime Security Dashboard
      </Typography>

      <Grid container spacing={2}>
        {/* Total Ships */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: "#f5f9ff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ fontSize: "0.8rem" }}
              >
                Total Ships
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  my: 0.5,
                  fontWeight: 500,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {stats?.totalShips || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  fontSize: "0.75rem",
                  mt: 0.5,
                }}
              >
                {stats?.activeShips || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Under Review */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: "#edf7ff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ fontSize: "0.8rem" }}
              >
                Under Review
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  my: 0.5,
                  fontWeight: 500,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {stats?.underReview || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  fontSize: "0.75rem",
                  mt: 0.5,
                }}
              >
                {stats?.totalShips
                  ? ((stats.underReview / stats.totalShips) * 100).toFixed(1)
                  : "0.0"}
                % of fleet
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* In Quarantine */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: "#fff5f5",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ fontSize: "0.8rem" }}
              >
                In Quarantine
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  my: 0.5,
                  fontWeight: 500,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {stats?.inQuarantine || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  fontSize: "0.75rem",
                  mt: 0.5,
                }}
              >
                {stats?.totalShips
                  ? ((stats.inQuarantine / stats.totalShips) * 100).toFixed(1)
                  : "0.0"}
                % of fleet
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Infractions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: "#fffaf0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ fontSize: "0.8rem" }}
              >
                Total Infractions
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  my: 0.5,
                  fontWeight: 500,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                }}
              >
                {stats?.totalInfractions || 0}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  fontSize: "0.75rem",
                  mt: 0.5,
                }}
              >
                {stats?.totalShips && stats?.totalShips > 0
                  ? (stats.totalInfractions / stats.totalShips).toFixed(1)
                  : "0.0"}{" "}
                per ship avg.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHeader;

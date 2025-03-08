// src/components/dashboard/DashboardHeader.jsx
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAllShips, getAllInfractions } from "../../services/api";

/**
 * DashboardHeader - Shows key metrics at the top of the dashboard
 */
const DashboardHeader = () => {
  // Fetch data for metrics
  const { data: ships, isLoading: shipsLoading } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  const { data: infractions, isLoading: infractionsLoading } = useQuery({
    queryKey: ["infractions"],
    queryFn: () => getAllInfractions().then((res) => res.data),
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!ships || shipsLoading) return null;

    const totalShips = ships.length;
    const activeShips = ships.filter((s) => s.shipStatus === "ACTIVE").length;
    const underReview = ships.filter(
      (s) => s.shipStatus === "UNDER_REVIEW"
    ).length;
    const inQuarantine = ships.filter(
      (s) => s.shipStatus === "QUARANTINE"
    ).length;
    const totalInfractions = infractions?.length || 0;

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
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton animation="wave" height={30} width="50%" />
                  <Skeleton animation="wave" height={50} width="70%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Maritime Security Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Ships */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#f5f9ff" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Total Ships
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                {stats?.totalShips || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {stats?.activeShips || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Under Review */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#edf7ff" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Under Review
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                {stats?.underReview || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {((stats?.underReview / stats?.totalShips) * 100 || 0).toFixed(
                  1
                )}
                % of fleet
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* In Quarantine */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#fff5f5" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                In Quarantine
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                {stats?.inQuarantine || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {((stats?.inQuarantine / stats?.totalShips) * 100 || 0).toFixed(
                  1
                )}
                % of fleet
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Infractions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#fffaf0" }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Total Infractions
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 600 }}>
                {stats?.totalInfractions || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {(stats?.totalInfractions / stats?.totalShips || 0).toFixed(1)}{" "}
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

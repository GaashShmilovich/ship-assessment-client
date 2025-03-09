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

/**
 * DashboardHeader - Shows key metrics at the top of the dashboard
 * Precisely aligned with map container below
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
    // No container or max-width here to match parent container width exactly
    <Box sx={{ width: 1200, mb: 3 }}>
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
                  fontSize: { xs: "2rem", sm: "2.5rem" },
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
                  fontSize: { xs: "2rem", sm: "2.5rem" },
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
                  fontSize: { xs: "2rem", sm: "2.5rem" },
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
                  fontSize: { xs: "2rem", sm: "2.5rem" },
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

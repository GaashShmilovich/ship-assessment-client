// src/pages/ShipList.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllShips } from "../services/api";
import {
  Typography,
  Box,
  Container,
  Paper,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Skeleton,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import StatusIndicator from "../components/common/StatusIndicator";

// Import the ShipCard component
import ShipCard from "../components/ships/ShipCard";

const ShipList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);

  // Get all ships
  const {
    data: ships = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  // Filter and sort ships
  const filteredShips = useMemo(() => {
    return ships
      .filter((ship) => {
        // Search term filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          ship.shipName?.toLowerCase().includes(searchLower) ||
          ship.shipFlag?.toLowerCase().includes(searchLower) ||
          ship.shipType?.toLowerCase().includes(searchLower) ||
          ship.portOfRegistry?.toLowerCase().includes(searchLower);

        // Status filter
        const matchesStatus =
          statusFilter === "all" || ship.shipStatus === statusFilter;

        // High risk filter
        const matchesRisk = !showHighRiskOnly || ship.isHighRiskCrew;

        return matchesSearch && matchesStatus && matchesRisk;
      })
      .sort((a, b) => {
        // Sort by selected field
        switch (sortBy) {
          case "name":
            return (a.shipName || "").localeCompare(b.shipName || "");
          case "capacity":
            return (
              (b.cargoCapacityTonnage || 0) - (a.cargoCapacityTonnage || 0)
            );
          case "flag":
            return (a.shipFlag || "").localeCompare(b.shipFlag || "");
          case "status":
            return (a.shipStatus || "").localeCompare(b.shipStatus || "");
          default:
            return 0;
        }
      });
  }, [ships, searchTerm, statusFilter, sortBy, showHighRiskOnly]);

  const handleCardClick = (shipId) => {
    navigate(`/ship/${shipId}`);
  };

  // Loading state with skeletons
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={250} height={56} />
            <Skeleton variant="rectangular" width={150} height={56} />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Error fetching ship data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ship Fleet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all vessels
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            icon={<DirectionsBoatIcon />}
            label={`${filteredShips.length} ships`}
            sx={{ mr: 1 }}
          />
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search ships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="medium">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                <MenuItem value="QUARANTINE">Quarantine</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="medium">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="name">Ship Name</MenuItem>
                <MenuItem value="capacity">Capacity (High to Low)</MenuItem>
                <MenuItem value="flag">Flag</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={showHighRiskOnly}
                    onChange={(e) => setShowHighRiskOnly(e.target.checked)}
                  />
                }
                label="High Risk Only"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Results count */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredShips.length} of {ships.length} ships
        </Typography>

        {filteredShips.length === 0 && searchTerm && (
          <Chip
            label="No results found"
            color="warning"
            onDelete={() => setSearchTerm("")}
          />
        )}
      </Box>

      {/* Ship Grid */}
      {filteredShips.length > 0 ? (
        <Grid container spacing={3}>
          {filteredShips.map((ship) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={ship.fileId || ship.id}
            >
              <ShipCard ship={ship} onClick={handleCardClick} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          <DirectionsBoatIcon
            sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No ships found matching your filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria or filters
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ShipList;

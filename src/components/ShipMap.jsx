// This is the fixed ShipMap component that addresses the scrolling issue
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { getAllShips } from "../services/api";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Paper,
  Skeleton,
  Chip,
  Card,
  CardContent,
  Divider,
  Avatar,
  Tooltip,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import StatusIndicator from "./common/StatusIndicator";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SailingIcon from "@mui/icons-material/Sailing";
import WarningIcon from "@mui/icons-material/Warning";
import ExploreIcon from "@mui/icons-material/Explore";

// Create custom ship marker icon with SVG
const createShipMarker = (status, isHighRisk, shipType) => {
  // Status colors
  const statusColors = {
    ACTIVE: "#4caf50", // Green
    MAINTENANCE: "#ff9800", // Orange
    UNDER_REVIEW: "#9c27b0", // Purple
    QUARANTINE: "#f44336", // Red
  };

  // Default blue if status not found
  const statusColor = statusColors[status] || "#1976d2";

  // High risk indicator
  const highRiskIndicator = isHighRisk
    ? '<circle cx="24" cy="8" r="6" fill="#d32f2f" stroke="white" stroke-width="1"/>'
    : "";

  // Choose ship icon based on ship type
  let shipPath;
  if (shipType === "Cruise") {
    // Cruise ship icon (simplified cruise ship silhouette)
    shipPath =
      "M17 16.85v-10c0-1.3-0.84-2.4-2-2.82v-1.18c0-0.55-0.45-1-1-1h-4c-0.55 0-1 0.45-1 1v1.18c-1.16 0.41-2 1.51-2 2.82v10l-2 2v1h14v-1l-2-2zm-5-14c0.55 0 1 0.45 1 1s-0.45 1-1 1-1-0.45-1-1 0.45-1 1-1z";
  } else if (shipType === "Tanker") {
    // Tanker ship icon
    shipPath =
      "M20.96 17H10V5H8v12H3.04C2.46 17 2 17.46 2 18.04V19h20v-.96c0-.58-.46-1.04-1.04-1.04zM10.5 11h1V7h-1zm3 0h1V7h-1z";
  } else {
    // Default cargo ship
    shipPath =
      "M17 16.85v-10c0-1.3-0.84-2.4-2-2.82v-1.18c0-0.55-0.45-1-1-1h-4c-0.55 0-1 0.45-1 1v1.18c-1.16 0.41-2 1.51-2 2.82v10l-2 2v1h14v-1l-2-2zm-5-14c0.55 0 1 0.45 1 1s-0.45 1-1 1-1-0.45-1-1 0.45-1 1-1z";
  }

  // Create SVG for ship icon
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="${shipPath}" fill="${statusColor}" stroke="white" stroke-width="1" transform="translate(4, 4) scale(1.2)"/>
      ${highRiskIndicator}
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "ship-custom-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Define water areas where ships can be positioned
const waterAreas = [
  { minLat: 32.835, maxLat: 32.865, minLng: 34.95, maxLng: 34.98 },
  { minLat: 32.83, maxLat: 32.86, minLng: 34.985, maxLng: 35.01 },
  { minLat: 32.825, maxLat: 32.845, minLng: 35.01, maxLng: 35.04 },
];

// Deterministic pseudo-random position based on ship fileId
const getShipPosition = (fileId, shipName) => {
  // Use ship properties to generate a repeatable position
  const seed = (fileId || 0) + (shipName || "").charCodeAt(0) || 0;

  // Select water area based on seed
  const areaIndex = seed % waterAreas.length;
  const area = waterAreas[areaIndex];

  // Generate position within the selected area
  const normalizedSeed = seed / 1000;
  const lat =
    area.minLat + ((normalizedSeed * 7919) % 1) * (area.maxLat - area.minLat);
  const lng =
    area.minLng + ((normalizedSeed * 104729) % 1) * (area.maxLng - area.minLng);

  return [lat, lng];
};

// Component to handle map events
const MapEventHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick && onMapClick();
    },
  });
  return null;
};

// Optimized ShipMarkers component
const ShipMarkers = React.memo(({ ships, onMarkerClick }) => {
  // Memoize markers to avoid unnecessary re-renders
  const markers = useMemo(() => {
    return ships.map((ship) => ({
      ship,
      position: getShipPosition(ship.fileId, ship.shipName),
      icon: createShipMarker(
        ship.shipStatus,
        ship.isHighRiskCrew,
        ship.shipType
      ),
    }));
  }, [ships]);

  const handleMarkerClick = useCallback(
    (e, ship) => {
      L.DomEvent.stopPropagation(e.originalEvent);
      onMarkerClick && onMarkerClick(ship);
    },
    [onMarkerClick]
  );

  return (
    <>
      {markers.map(({ ship, position, icon }) => (
        <Marker
          key={`ship-${ship.fileId}`}
          position={position}
          icon={icon}
          eventHandlers={{
            click: (e) => handleMarkerClick(e, ship),
          }}
        />
      ))}
    </>
  );
});

// Custom style for map tiles
const mapStyle = {
  sea: {
    color: "#b3dcff", // Light blue for water
    weight: 1,
    opacity: 0.8,
    fillColor: "#d6eaff",
    fillOpacity: 0.5,
  },
};

const ShipMap = () => {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShip, setSelectedShip] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const prevOverflowRef = useRef("");

  const mapCenter = useMemo(
    () => [
      waterAreas.reduce(
        (sum, area) => sum + (area.minLat + area.maxLat) / 2,
        0
      ) / waterAreas.length,
      waterAreas.reduce(
        (sum, area) => sum + (area.minLng + area.maxLng) / 2,
        0
      ) / waterAreas.length,
    ],
    []
  );

  const zoomLevel = 13;

  const {
    data: shipsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  const ships = useMemo(() => {
    if (!shipsData) return [];

    // Check if shipsData is an array
    if (Array.isArray(shipsData)) {
      return shipsData;
    }

    // If it's an object, try to find an array property
    if (shipsData && typeof shipsData === "object") {
      // Look for possible array properties
      for (const key in shipsData) {
        if (Array.isArray(shipsData[key])) {
          console.warn(`Ships data was nested in property '${key}'`);
          return shipsData[key];
        }
      }

      // If no array properties found but we have something, return an empty array
      console.error(
        "Expected ships to be an array but got:",
        typeof shipsData,
        shipsData
      );
      return [];
    }

    // If data is a string (like HTML), log an error and return empty array
    if (typeof shipsData === "string") {
      console.error(
        "Received string instead of ships data array. First 100 chars:",
        shipsData.substring(0, 100)
      );
      return [];
    }

    return [];
  }, [shipsData]);

  const statusCounts = useMemo(() => {
    return ships.reduce((acc, ship) => {
      const status = ship.shipStatus || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [ships]);

  // Filter ships by status
  const filteredShips = useMemo(() => {
    return ships.filter((ship) => {
      if (statusFilter === "all") return true;
      return ship.shipStatus === statusFilter;
    });
  }, [ships, statusFilter]);

  const handleMarkerClick = useCallback((ship) => {
    // Save current overflow state before changing it
    prevOverflowRef.current = document.body.style.overflow;
    // Set body style for modal
    document.body.style.overflow = "hidden";
    setSelectedShip(ship);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedShip(null);
    // Use setTimeout to ensure the dialog is fully closed before restoring scroll
    setTimeout(() => {
      // Restore previous overflow style or default to auto
      document.body.style.overflow = prevOverflowRef.current || "auto";
    }, 100);
  }, []);

  const handleViewDetails = useCallback(
    (fileId) => {
      // Restore scrolling before navigation
      document.body.style.overflow = prevOverflowRef.current || "auto";
      navigate(`/ship/${fileId}`);
    },
    [navigate]
  );

  // Handler for map click - close dialogs
  const handleMapClick = useCallback(() => {
    if (selectedShip) {
      handleClose();
    }
  }, [selectedShip, handleClose]);

  // Ensure body scroll is properly restored on component unmount
  useEffect(() => {
    // Cleanup function to ensure body scroll is restored when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Add custom map styles via CSS
  useEffect(() => {
    // Add custom CSS to make the map look better
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container {
        background-color: #b3e0ff;
        border-radius: 8px;
        overflow: hidden;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 3px 14px rgba(0,0,0,0.2);
        padding: 0;
        overflow: hidden;
      }
      .leaflet-popup-content {
        margin: 0;
        padding: 0;
      }
      .leaflet-popup-tip {
        box-shadow: 0 3px 14px rgba(0,0,0,0.2);
      }
      .ship-custom-icon {
        filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.3));
        cursor: pointer;
      }
      .custom-cluster-icon {
        background-color: #1976d2;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        width: 36px !important;
        height: 36px !important;
        margin-top: -18px !important;
        margin-left: -18px !important;
        line-height: 36px;
        text-align: center;
      }
      .cluster-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flexShrink: 0, mb: 2 }}>
          <Skeleton variant="rectangular" width={200} height={56} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Error fetching ship data. Please try again later.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header and Filter UI */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Ships ({ships.length})</MenuItem>
              <MenuItem value="ACTIVE">
                Active ({statusCounts.ACTIVE || 0})
              </MenuItem>
              <MenuItem value="MAINTENANCE">
                Maintenance ({statusCounts.MAINTENANCE || 0})
              </MenuItem>
              <MenuItem value="UNDER_REVIEW">
                Under Review ({statusCounts.UNDER_REVIEW || 0})
              </MenuItem>
              <MenuItem value="QUARANTINE">
                Quarantine ({statusCounts.QUARANTINE || 0})
              </MenuItem>
            </Select>
          </FormControl>

          <Paper
            elevation={0}
            sx={{
              p: 1,
              bgcolor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {filteredShips.length} of {ships.length} ships in the port
              area
            </Typography>
          </Paper>
        </Box>

        {/* Map Container */}
        <Paper
          elevation={2}
          sx={{
            flexGrow: 1,
            position: "relative",
            zIndex: 0,
            overflow: "hidden",
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <ZoomControl position="bottomright" />
            <MapEventHandler onMapClick={handleMapClick} />

            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Standard Map">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Maritime">
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Terrain">
                <TileLayer
                  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                  url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MarkerClusterGroup
              showCoverageOnHover={false}
              maxClusterRadius={40}
              disableClusteringAtZoom={15}
              spiderfyOnMaxZoom={true}
              chunkedLoading={true}
              iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                  html: `<div class="cluster-icon">${count}</div>`,
                  className: "custom-cluster-icon",
                  iconSize: [40, 40],
                  iconAnchor: [20, 20],
                });
              }}
            >
              <ShipMarkers
                ships={filteredShips}
                onMarkerClick={handleMarkerClick}
              />
            </MarkerClusterGroup>
          </MapContainer>
        </Paper>

        {/* Map Legend */}
        <Paper
          elevation={1}
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="medium">
            Ship Status Legend
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 1 }}>
            <Tooltip title="Active ships in operation">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#4caf50",
                    mr: 1,
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Typography variant="body2">Active</Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Ships under maintenance">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#ff9800",
                    mr: 1,
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Typography variant="body2">Maintenance</Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Ships under security or safety review">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#9c27b0",
                    mr: 1,
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Typography variant="body2">Under Review</Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Ships in quarantine - restricted access">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#f44336",
                    mr: 1,
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Typography variant="body2">Quarantine</Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Ships with high-risk crew">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ position: "relative", mr: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#1976d2",
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "#d32f2f",
                      position: "absolute",
                      top: -3,
                      right: -3,
                      border: "1px solid white",
                    }}
                  />
                </Box>
                <Typography variant="body2">High Risk Crew</Typography>
              </Box>
            </Tooltip>
          </Box>
        </Paper>
      </Box>

      {/* Ship Details Dialog - Using disableScrollLock to prevent scroll issues */}
      <Dialog
        open={Boolean(selectedShip)}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        keepMounted={false}
        disableScrollLock={true}
        disableRestoreFocus
        aria-labelledby="ship-dialog-title"
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          id="ship-dialog-title"
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {selectedShip && (
            <>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                {selectedShip.shipType === "Cruise" ? (
                  <SailingIcon />
                ) : selectedShip.shipType === "Tanker" ? (
                  <LocalShippingIcon />
                ) : (
                  <DirectionsBoatIcon />
                )}
              </Avatar>
              <Box>
                {selectedShip.shipName}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {selectedShip.shipType} • {selectedShip.shipFlag}
                </Typography>
              </Box>
            </>
          )}
        </DialogTitle>

        <Divider />

        <DialogContent>
          {selectedShip && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status
                </Typography>
                <StatusIndicator status={selectedShip.shipStatus} />
              </Box>

              <Divider />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Port of Registry
                  </Typography>
                  <Typography variant="body1">
                    {selectedShip.portOfRegistry}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Cargo Capacity
                  </Typography>
                  <Typography variant="body1">
                    {selectedShip.cargoCapacityTonnage.toLocaleString()} tons
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Owner
                  </Typography>
                  <Typography variant="body1">
                    {selectedShip.shipOwner || "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Registry Number
                  </Typography>
                  <Typography variant="body1">
                    {selectedShip.officialRegistryNumber || "N/A"}
                  </Typography>
                </Box>
              </Box>

              {selectedShip.isHighRiskCrew && (
                <Alert severity="error" icon={<WarningIcon />} sx={{ mt: 2 }}>
                  This ship has been flagged for high-risk crew assessment
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
          <Button
            onClick={() => handleViewDetails(selectedShip.fileId)}
            color="primary"
            variant="contained"
            startIcon={<ExploreIcon />}
          >
            View Full Details
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShipMap;

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMapEvents,
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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";

// Fix default icon issues with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const waterAreas = [
  { minLat: 32.835, maxLat: 32.865, minLng: 34.95, maxLng: 34.98 },
  { minLat: 32.83, maxLat: 32.86, minLng: 34.985, maxLng: 35.01 },
  { minLat: 32.825, maxLat: 32.845, minLng: 35.01, maxLng: 35.04 },
];

const getRandomSeaPosition = () => {
  const area = waterAreas[Math.floor(Math.random() * waterAreas.length)];

  const lat = area.minLat + Math.random() * (area.maxLat - area.minLat);
  const lng = area.minLng + Math.random() * (area.maxLng - area.minLng);

  return [lat, lng];
};

const MapEventHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      L.DomEvent.stopPropagation(e.originalEvent);
      e.originalEvent.preventDefault();
      onMapClick();
    },
  });
  return null;
};

const ShipMarkers = React.memo(({ ships, onMarkerClick }) => {
  const markers = useMemo(
    () =>
      ships.map((ship) => ({
        ship,
        position: getRandomSeaPosition(),
      })),
    [ships]
  );

  const handleMarkerClick = useCallback(
    (e, ship) => {
      L.DomEvent.stopPropagation(e.originalEvent);
      e.originalEvent.preventDefault();
      onMarkerClick(ship);
      return false;
    },
    [onMarkerClick]
  );

  return (
    <>
      {markers.map(({ ship, position }) => (
        <Marker
          key={ship.fileId}
          position={position}
          eventHandlers={{
            click: (e) => handleMarkerClick(e, ship),
          }}
        />
      ))}
    </>
  );
});

const ShipMap = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShip, setSelectedShip] = useState(null);

  const mapCenter = [
    waterAreas.reduce((sum, area) => sum + (area.minLat + area.maxLat) / 2, 0) /
      waterAreas.length,
    waterAreas.reduce((sum, area) => sum + (area.minLng + area.maxLng) / 2, 0) /
      waterAreas.length,
  ];

  const zoomLevel = 13;

  const {
    data: ships = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  const filteredShips = useMemo(() => {
    return ships.filter((ship) => {
      if (statusFilter === "all") return true;
      return ship.shipStatus === statusFilter;
    });
  }, [ships, statusFilter]);

  const handleMarkerClick = useCallback((ship) => {
    setSelectedShip(ship);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedShip(null);
  }, []);

  // Handler for map click - just to ensure clean handling
  const handleMapClick = useCallback(() => {
    // Optional: close the dialog if it's open
    // setSelectedShip(null);
  }, []);

  // Prevent the dialog from causing jumps when opening/closing
  useEffect(() => {
    const handleBodyScroll = (open) => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleBodyScroll(Boolean(selectedShip));

    return () => {
      handleBodyScroll(false);
    };
  }, [selectedShip]);

  if (isLoading)
    return (
      <Typography variant="h6" sx={{ p: 2 }}>
        Loading ship data...
      </Typography>
    );
  if (error)
    return <div>Error fetching ship data. Please try again later.</div>;

  return (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Filter UI */}
        <Box sx={{ flexShrink: 0, mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Map Container */}
        <Box
          sx={{
            flexGrow: 1,
            position: "relative",
            // Fix: Add these styles to prevent the map from jumping
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            zoomControl={true}
            style={{ height: "100%", width: "100%" }}
            key="map-container"
          >
            <MapEventHandler onMapClick={handleMapClick} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <MarkerClusterGroup
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e.originalEvent);
                  e.originalEvent.preventDefault();
                },
              }}
            >
              <ShipMarkers
                ships={filteredShips}
                onMarkerClick={handleMarkerClick}
              />
            </MarkerClusterGroup>
          </MapContainer>
        </Box>
      </Box>

      {/* Dialog placed outside the Box component but inside the Fragment */}
      <Dialog
        open={Boolean(selectedShip)}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        keepMounted={false}
        disableRestoreFocus
        aria-labelledby="ship-dialog-title"
        sx={{
          position: "fixed",
          zIndex: 9999,
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <DialogTitle id="ship-dialog-title">
          {selectedShip ? selectedShip.shipName : ""}
        </DialogTitle>
        <DialogContent dividers>
          {selectedShip && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body1" component="div">
                <strong>Type:</strong> {selectedShip.shipType}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Flag:</strong> {selectedShip.shipFlag}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Port of Registry:</strong> {selectedShip.portOfRegistry}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Cargo Capacity:</strong>{" "}
                {selectedShip.cargoCapacityTonnage} tons
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Status:</strong> {selectedShip.shipStatus}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            color="primary"
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShipMap;

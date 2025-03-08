// src/components/ShipList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getAllShips } from "../services/api";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

const ShipList = () => {
  const navigate = useNavigate();

  const {
    data: ships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  if (isLoading)
    return (
      <Typography variant="h6" sx={{ p: 2 }}>
        Loading ship data...
      </Typography>
    );
  if (error)
    return <div>Error fetching ship data. Please try again later.</div>;

  const handleCardClick = (shipId) => {
    navigate(`/ship/${shipId}`);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Ship Information
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {ships.map((ship, index) => (
          <Box
            key={ship.fileId ? `${ship.fileId}-${index}` : index}
            onClick={() => handleCardClick(ship.fileId)}
            sx={{ cursor: "pointer" }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5">{ship.shipName}</Typography>
                <Typography variant="body2">Flag: {ship.shipFlag}</Typography>
                <Typography variant="body2">Type: {ship.shipType}</Typography>
                <Typography variant="body2">
                  Port of Registry: {ship.portOfRegistry}
                </Typography>
                <Typography variant="body2">
                  Crew: {ship.crewNationality}
                </Typography>
                <Typography variant="body2">
                  Capacity: {ship.cargoCapacityTonnage} tons
                </Typography>
                <Typography variant="body2">
                  Status: {ship.shipStatus}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default ShipList;

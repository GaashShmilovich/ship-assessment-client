// src/components/ships/ShipCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import StatusIndicator from "../common/StatusIndicator";

/**
 * ShipCard - A card component to display a ship in the ships list
 */
const ShipCard = ({ ship, onClick }) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: ship.isHighRiskCrew ? "2px solid #f44336" : "none",
      }}
    >
      <CardActionArea
        onClick={() => onClick(ship.fileId)}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              {ship.shipName}
            </Typography>
            <StatusIndicator status={ship.shipStatus} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">{ship.shipType}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Flag
              </Typography>
              <Typography variant="body1">{ship.shipFlag}</Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Port of Registry
              </Typography>
              <Typography variant="body1" noWrap>
                {ship.portOfRegistry}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Capacity
              </Typography>
              <Typography variant="body1">
                {ship.cargoCapacityTonnage.toLocaleString()} tons
              </Typography>
            </Grid>
          </Grid>

          {ship.isHighRiskCrew && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label="High Risk Crew"
                color="error"
                size="small"
                sx={{ fontSize: "0.75rem" }}
              />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ShipCard;

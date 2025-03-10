// src/layout/Footer.jsx
import React from "react";
import { Box, Typography, Container, Link, Divider } from "@mui/material";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "flex-start" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              mb: { xs: 2, sm: 0 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <DirectionsBoatIcon
                sx={{ mr: 1 }}
                color="primary"
                fontSize="small"
              />
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: "bold" }}
              >
                Port Security Manager
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Maritime security management system
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Port Security Manager. All rights
              reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <Link href="#" underline="hover" color="inherit" sx={{ mr: 2 }}>
                Privacy Policy
              </Link>
              <Link href="#" underline="hover" color="inherit">
                Terms of Service
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

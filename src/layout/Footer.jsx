// src/layout/Footer.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ textAlign: "center", p: 2, mt: 4, backgroundColor: "#f5f5f5" }}>
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} Port Security Manager. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;

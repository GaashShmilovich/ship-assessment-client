// src/layout/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Container } from "@mui/material";

const MainLayout = () => {
  return (
    <>
      <Header />
      <Container sx={{ mt: 4, minHeight: "80vh" }}>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
};

export default MainLayout;

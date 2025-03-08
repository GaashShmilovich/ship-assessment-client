// src/pages/CustomDashboard.jsx
import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Container,
} from "@mui/material";
import ShipMap from "../components/ShipMap";
import ShipInfoChart from "../components/charts/ShipInfoChart";
import SSAAssessmentsChart from "../components/charts/SSAAssessmentsChart";
import InfractionsChart from "../components/charts/InfractionsChart";
import CargoCapacityChart from "../components/charts/CargoCapacityChart";
import AutoResizeBox from "../components/AutoResizeBox";

// Update default layout: Increase map widget height and rename its key to "shipMap"
const defaultLayout = [
  { i: "shipMap", x: 0, y: 0, w: 12, h: 14 }, // increased height (14 * 30 = 420px)
  { i: "shipInfo", x: 0, y: 14, w: 6, h: 6 },
  { i: "ssa", x: 6, y: 14, w: 6, h: 6 },
  { i: "infractions", x: 0, y: 20, w: 6, h: 6 },
  { i: "cargo", x: 6, y: 20, w: 6, h: 6 },
];

// Initially, all widgets are visible.
const initialWidgets = {
  shipMap: true,
  shipInfo: true,
  ssa: true,
  infractions: true,
  cargo: true,
};

const CustomDashboard = () => {
  const [layout, setLayout] = useState(defaultLayout);
  const [activeWidgets, setActiveWidgets] = useState(initialWidgets);

  // Toggle widget visibility.
  const handleToggleWidget = (widgetKey) => {
    setActiveWidgets((prev) => ({
      ...prev,
      [widgetKey]: !prev[widgetKey],
    }));
    // Optionally, you can add logic to reinsert a layout item if missing.
  };

  // Filter layout items based on active widgets.
  const filteredLayout = layout.filter((item) => activeWidgets[item.i]);

  // A helper to update layout height based on content.
  const updateLayoutHeight = (widgetKey, contentHeight) => {
    const rowHeight = 30; // grid rowHeight
    const newH = Math.ceil(contentHeight / rowHeight);
    setLayout((prevLayout) =>
      prevLayout.map((item) =>
        item.i === widgetKey ? { ...item, h: newH } : item
      )
    );
  };

  return (
    <Container maxWidth="lg" sx={{ p: 2 }}>
      {/* Widget Toggle Switches */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Manage Dashboard Widgets
        </Typography>
        <FormGroup row>
          {Object.keys(initialWidgets).map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={activeWidgets[key]}
                  onChange={() => handleToggleWidget(key)}
                />
              }
              label={key}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Grid Layout for Widgets */}
      <GridLayout
        className="layout"
        layout={filteredLayout}
        cols={12}
        rowHeight={30}
        width={1200} // Consider calculating width dynamically for responsiveness
        onLayoutChange={(newLayout) => setLayout(newLayout)}
        draggableHandle=".drag-handle"
        isResizable={false} // Only allow rearrangement
      >
        {activeWidgets.shipMap && (
          <div
            key="shipMap"
            style={{
              background: "#fff",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="drag-handle"
              style={{
                cursor: "move",
                padding: "8px",
                background: "#1976d2",
                color: "#fff",
                marginBottom: "16px",
                border: "2px solid red", // Add this for debugging
              }}
            >
              Ship Map
            </div>
            <ShipMap />
          </div>
        )}
        {activeWidgets.shipInfo && (
          <div
            key="shipInfo"
            style={{
              background: "#fff",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="drag-handle"
              style={{
                cursor: "move",
                padding: "8px",
                background: "#1976d2",
                color: "#fff",
              }}
            >
              Ship Status Overview
            </div>
            <AutoResizeBox
              onResize={(height) => updateLayoutHeight("shipInfo", height)}
            >
              <ShipInfoChart />
            </AutoResizeBox>
          </div>
        )}
        {activeWidgets.ssa && (
          <div
            key="ssa"
            style={{
              background: "#fff",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="drag-handle"
              style={{
                cursor: "move",
                padding: "8px",
                background: "#1976d2",
                color: "#fff",
              }}
            >
              SSA Assessments
            </div>
            <AutoResizeBox
              onResize={(height) => updateLayoutHeight("ssa", height)}
            >
              <SSAAssessmentsChart />
            </AutoResizeBox>
          </div>
        )}
        {activeWidgets.infractions && (
          <div
            key="infractions"
            style={{
              background: "#fff",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="drag-handle"
              style={{
                cursor: "move",
                padding: "8px",
                background: "#1976d2",
                color: "#fff",
              }}
            >
              Infractions
            </div>
            <AutoResizeBox
              onResize={(height) => updateLayoutHeight("infractions", height)}
            >
              <InfractionsChart />
            </AutoResizeBox>
          </div>
        )}
        {activeWidgets.cargo && (
          <div
            key="cargo"
            style={{
              background: "#fff",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="drag-handle"
              style={{
                cursor: "move",
                padding: "8px",
                background: "#1976d2",
                color: "#fff",
              }}
            >
              Cargo Capacity Distribution
            </div>
            <AutoResizeBox
              onResize={(height) => updateLayoutHeight("cargo", height)}
            >
              <CargoCapacityChart />
            </AutoResizeBox>
          </div>
        )}
      </GridLayout>
    </Container>
  );
};

export default CustomDashboard;

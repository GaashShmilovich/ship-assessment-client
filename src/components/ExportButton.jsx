import React from "react";
import { Button } from "@mui/material";
import Papa from "papaparse";

const ExportButton = ({ data, filename }) => {
  const handleExport = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || "report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="contained" onClick={handleExport}>
      Export CSV
    </Button>
  );
};

export default ExportButton;

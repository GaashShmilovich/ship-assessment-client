// src/components/dashboard/DocumentExpiryTracker.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllShips } from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  useTheme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningIcon from "@mui/icons-material/Warning";

const DocumentExpiryTracker = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch ship data
  const { data: ships = [], isLoading } = useQuery({
    queryKey: ["ships"],
    queryFn: () => getAllShips().then((res) => res.data),
  });

  // Calculate days until expiry and categorize documents
  const documentData = useMemo(() => {
    if (!ships.length) return [];

    const currentDate = new Date();
    const documents = [];

    // Mock document data - in a real app, this would come from your backend
    ships.forEach((ship) => {
      // Create a mock SSA expiry date (1 year after SSA date)
      if (ship.dateOfSsa) {
        const ssaDate = new Date(ship.dateOfSsa);
        const expiryDate = new Date(ssaDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const daysUntilExpiry = Math.ceil(
          (expiryDate - currentDate) / (1000 * 60 * 60 * 24)
        );

        documents.push({
          shipId: ship.fileId,
          shipName: ship.shipName,
          documentType: "SSA Certificate",
          expiryDate: expiryDate.toISOString().split("T")[0],
          daysUntilExpiry,
          status:
            daysUntilExpiry < 0
              ? "expired"
              : daysUntilExpiry <= 30
              ? "warning"
              : "valid",
        });
      }

      // Add mock safety certificate with random expiry
      const randomDays = Math.floor(Math.random() * 180) - 30; // Random days between -30 and 150
      const safetyExpiryDate = new Date();
      safetyExpiryDate.setDate(safetyExpiryDate.getDate() + randomDays);

      documents.push({
        shipId: ship.fileId,
        shipName: ship.shipName,
        documentType: "Safety Certificate",
        expiryDate: safetyExpiryDate.toISOString().split("T")[0],
        daysUntilExpiry: randomDays,
        status:
          randomDays < 0 ? "expired" : randomDays <= 30 ? "warning" : "valid",
      });

      // Add mock crew certification with random expiry
      const crewRandomDays = Math.floor(Math.random() * 90) - 10; // Random days between -10 and 80
      const crewExpiryDate = new Date();
      crewExpiryDate.setDate(crewExpiryDate.getDate() + crewRandomDays);

      documents.push({
        shipId: ship.fileId,
        shipName: ship.shipName,
        documentType: "Crew Certification",
        expiryDate: crewExpiryDate.toISOString().split("T")[0],
        daysUntilExpiry: crewRandomDays,
        status:
          crewRandomDays < 0
            ? "expired"
            : crewRandomDays <= 30
            ? "warning"
            : "valid",
      });
    });

    // Sort by days until expiry (ascending)
    return documents.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [ships]);

  // Filter for documents that need attention (expired or about to expire)
  const expiringDocuments = useMemo(() => {
    return documentData.filter((doc) => doc.daysUntilExpiry <= 30);
  }, [documentData]);

  const getStatusColor = (status) => {
    switch (status) {
      case "expired":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "valid":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status, days) => {
    switch (status) {
      case "expired":
        return `Expired (${Math.abs(days)} days ago)`;
      case "warning":
        return `Expires in ${days} days`;
      case "valid":
        return `Valid (${days} days remaining)`;
      default:
        return "Unknown";
    }
  };

  const handleRowClick = (shipId) => {
    navigate(`/ship/${shipId}`);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          Document Expiry Tracker
        </Typography>

        <Chip
          icon={<WarningIcon />}
          label={`${expiringDocuments.length} Need Attention`}
          color={expiringDocuments.length > 0 ? "warning" : "success"}
          variant="outlined"
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{ flexGrow: 1, overflow: "auto", maxHeight: "calc(100% - 60px)" }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ship Name</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expiringDocuments.length > 0 ? (
              expiringDocuments.map((doc) => (
                <TableRow
                  key={`${doc.shipId}-${doc.documentType}`}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                    bgcolor:
                      doc.status === "expired"
                        ? "rgba(244, 67, 54, 0.08)"
                        : "inherit",
                  }}
                  onClick={() => handleRowClick(doc.shipId)}
                >
                  <TableCell>{doc.shipName}</TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarTodayIcon
                        fontSize="small"
                        sx={{ mr: 0.5, fontSize: 16, opacity: 0.7 }}
                      />
                      {doc.expiryDate}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(doc.status, doc.daysUntilExpiry)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(doc.status)}20`,
                        color: getStatusColor(doc.status),
                        fontWeight: "medium",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" sx={{ py: 2 }}>
                    No documents expiring soon
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            navigate("/ships");
          }}
        >
          View All Documents
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentExpiryTracker;

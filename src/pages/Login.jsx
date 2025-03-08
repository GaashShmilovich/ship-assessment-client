// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Container,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login, isAuthenticated } from "../services/authService";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!username.trim()) {
      setErrorMsg("Username is required");
      return;
    }

    if (!password) {
      setErrorMsg("Password is required");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Demo credentials hint
  const handleDemoLogin = () => {
    setUsername("securityManager");
    setPassword("password123");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: "50%",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DirectionsBoatIcon fontSize="large" />
          </Box>

          <Typography
            component="h1"
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            Port Security Manager
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Sign in to access your dashboard
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Demo
              </Typography>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleDemoLogin}
                underline="hover"
              >
                Use demo credentials
              </Link>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 4, textAlign: "center" }}
        >
          For demo purposes only. Use username: "securityManager" and password:
          "password123"
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;

import { createTheme } from "@mui/material/styles"

const theme = createTheme({
    palette: {
        primary: {
            main: "#1565c0",
            light: "#5e92f3",
            dark: "#003c8f",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#00838f",
            light: "#4fb3bf",
            dark: "#005662",
            contrastText: "#ffffff",
        },
        error: {
            main: "#d32f2f",
        },
        warning: {
            main: "#ffa000",
        },
        info: {
            main: "#1976d2",
        },
        success: {
            main: "#2e7d32",
        },
        background: {
            default: "#f5f7fa",
            paper: "#ffffff",
        },
        status: {
            active: "#66bb6a",
            quarantine: "#ef5350",
            maintenance: "#ffb74d",
            underReview: "#ba68c8",
        },
    },
    typography: {
        fontFamily: [
            "'Roboto'",
            "sans-serif",
        ].join(","),
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 500,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    textTransform: "none",
                    fontWeight: 500,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                },
            },
        },
    },
})

export default theme
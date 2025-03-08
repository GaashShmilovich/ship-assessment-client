// src/components/charts/chartConfig.js
import { useTheme } from "@mui/material"

// Custom chart color palette
export const chartColors = {
    primary: [
        "rgba(25, 118, 210, 0.7)",
        "rgba(66, 165, 245, 0.7)",
        "rgba(100, 181, 246, 0.7)",
        "rgba(144, 202, 249, 0.7)",
        "rgba(187, 222, 251, 0.7)",
    ],
    success: [
        "rgba(46, 125, 50, 0.7)",
        "rgba(76, 175, 80, 0.7)",
        "rgba(129, 199, 132, 0.7)",
        "rgba(165, 214, 167, 0.7)",
        "rgba(200, 230, 201, 0.7)",
    ],
    warning: [
        "rgba(237, 108, 2, 0.7)",
        "rgba(255, 152, 0, 0.7)",
        "rgba(255, 167, 38, 0.7)",
        "rgba(255, 183, 77, 0.7)",
        "rgba(255, 204, 128, 0.7)",
    ],
    error: [
        "rgba(211, 47, 47, 0.7)",
        "rgba(244, 67, 54, 0.7)",
        "rgba(229, 115, 115, 0.7)",
        "rgba(239, 154, 154, 0.7)",
        "rgba(255, 205, 210, 0.7)",
    ],
    neutral: [
        "rgba(66, 66, 66, 0.7)",
        "rgba(97, 97, 97, 0.7)",
        "rgba(158, 158, 158, 0.7)",
        "rgba(189, 189, 189, 0.7)",
        "rgba(224, 224, 224, 0.7)",
    ],
}

// Status colors mapping
export const statusColors = {
    ACTIVE: { main: "success", index: 0 },
    UNDER_REVIEW: { main: "warning", index: 0 },
    QUARANTINE: { main: "error", index: 0 },
    MAINTENANCE: { main: "primary", index: 2 },
    UNKNOWN: { main: "neutral", index: 0 },
}

// Chart animation config
export const animationOptions = {
    responsive: true,
    animation: {
        duration: 1000,
        easing: "easeOutQuart",
    },
    transitions: {
        active: {
            animation: {
                duration: 400,
            },
        },
    },
    plugins: {
        legend: {
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: {
                size: 14,
                weight: "bold",
            },
            bodyFont: {
                size: 13,
            },
            padding: 10,
            cornerRadius: 4,
            displayColors: true,
        },
    },
}

// Hook to generate chart colors based on theme and status
export const useChartColors = () => {
    const theme = useTheme()

    const getStatusColor = (status, opacity = 0.7) => {
        const statusKey = status?.toUpperCase() || "UNKNOWN"
        const colorInfo = statusColors[statusKey] || statusColors.UNKNOWN

        const color = theme.palette[colorInfo.main]
            ? theme.palette[colorInfo.main].main
            : chartColors[colorInfo.main][colorInfo.index]

        return color.replace(/[^,]+(?=\))/, opacity)
    }

    const getChartColorSet = (type = "primary", count = 5) => {
        const colorSet = chartColors[type] || chartColors.primary
        return colorSet.slice(0, count)
    }

    return { getStatusColor, getChartColorSet }
}

// Generate a canvas to export chart as image
export const exportChartToImage = (chartRef, fileName = "chart.png") => {
    if (!chartRef || !chartRef.current) return

    // Check if the chart has toBase64Image method (Chart.js 3.x+)
    if (typeof chartRef.current.toBase64Image === 'function') {
        const link = document.createElement("a")
        link.download = fileName
        link.href = chartRef.current.toBase64Image()
        link.click()
    } else {
        console.warn('Chart export is not available')
    }
}
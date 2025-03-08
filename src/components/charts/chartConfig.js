// src/components/charts/chartConfig.js
import { useTheme } from "@mui/material"

// Custom chart color palette with enhanced colors
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

// Improved chart animation config with better responsiveness
export const animationOptions = {
    responsive: true,
    maintainAspectRatio: false, // Critical for proper resizing
    animation: {
        duration: 800,
        easing: "easeOutQuart",
    },
    transitions: {
        active: {
            animation: {
                duration: 300,
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
            position: 'top',
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
            usePointStyle: true,
            callbacks: {
                // Default callback to format percentages
                labelPercentage: function (context, total) {
                    const value = context.raw || 0
                    const percentage = total ? Math.round((value / total) * 100) : 0
                    return `${percentage}%`
                }
            }
        },
        // Ensure datalabels plugin doesn't conflict with chart.js
        datalabels: {
            display: false // Disable by default, enable explicitly when needed
        }
    },
    // Better defaults for small containers
    layout: {
        padding: {
            top: 10,
            right: 16,
            bottom: 10,
            left: 8
        }
    },
    // Better responsive behavior
    resizeDelay: 100, // Debounce resize events
}

// Generate responsive options based on container dimensions
export const getResponsiveOptions = (dimensions, baseOptions = {}) => {
    const { width = 0, height = 0 } = dimensions || {}
    const isSmall = width < 300 || height < 200
    const isMedium = (width >= 300 && width < 500) || (height >= 200 && height < 300)

    // Dynamically adjust options based on container size
    const responsiveOptions = {
        ...baseOptions,
        plugins: {
            ...baseOptions.plugins,
            legend: {
                ...baseOptions.plugins?.legend,
                display: !isSmall, // Hide legend on small containers
                position: isSmall ? 'bottom' : (isMedium ? 'bottom' : 'top'),
                labels: {
                    ...baseOptions.plugins?.legend?.labels,
                    boxWidth: isSmall ? 8 : (isMedium ? 12 : 16),
                    font: {
                        ...baseOptions.plugins?.legend?.labels?.font,
                        size: isSmall ? 10 : (isMedium ? 11 : 12)
                    }
                }
            },
            tooltip: {
                ...baseOptions.plugins?.tooltip,
                enabled: true, // Always enable tooltips
                titleFont: {
                    ...baseOptions.plugins?.tooltip?.titleFont,
                    size: isSmall ? 12 : 14
                },
                bodyFont: {
                    ...baseOptions.plugins?.tooltip?.bodyFont,
                    size: isSmall ? 11 : 13
                }
            },
            title: {
                ...baseOptions.plugins?.title,
                display: baseOptions.plugins?.title?.display && !isSmall,
                font: {
                    ...baseOptions.plugins?.title?.font,
                    size: isSmall ? 14 : (isMedium ? 16 : 18)
                }
            }
        },
        scales: {
            ...baseOptions.scales,
            x: {
                ...baseOptions.scales?.x,
                ticks: {
                    ...baseOptions.scales?.x?.ticks,
                    display: !isSmall,
                    font: {
                        ...baseOptions.scales?.x?.ticks?.font,
                        size: isSmall ? 9 : (isMedium ? 10 : 12)
                    },
                    maxRotation: isSmall ? 45 : (isMedium ? 45 : 0),
                }
            },
            y: {
                ...baseOptions.scales?.y,
                ticks: {
                    ...baseOptions.scales?.y?.ticks,
                    font: {
                        ...baseOptions.scales?.y?.ticks?.font,
                        size: isSmall ? 9 : (isMedium ? 10 : 12)
                    }
                }
            }
        }
    }

    return responsiveOptions
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
        // Create a new array to avoid mutating the original
        return [...colorSet].slice(0, count)
    }

    return { getStatusColor, getChartColorSet }
}

// Generate a canvas to export chart as image with enhanced quality
export const exportChartToImage = (chartRef, fileName = "chart.png") => {
    if (!chartRef || !chartRef.current) return

    try {
        // Check if the chart has toBase64Image method (Chart.js 3.x+)
        if (typeof chartRef.current.toBase64Image === 'function') {
            const link = document.createElement("a")
            link.download = fileName
            // Use better quality settings
            link.href = chartRef.current.toBase64Image('image/png', 1.0)
            link.click()
        } else {
            console.warn('Chart export is not available - chart instance missing toBase64Image method')
        }
    } catch (error) {
        console.error('Error exporting chart:', error)
    }
}

// Function to create gradient backgrounds for charts
export const createGradientBackground = (ctx, colors) => {
    if (!ctx) return colors

    return colors.map(color => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400)
        // Extract rgba values
        const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/)

        if (!rgbaMatch) return color

        const [, r, g, b, a = "1"] = rgbaMatch

        // Create gradient with transparency
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`)

        return gradient
    })
}
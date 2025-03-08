// src/services/api.js
import axios from "axios"

// Create base axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 15 seconds timeout
})

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Format errors in a consistent way
        let message = 'An unexpected error occurred. Please try again later.'
        let statusCode = 500

        if (error.response) {
            // The request was made and the server responded with a status code
            // outside the 2xx range
            statusCode = error.response.status

            // Try to get error message from response
            if (error.response.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data
                } else if (error.response.data.message) {
                    message = error.response.data.message
                } else if (error.response.data.error) {
                    message = error.response.data.error
                }
            }

            // Customize message for common status codes
            if (statusCode === 401) {
                message = 'Your session has expired. Please login again.'
                // Could handle auto-logout here
            } else if (statusCode === 403) {
                message = 'You do not have permission to perform this action.'
            } else if (statusCode === 404) {
                message = 'The requested resource was not found.'
            }
        } else if (error.request) {
            // The request was made but no response was received
            message = 'No response received from server. Please check your connection.'
            statusCode = 0
        }

        // Log errors in development
        if (process.env.NODE_ENV !== 'production') {
            console.error(`API Error (${statusCode}):`, message)
            console.error(error)
        }

        // Attach formatted details to the error
        error.formattedMessage = message
        error.statusCode = statusCode

        return Promise.reject(error)
    }
)

// Add request interceptor for auth token
apiClient.interceptors.request.use(
    (config) => {
        // Get auth token from storage
        const token = localStorage.getItem('authToken')

        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// ----- Ship Service -----
export const getAllShips = () => apiClient.get("/ships")
export const getShipById = (id) => apiClient.get(`/ships/${id}`)
export const createShip = (shipData) => apiClient.post("/ships", shipData)
export const updateShip = (id, shipData) => apiClient.put(`/ships/${id}`, shipData)
export const deleteShip = (id) => apiClient.delete(`/ships/${id}`)
export const getShipsByStatus = (status) => apiClient.get(`/ships/status/${status}`)

// ----- SSA Assessments Service -----
export const getAllAssessments = () => apiClient.get("/assessments")
export const getAssessmentById = (id) => apiClient.get(`/assessments/${id}`)
export const getAssessmentsByShipId = (fileId) =>
    apiClient.get(`/assessments/ship/${fileId}`)
export const createAssessment = (assessmentData) => apiClient.post("/assessments", assessmentData)
export const updateAssessment = (id, assessmentData) => apiClient.put(`/assessments/${id}`, assessmentData)
export const deleteAssessment = (id) => apiClient.delete(`/assessments/${id}`)

// ----- Infractions Service -----
export const getAllInfractions = () => apiClient.get("/infractions")
export const getInfractionById = (id) => apiClient.get(`/infractions/${id}`)
export const getInfractionsByShipId = (fileId) =>
    apiClient.get(`/infractions/ship/${fileId}`)
export const createInfraction = (infractionData) => apiClient.post("/infractions", infractionData)
export const updateInfraction = (id, infractionData) => apiClient.put(`/infractions/${id}`, infractionData)
export const deleteInfraction = (id) => apiClient.delete(`/infractions/${id}`)

// ----- Harbor History Service -----
export const getAllHistories = () => apiClient.get("/harbor-history")
export const getHistoryById = (id) => apiClient.get(`/harbor-history/${id}`)
export const getHistoriesByShipId = (fileId) =>
    apiClient.get(`/harbor-history/ship/${fileId}`)
export const createHistory = (historyData) => apiClient.post("/harbor-history", historyData)
export const updateHistory = (id, historyData) => apiClient.put(`/harbor-history/${id}`, historyData)
export const deleteHistory = (id) => apiClient.delete(`/harbor-history/${id}`)
export const getHistoriesByPort = (port) => apiClient.get(`/harbor-history/port/${port}`)
export const getHistoriesByCountry = (country) => apiClient.get(`/harbor-history/country/${country}`)
export const getHighRiskHistories = () => apiClient.get("/harbor-history/high-risk")
export const getCurrentlyDockedShips = () => apiClient.get("/harbor-history/currently-docked")
export const getHistoriesAfterDate = (date) =>
    apiClient.get("/harbor-history/arrived-after", { params: { date } })

// Add a health check endpoint
export const checkApiHealth = () => apiClient.get('/health')

// Export the enhanced API client for direct use if needed
export { apiClient }
// src/services/api.js
import axios from "axios"

// Create base axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
})

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Ensure we're getting JSON data, not HTML
        const contentType = response.headers['content-type']
        if (contentType && contentType.includes('text/html')) {
            // If we get HTML instead of JSON, return empty data with a consistent structure
            console.warn('Received HTML instead of JSON from API. Using fallback data.')
            return {
                data: [],
                status: response.status,
                statusText: response.statusText
            }
        }
        return response
    },
    (error) => {
        let message = 'An unexpected error occurred. Please try again later.'
        let statusCode = 500

        if (error.response) {
            statusCode = error.response.status

            if (error.response.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data
                } else if (error.response.data.message) {
                    message = error.response.data.message
                } else if (error.response.data.error) {
                    message = error.response.data.error
                }
            }

            if (statusCode === 401) {
                message = 'Your session has expired. Please login again.'
            } else if (statusCode === 403) {
                message = 'You do not have permission to perform this action.'
            } else if (statusCode === 404) {
                message = 'The requested resource was not found.'
            }
        } else if (error.request) {
            message = 'No response received from server. Please check your connection.'
            statusCode = 0
        }

        console.error(`API Error (${statusCode}):`, message)
        console.error(error)

        error.formattedMessage = message
        error.statusCode = statusCode

        // Return a rejected promise with our enhanced error
        return Promise.reject(error)
    }
)

// Add authentication token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Fallback data when API fails
const getEmptyFallback = () => ({ data: [] })

// ----- Ship Service -----
export const getAllShips = () =>
    apiClient.get("/ships").catch(error => {
        console.error("Error fetching ships:", error)
        return getEmptyFallback()
    })

export const getShipById = (id) =>
    apiClient.get(`/ships/${id}`).catch(error => {
        console.error(`Error fetching ship ${id}:`, error)
        return { data: null }
    })

export const createShip = (shipData) => apiClient.post("/ships", shipData)
export const updateShip = (id, shipData) => apiClient.put(`/ships/${id}`, shipData)
export const deleteShip = (id) => apiClient.delete(`/ships/${id}`)
export const getShipsByStatus = (status) => apiClient.get(`/ships/status/${status}`)

// ----- SSA Assessments Service -----
export const getAllAssessments = () =>
    apiClient.get("/assessments").catch(error => {
        console.error("Error fetching assessments:", error)
        return getEmptyFallback()
    })

export const getAssessmentById = (id) => apiClient.get(`/assessments/${id}`)
export const getAssessmentsByShipId = (fileId) =>
    apiClient.get(`/assessments/ship/${fileId}`).catch(error => {
        console.error(`Error fetching assessments for ship ${fileId}:`, error)
        return getEmptyFallback()
    })

export const createAssessment = (assessmentData) => apiClient.post("/assessments", assessmentData)
export const updateAssessment = (id, assessmentData) => apiClient.put(`/assessments/${id}`, assessmentData)
export const deleteAssessment = (id) => apiClient.delete(`/assessments/${id}`)

// ----- Infractions Service -----
export const getAllInfractions = () =>
    apiClient.get("/infractions").catch(error => {
        console.error("Error fetching infractions:", error)
        return getEmptyFallback()
    })

export const getInfractionById = (id) => apiClient.get(`/infractions/${id}`)
export const getInfractionsByShipId = (fileId) =>
    apiClient.get(`/infractions/ship/${fileId}`).catch(error => {
        console.error(`Error fetching infractions for ship ${fileId}:`, error)
        return getEmptyFallback()
    })

export const createInfraction = (infractionData) => apiClient.post("/infractions", infractionData)
export const updateInfraction = (id, infractionData) => apiClient.put(`/infractions/${id}`, infractionData)
export const deleteInfraction = (id) => apiClient.delete(`/infractions/${id}`)

// ----- Harbor History Service -----
export const getAllHistories = () =>
    apiClient.get("/harbor-history").catch(error => {
        console.error("Error fetching harbor histories:", error)
        return getEmptyFallback()
    })

export const getHistoryById = (id) => apiClient.get(`/harbor-history/${id}`)
export const getHistoriesByShipId = (fileId) =>
    apiClient.get(`/harbor-history/ship/${fileId}`).catch(error => {
        console.error(`Error fetching histories for ship ${fileId}:`, error)
        return getEmptyFallback()
    })

export const createHistory = (historyData) => apiClient.post("/harbor-history", historyData)
export const updateHistory = (id, historyData) => apiClient.put(`/harbor-history/${id}`, historyData)
export const deleteHistory = (id) => apiClient.delete(`/harbor-history/${id}`)
export const getHistoriesByPort = (port) => apiClient.get(`/harbor-history/port/${port}`)
export const getHistoriesByCountry = (country) => apiClient.get(`/harbor-history/country/${country}`)
export const getHighRiskHistories = () => apiClient.get("/harbor-history/high-risk")
export const getCurrentlyDockedShips = () => apiClient.get("/harbor-history/currently-docked")
export const getHistoriesAfterDate = (date) =>
    apiClient.get("/harbor-history/arrived-after", { params: { date } })

export const checkApiHealth = () => apiClient.get('/health')

export { apiClient }
import axios from "axios"

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

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
// (Add any other SSA endpoints as needed)

// ----- Infractions Service -----
export const getAllInfractions = () => apiClient.get("/infractions")
export const getInfractionById = (id) => apiClient.get(`/infractions/${id}`)
export const getInfractionsByShipId = (fileId) =>
    apiClient.get(`/infractions/ship/${fileId}`)
export const createInfraction = (infractionData) => apiClient.post("/infractions", infractionData)
export const updateInfraction = (id, infractionData) => apiClient.put(`/infractions/${id}`, infractionData)
export const deleteInfraction = (id) => apiClient.delete(`/infractions/${id}`)
// (Add any other infraction endpoints as needed)

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

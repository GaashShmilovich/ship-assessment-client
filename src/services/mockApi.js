// src/services/mockApi.js

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// -----------------------
// ship_info table
// -----------------------
const mockShipInfo = [
    {
        file_id: 1,
        ship_name: "Ever Given",
        ship_flag: "Panama",
        ship_type: "Container",
        port_of_registry: "Port of Los Angeles",
        working_languages: "English, Spanish",
        official_registry_number: 123456789,
        call_sign: "ABC123",
        ship_owner: "Maersk",
        class: "A",
        cargo_capacity_tonnage: 200000,
        date_of_ssa: "2025-03-01",
        ssa_by: "SSA Officer 1",
        is_high_risk_crew: false,
        record_created_at: "2025-03-01T08:00:00Z",
        record_updated_at: "2025-03-06T09:00:00Z",
        ship_status: "quarantine"
    },
    {
        file_id: 2,
        ship_name: "Queen Mary 2",
        ship_flag: "UK",
        ship_type: "Cruise",
        port_of_registry: "Port of Rotterdam",
        working_languages: "English, French",
        official_registry_number: 987654321,
        call_sign: "XYZ789",
        ship_owner: "Cunard",
        class: "B",
        cargo_capacity_tonnage: 50000,
        date_of_ssa: "2025-03-02",
        ssa_by: "SSA Officer 2",
        is_high_risk_crew: false,
        record_created_at: "2025-03-02T09:00:00Z",
        record_updated_at: "2025-03-06T10:00:00Z",
        ship_status: "active"
    },
    {
        file_id: 3,
        ship_name: "MSC Oscar",
        ship_flag: "Liberia",
        ship_type: "Container",
        port_of_registry: "Port of Singapore",
        working_languages: "English, Mandarin",
        official_registry_number: 555666777,
        call_sign: "MSC999",
        ship_owner: "MSC",
        class: "A",
        cargo_capacity_tonnage: 150000,
        date_of_ssa: "2025-03-03",
        ssa_by: "SSA Officer 3",
        is_high_risk_crew: true,
        record_created_at: "2025-03-03T07:30:00Z",
        record_updated_at: "2025-03-07T08:00:00Z",
        ship_status: "active"
    },
    {
        file_id: 4,
        ship_name: "Hanjin Victory",
        ship_flag: "South Korea",
        ship_type: "Tanker",
        port_of_registry: "Port of Busan",
        working_languages: "Korean, English",
        official_registry_number: 444333222,
        call_sign: "HAN123",
        ship_owner: "Hanjin Shipping",
        class: "C",
        cargo_capacity_tonnage: 120000,
        date_of_ssa: "2025-03-04",
        ssa_by: "SSA Officer 4",
        is_high_risk_crew: false,
        record_created_at: "2025-03-04T06:00:00Z",
        record_updated_at: "2025-03-07T09:30:00Z",
        ship_status: "maintenance"
    },
    {
        file_id: 5,
        ship_name: "Oceanic Explorer",
        ship_flag: "Bahamas",
        ship_type: "Research",
        port_of_registry: "Port of Miami",
        working_languages: "English, Spanish",
        official_registry_number: 112233445,
        call_sign: "OCE123",
        ship_owner: "Oceanic Research Inc.",
        class: "D",
        cargo_capacity_tonnage: 30000,
        date_of_ssa: "2025-03-05",
        ssa_by: "SSA Officer 5",
        is_high_risk_crew: true,
        record_created_at: "2025-03-05T10:00:00Z",
        record_updated_at: "2025-03-07T11:00:00Z",
        ship_status: "active"
    }
    // Add more records as needed...
]

// -----------------------
// ssa_assessments table
// -----------------------
const mockSSAAssessments = [
    {
        ssa_id: 1,
        file_id: 1,
        ssa_type: "violence",
        ssa_score: 20,
        ssa_comments: "Minor issues with crew discipline",
        is_suspect: false,
        record_created_at: "2025-03-01T08:30:00Z"
    },
    {
        ssa_id: 2,
        file_id: 2,
        ssa_type: "health",
        ssa_score: 50,
        ssa_comments: "Requires urgent maintenance on life support systems",
        is_suspect: true,
        record_created_at: "2025-03-02T09:30:00Z"
    },
    {
        ssa_id: 3,
        file_id: 3,
        ssa_type: "cyber",
        ssa_score: 70,
        ssa_comments: "Software systems outdated; potential security risks",
        is_suspect: false,
        record_created_at: "2025-03-03T11:00:00Z"
    },
    {
        ssa_id: 4,
        file_id: 4,
        ssa_type: "illegal",
        ssa_score: 40,
        ssa_comments: "Non-compliance with recent regulations",
        is_suspect: true,
        record_created_at: "2025-03-04T12:00:00Z"
    },
    {
        ssa_id: 5,
        file_id: 5,
        ssa_type: "other",
        ssa_score: 60,
        ssa_comments: "Inconsistencies found in documentation",
        is_suspect: false,
        record_created_at: "2025-03-05T13:00:00Z"
    }
    // Add additional assessments as needed...
]

// -----------------------
// infractions table
// -----------------------
const mockInfractions = [
    {
        infraction_id: 1,
        file_id: 1,
        infraction_type: "documentation_issue",
        details: "Missing inspection certificate; delayed submission",
        infraction_date: "2025-03-03",
        record_created_at: "2025-03-03T10:00:00Z"
    },
    {
        infraction_id: 2,
        file_id: 2,
        infraction_type: "physical_dmg",
        details: "Minor hull damage from docking incident",
        infraction_date: "2025-03-04",
        record_created_at: "2025-03-04T11:00:00Z"
    },
    {
        infraction_id: 3,
        file_id: 3,
        infraction_type: "custom",
        details: "Unauthorized modification of navigation system",
        infraction_date: "2025-03-05",
        record_created_at: "2025-03-05T12:30:00Z"
    },
    {
        infraction_id: 4,
        file_id: 4,
        infraction_type: "documentation_issue",
        details: "Expired safety certificates",
        infraction_date: "2025-03-06",
        record_created_at: "2025-03-06T09:45:00Z"
    },
    {
        infraction_id: 5,
        file_id: 5,
        infraction_type: "physical_dmg",
        details: "Minor interior damage during rough weather",
        infraction_date: "2025-03-07",
        record_created_at: "2025-03-07T14:15:00Z"
    }
    // Add more infractions as needed...
]

// -----------------------
// harbor_history table
// -----------------------
const mockHarborHistory = [
    {
        history_id: 1,
        file_id: 1,
        port_visited: "Port of Los Angeles",
        country: "USA",
        arrival_date: "2025-03-01",
        departure_date: "2025-03-02",
        is_high_risk: false,
        risk_reason: null,
        record_created_at: "2025-03-01T08:00:00Z"
    },
    {
        history_id: 2,
        file_id: 2,
        port_visited: "Port of Rotterdam",
        country: "Netherlands",
        arrival_date: "2025-03-02",
        departure_date: "2025-03-03",
        is_high_risk: true,
        risk_reason: "smuggling",
        record_created_at: "2025-03-02T09:00:00Z"
    },
    {
        history_id: 3,
        file_id: 3,
        port_visited: "Port of Singapore",
        country: "Singapore",
        arrival_date: "2025-03-03",
        departure_date: "2025-03-04",
        is_high_risk: false,
        risk_reason: null,
        record_created_at: "2025-03-03T10:00:00Z"
    },
    {
        history_id: 4,
        file_id: 4,
        port_visited: "Port of Busan",
        country: "South Korea",
        arrival_date: "2025-03-04",
        departure_date: "2025-03-05",
        is_high_risk: true,
        risk_reason: "disease",
        record_created_at: "2025-03-04T11:00:00Z"
    },
    {
        history_id: 5,
        file_id: 5,
        port_visited: "Port of Miami",
        country: "USA",
        arrival_date: "2025-03-05",
        departure_date: "2025-03-06",
        is_high_risk: false,
        risk_reason: null,
        record_created_at: "2025-03-05T12:00:00Z"
    },
    {
        history_id: 6,
        file_id: 2,
        port_visited: "Port of Hamburg",
        country: "Germany",
        arrival_date: "2025-03-06",
        departure_date: "2025-03-07",
        is_high_risk: true,
        risk_reason: "terrorism",
        record_created_at: "2025-03-06T13:00:00Z"
    }
    // Add additional history records as needed...
]

// -----------------------
// Export functions
// -----------------------

export const fetchShipInfo = async () => {
    await delay(500)
    return { data: mockShipInfo }
}

export const fetchSSAAssessments = async () => {
    await delay(500)
    return { data: mockSSAAssessments }
}

export const fetchInfractions = async () => {
    await delay(500)
    return { data: mockInfractions }
}

export const fetchHarborHistory = async () => {
    await delay(500)
    return { data: mockHarborHistory }
}

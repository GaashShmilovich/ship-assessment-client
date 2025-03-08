
/**
 * @param {Error} error - Original error object
 * @returns {Object} Standardized error object
 */
export const processApiError = (error) => {
    // Default error message
    let message = 'An unexpected error occurred. Please try again later.'
    let status = 500
    let errorCode = 'UNKNOWN_ERROR'
    let originalError = error

    if (error.response) {
        status = error.response.status

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

        // Set appropriate error code based on status
        switch (status) {
            case 400:
                errorCode = 'BAD_REQUEST'
                break
            case 401:
                errorCode = 'UNAUTHORIZED'
                message = 'Your session has expired. Please login again.'
                break
            case 403:
                errorCode = 'FORBIDDEN'
                message = 'You do not have permission to perform this action.'
                break
            case 404:
                errorCode = 'NOT_FOUND'
                message = 'The requested resource was not found.'
                break
            case 500:
                errorCode = 'SERVER_ERROR'
                break
            default:
                errorCode = `HTTP_${status}`
        }
    } else if (error.request) {
        // The request was made but no response was received
        message = 'No response received from server. Please check your connection.'
        errorCode = 'NETWORK_ERROR'
    }

    // Format as a consistent error object
    return {
        message,
        status,
        errorCode,
        originalError,
        timestamp: new Date(),
        isApiError: true
    }
}

/**
 * Log errors to console with consistent formatting
 * In a production app, this would send errors to a monitoring service
 */
export const logError = (error, context = '') => {
    // For now we just log to console, but this could be expanded
    // to report to an error tracking service
    if (process.env.NODE_ENV !== 'production') {
        console.group(`🔴 Error${context ? ` in ${context}` : ''}`)
        console.error(error)
        console.groupEnd()
    }

    // Would include error reporting service here, e.g.:
    // errorReportingService.captureError(error, { context });
}

/**
 * Check if error is a 401 unauthorized error
 * Used to trigger auth renewal or logout
 */
export const isUnauthorizedError = (error) => {
    return error?.response?.status === 401 ||
        error?.errorCode === 'UNAUTHORIZED'
}

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred.'

    // Return formatted message if it's one of our API errors
    if (error.isApiError) {
        return error.message
    }

    // For axios errors
    if (error.response?.data?.message) {
        return error.response.data.message
    }

    // For regular Error objects
    if (error.message) {
        // Clean up some common error messages
        if (error.message.includes('Network Error')) {
            return 'Network connection error. Please check your internet connection.'
        }

        if (error.message.includes('timeout')) {
            return 'The request timed out. Please try again.'
        }

        return error.message
    }

    // Fallback for anything else
    return 'An unexpected error occurred. Please try again later.'
}

/**
 * Helper for query error handling when using React Query
 */
export const handleQueryError = (error, queryClient) => {
    const processedError = processApiError(error)
    logError(processedError)

    // Handle auth errors by logging user out if needed
    if (isUnauthorizedError(processedError)) {
        // Clear all queries from cache
        queryClient.clear()

        // In a real app, would redirect to login
        // logout();
        // navigate('/login');
    }

    return processedError
}
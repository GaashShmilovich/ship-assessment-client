// src/hooks/useApiError.js
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { logout } from '../services/authService'

/**
 * Custom hook to handle API errors across components
 * Provides consistent error handling with notifications
 */
const useApiError = () => {
    const { enqueueSnackbar } = useSnackbar()
    const navigate = useNavigate()

    /**
     * Process API error and show notification
     */
    const handleApiError = useCallback((error, options = {}) => {
        const { silent = false, redirect = null, severity = 'error' } = options

        // Get message from our Axios interceptor if available
        const message = error?.formattedMessage ||
            error?.message ||
            'An unexpected error occurred'

        // Check for auth errors
        if (error?.statusCode === 401) {
            // Clear user session
            logout()
            // Show message
            enqueueSnackbar('Your session has expired. Please log in again.', {
                variant: 'warning',
                preventDuplicate: true,
            })
            // Redirect to login
            navigate('/login', { replace: true })
            return
        }

        // Show error notification (unless silent)
        if (!silent) {
            enqueueSnackbar(message, {
                variant: severity,
                autoHideDuration: 5000,
            })
        }

        // Optional redirect
        if (redirect) {
            navigate(redirect)
        }

        // Return for further handling if needed
        return message
    }, [enqueueSnackbar, navigate])

    /**
     * Create custom error handler for use with React Query
     */
    const createErrorHandler = useCallback((options = {}) => {
        return (error) => handleApiError(error, options)
    }, [handleApiError])

    return {
        handleApiError,
        createErrorHandler
    }
}

export default useApiError
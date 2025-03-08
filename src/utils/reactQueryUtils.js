
/**
 * Default error handler for React Query hooks
 * @param {Error} error - The error from React Query
 * @param {Object} options - Additional options
 * @returns {string} User-friendly error message
 */
export const handleQueryError = (error, options = {}) => {
    const { silent = false } = options

    // Get the formatted message from our API interceptor
    const message = error.formattedMessage ||
        error.message ||
        'An unexpected error occurred'

    // Log error in development (unless silent)
    if (!silent && process.env.NODE_ENV !== 'production') {
        console.error('Query Error:', message, error)
    }

    // Handle specific status codes
    if (error.statusCode === 401) {
        // Session expired, could trigger logout
        // logout();
        // navigate('/login');
    }

    return message
}

/**
 * Default React Query client configuration
 */
export const defaultQueryOptions = {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
        // Don't retry for client errors (4xx)
        if (error.statusCode >= 400 && error.statusCode < 500) {
            return false
        }
        // Retry server errors but limit attempts
        return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Default error handler
    onError: (error) => handleQueryError(error)
}

/**
 * Wrap API functions with error handling for React Query
 * @param {Function} apiFn - The API function to call
 * @param {Object} options - Additional options for error handling
 * @returns {Promise} Promise with handled errors
 */
export const withErrorHandling = (apiFn, options = {}) => {
    return async (...args) => {
        try {
            const response = await apiFn(...args)
            return response
        } catch (error) {
            // Format error for React Query
            const formattedError = new Error(
                error.formattedMessage ||
                'An error occurred while fetching data'
            )

            // Copy properties from the original error
            formattedError.statusCode = error.statusCode || 500
            formattedError.originalError = error

            // Handle error with our utility
            handleQueryError(formattedError, options)

            // Rethrow for React Query to catch
            throw formattedError
        }
    }
}

/**
 * Configure React Query hooks with better error handling and messages
 */
export const configureReactQuery = (queryClient) => {
    // Set default options
    queryClient.setDefaultOptions({
        queries: defaultQueryOptions,
        mutations: {
            onError: (error) => handleQueryError(error)
        }
    })

    return queryClient
}
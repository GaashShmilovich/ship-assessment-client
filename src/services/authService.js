const mockUser = {
    username: 'securityManager',
    password: 'password123',
    token: 'mock-token-123'
}

export const login = async (username, password) => {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (username === mockUser.username && password === mockUser.password) {
        localStorage.setItem('authToken', mockUser.token)
        return { success: true, token: mockUser.token }
    } else {
        throw new Error('Invalid credentials')
    }
}

export const logout = () => {
    localStorage.removeItem('authToken')
}

export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken')
}

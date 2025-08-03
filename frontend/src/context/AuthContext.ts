import { createContext } from 'react'

export const AuthContext = createContext({
    isAuthenticated: false,
    token: null,
    login: async (email, password) => ({ success: false, error: 'Context not ready' }),
    register: async (email, password, inviteCode) => ({ success: false, error: 'Context not ready' }),
    logout: () => {},
    isLoading: true
})

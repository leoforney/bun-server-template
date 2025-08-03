import React, { useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const api = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || 'Login failed.' }
            }
            // Assuming the backend returns a token like { token: '...' }
            return { success: true, token: data.token }
        } catch (error) {
            console.error('Login API error:', error)
            return { success: false, error: 'A network error occurred.' }
        }
    },
    register: async (email, password, inviteCode) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, inviteCode })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || 'Registration failed.' }
            }
            return { success: true, message: data.message || 'Registration successful!' }
        } catch (error) {
            console.error('Registration API error:', error)
            return { success: false, error: 'A network error occurred.' }
        }
    }
}

// --- 2. AUTHENTICATION CONTEXT ---

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(Cookies.get('jwt_token') || null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedToken = Cookies.get('jwt_token')
        if (storedToken) {
            setToken(storedToken)
        }
        setIsLoading(false)
    }, [])

    const login = async (email, password) => {
        const response = await api.login(email, password)
        if (response.success) {
            setToken(response.token)
            Cookies.set('jwt_token', response.token, { expires: 7, secure: true, sameSite: 'strict' })
        }
        return response
    }

    const register = async (email, password, inviteCode) => {
        return await api.register(email, password, inviteCode)
    }

    const logout = () => {
        setToken(null)
        Cookies.remove('jwt_token')
    }

    const value = useMemo(
        () => ({
            isAuthenticated: !!token,
            token,
            login,
            register,
            logout,
            isLoading
        }),
        [token, isLoading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

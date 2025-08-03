import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RegisterPage } from './pages/RegisterPage'
import { Box, CircularProgress, CssBaseline } from '@mui/material'
import HomePage from './pages/HomePage'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { AuthProvider } from './provider/AuthProvider'

/**
 * A wrapper for routes that require authentication.
 * Redirects to the login page if the user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />
    }

    return children
}

/**
 * A wrapper for public routes like login/register.
 * Redirects to the main app if the user is already authenticated.
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (isAuthenticated) {
        return <Navigate to='/' replace />
    }

    return children
}

export default function App() {
    return (
        <>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Protected Route: Only accessible when logged in */}
                        <Route
                            path='/'
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Public Routes: Only accessible when logged out */}
                        <Route
                            path='/login'
                            element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path='/register'
                            element={
                                <PublicRoute>
                                    <RegisterPage />
                                </PublicRoute>
                            }
                        />

                        {/* Fallback route */}
                        <Route path='*' element={<Navigate to='/' />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </>
    )
}

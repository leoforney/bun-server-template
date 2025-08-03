import { memo, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const HomePage = memo(function HomePage() {
    const { token } = useAuth()

    return (
        <Box sx={{ flexGrow: 1, p: 2, minHeight: '100vh' }}>
            <Typography variant={'body1'}>Home page, auth: ${token}</Typography>
        </Box>
    )
})

export default HomePage

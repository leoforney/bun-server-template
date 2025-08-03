import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Grid, Link, TextField, Typography } from '@mui/material'

export const LoginPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email || !password) {
            setError('Please fill in all fields.')
            return
        }
        setLoading(true)
        const response = await login(email, password)
        setLoading(false)
        if (response.success) {
            navigate('/')
        } else {
            setError(response.error)
        }
    }

    return (
        <Container component='main' maxWidth='xs'>
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component='h1' variant='h5'>
                    Sign In
                </Typography>
                <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField margin='normal' required fullWidth id='email' label='Email Address' name='email' autoComplete='email' autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField margin='normal' required fullWidth name='password' label='Password' type='password' id='password' autoComplete='current-password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    {error && (
                        <Alert severity='error' sx={{ mt: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                    <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                    <Grid container justifyContent='flex-end'>
                        <Grid>
                            <Link
                                href='#'
                                variant='body2'
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/register')
                                }}
                            >
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}

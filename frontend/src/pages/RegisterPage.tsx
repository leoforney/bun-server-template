import { useAuth } from '../hooks/useAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import React, { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Grid, Link, TextField, Typography } from '@mui/material'

export const RegisterPage = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [inviteCode, setInviteCode] = useState(searchParams.get('inviteCode') || '')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!email || !password || !inviteCode) {
            setError('Please fill in all fields, including a valid invite code.')
            return
        }
        setLoading(true)
        const response = await register(email, password, inviteCode)
        setLoading(false)
        if (response.success) {
            setSuccess('Registration successful! Redirecting to login...')
            setTimeout(() => navigate('/login'), 2000)
        } else {
            setError(response.error)
        }
    }

    return (
        <Container component='main' maxWidth='xs'>
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component='h1' variant='h5'>
                    Sign Up
                </Typography>
                <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField required fullWidth id='email' label='Email Address' name='email' autoComplete='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField required fullWidth name='password' label='Password' type='password' id='password' autoComplete='new-password' value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                required
                                fullWidth
                                name='inviteCode'
                                label='Invite Code'
                                id='inviteCode'
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                helperText='Invite code is read from the URL or can be entered here.'
                            />
                        </Grid>
                    </Grid>
                    {error && (
                        <Alert severity='error' sx={{ mt: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity='success' sx={{ mt: 2, width: '100%' }}>
                            {success}
                        </Alert>
                    )}
                    <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    <Grid container justifyContent='flex-end'>
                        <Grid>
                            <Link
                                href='#'
                                variant='body2'
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/login')
                                }}
                            >
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}

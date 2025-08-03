import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Container, Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, Alert, Paper, IconButton } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

const API_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * A page for managing and creating new invite codes.
 */
export const InvitePage = () => {
    // This assumes your useAuth hook provides the user's token for API calls.
    const { token } = useAuth()
    const [codes, setCodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')
    const [copiedCode, setCopiedCode] = useState(null)

    // A function to fetch the user's invite codes from the API
    const fetchCodes = useCallback(async () => {
        if (!token) return
        setError('')
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/invites`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Failed to fetch codes.')
            }
            const data = await response.json()
            setCodes(data.inviteCodes || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [token])

    // Fetch codes when the component first loads
    useEffect(() => {
        fetchCodes()
    }, [fetchCodes])

    // A function to create a new invite code
    const handleCreateCode = async () => {
        if (!token) return
        setError('')
        setCreating(true)
        try {
            const response = await fetch(`${API_URL}/api/invites`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Failed to create code.')
            }
            // Refresh the list to show the new code
            await fetchCodes()
        } catch (err) {
            setError(err.message)
        } finally {
            setCreating(false)
        }
    }

    // A function to copy a code to the clipboard
    const handleCopy = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000) // Reset feedback after 2 seconds
    }

    return (
        <Container component='main' maxWidth='sm'>
            <Box
                sx={{
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography component='h1' variant='h4' gutterBottom>
                    Manage Invites
                </Typography>

                {error && (
                    <Alert severity='error' sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <CircularProgress sx={{ mt: 4 }} />
                ) : (
                    <Paper elevation={3} sx={{ p: 2, mt: 2, width: '100%' }}>
                        <List>
                            {codes.length > 0 ? (
                                codes.map((code) => (
                                    <ListItem
                                        key={code}
                                        secondaryAction={
                                            <IconButton edge='end' aria-label='copy' onClick={() => handleCopy(code)}>
                                                <ContentCopyIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={code} secondary={copiedCode === code ? 'Copied!' : ''} />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant='body1' align='center' sx={{ p: 2 }}>
                                    You have no active invite codes.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                )}

                <Button variant='contained' startIcon={creating ? <CircularProgress size={20} color='inherit' /> : <AddCircleOutlineIcon />} onClick={handleCreateCode} disabled={creating || loading} sx={{ mt: 3 }}>
                    Create New Invite Code
                </Button>
            </Box>
        </Container>
    )
}

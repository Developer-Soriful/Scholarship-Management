import React from 'react'
import useAuth from '../Auth/useAuth'
import useUserRole from '../Auth/useUserRole'
import LoadingSpinner from '../Components/LoadingSpinner'
import { Navigate } from 'react-router'

const ModeratorProtector = ({ children }) => {
    const { user, loading } = useAuth()
    const { role, isLoading } = useUserRole()
    if (loading || isLoading) {
        return <div className='flex justify-center items-center min-h-screen'><LoadingSpinner /></div>
    }
    if (!user || role !== 'moderator') {
        return <Navigate to='/forbidden' />
    }
    return children
}

export default ModeratorProtector
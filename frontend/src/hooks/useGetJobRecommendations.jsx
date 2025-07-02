import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT } from '@/utils/constant'
import { setJobRecommendations, setLoading, setError } from '@/redux/aiCoachSlice'

const useGetJobRecommendations = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(store => store.auth)
    
    useEffect(() => {
        const fetchJobRecommendations = async () => {
            if (!user) return
            
            try {
                dispatch(setLoading(true))
                const res = await axios.get(`${AI_COACH_API_END_POINT}/job-recommendations`, {
                    withCredentials: true
                })
                
                if (res.data.success) {
                    dispatch(setJobRecommendations(res.data.recommendations))
                }
            } catch (error) {
                console.error('Error fetching job recommendations:', error)
                dispatch(setError(error.response?.data?.message || 'Failed to fetch job recommendations'))
                toast.error(error.response?.data?.message || 'Failed to fetch job recommendations')
            } finally {
                dispatch(setLoading(false))
            }
        }
        
        fetchJobRecommendations()
    }, [dispatch, user])
}

export default useGetJobRecommendations
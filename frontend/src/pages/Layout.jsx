import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import { 
    useUser, 
    SignIn, 
    useAuth, 
    CreateOrganization, 
    useOrganizationList, 
    useOrganization 
} from '@clerk/clerk-react'
import { fetchWorkspaces } from '../features/workspaceSlice'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading, workspaces } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    
    // Clerk hooks
    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()
    const { organization } = useOrganization() // Get currently active org
    
    // Fetch all memberships to handle invites correctly
    const { isLoaded: isOrgListLoaded, setActive, userMemberships } = useOrganizationList({
        userMemberships: {
            infinite: true,
        },
    });

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    // Initial Workspaces load
    useEffect(() => {
        if (isLoaded && user && workspaces.length === 0) {
            dispatch(fetchWorkspaces({ getToken }))
        }
    }, [user, isLoaded])

    // ------------------------------------------------------------------
    // AUTO-SELECT LOGIC (Handles Invite Acceptance)
    // ------------------------------------------------------------------
    useEffect(() => {
        // Ensure Clerk data is ready
        if (!isOrgListLoaded || !setActive || !userMemberships.data) return;

        const hasMemberships = userMemberships.data.length > 0;

        // If user has memberships, but we haven't loaded workspaces yet (or org is null),
        // we need to make sure the CORRECT organization is active.
        if (hasMemberships && (!organization || workspaces.length === 0)) {
            
            // Sort memberships by 'createdAt' descending (Newest first).
            // This handles the "Old Invite" scenario: 
            // If I accept an old invite today, the membership is created TODAY, making it the newest.
            const sortedMemberships = [...userMemberships.data].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            const latestOrgId = sortedMemberships[0].organization.id;

            // If the active org is NOT the one we just joined, switch to it.
            if (organization?.id !== latestOrgId) {
                console.log("Switching to most recent organization:", sortedMemberships[0].organization.name);
                setActive({ organization: latestOrgId });
            }
        }
    }, [isOrgListLoaded, userMemberships, setActive, workspaces.length, organization]);


    // ------------------------------------------------------------------
    // RENDER LOGIC
    // ------------------------------------------------------------------

    // 1. If not logged in, show Sign In
    if (!user) {
        return (
            <div className='flex justify-center items-center h-screen bg-white/30 dark:bg-zinc-900/30 backdrop-blur-lg'>
                <SignIn />
            </div>
        )
    }

    // 2. Show loader while Clerk or Redux is fetching
    if (loading || !isOrgListLoaded) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    // 3. FORCE CREATE ORGANIZATION
    // Only show this if the user has NO workspaces AND NO Clerk memberships.
    // (This fixes the bug where invited users were blocked)
    const hasClerkMemberships = userMemberships.data?.length > 0;

    if (user && workspaces.length === 0 && !hasClerkMemberships) {
        return (
            <div className='min-h-screen flex justify-center items-center'>
                <CreateOrganization />
            </div>
        )
    }

    // 4. Main Layout
    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
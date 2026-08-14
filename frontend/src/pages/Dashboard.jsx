import { Plus } from 'lucide-react'
import { useState } from 'react'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'
import {useUser} from '@clerk/clerk-react'
import { useSelector } from 'react-redux'
import VelocityChart from '../components/VelocityChart'
import MemberWorkload from '../components/MemberWorkload'

const Dashboard = () => {

    //getting user data from clerk
    const {user} = useUser()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { currentWorkspace } = useSelector((state) => state.workspace);

    return (
        <div className='max-w-7xl mx-auto px-4 py-8 space-y-10'>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400"> 
                        Welcome back, {user?.fullName || 'User'} 
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400"> 
                        Here's what's happening with your projects today 
                    </p>
                </div>

                {/* New Project button */}
                <button onClick={() => setIsDialogOpen(true)} className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300" >
                    <Plus size={18} className="transition-transform group-hover:rotate-90" /> New Project
                </button>

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Stats Row */}
            <StatsGrid />

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Charts Row */}
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="relative p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Workspace Velocity</h3>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-6">Tasks completed over the last 7 days</p>
                            <div className="h-64">
                                <VelocityChart projects={currentWorkspace?.projects} />
                            </div>
                        </div>
                        <div className="relative p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Member Workload</h3>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-6">Active tasks by assignee</p>
                            <div className="h-64 flex items-center justify-center">
                                <MemberWorkload projects={currentWorkspace?.projects} members={currentWorkspace?.members} />
                            </div>
                        </div>
                    </div>

                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div className="space-y-8">
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard

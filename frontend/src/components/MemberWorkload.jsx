import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

export default function MemberWorkload({ projects, members }) {
    const workload = {};
    
    // Initialize with members
    if (members) {
        members.forEach(m => {
            const name = m.user.name || m.user.email.split('@')[0];
            workload[m.user.id] = { name, tasks: 0 };
        });
    }

    if (projects) {
        projects.forEach(p => {
            p.tasks.forEach(t => {
                if (t.status !== 'DONE' && t.assigneeId) {
                    if (workload[t.assigneeId]) {
                        workload[t.assigneeId].tasks += 1;
                    } else if (t.assignee) {
                        workload[t.assigneeId] = { 
                            name: t.assignee.name || t.assignee.email.split('@')[0], 
                            tasks: 1 
                        };
                    }
                }
            });
        });
    }

    const data = Object.values(workload).filter(w => w.tasks > 0).sort((a, b) => b.tasks - a.tasks);

    if (data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-zinc-500 text-sm mt-4">
                No active tasks assigned to members
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="tasks"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

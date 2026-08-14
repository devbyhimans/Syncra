import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function VelocityChart({ projects }) {
    // Calculate tasks completed in the last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
            date: format(d, 'MMM dd'),
            rawDate: d,
            completed: 0,
        };
    });

    if (projects) {
        projects.forEach(p => {
            p.tasks.forEach(t => {
                if (t.status === 'DONE' && t.updatedAt) {
                    const updated = new Date(t.updatedAt);
                    const dayMatch = last7Days.find(d => 
                        d.rawDate.getDate() === updated.getDate() && 
                        d.rawDate.getMonth() === updated.getMonth()
                    );
                    if (dayMatch) {
                        dayMatch.completed += 1;
                    }
                }
            });
        });
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} />
                    <Tooltip 
                        cursor={{ fill: '#3f3f46', opacity: 0.1 }}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                    <Bar dataKey="completed" name="Tasks Completed" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

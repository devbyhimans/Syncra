import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Landing from "./pages/Landing"; // Importing the new page

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                {/* 1. PUBLIC ROUTE: The Landing Page is now at the root "/" */}
                <Route path="/" element={<Landing />} />

                {/* 2. PROTECTED ROUTES: Wrapped in Layout */}
                {/* We removed path="/" from Layout so it applies logic without forcing a URL prefix */}
                <Route element={<Layout />}>
                    
                    {/* 3. Dashboard moved to explicit "/dashboard" path */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* These paths remain the same as before */}
                    <Route path="/team" element={<Team />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projectsDetail" element={<ProjectDetails />} />
                    <Route path="/taskDetails" element={<TaskDetails />} />
                </Route>

                {/* 4. CATCH-ALL: Redirect unknown URLs to Landing Page */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Landing from "./pages/Landing"; // Importing the new page
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                {/* 1. PUBLIC ROUTE: The Landing Page is now at the root "/" */}
                <Route path="/" element={<Landing />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />

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

                {/* 4. CATCH-ALL: Redirect unknown URLs to NotFound Page */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
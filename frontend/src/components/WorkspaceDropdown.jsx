import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useClerk ,useOrganizationList } from "@clerk/clerk-react";

// Fallback avatar when workspace image is missing/broken
const WorkspaceAvatar = ({ src, name, size = "w-8 h-8" }) => {
    if (src) {
        return (
            <img 
                src={src} 
                alt={name} 
                className={`${size} rounded shadow object-cover`}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
        );
    }
    const initial = (name || "W")[0].toUpperCase();
    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
    const color = colors[initial.charCodeAt(0) % colors.length];
    return (
        <div className={`${size} ${color} rounded shadow flex items-center justify-center text-white font-semibold text-sm`}>
            {initial}
        </div>
    );
};

function WorkspaceDropdown() {

    const {setActive,userMemberships,isLoaded} = useOrganizationList({userMemberships:true})

    const {openCreateOrganization} = useClerk()

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId) => {
        //showing the active organization of user 
        setActive({organization:organizationId})
        dispatch(setCurrentWorkspace(organizationId))
        setIsOpen(false);
        navigate('/')
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    //Setting the active workspace
    useEffect(()=>{
        if(currentWorkspace && isLoaded){
            setActive({organization:currentWorkspace.id})
        }
    },[currentWorkspace, isLoaded])

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-white dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    <WorkspaceAvatar src={currentWorkspace?.image_url} name={currentWorkspace?.name} />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {/* Only show orgs that exist in BOTH Clerk AND the database.
                           This prevents stale Clerk orgs (from before a DB reset) from appearing. */}
                        {userMemberships.data
                            .filter(({organization}) => workspaces.some(w => w.id === organization.id))
                            .map(({organization}) => (
                            <div key={organization.id} onClick={() => onSelectWorkspace(organization.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                <WorkspaceAvatar src={organization.imageUrl} name={organization.name} size="w-6 h-6" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {organization.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {organization.membersCount || 0} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === organization.id && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    <div onClick={()=>{openCreateOrganization(); setIsOpen(false)}} className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                            <Plus className="w-4 h-4" /> Create Workspace
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../configs/api";

export const fetchWorkspaces = createAsyncThunk(
    'workspace/fetchWorkspaces',
    async ({ getToken }, { rejectWithValue }) => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/workspaces', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.workspaces || [];
        } catch (error) {
            const message = error?.response?.data?.message || error.message;
            console.error("fetchWorkspaces failed:", message);
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload);
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);

            // set current workspace to the new workspace
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );

            // if current workspace is updated, set it to the updated workspace
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
        },
        addProject: (state, action) => {
            state.currentWorkspace.projects.push(action.payload);
            // find workspace by id and add project to it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? { ...w, projects: w.projects.concat(action.payload) } : w
            );
        },
        addTask: (state, action) => {
            // Update currentWorkspace — use spread to avoid direct Immer mutation in .map()
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id === action.payload.projectId) {
                    return { ...p, tasks: [...p.tasks, action.payload] };
                }
                return p;
            });

            // Keep workspaces array in sync
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId
                            ? { ...p, tasks: [...p.tasks, action.payload] }
                            : p
                    )
                } : w
            );
        },
        updateTask: (state, action) => {
            state.currentWorkspace.projects.map((p) => {
                if (p.id === action.payload.projectId) {
                    p.tasks = p.tasks.map((t) =>
                        t.id === action.payload.id ? action.payload : t
                    );
                }
            });
            // find workspace and project by id and update task in it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id ? {
                    ...w, projects: w.projects.map((p) =>
                        p.id === action.payload.projectId ? {
                            ...p, tasks: p.tasks.map((t) =>
                                t.id === action.payload.id ? action.payload : t
                            )
                        } : p
                    )
                } : w
            );
        },
        deleteTask: (state, action) => {
            const taskIdsToDelete = Array.isArray(action.payload) ? action.payload : [action.payload];
            
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    p.tasks = p.tasks.filter((t) => !taskIdsToDelete.includes(t.id));
                    return p;
                });
            }

            // find workspace and project by id and delete task from it
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace?.id ? {
                    ...w, projects: w.projects.map((p) => ({
                        ...p, tasks: p.tasks.filter((t) => !taskIdsToDelete.includes(t.id))
                    }))
                } : w
            );
        }

    },
    extraReducers: (builder)=>{
        builder.addCase(fetchWorkspaces.pending, (state)=>{
            state.loading=true;
        });
        builder.addCase(fetchWorkspaces.fulfilled, (state,action)=>{
            state.workspaces = action.payload;
            if(action.payload.length >0){
                const localStorageCurrentWorkspaceId = localStorage.getItem('currentWorkspaceId');
                if(localStorageCurrentWorkspaceId){
                    const findWorkspace = action.payload.find((w)=>w.id === localStorageCurrentWorkspaceId);
                    if(findWorkspace){
                        state.currentWorkspace = findWorkspace
                    }else{
                        state.currentWorkspace = action.payload[0]
                    }
                }else{
                    state.currentWorkspace=action.payload[0]
                }
            }
            state.loading=false;
        });
        builder.addCase(fetchWorkspaces.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to load workspaces";
        });
    }
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace, updateWorkspace, deleteWorkspace, addProject, addTask, updateTask, deleteTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;
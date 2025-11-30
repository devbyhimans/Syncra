import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../configs/api.js";

// Workspaces ko backend se fetch karne ke liye async thunk
export const fetchworkspaces = createAsyncThunk(
  "workspace/fetchworkpsaces",
  async ({ getToken }) => {
    try {
      // Auth provider se JWT token le rahe hain
      const token = await getToken();

      // Backend ko GET request bhejna workspaces lane ke liye
      const { data } = await api.get("api/workspaces", {
        headers: {
          Authorization: `Bearer ${token}`, // Header me token send karna zaroori
        },
      });

      // Agar workspaces mile to return, warna empty array
      return data.workspaces || [];
    } catch (error) {
      // Error ko readable format me console me dikhana
      console.log(error?.response?.data?.message || error.message);
      return [];
    }
  }
);

const initialState = {
  workspaces: [],              // Sare workspaces store honge
  currentWorkspace: null,      // User ka currently selected workspace
  loading: false,              // API loading indicator
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {

    // State me direct workspaces set karna
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },

    // Current workspace set karna and localStorage me store karna
    setCurrentWorkspace: (state, action) => {
      localStorage.setItem("currentWorkspaceId", action.payload);
      state.currentWorkspace = state.workspaces.find(
        (w) => w.id === action.payload
      );
    },

    // New workspace add karna
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);

      // Add hone ke baad usi ko current workspace bana dena
      if (state.currentWorkspace?.id !== action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },

    // Kisi workspace ko update karna
    updateWorkspace: (state, action) => {
      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id ? action.payload : w
      );

      // Agar updated workspace hi current hai to usko bhi update karna
      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },

    // Workspace delete karna
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(
        (w) => w._id !== action.payload
      );
    },

    // Current workspace me project add karna
    addProject: (state, action) => {
      state.currentWorkspace.projects.push(action.payload);

      // Workspaces list me bhi update karna
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? { ...w, projects: w.projects.concat(action.payload) }
          : w
      );
    },

    // Project ke andar new task add karna
    addTask: (state, action) => {
      state.currentWorkspace.projects = state.currentWorkspace.projects.map(
        (p) => {
          if (p.id === action.payload.projectId) {
            p.tasks.push(action.payload); // Task insert
          }
          return p;
        }
      );

      // Workspaces list me bhi update karna
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? { ...p, tasks: p.tasks.concat(action.payload) }
                  : p
              ),
            }
          : w
      );
    },

    // Task ko update karna
    updateTask: (state, action) => {
      state.currentWorkspace.projects.map((p) => {
        if (p.id === action.payload.projectId) {
          p.tasks = p.tasks.map((t) =>
            t.id === action.payload.id ? action.payload : t
          );
        }
      });

      // Workspaces me bhi update karna
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? {
                      ...p,
                      tasks: p.tasks.map((t) =>
                        t.id === action.payload.id ? action.payload : t
                      ),
                    }
                  : p
              ),
            }
          : w
      );
    },

    // Task ko delete karna
    deleteTask: (state, action) => {
      // Current workspace me delete
      state.currentWorkspace.projects.map((p) => {
        p.tasks = p.tasks.filter((t) => !action.payload.includes(t.id));
        return p;
      });

      // Workspaces list me delete
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? {
              ...w,
              projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? {
                      ...p,
                      tasks: p.tasks.filter(
                        (t) => !action.payload.includes(t.id)
                      ),
                    }
                  : p
              ),
            }
          : w
      );
    },
  },

  // Async thunk ke states ko handle karna
  extraReducers: (builder) => {
    // Jab fetchworkspaces chal raha ho
    builder.addCase(fetchworkspaces.pending, (state) => {
      state.loading = true;
    });

    // Jab workspaces successfully fetch ho jaye
    builder.addCase(fetchworkspaces.fulfilled, (state, action) => {
      state.workspaces = action.payload;

      // LocalStorage me saved workspace ko restore karna
      if (action.payload.length > 0) {
        const localStorageCurrentWorkspaceId =
          localStorage.getItem("currentWorkspaceId");

        if (localStorageCurrentWorkspaceId) {
          const findWorkspace = action.payload.find(
            (w) => w.id == localStorageCurrentWorkspaceId
          );

          // Agar mil gaya to wahi set karo
          if (findWorkspace) {
            state.currentWorkspace = findWorkspace;
          } else {
            state.currentWorkspace = action.payload[0];
          }
        } else {
          // Default first workspace
          state.currentWorkspace = action.payload[0];
        }
      }

      state.loading = false;
    });
    builder.addCase(fetchworkspaces.rejected, (state) => {
      state.loading = false;
    });
  },
});

// Exporting reducers
export const {
  setWorkspaces,
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addProject,
  addTask,
  updateTask,
  deleteTask,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../configs/api";

// Redux async thunks can't use hooks, so getToken is passed in from the calling component.
// This is the correct pattern for Redux thunks with Clerk auth.

export const fetchNotifications = createAsyncThunk(
    "notification/fetchNotifications",
    async ({ getToken }, { rejectWithValue }) => {
        try {
            const token = await getToken();
            const { data } = await api.get("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.notifications || [];
        } catch (error) {
            const message = error?.response?.data?.message || error.message;
            console.error("fetchNotifications failed:", message);
            return rejectWithValue(message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    "notification/markAsRead",
    async ({ id, getToken }, { rejectWithValue }) => {
        try {
            const token = await getToken();
            await api.patch(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return id;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || error.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    "notification/markAllAsRead",
    async ({ getToken }, { rejectWithValue }) => {
        try {
            const token = await getToken();
            await api.patch("/api/notifications/read-all", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchNotifications.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter((n) => !n.read).length;
            state.loading = false;
        });
        builder.addCase(fetchNotifications.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch notifications";
        });
        builder.addCase(markAsRead.fulfilled, (state, action) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount -= 1;
            }
        });
        builder.addCase(markAllAsRead.fulfilled, (state) => {
            state.notifications.forEach((n) => (n.read = true));
            state.unreadCount = 0;
        });
    }
});

export default notificationSlice.reducer;

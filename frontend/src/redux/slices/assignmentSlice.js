import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assignments: [],
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: "assignment",
  initialState,
  reducers: {
    startAssignmentLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    setAssignments: (state, action) => {
      state.loading = false;
      state.assignments = action.payload;
    },

    addAssignment: (state, action) => {
      state.loading = false;
      state.assignments.push(action.payload);
    },

    updateAssignmentStatus: (state, action) => {
      const { assignmentId, status } = action.payload;
      const assignment = state.assignments.find(a => a._id === assignmentId);
      if (assignment) {
        assignment.status = status;
      }
    },

    assignmentError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearAssignments: (state) => {
      state.assignments = [];
    },
  },
});

export const {
  startAssignmentLoading,
  setAssignments,
  addAssignment,
  updateAssignmentStatus,
  assignmentError,
  clearAssignments,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;

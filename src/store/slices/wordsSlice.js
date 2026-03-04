import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wordsService } from '../../services/firebaseService';

// ==================== ASYNC THUNKS ====================

export const fetchWords = createAsyncThunk(
  'words/fetchWords',
  async (userId, { rejectWithValue }) => {
    const result = await wordsService.getWords(userId);
    if (result.success) return result.words;
    return rejectWithValue(result.error);
  }
);

export const addWord = createAsyncThunk(
  'words/addWord',
  async ({ userId, wordData }, { rejectWithValue }) => {
    const result = await wordsService.addWord(userId, wordData);
    if (result.success) return result.word;
    return rejectWithValue(result.error);
  }
);

export const updateWord = createAsyncThunk(
  'words/updateWord',
  async ({ userId, wordId, updates }, { rejectWithValue }) => {
    const result = await wordsService.updateWord(userId, wordId, updates);
    if (result.success) return { wordId, updates };
    return rejectWithValue(result.error);
  }
);

export const deleteWord = createAsyncThunk(
  'words/deleteWord',
  async ({ userId, wordId }, { rejectWithValue }) => {
    const result = await wordsService.deleteWord(userId, wordId);
    if (result.success) return wordId;
    return rejectWithValue(result.error);
  }
);

// ==================== SLICE ====================

const wordsSlice = createSlice({
  name: 'words',
  initialState: {
    list: [],
    loading: false,
    error: null,
    scanning: false,
    scannedResult: null,
    filter: 'all', // 'all' | 'favorite' | 'learned'
    searchQuery: '',
  },
  reducers: {
    setScanning: (state, action) => {
      state.scanning = action.payload;
    },
    setScannedResult: (state, action) => {
      state.scannedResult = action.payload;
    },
    clearScannedResult: (state) => {
      state.scannedResult = null;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setWordsFromRealtime: (state, action) => {
      state.list = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch words
    builder
      .addCase(fetchWords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchWords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add word
    builder
      .addCase(addWord.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWord.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(addWord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update word
    builder.addCase(updateWord.fulfilled, (state, action) => {
      const { wordId, updates } = action.payload;
      const index = state.list.findIndex((w) => w.id === wordId);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...updates };
      }
    });

    // Delete word
    builder.addCase(deleteWord.fulfilled, (state, action) => {
      state.list = state.list.filter((w) => w.id !== action.payload);
    });
  },
});

// ==================== SELECTORS ====================

export const selectAllWords = (state) => state.words.list;

export const selectFilteredWords = (state) => {
  const { list, filter, searchQuery } = state.words;
  let filtered = list;

  // Filter by type
  if (filter === 'favorite') {
    filtered = filtered.filter((w) => w.isFavorite);
  } else if (filter === 'learned') {
    filtered = filtered.filter((w) => w.isLearned);
  }

  // Filter by search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (w) =>
        w.objectName?.toLowerCase().includes(q) ||
        w.translation?.toLowerCase().includes(q) ||
        w.category?.toLowerCase().includes(q)
    );
  }

  return filtered;
};

export const selectWordsCount = (state) => state.words.list.length;
export const selectFavoriteCount = (state) =>
  state.words.list.filter((w) => w.isFavorite).length;
export const selectLearnedCount = (state) =>
  state.words.list.filter((w) => w.isLearned).length;

export const {
  setScanning,
  setScannedResult,
  clearScannedResult,
  setFilter,
  setSearchQuery,
  setWordsFromRealtime,
  clearError,
} = wordsSlice.actions;

export default wordsSlice.reducer;
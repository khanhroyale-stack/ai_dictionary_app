import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  selectFilteredWords,
  selectWordsCount,
  selectFavoriteCount,
  selectLearnedCount,
  fetchWords,
  updateWord,
  deleteWord,
  setFilter,
  setSearchQuery,
} from '../../store/slices/wordsSlice';
import { wordsService } from '../../services/firebaseService';
import WordCard from '../../components/wordCard';
import { COLORS } from '../../constants/colors';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'favorite', label: 'Yêu thích' },
  { key: 'learned', label: 'Đã học' },
];

const ScannedWordsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.settings);
  const words = useSelector(selectFilteredWords);
  const totalCount = useSelector(selectWordsCount);
  const favoriteCount = useSelector(selectFavoriteCount);
  const learnedCount = useSelector(selectLearnedCount);
  const { loading, filter, searchQuery } = useSelector((s) => s.words);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchWords(user.uid));
      // Subscribe to real-time updates
      const unsubscribe = wordsService.subscribeWords(user.uid, (updatedWords) => {
        // handled via real-time listener
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await dispatch(fetchWords(user.uid));
    setRefreshing(false);
  }, [user]);

  const handleToggleFavorite = async (word) => {
    if (!user) return;
    await dispatch(
      updateWord({
        userId: user.uid,
        wordId: word.id,
        updates: { isFavorite: !word.isFavorite },
      })
    );
  };

  const handleToggleLearned = async (word) => {
    if (!user) return;
    await dispatch(
      updateWord({
        userId: user.uid,
        wordId: word.id,
        updates: { isLearned: !word.isLearned },
      })
    );
  };

  const handleDelete = (word) => {
    Alert.alert(
      'Xóa từ',
      `Bạn có chắc muốn xóa "${word.objectName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => dispatch(deleteWord({ userId: user.uid, wordId: word.id })),
        },
      ]
    );
  };

  const renderHeader = () => (
    <View>
      {/* Header gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>TỪ ĐÃ QUÉT</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editBtn}>
            <Text style={styles.editBtnText}>{isEditing ? 'Xong' : 'Chỉnh sửa'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Tổng từ</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{learnedCount}</Text>
            <Text style={styles.statLabel}>Đã học</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm từ vựng..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => dispatch(setSearchQuery(''))}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => dispatch(setFilter(f.key))}>
            <Text
              style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={COLORS.grayLight} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Không tìm thấy từ nào' : 'Chưa có từ nào'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Thử tìm kiếm với từ khóa khác'
          : 'Hãy quét vật thể để thêm từ vựng mới!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <WordCard
              word={item}
              index={index}
              onPress={() => navigation.navigate('WordDetail', { word: item })}
              onToggleFavorite={handleToggleFavorite}
              onToggleLearned={handleToggleLearned}
            />
            {isEditing && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}>
                <Ionicons name="trash" size={18} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingBottom: 20 },
  headerGradient: {
    padding: 24,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.grayLight,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  cardWrapper: {
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    right: 8,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.grayDark,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ScannedWordsScreen;
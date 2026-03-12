import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { auth, database } from '../../services/firebaseService';
import {
  selectFavoriteCount,
  selectLearnedCount,
  selectWordsCount,
} from '../../store/slices/wordsSlice';

const HomeScreen = ({ navigation }) => {
  const { user } = useSelector((s) => s.settings);
  const totalWords = useSelector(selectWordsCount);
  const learnedWords = useSelector(selectLearnedCount);
  const favoriteWords = useSelector(selectFavoriteCount);
  const recentWords = useSelector((s) =>
    [...s.words.list].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  );

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const userRef = ref(database, `users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setUserData(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  const displayAvatar = userData?.photoURL || user?.photoURL;
  const displayName = userData?.displayName || user?.displayName || 'Bạn';
  const progress = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{displayName} 👋</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('Account')}
              style={styles.avatarBtn}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {displayName?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ học tập</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              {learnedWords}/{totalWords} từ đã học
            </Text>
          </View>
        </LinearGradient>

        {/* ===== STATS ===== */}
        <View style={styles.statsRow}>
          <StatCard icon="book" label="Tổng từ" value={totalWords} color={COLORS.primary} />
          <StatCard icon="checkmark-circle" label="Đã học" value={learnedWords} color={COLORS.success} />
          <StatCard icon="heart" label="Yêu thích" value={favoriteWords} color={COLORS.secondary} />
        </View>

        {/* ===== QUICK ACTIONS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="camera"
              label="Quét từ mới"
              color="#6C63FF"
              onPress={() => navigation.getParent()?.navigate('Scan')}
            />
            <ActionCard
              icon="list"
              label="Từ đã quét"
              color="#FF6584"
              onPress={() => navigation.getParent()?.navigate('ScannedWords')}
            />
            <ActionCard
              icon="heart"
              label="Yêu thích"
              color="#43C6AC"
              onPress={() => navigation.getParent()?.navigate('ScannedWords')}
            />
            <ActionCard
              icon="settings"
              label="Cài đặt"
              color="#FF9800"
              onPress={() => navigation.getParent()?.navigate('Settings')}
            />
          </View>
        </View>

        {/* ===== TỪ GẦN ĐÂY ===== */}
        {recentWords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Từ vựng gần đây</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('ScannedWords')}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {recentWords.map((word, index) => (
              <RecentWordCard
                key={word.id}
                word={word}
                onPress={() => navigation.navigate('WordDetail', { word })}
              />
            ))}
          </View>
        )}

        {/* ===== EMPTY STATE ===== */}
        {totalWords === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>Bắt đầu học ngay!</Text>
            <Text style={styles.emptyText}>
              Chụp ảnh bất kỳ vật thể nào để AI nhận diện và thêm vào từ điển của bạn
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => navigation.getParent()?.navigate('Scan')}>
              <Ionicons name="camera" size={20} color={COLORS.white} />
              <Text style={styles.startBtnText}>Quét từ đầu tiên</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ===== SUB COMPONENTS =====

const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionCard = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={[color, color + 'CC']}
      style={styles.actionGradient}>
      <Ionicons name={icon} size={28} color="#fff" />
      <Text style={styles.actionLabel}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const RecentWordCard = ({ word, onPress }) => (
  <TouchableOpacity style={styles.recentCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.recentLeft}>
      {word.imageUri ? (
        <Image source={{ uri: word.imageUri }} style={styles.recentImage} />
      ) : (
        <View style={styles.recentImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={COLORS.gray} />
        </View>
      )}
      <View style={styles.recentInfo}>
        <Text style={styles.recentWord}>{word.objectName}</Text>
        <Text style={styles.recentTranslation}>{word.translation}</Text>
      </View>
    </View>
    <View style={styles.recentRight}>
      {word.isLearned && (
        <View style={styles.learnedBadge}>
          <Text style={styles.learnedBadgeText}>Đã học</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
    </View>
  </TouchableOpacity>
);

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  avatarBtn: { padding: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },

  // Progress
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontSize: 14, color: '#fff', fontWeight: '600' },
  progressPercent: { fontSize: 14, color: '#fff', fontWeight: '800' },
  progressBarBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4, marginBottom: 8,
  },
  progressBarFill: {
    height: 8, backgroundColor: '#fff',
    borderRadius: 4, minWidth: 8,
  },
  progressSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.white,
    borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  // Section
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.black, marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Recent words
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 14, padding: 12,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recentImage: { width: 48, height: 48, borderRadius: 10, marginRight: 12 },
  recentImagePlaceholder: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  recentInfo: { flex: 1 },
  recentWord: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  recentTranslation: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  recentRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  learnedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  learnedBadgeText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.black, textAlign: 'center' },
  emptyText: {
    fontSize: 14, color: COLORS.gray, textAlign: 'center',
    lineHeight: 22, marginTop: 8, marginBottom: 24,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14, gap: 8,
  },
  startBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { logoutUser } from '../../store/slices/settingsSlice';
import { selectFavoriteCount, selectLearnedCount, selectWordsCount } from '../../store/slices/wordsSlice';
import { auth, database } from '../../services/firebaseService';
const AccountScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.settings);
  const totalWords = useSelector(selectWordsCount);
  const favoriteWords = useSelector(selectFavoriteCount);
  const learnedWords = useSelector(selectLearnedCount);

  const [userData, setUserData] = useState(null);


  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = ref(database, `users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const displayAvatar = userData?.photoURL || user?.photoURL;
  const displayName = userData?.displayName || user?.displayName;

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  };

  const handleMenuPress = (item) => {
    if (!item.screen) {
      Alert.alert('Yêu tặng', 'Tính năng này sẽ sớm ra mắt!');
      return;
    }

    navigation.getParent()?.navigate(item.screen);
  };




  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName || 'Người dùng'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalWords}</Text>
            <Text style={styles.statLabel}>Từ vựng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{learnedWords}</Text>
            <Text style={styles.statLabel}>Đã học</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{favoriteWords}</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuContainer}>
          <MenuItem icon="book-outline" title="Từ đã quét" color={COLORS.primary} onPress={() => navigation.getParent()?.navigate('ScannedWords')}/>
          <MenuItem icon="person-outline" title="Tài khoản" color={COLORS.accent} onPress={() => navigation.navigate('Profile')} />
          <MenuItem icon="settings-outline" title="Cài đặt" color={COLORS.warning} onPress={() => navigation.navigate('Settings')} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AI Dictionary v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
const MenuItem = ({ icon, title, onPress, color }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={[styles.menuIconBox, { backgroundColor: color + '15', borderRadius: 10 }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.black },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  profileAvatar: { marginRight: 14 },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: COLORS.black },
  profileEmail: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  editProfileBtn: { padding: 4 },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#dddd',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.black, fontWeight: '500' },

  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.error + '30',
  },
  logoutText: { fontSize: 15, color: COLORS.error, fontWeight: '600' },
  version: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});

export default AccountScreen;

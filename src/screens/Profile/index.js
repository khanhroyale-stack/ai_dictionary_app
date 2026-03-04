import { Ionicons } from '@expo/vector-icons';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, database } from '../../services/firebaseService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = ref(database, `users/${currentUser.uid}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUser({
          ...data,
          email: currentUser.email,
          photoURL: data.photoURL || null, // ← lấy từ database thay vì currentUser.photoURL
        });
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
        }}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={{ width: 110, height: 110, borderRadius: 55 }} /> : <Ionicons name="person" size={60} color="#ccc" />}
          </View>

          <View style={styles.header_info}>
            <View>
              <Text style={styles.name}>{user?.displayName || 'Người dùng'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('UpdateProfile')}>
              <Ionicons name="pencil" size={16} color="#4A6CF7" />
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* White Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <InfoItem label="Họ và tên" value={user?.displayName} />
          <InfoItem label="Ngày sinh" value={user?.dob || 'Chưa cập nhật'} />
          <InfoItem label="Giới tính" value={user?.gender || 'Chưa cập nhật'} />
          <InfoItem label="Email" value={user?.email} />
          <InfoItem label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} />
          <InfoItem label="Địa chỉ" value={user?.address || 'Chưa cập nhật'} />
        </View>

        <Text style={styles.footer}>© 2026 App Name. Tất cả quyền lợi thuộc về...</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ label, value }) => (
  <View style={styles.infoBox}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#5B86E5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header_info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  editText: {
    marginLeft: 5,
    color: '#4A6CF7',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    marginTop: -40,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#f5f6fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#888',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 3,
    color: '#333',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 30,
    marginBottom: 20,
  },
});

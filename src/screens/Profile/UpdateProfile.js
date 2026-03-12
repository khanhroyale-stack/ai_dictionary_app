import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { get, ref, update } from 'firebase/database';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Yup from 'yup';
import * as FileSystem from 'expo-file-system/legacy';
import { auth, database } from '../../services/firebaseService';

const UpdateProfileSchema = Yup.object().shape({
  displayName: Yup.string().min(2, 'Tên quá ngắn').required('Vui lòng nhập họ tên'),
  phone: Yup.string()
    .matches(/^[0-9+ ]+$/, 'Số điện thoại không hợp lệ')
    .required('Vui lòng nhập số điện thoại'),
  dob: Yup.string()
    .required('Vui lòng nhập ngày sinh')
    .matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Định dạng phải là DD/MM/YYYY'),
  address: Yup.string().required('Vui lòng nhập địa chỉ'),
});

const UpdateProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null); // URI local preview
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const loadUserData = async () => {
      try {
        const snapshot = await get(ref(database, `users/${user.uid}`));
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      } catch (error) {
        console.log('Load user error:', error);
      }
    };
    loadUserData();
  }, [user]);

  // ==================== AVATAR ====================
  const handlePickAvatar = async () => {
    // Xin quyền
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.');
      return;
    }

    // Mở picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,   // cho phép crop
      aspect: [1, 1],        // crop vuông
      quality: 0.3,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert('Đổi ảnh đại diện', 'Chọn nguồn ảnh', [
      { text: 'Chụp ảnh mới', onPress: handleTakePhoto },
      { text: 'Chọn từ thư viện', onPress: handlePickAvatar },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  // Upload ảnh lên Firebase Storage, trả về download URL
  // Thay hàm uploadAvatar trong UpdateProfileScreen.js
  const uploadAvatar = async (uri) => {
    try {
      console.log('URI:', uri); // kiểm tra uri có hợp lệ không
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      console.log('Base64 length:', base64?.length); // kiểm tra đọc được không
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('uploadAvatar error:', error);
      throw new Error('Xử lý ảnh thất bại: ' + error.message);
    }
  };
  // ==================== SUBMIT ====================
  const handleUpdate = async (values) => {
    try {
      let photoURL = userData?.photoURL || user.photoURL || null;;

      // Upload avatar mới nếu có chọn
      if (avatarUri) {
        setUploadingAvatar(true);
        photoURL = await uploadAvatar(avatarUri);
        setUploadingAvatar(false);
      }

      // Cập nhật Firebase Auth profile
      await updateProfile(user, {
        displayName: values.displayName
      });

      // Cập nhật Realtime Database
      await update(ref(database, `users/${user.uid}`), {
        displayName: values.displayName,
        phone: values.phone,
        address: values.address,
        dob: values.dob,
        gender: values.gender,
        photoURL: photoURL,
      });

      await user.reload();

      Alert.alert('✅ Thành công', 'Cập nhật thông tin thành công!');
      navigation.goBack();
    } catch (error) {
      setUploadingAvatar(false);
      Alert.alert('Lỗi', error.message);
    }
  };

  // Ảnh hiển thị: ưu tiên ảnh local mới chọn → ảnh cũ từ Firebase
  const displayAvatar = avatarUri || userData?.photoURL;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <Formik
          enableReinitialize
          initialValues={{
            displayName: userData?.displayName || user?.displayName || '',
            email: user?.email || '',
            phone: userData?.phone || '',
            address: userData?.address || '',
            dob: userData?.dob || '',
            gender: userData?.gender || 'Nam',
          }}
          validationSchema={UpdateProfileSchema}
          onSubmit={handleUpdate}>
          {({ handleChange, handleSubmit, values, errors, touched, setFieldTouched, setFieldValue }) => (
            <View>

              {/* ===== AVATAR SECTION ===== */}
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={showAvatarOptions} activeOpacity={0.8}>
                  <View style={styles.avatarWrapper}>
                    {/* Ảnh avatar */}
                    {displayAvatar ? (
                      <Image
                        source={{ uri: displayAvatar }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={60} color="#ccc" />
                      </View>
                    )}

                    {/* Loading indicator khi đang upload */}
                    {uploadingAvatar && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                      </View>
                    )}

                    {/* Camera icon overlay */}
                    <View style={styles.cameraOverlay}>
                      <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.avatarButton} onPress={showAvatarOptions}>
                  <Text style={styles.avatarButtonText}>
                    {avatarUri ? '✓ Đã chọn ảnh mới' : 'Chọn ảnh đại diện'}
                  </Text>
                </TouchableOpacity>

                {/* Badge thông báo ảnh chưa lưu */}
                {avatarUri && (
                  <Text style={styles.pendingText}>
                    Ảnh sẽ được lưu khi bạn nhấn "Lưu thay đổi"
                  </Text>
                )}
              </View>

              {/* ===== FORM FIELDS ===== */}
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={values.displayName}
                onChangeText={handleChange('displayName')}
                onBlur={() => setFieldTouched('displayName')}
              />
              {touched.displayName && errors.displayName && (
                <Text style={styles.error}>{errors.displayName}</Text>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={values.email}
                editable={false}
              />

              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={() => setFieldTouched('phone')}
                keyboardType="phone-pad"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.error}>{errors.phone}</Text>
              )}

              <Text style={styles.label}>Ngày sinh</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={values.dob}
                onChangeText={handleChange('dob')}
                onBlur={() => setFieldTouched('dob')}
              />
              {touched.dob && errors.dob && (
                <Text style={styles.error}>{errors.dob}</Text>
              )}

              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderRow}>
                {['Nam', 'Nữ', 'Khác'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.genderOption,
                      values.gender === item && styles.genderOptionActive,
                    ]}
                    onPress={() => setFieldValue('gender', item)}>
                    <Text style={[
                      styles.genderText,
                      values.gender === item && styles.genderTextActive,
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={styles.input}
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={() => setFieldTouched('address')}
              />
              {touched.address && errors.address && (
                <Text style={styles.error}>{errors.address}</Text>
              )}

              <TouchableOpacity
                style={[styles.button, uploadingAvatar && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={uploadingAvatar}>
                {uploadingAvatar ? (
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.buttonText}>Đang tải ảnh lên...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default UpdateProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    position: 'relative',
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#4A6CF7',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e0e0e0',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarButton: {
    marginTop: 12,
    borderColor: '#A3BCDD',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  avatarButtonText: {
    color: '#4A6CF7',
    fontSize: 14,
    fontWeight: '500',
  },
  pendingText: {
    marginTop: 6,
    fontSize: 11,
    color: '#FF9800',
    textAlign: 'center',
  },
  // Form
  label: {
    marginTop: 14,
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 14,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  genderOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  genderOptionActive: {
    backgroundColor: '#4A6CF7',
  },
  genderText: {
    color: '#333',
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4A6CF7',
    padding: 15,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9BB3F8',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
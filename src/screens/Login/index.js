import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, clearAuthError } from '../../store/slices/settingsSlice';
import { COLORS } from '../../constants/colors';

const STORAGE_KEY = 'savedCredentials';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { authLoading } = useSelector((s) => s.settings);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });

  // Load credentials đã lưu khi mở app
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { email, password } = JSON.parse(saved);
          setForm((f) => ({ ...f, email, password }));
          setRememberMe(true);
        }
      } catch (_) {}
    };
    loadSavedCredentials();
  }, []);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (!form.email.toLowerCase().endsWith('@gmail.com')) {
      Alert.alert('Lỗi', 'Email phải có đuôi @gmail.com.');
      return;
    }
    if (isRegister && !form.displayName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hiển thị.');
      return;
    }

    // Lưu hoặc xóa credentials
    try {
      if (rememberMe && !isRegister) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email: form.email, password: form.password })
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}

    if (isRegister) {
      const result = await dispatch(registerUser(form));
      if (registerUser.rejected.match(result)) {
        Alert.alert('Đăng ký thất bại', getErrorMessage(result.payload));
      }
    } else {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));
      if (loginUser.rejected.match(result)) {
        Alert.alert('Đăng nhập thất bại', getErrorMessage(result.payload));
      }
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return 'Có lỗi xảy ra';
    if (error.includes('user-not-found')) return 'Email không tồn tại';
    if (error.includes('wrong-password')) return 'Mật khẩu không đúng';
    if (error.includes('invalid-credential')) return 'Email hoặc mật khẩu không đúng';
    if (error.includes('email-already-in-use')) return 'Email đã được đăng ký';
    if (error.includes('weak-password')) return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
    if (error.includes('invalid-email')) return 'Email không hợp lệ';
    return error;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.headerGradient}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>Learn From Life</Text>
          <Text style={styles.appTagline}>Học từ vựng thông minh với AI</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </Text>

          {isRegister && (
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên hiển thị"
                placeholderTextColor={COLORS.gray}
                value={form.displayName}
                onChangeText={(t) => setForm((f) => ({ ...f, displayName: t }))}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.gray}
              value={form.email}
              onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor={COLORS.gray}
              value={form.password}
              onChangeText={(t) => setForm((f) => ({ ...f, password: t }))}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          {/* Remember me — chỉ hiện ở màn đăng nhập */}
          {!isRegister && (
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={13} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </TouchableOpacity>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={authLoading}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}>
              {authLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isRegister ? 'Đăng ký' : 'Đăng nhập'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Toggle mode */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setIsRegister(!isRegister);
              dispatch(clearAuthError());
            }}>
            <Text style={styles.toggleText}>
              {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
              <Text style={styles.toggleLink}>
                {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  headerGradient: {
    paddingTop: 80,
    paddingBottom: 50,
    alignItems: 'center',
  },
  iconContainer: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  appName: { fontSize: 30, fontWeight: '900', color: COLORS.white },
  appTagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    padding: 28,
    paddingTop: 36,
  },
  formTitle: { fontSize: 24, fontWeight: '800', color: COLORS.black, marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.black },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.grayLight,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 14,
    color: COLORS.grayDark,
  },
  submitBtn: { borderRadius: 14, marginTop: 4, overflow: 'hidden' },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  toggleBtn: { marginTop: 20, alignItems: 'center' },
  toggleText: { fontSize: 14, color: COLORS.gray },
  toggleLink: { color: COLORS.primary, fontWeight: '700' },
});

export default LoginScreen;
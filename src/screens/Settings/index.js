import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { SUPPORTED_LANGUAGES } from '../../constants/config';
import { notificationService } from '../../services/notificationService';
import { saveSettings, setSourceLanguage, setTargetLanguage, toggleBatterySaver, toggleOfflineMode, toggleRealTimeScan, toggleShowTrustLevel, toggleSound } from '../../store/slices/settingsSlice';

const SectionTitle = ({ title, style }) => <Text style={[styles.sectionTitle, style]}>{title}</Text>;
const SettingRow = ({ label, children, icon, iconColor = COLORS.primary }) => (
  <View style={styles.settingRow}>
    {icon && (
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
    )}
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.settingControl}>{children}</View>
  </View>
);

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { user, sourceLanguage, targetLanguage, soundEnabled, showTrustLevel, realTimeScan, batterySaver, offlineMode } = useSelector((s) => s.settings);

  const handleLanguageSelect = (type) => {
    const options = SUPPORTED_LANGUAGES.map((lang) => ({
      text: lang.name,
      onPress: () => {
        if (type === 'source') dispatch(setSourceLanguage(lang.code));
        else dispatch(setTargetLanguage(lang.code));
        saveSettingsToFirebase({ [type === 'source' ? 'sourceLanguage' : 'targetLanguage']: lang.code });
      },
    }));
    Alert.alert(type === 'source' ? 'Ngôn ngữ nguồn' : 'Ngôn ngữ dịch', 'Chọn ngôn ngữ', [...options, { text: 'Hủy', style: 'cancel' }]);
  };

  const saveSettingsToFirebase = (updates) => {
    if (!user) return;
    const current = {
      sourceLanguage,
      targetLanguage,
      soundEnabled,
      showTrustLevel,
      realTimeScan,
      batterySaver,
      offlineMode,
      ...updates,
    };
    dispatch(saveSettings({ userId: user.uid, settings: current }));
  };

  const getLanguageName = (code) => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name || code;
  };

  const handleScheduleNotification = async () => {
    await notificationService.scheduleDailyReviewReminder();
    Alert.alert('✅ Đã bật', 'Bạn sẽ nhận nhắc nhở ôn tập lúc 20:00 mỗi ngày!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Language Settings */}
        <SectionTitle title="Chọn ngôn ngữ" style={{ marginTop: 10 }} />
        <View style={styles.card}>
          <SettingRow label="Ngôn ngữ nguồn" icon="language-outline">
            <TouchableOpacity style={styles.languagePicker} onPress={() => handleLanguageSelect('source')}>
              <Text style={styles.languageText}>{getLanguageName(sourceLanguage)}</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Ngôn ngữ dịch" icon="swap-horizontal-outline" iconColor={COLORS.accent}>
            <TouchableOpacity style={styles.languagePicker} onPress={() => handleLanguageSelect('target')}>
              <Text style={styles.languageText}>{getLanguageName(targetLanguage)}</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </SettingRow>
        </View>
        {/* On/Off Settings */}
        <SectionTitle title="Bật/Tắt" />
        <View style={styles.card}>
          <SettingRow label="Phát âm" icon="volume-high-outline">
            <Switch
              value={soundEnabled}
              onValueChange={() => {
                dispatch(toggleSound());
                saveSettingsToFirebase({ soundEnabled: !soundEnabled });
              }}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary + '60' }}
              thumbColor={soundEnabled ? COLORS.primary : COLORS.gray}
            />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Hiện độ chính xác" icon="shield-checkmark-outline" iconColor={COLORS.success}>
            <Switch
              value={showTrustLevel}
              onValueChange={() => {
                dispatch(toggleShowTrustLevel());
                saveSettingsToFirebase({ showTrustLevel: !showTrustLevel });
              }}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary + '60' }}
              thumbColor={showTrustLevel ? COLORS.primary : COLORS.gray}
            />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Quét thời gian thực" icon="scan-outline" iconColor={COLORS.accent}>
            <Switch
              value={realTimeScan}
              onValueChange={() => {
                dispatch(toggleRealTimeScan());
                saveSettingsToFirebase({ realTimeScan: !realTimeScan });
              }}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary + '60' }}
              thumbColor={realTimeScan ? COLORS.primary : COLORS.gray}
            />
          </SettingRow>
        </View>
        {/* Performance */}
        <SectionTitle title="Hiệu năng" />
        <View style={styles.card}>
          <SettingRow label="Chế độ tiết kiệm pin" icon="battery-half-outline" iconColor={COLORS.warning}>
            <Switch
              value={batterySaver}
              onValueChange={() => {
                dispatch(toggleBatterySaver());
                saveSettingsToFirebase({ batterySaver: !batterySaver });
              }}
              trackColor={{ false: COLORS.grayLight, true: COLORS.warning + '60' }}
              thumbColor={batterySaver ? COLORS.warning : COLORS.gray}
            />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Chế độ ngoại tuyến" icon="cloud-offline-outline" iconColor={COLORS.gray}>
            <Switch
              value={offlineMode}
              onValueChange={() => {
                dispatch(toggleOfflineMode());
                saveSettingsToFirebase({ offlineMode: !offlineMode });
              }}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary + '60' }}
              thumbColor={offlineMode ? COLORS.primary : COLORS.gray}
            />
          </SettingRow>
        </View>
        {/* Notifications */}
        <SectionTitle title="Thông báo" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleScheduleNotification}>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.secondary + '15' }]}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.secondary} />
            </View>
            <Text style={styles.settingLabel}>Nhắc ôn tập hàng ngày (20:00)</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        {/* Info */}
        <SectionTitle title="Thông tin" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('AI Dictionary', 'Phiên bản 1.0.0\nPhát triển bởi sinh viên React Native Course')}>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>Về ứng dụng</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://example.com/terms')}>
            <View style={[styles.settingIcon, { backgroundColor: COLORS.accent + '15' }]}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.accent} />
            </View>
            <Text style={styles.settingLabel}>Điều khoản dịch vụ</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.black },
  settingControl: { alignItems: 'flex-end' },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginLeft: 62,
  },
  languagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  languageText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});

export default SettingsScreen;

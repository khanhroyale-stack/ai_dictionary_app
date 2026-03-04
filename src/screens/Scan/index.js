import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { geminiService } from '../../services/geminiService';
import { addWord } from '../../store/slices/wordsSlice';
import { notificationService } from '../../services/notificationService';
import { COLORS } from '../../constants/colors';

const ScanScreen = () => {
  const dispatch = useDispatch();
  const { user, sourceLanguage, targetLanguage, soundEnabled } = useSelector(
    (s) => s.settings
  );

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    setCameraActive(true);
    return () => setCameraActive(false);
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isScanning) return;
    try {
      setIsScanning(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      setCapturedImage(photo.uri);
      await analyzeImage(photo.base64);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      setIsScanning(false);
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setIsScanning(true);
      setCapturedImage(result.assets[0].uri);
      await analyzeImage(result.assets[0].base64);
    }
  };

  const analyzeImage = async (base64) => {
    try {
      const result = await geminiService.analyzeImage(base64, sourceLanguage, targetLanguage);
      if (result.success) {
        setScannedData(result.data);
        setModalVisible(true);
      } else {
        Alert.alert('Lỗi AI', 'Không thể nhận diện vật thể. Vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi phân tích ảnh.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveWord = async () => {
    if (!user || !scannedData) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để lưu từ vựng.');
      return;
    }
    const wordData = {
      ...scannedData,
      imageUri: capturedImage,
      sourceLanguage,
      targetLanguage,
    };
    const result = await dispatch(addWord({ userId: user.uid, wordData }));
    if (addWord.fulfilled.match(result)) {
      await notificationService.sendScanSuccessNotification(scannedData.objectName);
      setModalVisible(false);
      setScannedData(null);
      setCapturedImage(null);
      Alert.alert('✅ Đã lưu!', `"${scannedData.objectName}" đã được thêm vào từ điển.`);
    } else {
      Alert.alert('Lỗi', 'Không thể lưu từ. Vui lòng thử lại.');
    }
  };

  // Camera permission not granted
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={80} color={COLORS.primary} />
        <Text style={styles.permissionTitle}>Cần quyền truy cập Camera</Text>
        <Text style={styles.permissionText}>
          Ứng dụng cần quyền camera để quét vật thể
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Camera View */}
        {cameraActive && (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back">
            {/* Overlay frame */}
            <View style={styles.overlay}>
              {/* Top dark area */}
              <View style={styles.overlayTop} />
              {/* Middle row */}
              <View style={styles.overlayMiddle}>
                <View style={styles.overlaySide} />
                {/* Scan frame */}
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  {isScanning && (
                    <View style={styles.scanningIndicator}>
                      <ActivityIndicator size="large" color={COLORS.white} />
                      <Text style={styles.scanningText}>Đang phân tích...</Text>
                    </View>
                  )}
                </View>
                <View style={styles.overlaySide} />
              </View>
              {/* Bottom dark area */}
              <View style={styles.overlayBottom}>
                <Text style={styles.hintText}>Đặt vật thể vào khung để quét</Text>
                {/* Controls */}
                <View style={styles.controls}>
                  <TouchableOpacity
                    style={styles.galleryBtn}
                    onPress={handlePickFromGallery}
                    disabled={isScanning}>
                    <Ionicons name="images" size={26} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.captureBtn, isScanning && styles.captureBtnDisabled]}
                    onPress={handleCapture}
                    disabled={isScanning}>
                    <View style={styles.captureBtnInner} />
                  </TouchableOpacity>
                  <View style={{ width: 56 }} />
                </View>
              </View>
            </View>
          </CameraView>
        )}

        {/* Result Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kết quả nhận diện</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setScannedData(null);
                  }}>
                  <Ionicons name="close" size={24} color={COLORS.grayDark} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {capturedImage && (
                  <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                )}

                {scannedData && (
                  <View style={styles.resultContainer}>
                    {/* Category badge */}
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{scannedData.category}</Text>
                    </View>

                    {/* Main word */}
                    <Text style={styles.mainWord}>{scannedData.objectName}</Text>
                    <Text style={styles.pronunciation}>{scannedData.pronunciation}</Text>
                    <Text style={styles.translation}>{scannedData.translation}</Text>

                    {/* Part of speech */}
                    <Text style={styles.partOfSpeech}>
                      ({scannedData.partOfSpeech})
                    </Text>

                    {/* Description */}
                    {scannedData.description && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.descriptionText}>{scannedData.description}</Text>
                      </View>
                    )}

                    {/* Examples */}
                    {scannedData.examples && scannedData.examples.length > 0 && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ví dụ</Text>
                        {scannedData.examples.map((ex, i) => (
                          <View key={i} style={styles.exampleItem}>
                            <Text style={styles.exampleSentence}>• {ex.sentence}</Text>
                            <Text style={styles.exampleTranslation}>{ex.translation}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Related words */}
                    {scannedData.relatedWords && scannedData.relatedWords.length > 0 && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Từ liên quan</Text>
                        <View style={styles.relatedWords}>
                          {scannedData.relatedWords.map((rw, i) => (
                            <View key={i} style={styles.relatedWordChip}>
                              <Text style={styles.relatedWordText}>{rw.word}</Text>
                              <Text style={styles.relatedWordMeaning}>{rw.meaning}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Confidence */}
                    <View style={styles.confidenceRow}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.confidenceText}>
                        Độ tin cậy: {Math.round((scannedData.confidence || 0.9) * 100)}%
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Action buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.discardBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setScannedData(null);
                  }}>
                  <Text style={styles.discardBtnText}>Bỏ qua</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWord}>
                  <Ionicons name="bookmark" size={18} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Lưu từ vựng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 260,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.white,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanningIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanningText: {
    color: COLORS.white,
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  overlayBottom: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    paddingTop: 20,
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  galleryBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.grayLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  mainWord: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.black,
  },
  pronunciation: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  partOfSpeech: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.grayDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.grayDark,
    lineHeight: 22,
  },
  exampleItem: {
    marginBottom: 8,
  },
  exampleSentence: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  exampleTranslation: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  relatedWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedWordChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  relatedWordText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  relatedWordMeaning: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayLight,
    alignItems: 'center',
  },
  discardBtnText: {
    fontSize: 15,
    color: COLORS.grayDark,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default ScanScreen;
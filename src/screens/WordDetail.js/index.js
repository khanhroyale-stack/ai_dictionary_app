import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateWord } from '../../store/slices/wordsSlice';
import { COLORS } from '../../constants/colors';

const WordDetailScreen = ({ route, navigation }) => {
  const { word: initialWord } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.settings);

  const word = useSelector((s) =>
    s.words.list.find((w) => w.id === initialWord.id)
  ) || initialWord; // fallback về initialWord nếu không tìm thấy

  const handleToggleFavorite = () => {
    if (!user) return;
    dispatch(updateWord({ userId: user.uid, wordId: word.id, updates: { isFavorite: !word.isFavorite } }));
  };

  const handleToggleLearned = () => {
    if (!user) return;
    dispatch(updateWord({ userId: user.uid, wordId: word.id, updates: { isLearned: !word.isLearned } }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
              <Ionicons
                name={word.isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          {word.imageUri && (
            <Image source={{ uri: word.imageUri }} style={styles.headerImage} />
          )}

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{word.category || 'Object'}</Text>
          </View>
          <Text style={styles.mainWord}>{word.objectName}</Text>
          <Text style={styles.pronunciation}>{word.pronunciation}</Text>
          <Text style={styles.translation}>{word.translation}</Text>
        </LinearGradient>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, word.isLearned && styles.actionBtnActive]}
            onPress={handleToggleLearned}>
            <Ionicons
              name={word.isLearned ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
              color={word.isLearned ? COLORS.white : COLORS.primary}
            />
            <Text style={[styles.actionBtnText, word.isLearned && styles.actionBtnTextActive]}>
              {word.isLearned ? 'Đã học' : 'Đánh dấu đã học'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Description */}
          {word.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MÔ TẢ</Text>
              <View style={styles.card}>
                <Text style={styles.descriptionText}>{word.description}</Text>
              </View>
            </View>
          )}

          {/* Part of speech */}
          {word.partOfSpeech && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LOẠI TỪ</Text>
              <View style={styles.card}>
                <Text style={styles.cardText}>{word.partOfSpeech}</Text>
              </View>
            </View>
          )}

          {/* Examples */}
          {word.examples && word.examples.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>VÍ DỤ</Text>
              {word.examples.map((ex, i) => (
                <View key={i} style={[styles.card, styles.exampleCard]}>
                  <Ionicons name="chatbubble-outline" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exampleSentence}>{ex.sentence}</Text>
                    <Text style={styles.exampleTranslation}>{ex.translation}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Related words */}
          {word.relatedWords && word.relatedWords.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TỪ LIÊN QUAN</Text>
              <View style={styles.relatedWords}>
                {word.relatedWords.map((rw, i) => (
                  <View key={i} style={styles.relatedChip}>
                    <Text style={styles.relatedWord}>{rw.word}</Text>
                    <Text style={styles.relatedMeaning}>{rw.meaning}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Confidence & date */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
              <Text style={styles.metaText}>
                Tin cậy: {Math.round((word.confidence || 0.9) * 100)}%
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>
                {word.createdAt ? new Date(word.createdAt).toLocaleDateString('vi-VN') : ''}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  favoriteBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerImage: {
    width: 140, height: 140, borderRadius: 16,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 8,
  },
  categoryText: { color: COLORS.white, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  mainWord: { fontSize: 32, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  pronunciation: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginTop: 4 },
  translation: { fontSize: 22, fontWeight: '600', color: COLORS.white, marginTop: 8 },
  actionRow: { paddingHorizontal: 20, paddingVertical: 16 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.primary, gap: 8,
  },
  actionBtnActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  actionBtnText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  actionBtnTextActive: { color: COLORS.white },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.gray,
    letterSpacing: 1, marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  exampleCard: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardText: { fontSize: 15, color: COLORS.black },
  descriptionText: { fontSize: 14, color: COLORS.grayDark, lineHeight: 22 },
  exampleSentence: { fontSize: 14, color: COLORS.black, lineHeight: 20 },
  exampleTranslation: { fontSize: 13, color: COLORS.gray, marginTop: 4, fontStyle: 'italic' },
  relatedWords: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  relatedChip: {
    backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary + '40', alignItems: 'center',
  },
  relatedWord: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  relatedMeaning: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.gray },
});

export default WordDetailScreen;
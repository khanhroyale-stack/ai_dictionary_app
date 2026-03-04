import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const CARD_GRADIENTS = [
  ['#6C63FF', '#8B85FF'],
  ['#FF6584', '#FF8FA3'],
  ['#43C6AC', '#56D8B0'],
  ['#FF9800', '#FFB74D'],
  ['#8B5CF6', '#A78BFA'],
];

const WordCard = ({ word, index, onPress, onToggleFavorite, onToggleLearned }) => {
  const gradientColors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.card}>
        {/* Left: Image or Icon */}
        <View style={styles.imageContainer}>
          {word.imageUri ? (
            <Image source={{ uri: word.imageUri }} style={styles.image} />
          ) : (
            <View style={styles.iconBox}>
              <Ionicons name="camera" size={28} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </View>

        {/* Middle: Content */}
        <View style={styles.content}>
          <Text style={styles.objectName} numberOfLines={1}>
            {word.objectName || 'Unknown'}
          </Text>
          <Text style={styles.translation} numberOfLines={1}>
            {word.translation || 'No translation'}
          </Text>
          <Text style={styles.date}>{formatDate(word.createdAt)}</Text>

          {/* Tags */}
          <View style={styles.tags}>
            {word.isLearned && (
              <TouchableOpacity
                onPress={() => onToggleLearned && onToggleLearned(word)}
                style={[styles.tag, styles.tagLearned]}>
                <Text style={styles.tagText}>Đã học</Text>
              </TouchableOpacity>
            )}
            {word.isFavorite && (
              <TouchableOpacity
                onPress={() => onToggleFavorite && onToggleFavorite(word)}
                style={[styles.tag, styles.tagFavorite]}>
                <Text style={styles.tagText}>Yêu thích</Text>
              </TouchableOpacity>
            )}
            {!word.isLearned && (
              <TouchableOpacity
                onPress={() => onToggleLearned && onToggleLearned(word)}
                style={[styles.tag, styles.tagUnlearned]}>
                <Text style={styles.tagText}>Chưa học</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right: Arrow + Favorite */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => onToggleFavorite && onToggleFavorite(word)}
            style={styles.favoriteBtn}>
            <Ionicons
              name={word.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  objectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  translation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagLearned: {
    backgroundColor: '#4CAF50',
  },
  tagFavorite: {
    backgroundColor: '#FF6584',
  },
  tagUnlearned: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  favoriteBtn: {
    padding: 4,
  },
});

export default WordCard;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { recommendationService, RecommendedUser } from '../services/recommendationService';
import { ConversationDisplay } from '../types/chat';
import { DEFAULT_AVATAR } from '../constants/images';

interface FindPeopleScreenProps {
  route?: {
    params?: {
      existingConversationUserIds?: string[];
    };
  };
}

export default function FindPeopleScreen({ route }: FindPeopleScreenProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingConversation, setStartingConversation] = useState<string | null>(null);

  const existingUserIds = route?.params?.existingConversationUserIds || [];

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const recommended = await recommendationService.getRecommendedUsers(
        user.id,
        existingUserIds,
        20
      );
      setRecommendations(recommended);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecommendations();
  };

  const handleStartConversation = async (targetUser: RecommendedUser) => {
    if (!user?.id || startingConversation) return;
    
    setStartingConversation(targetUser.id);
    
    try {
      const conversationId = await chatService.startConversation(user.id, targetUser.id);
      navigation.navigate('Chat', {
        conversationId,
        otherUserId: targetUser.id,
        otherUserName: targetUser.name,
        otherUserAvatar: targetUser.avatar,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setStartingConversation(null);
    }
  };

  const renderRecommendationItem = ({ item }: { item: RecommendedUser }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleStartConversation(item)}
      activeOpacity={0.7}
      disabled={startingConversation === item.id}
    >
      <Image
        source={{ uri: item.avatar || DEFAULT_AVATAR }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name || item.username}
          </Text>
          {item.isHost && (
            <View style={styles.hostBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.username} numberOfLines={1}>
          @{item.username}
        </Text>
        
        {item.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
        
        <View style={styles.reasonTags}>
          {item.reasonTags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.reasonTag}>
              <Text style={styles.reasonTagText}>{tag}</Text>
            </View>
          ))}
          {item.distanceFormatted && (
            <View style={[styles.reasonTag, styles.distanceTag]}>
              <Ionicons name="location-outline" size={10} color="#6366F1" />
              <Text style={styles.distanceText}>{item.distanceFormatted}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={12} color="#9CA3AF" />
            <Text style={styles.statText}>{item.followers} followers</Text>
          </View>
          {item.mutualInterests && item.mutualInterests.length > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={12} color="#9CA3AF" />
              <Text style={styles.statText}>
                {item.mutualInterests.length} mutual interest{item.mutualInterests.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.messageButton,
          startingConversation === item.id && styles.messageButtonDisabled
        ]}
        onPress={() => handleStartConversation(item)}
        disabled={startingConversation === item.id}
      >
        {startingConversation === item.id ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>No recommendations found</Text>
      <Text style={styles.emptyStateSubtitle}>
        We couldn't find any people to recommend right now.
        Try refreshing or completing your profile for better recommendations.
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.loadingText}>Finding people you might like...</Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Please log in to find people</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find People</Text>
        <TouchableOpacity
          style={styles.refreshHeaderButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={refreshing ? "#9CA3AF" : "#6366F1"} 
          />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>
          People you might want to connect with
        </Text>
      </View>

      {/* Recommendations List */}
      {loading ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id}
          renderItem={renderRecommendationItem}
          contentContainerStyle={[
            styles.listContainer,
            recommendations.length === 0 ? styles.emptyContainer : undefined,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  refreshHeaderButton: {
    padding: 8,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
    flex: 1,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 2,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  reasonTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  reasonTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  reasonTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
    marginLeft: 2,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  messageButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});
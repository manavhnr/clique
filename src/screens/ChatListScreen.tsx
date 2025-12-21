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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { ConversationDisplay } from '../types/chat';
import { DEFAULT_AVATAR } from '../constants/images';
import { searchUsers, UserSearchResult } from '../services/userService';

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<UserSearchResult[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = chatService.subscribeToUserConversations(
      user.id,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Load user recommendations when there are no conversations
  useEffect(() => {
    if (conversations.length === 0 && !loading && user?.id) {
      loadRecommendations();
    }
  }, [conversations.length, loading, user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id || loadingRecommendations) return;
    
    setLoadingRecommendations(true);
    try {
      // Get random users as recommendations (you can implement better logic based on mutual friends, interests, etc.)
      const users = await searchUsers('', 10); // Get random users
      // Filter out current user and users they already have conversations with
      const existingUserIds = conversations.map(conv => conv.otherUser.id);
      const filteredUsers = users.filter(u => u.id !== user.id && !existingUserIds.includes(u.id));
      setRecommendations(filteredUsers.slice(0, 5)); // Show top 5 recommendations
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleConversationPress = (conversation: ConversationDisplay) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUserId: conversation.otherUser.id,
      otherUserName: conversation.otherUser.name,
      otherUserAvatar: conversation.otherUser.avatar,
    });
  };

  const handleFindPeople = () => {
    // Pass existing conversation user IDs to exclude them from recommendations
    const existingUserIds = conversations.map(conv => conv.otherUser.id);
    navigation.navigate('FindPeople', {
      existingConversationUserIds: existingUserIds
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (conversations.length === 0) {
      loadRecommendations();
    }
    // The real-time listener will automatically update the list
  };

  const handleStartConversation = async (targetUser: UserSearchResult) => {
    if (!user?.id) return;
    
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
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderConversation = ({ item }: { item: ConversationDisplay }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.otherUser.avatar || DEFAULT_AVATAR }}
        style={styles.avatar}
      />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.lastMessageAt)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start a conversation with someone below
      </Text>
      
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>People you might know</Text>
          {recommendations.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.recommendationItem}
              onPress={() => handleStartConversation(user)}
            >
              <Image
                source={{ uri: user.avatar || DEFAULT_AVATAR }}
                style={styles.recommendationAvatar}
              />
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationName}>{user.name}</Text>
                <Text style={styles.recommendationUsername}>@{user.username}</Text>
                {user.bio && (
                  <Text style={styles.recommendationBio} numberOfLines={1}>
                    {user.bio}
                  </Text>
                )}
              </View>
              <View style={styles.messageIconContainer}>
                <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.discoverMoreButton}
            onPress={handleFindPeople}
          >
            <Text style={styles.discoverMoreText}>Discover more people</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* No recommendations state */}
      {recommendations.length === 0 && !loadingRecommendations && (
        <View style={styles.noRecommendationsContainer}>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={handleFindPeople}
          >
            <Ionicons name="people-outline" size={24} color="#FFFFFF" />
            <Text style={styles.discoverButtonText}>Find People to Message</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Loading recommendations */}
      {loadingRecommendations && (
        <View style={styles.loadingRecommendations}>
          <Text style={styles.loadingText}>Finding people you might know...</Text>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Please log in to view messages</Text>
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
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />
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
  headerRight: {
    width: 40,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
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
    marginBottom: 32,
  },
  recommendationsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recommendationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  recommendationUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  recommendationBio: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverMoreButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  discoverMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  discoverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingRecommendations: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
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
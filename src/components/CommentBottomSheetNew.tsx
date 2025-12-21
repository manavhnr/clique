import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commentsService, CreateCommentData } from '../services/commentsService';
import { PostComment } from '../types/posts';
import { useAuth } from '../contexts/AuthContext';

interface CommentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  userId: string;
  postAuthorId: string;
}

interface CommentWithReplies extends PostComment {
  replies: PostComment[];
  isExpanded?: boolean;
}

export default function CommentBottomSheet({
  visible,
  onClose,
  postId,
  userId,
  postAuthorId,
}: CommentBottomSheetProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { user } = useAuth();

  // Real-time comments subscription
  useEffect(() => {
    if (visible && postId) {
      // Subscribe to real-time comments using the new service
      const unsubscribe = commentsService.subscribeToComments(postId, (newComments) => {
        setComments(newComments);
      });

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }
  }, [visible, postId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || loading || !user) return;

    setLoading(true);
    try {
      const commentData: CreateCommentData = {
        userId: userId,
        userName: user.name || user.username || `User ${userId.slice(0, 6)}`,
        userAvatar: undefined, // You can add avatar URL here
        commentText: newComment.trim(),
      };

      const result = await commentsService.createComment(postId, commentData);
      
      if (result.success) {
        setNewComment('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
    setLoading(false);
  };

  // Add a reply to a comment
  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim() || loading || !user) return;

    setLoading(true);
    try {
      const replyData: CreateCommentData = {
        userId: userId,
        userName: user.name || user.username || `User ${userId.slice(0, 6)}`,
        userAvatar: undefined,
        commentText: replyText.trim(),
        parentCommentId: parentCommentId,
      };

      const result = await commentsService.createComment(postId, replyData);
      
      if (result.success) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply. Please try again.');
    }
    setLoading(false);
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await commentsService.deleteComment(postId, commentId);
              if (!result.success) {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Toggle replies visibility
  const toggleReplies = async (commentId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.commentId === commentId 
          ? { ...comment, isExpanded: !comment.isExpanded }
          : comment
      )
    );
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderComment = ({ item }: { item: CommentWithReplies }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Image 
          source={{ uri: item.userAvatar || 'https://picsum.photos/100/100?random=21' }} 
          style={styles.userAvatar}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentMeta}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.commentText}</Text>
          
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setReplyingTo(item.commentId)}
            >
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
            
            {(item.userId === userId || postAuthorId === userId) && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteComment(item.commentId)}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Replies Section */}
          {item.replies.length > 0 && (
            <TouchableOpacity 
              style={styles.repliesToggle}
              onPress={() => toggleReplies(item.commentId)}
            >
              <Text style={styles.repliesToggleText}>
                {item.isExpanded ? 'Hide' : 'Show'} {item.replies.length} replies
              </Text>
              <Ionicons 
                name={item.isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#6366F1" 
              />
            </TouchableOpacity>
          )}

          {item.isExpanded && item.replies.map((reply) => (
            <View key={reply.commentId} style={styles.replyContainer}>
              <Image 
                source={{ uri: reply.userAvatar || 'https://picsum.photos/100/100?random=22' }} 
                style={styles.replyAvatar}
              />
              <View style={styles.replyContent}>
                <View style={styles.commentMeta}>
                  <Text style={styles.userName}>{reply.userName}</Text>
                  <Text style={styles.commentTime}>{formatTime(reply.createdAt)}</Text>
                </View>
                <Text style={styles.commentText}>{reply.commentText}</Text>
                
                <View style={styles.commentActions}>
                  {(reply.userId === userId || postAuthorId === userId) && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteComment(reply.commentId)}
                    >
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Reply Input */}
          {replyingTo === item.commentId && (
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write a reply..."
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <View style={styles.replyInputActions}>
                <TouchableOpacity 
                  style={styles.cancelReplyButton}
                  onPress={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  <Text style={styles.cancelReplyText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.sendReplyButton}
                  onPress={() => handleAddReply(item.commentId)}
                  disabled={!replyText.trim() || loading}
                >
                  <Text style={styles.sendReplyText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.commentId}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newComment.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim() || loading}
          >
            <Ionicons name="send" size={20} color={!newComment.trim() || loading ? "#9CA3AF" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  deleteText: {
    color: '#EF4444',
  },
  repliesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  repliesToggleText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 4,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginLeft: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyInputContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  replyInput: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    minHeight: 40,
  },
  replyInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelReplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  cancelReplyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sendReplyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sendReplyText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
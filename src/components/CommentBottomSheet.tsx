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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commentsService, CommentWithReplies as ServiceCommentWithReplies, CreateCommentData } from '../services/commentsService';
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
  replies?: PostComment[];
  showReplies?: boolean;
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

  // Real-time comments subscription
  useEffect(() => {
    if (visible && postId) {
      setLoading(true);
      
      // Subscribe to real-time comments using the service
      const unsubscribe = commentsService.subscribeToComments(postId, (newComments: ServiceCommentWithReplies[]) => {
        setComments(newComments);
        setLoading(false);
      });

      unsubscribeRef.current = unsubscribe;

      // Cleanup on unmount or when modal closes
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [visible, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const result = await commentsService.createComment(postId, {
        userId,
        userName: 'User', // Replace with actual user name from auth context
        commentText: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
    setLoading(false);
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const result = await commentsService.createComment(postId, {
        userId,
        userName: 'User', // Replace with actual user name from auth context
        commentText: replyText.trim(),
        parentCommentId
      });
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply');
    }
    setLoading(false);
  };

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
              await commentsService.deleteComment(postId, commentId);
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const toggleReplies = (commentId: string) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.commentId === commentId
          ? { ...comment, showReplies: !comment.showReplies }
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

  const renderComment = ({ item: comment }: { item: CommentWithReplies }) => (
    <View className="mb-4">
      {/* Main Comment */}
      <View className="bg-gray-800 rounded-lg p-3 mb-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-white font-medium text-sm mb-1">User {comment.userId.slice(-4)}</Text>
            <Text className="text-gray-200 text-sm">{comment.commentText}</Text>
            <Text className="text-gray-400 text-xs mt-1">{formatTime(comment.createdAt)}</Text>
          </View>
          
          {/* Comment Actions */}
          <View className="flex-row ml-2">
            <TouchableOpacity
              onPress={() => setReplyingTo(comment.commentId)}
              className="p-1"
            >
              <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            
            {(userId === comment.userId || userId === postAuthorId) && (
              <TouchableOpacity
                onPress={() => handleDeleteComment(comment.commentId)}
                className="p-1 ml-1"
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Reply Input */}
        {replyingTo === comment.commentId && (
          <View className="mt-2 pt-2 border-t border-gray-700">
            <View className="flex-row items-center">
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a reply..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm mr-2"
                multiline
              />
              <TouchableOpacity
                onPress={() => handleAddReply(comment.commentId)}
                disabled={loading || !replyText.trim()}
                className="bg-purple-600 px-3 py-2 rounded-lg"
              >
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              className="mt-1"
            >
              <Text className="text-gray-400 text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <View className="ml-4">
          <TouchableOpacity
            onPress={() => toggleReplies(comment.commentId)}
            className="mb-2"
          >
            <Text className="text-purple-400 text-sm">
              {comment.showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>

          {comment.showReplies && comment.replies.map((reply) => (
            <View key={reply.commentId} className="bg-gray-700 rounded-lg p-3 mb-2">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-white font-medium text-sm mb-1">User {reply.userId.slice(-4)}</Text>
                  <Text className="text-gray-200 text-sm">{reply.commentText}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{formatTime(reply.createdAt)}</Text>
                </View>
                
                {(userId === reply.userId || userId === postAuthorId) && (
                  <TouchableOpacity
                    onPress={() => handleDeleteComment(reply.commentId)}
                    className="p-1 ml-2"
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <TouchableOpacity 
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Bottom Sheet Container */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          className="bg-gray-900 rounded-t-3xl"
          style={{ maxHeight: '60%', minHeight: '50%' }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            {/* Drag Handle */}
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-gray-600 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-700">
              <Text className="text-white text-lg font-semibold">Comments</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.commentId}
              className="flex-1"
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="items-center justify-center py-8">
                  <Ionicons name="chatbubble-outline" size={48} color="#6B7280" />
                  <Text className="text-gray-400 text-center mt-2">No comments yet</Text>
                  <Text className="text-gray-500 text-center text-sm">Be the first to comment!</Text>
                </View>
              }
            />

            {/* New Comment Input */}
            <View className="p-4 border-t border-gray-700">
              <View className="flex-row items-center">
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Write a comment..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg mr-2"
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  disabled={loading || !newComment.trim()}
                  className={`px-4 py-3 rounded-lg ${
                    loading || !newComment.trim() ? 'bg-gray-600' : 'bg-purple-600'
                  }`}
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
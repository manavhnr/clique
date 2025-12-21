import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Conversation, Message, ConversationDisplay, MessageDisplay } from '../types/chat';

class ChatService {
  private conversationsRef = collection(db, 'conversations');

  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(userAId: string, userBId: string): Promise<string> {
    if (userAId === userBId) {
      throw new Error('Cannot create conversation with yourself');
    }

    // Check if conversation already exists
    const existingQuery = query(
      this.conversationsRef,
      where('participants', 'array-contains', userAId)
    );

    const snapshot = await getDocs(existingQuery);
    const existingConversation = snapshot.docs.find(doc => {
      const data = doc.data() as Conversation;
      return data.participants.includes(userBId);
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const newConversation = {
      participants: [userAId, userBId],
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(this.conversationsRef, newConversation);
    return docRef.id;
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    if (!text.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      
      // Add message to subcollection
      await addDoc(messagesRef, {
        senderId,
        text: text.trim(),
        createdAt: serverTimestamp(),
        readBy: [senderId], // sender has read their own message
      });

      // Update conversation with last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Subscribe to messages in a conversation with real-time updates
   */
  subscribeToMessages(
    conversationId: string,
    currentUserId: string,
    callback: (messages: MessageDisplay[]) => void
  ): () => void {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages: MessageDisplay[] = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<Message, 'id'>;
          return {
            id: doc.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            isOwn: data.senderId === currentUserId,
            isRead: data.readBy?.includes(currentUserId) || false,
          };
        });
        callback(messages);
      },
      (error) => {
        console.error('Error subscribing to messages:', error);
        callback([]);
      }
    );
  }

  /**
   * Subscribe to user's conversations with real-time updates
   */
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: ConversationDisplay[]) => void
  ): () => void {
    const userConversationsQuery = query(
      this.conversationsRef,
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(
      userConversationsQuery,
      async (snapshot) => {
        const conversationsData: Array<{ doc: any; data: Conversation }> = [];

        // Collect all conversations data
        for (const doc of snapshot.docs) {
          const data = doc.data() as Conversation;
          conversationsData.push({ doc, data });
        }

        // Sort by lastMessageAt in memory (desc order)
        conversationsData.sort((a, b) => {
          const aTime = (a.data.lastMessageAt as Timestamp)?.toDate().getTime() || 0;
          const bTime = (b.data.lastMessageAt as Timestamp)?.toDate().getTime() || 0;
          return bTime - aTime;
        });

        const conversationsDisplay: ConversationDisplay[] = [];

        for (const { doc, data } of conversationsData) {
          const otherUserId = data.participants.find(id => id !== userId);
          
          if (!otherUserId) continue;

          // Get other user's info (simplified - you might want to cache this)
          const otherUser = await this.getUserInfo(otherUserId);
          
          // Count unread messages (simplified)
          const unreadCount = 0; // TODO: Implement proper unread counting

          conversationsDisplay.push({
            id: doc.id,
            otherUser,
            lastMessage: data.lastMessage || 'No messages yet',
            lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() || new Date(),
            unreadCount,
          });
        }

        callback(conversationsDisplay);
      },
      (error) => {
        console.error('Error subscribing to conversations:', error);
        callback([]);
      }
    );
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      const unreadQuery = query(
        messagesRef,
        where('readBy', 'not-in', [userId])
      );

      const snapshot = await getDocs(unreadQuery);
      
      const updatePromises = snapshot.docs.map(messageDoc => 
        updateDoc(messageDoc.ref, {
          readBy: arrayUnion(userId)
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Get user info for display (simplified version)
   */
  private async getUserInfo(userId: string): Promise<{ id: string; name: string; avatar?: string }> {
    try {
      // This is a simplified version - you might want to use your existing user service
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userId,
          name: userData.name || userData.username || 'Unknown User',
          avatar: userData.avatar,
        };
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }

    return {
      id: userId,
      name: 'Unknown User',
    };
  }

  /**
   * Start a new conversation with a user
   */
  async startConversation(currentUserId: string, targetUserId: string): Promise<string> {
    return this.getOrCreateConversation(currentUserId, targetUserId);
  }
}

export const chatService = new ChatService();
export default chatService;
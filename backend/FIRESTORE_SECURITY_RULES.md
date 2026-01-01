# Firebase Firestore Security Rules for Clique App

## Overview
This document explains the Firestore security rules for the Clique social events app, focusing on the `follows` collection and related security patterns.

## Security Rules Implementation

### Follows Collection Rules

The `follows` collection implements strict security controls:

```javascript
match /follows/{followId} {
  // Only authenticated users can access follow data
  allow read: if request.auth != null;
  
  // Users can only create follow documents where they are the follower
  allow create: if request.auth != null 
    && request.auth.uid == resource.data.followerId
    && validateFollowDocument(request.resource.data);
  
  // Users can only delete follow documents where they are the follower
  allow delete: if request.auth != null 
    && request.auth.uid == resource.data.followerId;
  
  // Prevent updates to follow documents (immutable after creation)
  allow update: if false;
}
```

### Key Security Features

#### 1. **Authentication Required**
- All operations require `request.auth != null`
- Prevents anonymous access to follow relationships

#### 2. **Create Protection**
- Users can only create follows where `request.auth.uid == followerId`
- Prevents users from creating fake follow relationships
- Includes document validation to ensure proper structure

#### 3. **Delete Protection**
- Users can only delete follows where they are the follower
- Prevents users from removing other people's follow relationships

#### 4. **Immutable Follow Documents**
- `allow update: if false` prevents any modifications
- Follow relationships are create-only or delete-only
- Ensures data integrity and audit trail

#### 5. **Document Validation**
```javascript
function validateFollowDocument(data) {
  return data.keys().hasAll(['followerId', 'followingId', 'createdAt', 'status'])
    && data.followerId is string
    && data.followingId is string
    && data.createdAt is timestamp
    && data.status == 'active'
    && data.followerId != data.followingId; // Prevent self-following
}
```

### Related Collection Rules

#### Users Collection
- **Read**: Authenticated users can read any profile (for connection counts)
- **Write**: Users can only modify their own profile data

#### Posts Collection
- **Read**: Authenticated users can read all posts
- **Write**: Users can only create/update/delete their own posts

## Deployment Instructions

### 1. Deploy Rules to Firebase

```bash
# Navigate to your Firebase project directory
cd /path/to/your/firebase/project

# Deploy rules to Firestore
firebase deploy --only firestore:rules
```

### 2. Test Rules Locally

```bash
# Start the Firestore emulator with rules
firebase emulators:start --only firestore

# Run tests against local emulator
npm run test:firestore-rules
```

### 3. Validate Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database > Rules
4. Verify the rules are deployed correctly
5. Use the Rules Playground to test scenarios

## Security Test Scenarios

### ✅ **Should Allow**

1. **Authenticated user reading follows**
   ```
   auth.uid: 'user123'
   operation: read /follows/doc1
   result: ✅ allowed
   ```

2. **User creating their own follow**
   ```
   auth.uid: 'user123'
   operation: create /follows/doc1 { followerId: 'user123', followingId: 'user456' }
   result: ✅ allowed
   ```

3. **User deleting their own follow**
   ```
   auth.uid: 'user123'
   operation: delete /follows/doc1 (where followerId: 'user123')
   result: ✅ allowed
   ```

### ❌ **Should Deny**

1. **Unauthenticated access**
   ```
   auth: null
   operation: read /follows/doc1
   result: ❌ denied
   ```

2. **User creating follow for someone else**
   ```
   auth.uid: 'user123'
   operation: create /follows/doc1 { followerId: 'user456', followingId: 'user789' }
   result: ❌ denied
   ```

3. **Updating follow documents**
   ```
   auth.uid: 'user123'
   operation: update /follows/doc1
   result: ❌ denied (always)
   ```

4. **Self-following attempts**
   ```
   auth.uid: 'user123'
   operation: create /follows/doc1 { followerId: 'user123', followingId: 'user123' }
   result: ❌ denied
   ```

## Production Considerations

### 1. **Rate Limiting**
- Consider implementing client-side rate limiting
- Use Firebase App Check for additional protection

### 2. **Data Validation**
- Rules validate document structure
- Additional server-side validation recommended

### 3. **Monitoring**
- Monitor rule denials in Firebase Console
- Set up alerts for unusual access patterns

### 4. **Backup Strategy**
- Regular Firestore exports
- Version control for security rules

## Integration with Backend API

The Node.js backend uses Firebase Admin SDK which **bypasses security rules**. This is intentional:

- **Client apps** (React Native) → Subject to security rules
- **Server code** (Node.js API) → Bypasses rules (uses Admin SDK)

Ensure your backend API implements proper authentication and authorization checks since it's not protected by Firestore rules.

## Rule Updates and Versioning

When updating rules:

1. **Test in emulator first**
2. **Deploy to staging environment**
3. **Monitor for unexpected denials**
4. **Deploy to production during low-traffic periods**

Keep rule versions in git for rollback capability:

```bash
# Tag rule versions
git tag -a "firestore-rules-v1.2" -m "Added self-follow prevention"
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check user authentication status
   - Verify `followerId` matches authenticated user
   - Ensure document structure is valid

2. **Rules not updating**
   - Wait up to 60 seconds for rule propagation
   - Clear client-side cache
   - Verify deployment completed successfully

3. **Testing failures**
   - Ensure emulator is running latest rules
   - Check test user authentication tokens
   - Validate test document structures
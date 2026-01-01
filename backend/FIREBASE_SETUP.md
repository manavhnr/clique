# Firebase Backend Environment Variables

## Required Environment Variables for Connections API

Add these environment variables to your `.env` file in the `/backend` directory:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----"

# Server Configuration
PORT=8080
NODE_ENV=development
```

## Firestore Database Structure

The connections API uses the following Firestore collections:

### `follows` Collection
```
follows/{documentId}
{
  followerId: string,     // User who is following
  followingId: string,    // User being followed  
  createdAt: timestamp,   // When the follow relationship was created
  status: 'active'        // Status of the relationship
}
```

### `users` Collection (if needed)
```
users/{userId}
{
  displayName: string,
  email: string,
  // ... other user fields
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId/connections` | Get total connections count |
| POST | `/api/users/:userId/follow` | Follow a user |
| DELETE | `/api/users/:userId/follow` | Unfollow a user |
| GET | `/api/users/:userId/follow-status/:targetUserId` | Check follow status |
| GET | `/api/users/:userId/followers` | Get followers list |
| GET | `/api/users/:userId/following` | Get following list |

## Setup Instructions

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Create a service account and download the JSON key
4. Extract the required fields and add to your `.env` file
5. Run `npm install` in the backend directory
6. Start the server with `npm run dev`
7. Test with the provided test script: `npx ts-node src/test/testConnections.ts`

## Security Rules (Firestore)

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to manage their own follows
    match /follows/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read access to user documents
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
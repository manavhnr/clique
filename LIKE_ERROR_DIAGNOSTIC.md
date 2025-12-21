# Post Like Error Diagnostic 🔍

## Current Issue
Getting "post does not exist" error when trying to like posts.

## Troubleshooting Steps

### 1. First, Check Console Output
When you open the HomeScreen, look for these console messages:
- `🔄 Loading posts from Firestore...`
- `📊 Fetched posts: X posts`
- `📝 Post details:` (with individual post IDs)
- `Exists in DB: true/false` for each post

### 2. Create a Test Post
1. Tap the purple **+ button** in bottom-right corner
2. Select **"Create Simple Test Post"**
3. Watch console for:
   - `Creating simple test post...`
   - `Created post with ID: XXXXXX`
   - `Post exists after creation: true`

### 3. Test Like Functionality
1. After creating a test post, try liking it
2. Watch console for:
   - `Attempting to like/unlike post: XXXXXX`
   - `Post exists check: true/false`
   - `Liking post...` or error message

### 4. Debug Database State
1. Tap purple **+ button**
2. Select **"Debug System"** 
3. Check console for database collection counts

## Expected Console Output (Working State)
```
🔄 Loading posts from Firestore...
👤 User logged in: ABC123
📊 Fetched posts: 1 posts
📝 Post details:
  - ID: XYZ789
    Author: ABC123
    Text: This is a test post from Clique...
    Likes: 0
    Exists in DB: true
💖 Loading user liked posts for user: ABC123
✅ User liked posts: []
```

## Expected Like Process (Working State)
```
Attempting to like/unlike post: XYZ789
User ID: ABC123
Post exists check: true
Liking post...
Successfully liked post
```

## If You Still Get "Post Does Not Exist"

### Check These Issues:
1. **Database Permissions**: Firebase rules might be blocking access
2. **Network Issues**: Check internet connection
3. **Firebase Config**: Verify `firebaseConfig.ts` is correct
4. **Authentication**: Make sure user is properly logged in

### Manual Database Check:
1. Go to Firebase Console → Firestore Database
2. Look for `posts` collection
3. Verify posts exist with the IDs shown in console

### Force Refresh:
1. Pull down on the HomeScreen to refresh
2. Or close and reopen the app

## Quick Fix Commands:
If nothing works, try:
1. **Create Fresh Post**: Use "Create Simple Test Post" (not "Create Multiple Posts")
2. **Clear State**: Close app completely and restart
3. **Check Auth**: Make sure you're logged in (`user.id` should exist)

Let me know what the console shows and I can help debug further!
// Default images and avatars used throughout the app
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=C3B5F5&color=ffffff&size=200&rounded=true';

// Alternative placeholder avatar URLs
export const AVATAR_PLACEHOLDERS = {
  default: DEFAULT_AVATAR,
  // User initials based avatar
  generateInitialsAvatar: (name: string, backgroundColor: string = 'C3B5F5') => 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${backgroundColor}&color=ffffff&size=200&rounded=true`,
};

// Export for easy import
export { DEFAULT_AVATAR as defaultAvatar };
/**
 * 🎨 EmptyState Component - Modern Social App Style
 * Reusable component for empty states across the app
 * Inspired by Instagram DMs and iMessage empty states
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon: string;                    // Emoji or icon
  title: string;                   // Main heading
  subtitle: string;                // Description text
  ctaText?: string;               // Call-to-action button text
  onCtaPress?: () => void;        // CTA button handler
  iconSize?: 'sm' | 'md' | 'lg';  // Icon size variant
}

/**
 * Modern empty state component with clean design
 * Features soft colors, proper spacing, and premium feel
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  ctaText,
  onCtaPress,
  iconSize = 'lg'
}: EmptyStateProps) {
  // Icon size mapping
  const iconSizeClasses = {
    sm: 'text-6xl',
    md: 'text-7xl', 
    lg: 'text-8xl'
  };

  const iconContainerSizes = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <View className="flex-1 justify-center items-center px-8 py-16">
      {/* Icon Container with Premium Gradient Background */}
      <View 
        className={`${
          iconContainerSizes[iconSize]
        } rounded-full items-center justify-center mb-8 shadow-lg border border-purple-100/50`}
        style={{
          backgroundColor: '#F8FAFF',
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16
        }}
      >
        <Text className={`${iconSizeClasses[iconSize]} opacity-90`}>
          {icon}
        </Text>
      </View>

      {/* Title with Premium Typography */}
      <Text className="text-2xl font-bold text-gray-900 mb-4 text-center tracking-tight">
        {title}
      </Text>

      {/* Subtitle with Improved Readability */}
      <Text className="text-lg text-gray-500 text-center leading-7 mb-10 max-w-xs font-medium opacity-80">
        {subtitle}
      </Text>

      {/* Optional CTA Button with Modern Design */}
      {ctaText && onCtaPress && (
        <TouchableOpacity
          onPress={onCtaPress}
          className="bg-purple-500 px-8 py-4 rounded-2xl active:scale-95 border border-purple-400/20"
          activeOpacity={0.8}
          style={{
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 16
          }}
        >
          <Text className="text-white font-semibold text-lg tracking-wide">
            {ctaText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
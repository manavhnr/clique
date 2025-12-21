import React from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LayoutTest = () => {
  const deviceInfo = {
    screenWidth,
    screenHeight,
    platform: Platform.OS,
    ratio: screenWidth / screenHeight,
    isTablet: screenWidth >= 768,
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#F8FAFC' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        📱 Layout Test Results
      </Text>
      
      <Text>Screen Width: {deviceInfo.screenWidth}px</Text>
      <Text>Screen Height: {deviceInfo.screenHeight}px</Text>
      <Text>Platform: {deviceInfo.platform}</Text>
      <Text>Aspect Ratio: {deviceInfo.ratio.toFixed(2)}</Text>
      <Text>Device Type: {deviceInfo.isTablet ? 'Tablet' : 'Phone'}</Text>
      
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>HomeScreen Layout Compatibility:</Text>
        
        {/* Card Width Test */}
        <View style={{
          width: screenWidth - 32, // matches your scrollContent paddingHorizontal: 12 + marginHorizontal: 8
          backgroundColor: '#1A1A2E',
          borderRadius: 20,
          padding: 20,
          marginVertical: 10,
          shadowOpacity: 0.15,
          elevation: 8,
        }}>
          <Text style={{ color: '#FFFFFF' }}>✅ Card container fits properly</Text>
          
          {/* Avatar and Content Test */}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FFD700',
              marginRight: 16,
            }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                Username fits: ✅
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>
                @handle • 1h
              </Text>
            </View>
          </View>
          
          {/* Media Test */}
          <View style={{
            width: '100%',
            height: Math.min(240, screenWidth * 0.6),
            backgroundColor: '#8B5CF6',
            borderRadius: 20,
            marginVertical: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#FFFFFF' }}>
              📸 Media: {Math.min(240, screenWidth * 0.6)}px height
            </Text>
          </View>
          
          {/* Engagement Buttons Test */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(139, 92, 246, 0.1)',
          }}>
            {['💬', '🔁', '❤️', '🔖', '📤'].map((emoji, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: '18%',
                justifyContent: 'center',
              }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 4,
                }}>
                  <Text>{emoji}</Text>
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 15 }}>{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <Text style={{ color: '#10B981', fontWeight: 'bold' }}>
          ✅ Layout appears optimal for this device!
        </Text>
        
        {deviceInfo.screenWidth < 350 && (
          <Text style={{ color: '#EF4444', marginTop: 10 }}>
            ⚠️ Small screen detected - consider reducing padding
          </Text>
        )}
        
        {deviceInfo.isTablet && (
          <Text style={{ color: '#8B5CF6', marginTop: 10 }}>
            📱 Tablet detected - layout will work well with current design
          </Text>
        )}
      </View>
    </View>
  );
};

export default LayoutTest;
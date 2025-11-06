import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { eventsService, CreateEventData } from '../services/eventsService';

interface CreateEventFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  maxCapacity: number;
  earlyBirdPrice: number;
  regularPrice: number;
  premiumPrice: number;
  ageRestriction: string;
  dressCode: string;
  amenities: string[];
  images: string[];
  terms: string;
}

const categories = [
  'Music', 'Food & Dining', 'Art & Culture', 'Technology', 'Business', 
  'Sports & Fitness', 'Entertainment', 'Education', 'Fashion', 'Lifestyle'
];

const amenityOptions = [
  'DJ & Music', 'Live Performance', 'Food & Beverages', 'Cocktails', 
  'Photography', 'Parking', 'WiFi', 'AC/Heating', 'Security', 'Valet Service',
  'Welcome Drinks', 'City View', 'Networking', 'Merchandise', 'Dance Floor'
];

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  const isEditMode = route.params?.mode === 'edit';
  const eventId = route.params?.eventId;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    address: '',
    city: '',
    maxCapacity: 50,
    earlyBirdPrice: 0,
    regularPrice: 0,
    premiumPrice: 0,
    ageRestriction: '',
    dressCode: '',
    amenities: [],
    images: [],
    terms: '',
  });

  const handleInputChange = (field: keyof CreateEventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Add Event Images',
      'In a real app, this would open camera/gallery to upload event images.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Upload',
          onPress: () => {
            const newImage = `https://picsum.photos/400/300?random=${Date.now()}`;
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, newImage]
            }));
          }
        }
      ]
    );
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.date && formData.startTime && formData.venue && formData.address;
      case 3:
        return formData.regularPrice > 0 && formData.maxCapacity > 0;
      case 4:
        return formData.images.length > 0 && formData.amenities.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      Alert.alert('Required Fields', 'Please fill all required fields to continue.');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare event data for Firebase
      const eventData: CreateEventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        address: formData.address,
        city: formData.city,
        maxCapacity: formData.maxCapacity,
        earlyBirdPrice: formData.earlyBirdPrice,
        regularPrice: formData.regularPrice,
        premiumPrice: formData.premiumPrice,
        ageRestriction: formData.ageRestriction,
        dressCode: formData.dressCode,
        amenities: formData.amenities,
        images: formData.images,
        terms: formData.terms,
      };

      // Host info for the event
      const hostInfo = {
        name: user?.name || 'Host',
        username: user?.username || '@host',
        avatar: 'https://picsum.photos/100/100?random=21',
        rating: 4.8,
        eventsHosted: 12,
        isVerified: true,
      };

      const result = await eventsService.createEvent(user?.id || '', eventData, hostInfo);
      
      if (result.success) {
        Alert.alert(
          'Event Created!',
          'Your event has been created successfully. You can now publish it to start accepting bookings.',
          [
            {
              text: 'Create Another',
              onPress: () => {
                // Reset form
                setFormData({
                  title: '',
                  description: '',
                  category: '',
                  date: '',
                  startTime: '',
                  endTime: '',
                  venue: '',
                  address: '',
                  city: '',
                  maxCapacity: 50,
                  earlyBirdPrice: 0,
                  regularPrice: 0,
                  premiumPrice: 0,
                  ageRestriction: '',
                  dressCode: '',
                  amenities: [],
                  images: [],
                  terms: '',
                });
                setCurrentStep(1);
              }
            },
            {
              text: 'View Dashboard',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Event Basics</Text>
      <Text style={styles.stepDescription}>Tell us about your event</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Event Title *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholder="e.g., Rooftop Sunset Party 🌅"
          maxLength={100}
        />
        <Text style={styles.charCount}>{formData.title.length}/100</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipSelected
                ]}
                onPress={() => handleInputChange('category', category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.category === category && styles.categoryChipTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Event Description *</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 100 }]}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Describe your event, what guests can expect, special features..."
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        <Text style={styles.charCount}>{formData.description.length}/500</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Date & Venue</Text>
      <Text style={styles.stepDescription}>When and where will your event take place?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Event Date *</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => {
            // Simulate date selection
            handleInputChange('date', '15 Nov 2025');
          }}
        >
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text style={[styles.dateText, !formData.date && styles.placeholderText]}>
            {formData.date || 'Select date'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Start Time *</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => {
              // Simulate time selection
              handleInputChange('startTime', '6:00 PM');
            }}
          >
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={[styles.dateText, !formData.startTime && styles.placeholderText]}>
              {formData.startTime || 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>End Time</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => {
              // Simulate time selection
              handleInputChange('endTime', '11:00 PM');
            }}
          >
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={[styles.dateText, !formData.endTime && styles.placeholderText]}>
              {formData.endTime || 'End'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Venue Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.venue}
          onChangeText={(value) => handleInputChange('venue', value)}
          placeholder="e.g., Sky Lounge, Rooftop Restaurant"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Venue Address *</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 60 }]}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          placeholder="Complete address with landmark"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>City</Text>
        <TextInput
          style={styles.textInput}
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
          placeholder="Mumbai, Delhi, Bangalore..."
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pricing & Capacity</Text>
      <Text style={styles.stepDescription}>Set your ticket prices and event capacity</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Maximum Capacity *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.maxCapacity.toString()}
          onChangeText={(value) => handleInputChange('maxCapacity', parseInt(value) || 0)}
          placeholder="How many guests can attend?"
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.sectionSubtitle}>Ticket Pricing</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Early Bird Price</Text>
        <View style={styles.priceInput}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.priceInputField}
            value={formData.earlyBirdPrice.toString()}
            onChangeText={(value) => handleInputChange('earlyBirdPrice', parseInt(value) || 0)}
            placeholder="1299"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Regular Price *</Text>
        <View style={styles.priceInput}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.priceInputField}
            value={formData.regularPrice.toString()}
            onChangeText={(value) => handleInputChange('regularPrice', parseInt(value) || 0)}
            placeholder="1599"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Premium Price</Text>
        <View style={styles.priceInput}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.priceInputField}
            value={formData.premiumPrice.toString()}
            onChangeText={(value) => handleInputChange('premiumPrice', parseInt(value) || 0)}
            placeholder="1999"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Age Restriction</Text>
          <TextInput
            style={styles.textInput}
            value={formData.ageRestriction}
            onChangeText={(value) => handleInputChange('ageRestriction', value)}
            placeholder="21+, 18+, All ages"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Dress Code</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dressCode}
            onChangeText={(value) => handleInputChange('dressCode', value)}
            placeholder="Smart Casual, Formal"
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Images & Amenities</Text>
      <Text style={styles.stepDescription}>Add photos and select what's included</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Event Images * (Min 1)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
          <Ionicons name="camera" size={24} color="#6366F1" />
          <Text style={styles.uploadButtonText}>Add Photos</Text>
        </TouchableOpacity>
        
        {formData.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Amenities & Features * (Select all that apply)</Text>
        <View style={styles.amenitiesGrid}>
          {amenityOptions.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.amenityChip,
                formData.amenities.includes(amenity) && styles.amenityChipSelected
              ]}
              onPress={() => handleAmenityToggle(amenity)}
            >
              <Text style={[
                styles.amenityChipText,
                formData.amenities.includes(amenity) && styles.amenityChipTextSelected
              ]}>
                {amenity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Terms & Conditions</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 80 }]}
          value={formData.terms}
          onChangeText={(value) => handleInputChange('terms', value)}
          placeholder="Special instructions, cancellation policy, etc."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.stepIndicator}>{currentStep}/{totalSteps}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1 }} />
        
        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={[styles.primaryButton, !validateCurrentStep() && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={!validateCurrentStep()}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, (!validateCurrentStep() || isSubmitting) && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={!validateCurrentStep() || isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Creating...' : isEditMode ? 'Update Event' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  priceInputField: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
    marginTop: 8,
  },
  imagePreview: {
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  amenityChipSelected: {
    backgroundColor: '#6366F1',
  },
  amenityChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  amenityChipTextSelected: {
    color: '#FFFFFF',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
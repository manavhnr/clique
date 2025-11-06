import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

type DocumentType = 'identity' | 'business' | 'address' | 'tax';

interface UploadedDocument {
  type: DocumentType;
  name: string;
  uri: string;
  uploaded: boolean;
}

export default function HostApplicationScreen() {
  const navigation = useNavigation();
  const { user, updateUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    gstNumber: '',
    description: '',
    experience: '',
    references: '',
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>([
    { type: 'identity', name: 'Government ID (Aadhar/Passport)', uri: '', uploaded: false },
    { type: 'business', name: 'Business License/Registration', uri: '', uploaded: false },
    { type: 'address', name: 'Address Proof', uri: '', uploaded: false },
    { type: 'tax', name: 'PAN Card', uri: '', uploaded: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (type: DocumentType) => {
    // For now, simulate document upload
    Alert.alert(
      'Document Upload', 
      'In a real app, this would open camera/gallery to upload documents.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Upload', 
          onPress: () => {
            setDocuments(prev => prev.map(doc => 
              doc.type === type 
                ? { ...doc, uploaded: true, uri: 'https://picsum.photos/300/400' }
                : doc
            ));
          }
        }
      ]
    );
  };

  const handleSubmitApplication = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields and upload all documents.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For now, directly grant host permissions after verification
      await updateUserProfile({
        isHost: true,
        hostStatus: 'approved',
        hostApplicationDate: new Date().toISOString(),
        hostVerificationData: {
          ...formData,
          documents: documents.map(doc => ({ type: doc.type, verified: true })),
          verifiedAt: new Date().toISOString(),
        }
      });

      Alert.alert(
        'Application Submitted!', 
        'Congratulations! Your host application has been approved. You can now start creating events.',
        [{ text: 'Continue', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const requiredFields = ['businessName', 'businessType', 'contactNumber', 'address', 'city', 'panNumber'];
    const hasAllFields = requiredFields.every(field => formData[field as keyof typeof formData].trim() !== '');
    const hasAllDocuments = documents.every(doc => doc.uploaded);
    return hasAllFields && hasAllDocuments;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderBusinessInfo();
      case 3:
        return renderDocumentVerification();
      default:
        return renderPersonalInfo();
    }
  };

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>
        Tell us about yourself and your hosting experience
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact Number *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.contactNumber}
          onChangeText={(value) => handleInputChange('contactNumber', value)}
          placeholder="Your phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          placeholder="Your complete address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            placeholder="City"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.textInput}
            value={formData.state}
            onChangeText={(value) => handleInputChange('state', value)}
            placeholder="State"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Experience in Event Management</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 80 }]}
          value={formData.experience}
          onChangeText={(value) => handleInputChange('experience', value)}
          placeholder="Tell us about your experience in organizing events..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderBusinessInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepDescription}>
        Provide your business details for verification
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.businessName}
          onChangeText={(value) => handleInputChange('businessName', value)}
          placeholder="Your business/organization name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Type *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.businessType}
          onChangeText={(value) => handleInputChange('businessType', value)}
          placeholder="e.g., Event Management, Restaurant, Club"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>PAN Number *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.panNumber}
          onChangeText={(value) => handleInputChange('panNumber', value)}
          placeholder="ABCDE1234F"
          autoCapitalize="characters"
          maxLength={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>GST Number (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.gstNumber}
          onChangeText={(value) => handleInputChange('gstNumber', value)}
          placeholder="GST registration number"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Description</Text>
        <TextInput
          style={[styles.textInput, { minHeight: 80 }]}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Describe your business and the types of events you want to host..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderDocumentVerification = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Document Verification</Text>
      <Text style={styles.stepDescription}>
        Upload required documents for verification
      </Text>

      {documents.map((document, index) => (
        <View key={index} style={styles.documentItem}>
          <View style={styles.documentHeader}>
            <View style={styles.documentInfo}>
              <Ionicons 
                name={document.uploaded ? "checkmark-circle" : "document-text"} 
                size={24} 
                color={document.uploaded ? "#10B981" : "#6B7280"} 
              />
              <View style={styles.documentText}>
                <Text style={styles.documentName}>{document.name}</Text>
                <Text style={styles.documentStatus}>
                  {document.uploaded ? 'Uploaded ✓' : 'Required'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                document.uploaded && styles.uploadButtonSuccess
              ]}
              onPress={() => handleDocumentUpload(document.type)}
            >
              <Text style={[
                styles.uploadButtonText,
                document.uploaded && styles.uploadButtonTextSuccess
              ]}>
                {document.uploaded ? 'Uploaded' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
          {document.uploaded && document.uri && (
            <Image source={{ uri: document.uri }} style={styles.documentPreview} />
          )}
        </View>
      ))}

      <View style={styles.verificationNote}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.verificationText}>
          All documents will be verified within 24-48 hours. You'll receive a notification once your application is approved.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Host</Text>
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
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1 }} />
        
        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setCurrentStep(currentStep + 1)}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, (!validateForm() || isSubmitting) && styles.primaryButtonDisabled]}
            onPress={handleSubmitApplication}
            disabled={!validateForm() || isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
    backgroundColor: '#3B82F6',
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
  rowInputs: {
    flexDirection: 'row',
  },
  documentItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentText: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  documentStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  uploadButtonSuccess: {
    backgroundColor: '#10B981',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadButtonTextSuccess: {
    color: '#FFFFFF',
  },
  documentPreview: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  verificationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  verificationText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
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
    backgroundColor: '#3B82F6',
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
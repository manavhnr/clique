import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

// Sample event pricing data
const getEventBookingInfo = (eventId: string) => {
  const events = {
    '1': {
      title: 'Summer Music Festival',
      date: 'July 25, 2025',
      time: '6:00 PM',
      location: 'Phoenix Mall, Mumbai',
      tickets: [
        { id: 'general', name: 'General Admission', price: 299, description: 'Standing area access' },
        { id: 'vip', name: 'VIP Package', price: 599, description: 'Premium seating + backstage access' },
        { id: 'premium', name: 'Premium Experience', price: 899, description: 'VIP + Meet & Greet + Merchandise' },
      ],
    },
    '2': {
      title: 'Tech Conference 2025',
      date: 'August 15, 2025',
      time: '9:00 AM',
      location: 'World Trade Center, Bangalore',
      tickets: [
        { id: 'student', name: 'Student Pass', price: 299, description: 'Valid student ID required' },
        { id: 'professional', name: 'Professional Pass', price: 599, description: 'Includes lunch and materials' },
        { id: 'enterprise', name: 'Enterprise Pass', price: 999, description: 'Professional + Networking dinner' },
      ],
    },
  };
  
  return events[eventId as keyof typeof events] || events['1'];
};

export default function BookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { eventId } = route.params || { eventId: '1' };
  
  const event = getEventBookingInfo(eventId);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedTicketInfo = event.tickets.find(ticket => ticket.id === selectedTicket);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedTicket) {
      Alert.alert('Select Ticket', 'Please select a ticket type to continue.');
      return;
    }

    const total = selectedTicketInfo!.price * quantity;
    Alert.alert(
      'Booking Confirmation',
      `You are about to book ${quantity} x ${selectedTicketInfo!.name} ticket(s) for ₹${total}. This would redirect to payment gateway in a real app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Booking', 
          onPress: () => {
            Alert.alert('Success!', 'Your booking has been confirmed! A confirmation email has been sent.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Summary */}
        <View style={styles.eventSummary}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.eventDetailText}>{event.date}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.eventDetailText}>{event.time}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.eventDetailText}>{event.location}</Text>
            </View>
          </View>
        </View>

        {/* Ticket Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Ticket Type</Text>
          {event.tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={[
                styles.ticketCard,
                selectedTicket === ticket.id && styles.ticketCardSelected,
              ]}
              onPress={() => setSelectedTicket(ticket.id)}
              activeOpacity={0.7}
            >
              <View style={styles.ticketInfo}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketName}>{ticket.name}</Text>
                  <Text style={styles.ticketPrice}>₹{ticket.price}</Text>
                </View>
                <Text style={styles.ticketDescription}>{ticket.description}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedTicket === ticket.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity Selection */}
        {selectedTicket && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={quantity <= 1 ? '#D1D5DB' : '#6B7280'} 
                />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={quantity >= 10 ? '#D1D5DB' : '#6B7280'} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.quantityNote}>Maximum 10 tickets per booking</Text>
          </View>
        )}

        {/* Booking Summary */}
        {selectedTicket && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ticket Type</Text>
                <Text style={styles.summaryValue}>{selectedTicketInfo!.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryValue}>{quantity}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price per ticket</Text>
                <Text style={styles.summaryValue}>₹{selectedTicketInfo!.price}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Total Amount</Text>
                <Text style={styles.summaryTotalValue}>₹{selectedTicketInfo!.price * quantity}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.termsContainer}>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.termText}>Tickets are non-refundable</Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.termText}>Valid ID required at entry</Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.termText}>Event timing may vary</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Section */}
      {selectedTicket && (
        <View style={styles.paymentContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{selectedTicketInfo!.price * quantity}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleProceedToPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
            <Ionicons name="card" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  eventSummary: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#F8FAFF',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  ticketDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 24,
  },
  quantityNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  termsContainer: {
    gap: 8,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  paymentButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
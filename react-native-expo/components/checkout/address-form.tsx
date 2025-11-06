import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { HttpTypes } from '@medusajs/types';
import { Picker } from '@react-native-picker/picker';
import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddressFormProps {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  countries: HttpTypes.StoreRegionCountry[];
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export function AddressForm({
  firstName,
  lastName,
  address,
  city,
  postalCode,
  countryCode,
  phone,
  countries,
  onFirstNameChange,
  onLastNameChange,
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  onCountryCodeChange,
  onPhoneChange,
}: AddressFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showPicker, setShowPicker] = useState(false);
  const [tempCountryCode, setTempCountryCode] = useState(countryCode);

  // Create refs for each input field
  const lastNameRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const postalCodeRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const selectedCountry = countries.find(
    (c) => (c.iso_2 || c.id) === countryCode
  );
  const selectedCountryName = selectedCountry
    ? selectedCountry.display_name || selectedCountry.name || selectedCountry.iso_2 || selectedCountry.id
    : 'Select Country';

  const handleDone = () => {
    onCountryCodeChange(tempCountryCode);
    setShowPicker(false);
    // Focus phone field after country selection
    setTimeout(() => phoneRef.current?.focus(), 100);
  };

  const handleCancel = () => {
    setTempCountryCode(countryCode);
    setShowPicker(false);
  };

  return (
    <>
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            styles.halfInput,
            { color: colors.text, borderColor: colors.icon + '30' },
          ]}
          placeholder="First Name"
          placeholderTextColor={colors.icon}
          value={firstName}
          onChangeText={onFirstNameChange}
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
        />
        <TextInput
          ref={lastNameRef}
          style={[
            styles.input,
            styles.halfInput,
            { color: colors.text, borderColor: colors.icon + '30' },
          ]}
          placeholder="Last Name"
          placeholderTextColor={colors.icon}
          value={lastName}
          onChangeText={onLastNameChange}
          returnKeyType="next"
          onSubmitEditing={() => addressRef.current?.focus()}
        />
      </View>

      <TextInput
        ref={addressRef}
        style={[styles.input, { color: colors.text, borderColor: colors.icon + '30' }]}
        placeholder="Address"
        placeholderTextColor={colors.icon}
        value={address}
        onChangeText={onAddressChange}
        returnKeyType="next"
        onSubmitEditing={() => cityRef.current?.focus()}
      />

      <View style={styles.row}>
        <TextInput
          ref={cityRef}
          style={[
            styles.input,
            styles.halfInput,
            { color: colors.text, borderColor: colors.icon + '30' },
          ]}
          placeholder="City"
          placeholderTextColor={colors.icon}
          value={city}
          onChangeText={onCityChange}
          returnKeyType="next"
          onSubmitEditing={() => postalCodeRef.current?.focus()}
        />
          <TextInput
            ref={postalCodeRef}
            style={[
              styles.input,
              styles.halfInput,
              { color: colors.text, borderColor: colors.icon + '30' },
            ]}
            placeholder="Postal Code"
            placeholderTextColor={colors.icon}
            value={postalCode}
            onChangeText={onPostalCodeChange}
            returnKeyType="next"
            onSubmitEditing={() => {
              setTempCountryCode(countryCode);
              setShowPicker(true);
            }}
          />
      </View>

      <TouchableOpacity
        style={[
          styles.input,
          styles.pickerButton,
          { borderColor: colors.icon + '30' },
        ]}
        onPress={() => {
          setTempCountryCode(countryCode);
          setShowPicker(true);
        }}
      >
        <Text style={[styles.pickerButtonText, { color: countryCode ? colors.text : colors.icon }]}>
          {selectedCountryName}
        </Text>
        <IconSymbol size={20} name="chevron.down" color={colors.icon} />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.icon + '30' }]}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={[styles.modalButton, { color: colors.tint }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
              <TouchableOpacity onPress={handleDone}>
                <Text style={[styles.modalButton, { color: colors.tint }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={tempCountryCode}
              onValueChange={(value) => {
                setTempCountryCode(value);
                if (Platform.OS === 'android') {
                  onCountryCodeChange(value);
                  setShowPicker(false);
                  // Focus phone field after country selection on Android
                  setTimeout(() => phoneRef.current?.focus(), 100);
                }
              }}
              style={[styles.picker, Platform.OS === 'android' && { color: colors.text }]}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
            >
              <Picker.Item label="Select Country" value="" enabled={false} />
              {countries.map((country) => {
                const code = country.iso_2 || country.id;
                const name = country.display_name || country.name || country.iso_2 || country.id;
                return <Picker.Item key={code} label={name} value={code} />;
              })}
            </Picker>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <TextInput
        ref={phoneRef}
        style={[styles.input, { color: colors.text, borderColor: colors.icon + '30' }]}
        placeholder="Phone Number"
        placeholderTextColor={colors.icon}
        value={phone}
        onChangeText={onPhoneChange}
        keyboardType="phone-pad"
        returnKeyType="done"
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 250 : 48,
  },
  pickerItemIOS: {
    height: 200,
  },
});


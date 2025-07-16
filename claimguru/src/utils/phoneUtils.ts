/**
 * Phone number formatting utility functions
 * Formats phone numbers in real-time as the user types
 */

/**
 * Formats a phone number string to (***) ***-**** format
 * @param value - Raw phone number input
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // Apply formatting based on length
  if (cleaned.length === 0) {
    return '';
  } else if (cleaned.length <= 3) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

/**
 * Removes formatting from a phone number to get clean digits
 * @param formattedValue - Formatted phone number string
 * @returns Clean numeric string
 */
export const cleanPhoneNumber = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

/**
 * Validates if a phone number is complete (10 digits)
 * @param value - Phone number string (formatted or unformatted)
 * @returns Boolean indicating if phone number is valid
 */
export const isValidPhoneNumber = (value: string): boolean => {
  const cleaned = cleanPhoneNumber(value);
  return cleaned.length === 10;
};

/**
 * Handles phone number input change with formatting
 * @param event - Input change event or string value
 * @param callback - Function to call with the formatted value
 */
export const handlePhoneNumberInput = (
  event: React.ChangeEvent<HTMLInputElement> | string,
  callback: (formattedValue: string) => void
): void => {
  const value = typeof event === 'string' ? event : event.target.value;
  const formatted = formatPhoneNumber(value);
  callback(formatted);
};

/**
 * Phone number input props for consistent behavior
 */
export const getPhoneInputProps = () => ({
  type: 'tel' as const,
  placeholder: '(555) 123-4567',
  maxLength: 14, // Length of formatted phone number
});
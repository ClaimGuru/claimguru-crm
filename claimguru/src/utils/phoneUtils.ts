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
 * Formats a phone extension
 * @param value - Raw extension input
 * @returns Formatted extension string
 */
export const formatPhoneExtension = (value: string): string => {
  // Remove all non-numeric characters and limit to reasonable length
  const cleaned = value.replace(/\D/g, '').slice(0, 6);
  return cleaned;
};

/**
 * Validates if a phone extension is valid (1-6 digits)
 * @param value - Extension string
 * @returns Boolean indicating if extension is valid
 */
export const isValidPhoneExtension = (value: string): boolean => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length >= 1 && cleaned.length <= 6;
};

/**
 * Phone number input props for consistent behavior
 */
export const getPhoneInputProps = () => ({
  type: 'tel' as const,
  placeholder: '(555) 123-4567',
  maxLength: 14, // Length of formatted phone number
});

/**
 * Phone extension input props for consistent behavior
 */
export const getPhoneExtensionInputProps = () => ({
  type: 'tel' as const,
  placeholder: 'Ext.',
  maxLength: 6,
});

/**
 * Combines phone number and extension into a display format
 * @param phoneNumber - Formatted phone number
 * @param extension - Phone extension
 * @returns Combined phone number with extension
 */
export const combinePhoneWithExtension = (phoneNumber: string, extension: string): string => {
  if (!phoneNumber) return '';
  if (!extension) return phoneNumber;
  return `${phoneNumber} ext. ${extension}`;
};
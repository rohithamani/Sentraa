export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  const passwordValidation = { isValid: !!password, errors: password ? [] : ['Password is required'] };
  
  const allErrors = [...emailValidation.errors, ...passwordValidation.errors];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

export const validateSignupForm = (
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
  
  const allErrors = [
    ...emailValidation.errors,
    ...passwordValidation.errors,
    ...confirmPasswordValidation.errors,
  ];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
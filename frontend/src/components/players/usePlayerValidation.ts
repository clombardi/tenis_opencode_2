import { useState, useCallback, useMemo } from 'react';
import type { CreatePlayerDto } from '../../services/api';

export type ValidatableField = keyof CreatePlayerDto;

export interface ValidationErrors extends Partial<Record<keyof CreatePlayerDto, string>> {}

interface UsePlayerValidationReturn {
  errors: ValidationErrors;
  submitted: boolean;
  validateField: (field: ValidatableField, value: string) => void;
  validateAll: (data: CreatePlayerDto) => boolean;
  errorTextToShow: (field: ValidatableField) => string | undefined;
  shouldDisableSave: () => boolean;
  reset: () => void;
}

const NAME_REGEX = /^[\p{L}\s\-áéíóúàèìòùñÑçÇüÜöÖäÄëËïÏöÖÿŸ]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const MAX_NAME_LENGTH = 80;
const MIN_DOCUMENTO_LENGTH = 5;

function calculateAge(birthDate: string): number | null {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function validateFieldValue(field: ValidatableField, value: string): string | undefined {
  switch (field) {
    case 'firstName':
    case 'lastName':
      if (!value.trim()) return 'El campo es obligatorio';
      if (value.length > MAX_NAME_LENGTH) return `Máximo ${MAX_NAME_LENGTH} caracteres`;
      if (!NAME_REGEX.test(value)) return 'Caracteres inválidos';
      return undefined;
    case 'email':
      if (!value.trim()) return 'El campo es obligatorio';
      if (!EMAIL_REGEX.test(value)) return 'Email inválido';
      return undefined;
    case 'documento':
      if (!value.trim()) return 'El campo es obligatorio';
      if (value.length < MIN_DOCUMENTO_LENGTH) return `Mínimo ${MIN_DOCUMENTO_LENGTH} caracteres`;
      if (!/^\d+$/.test(value)) return 'Solo números';
      return undefined;
    case 'birthDate':
      if (!value) return 'El campo es obligatorio';
      const age = calculateAge(value);
      if (age === null) return 'Fecha inválida';
      if (age < 8) return 'El jugador debe tener al menos 8 años';
      if (age > 120) return 'La edad no puede exceder 120 años';
      return undefined;
    case 'gender':
    case 'mano':
    case 'country':
      return undefined;
  }
}

export function usePlayerValidation(): UsePlayerValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<ValidatableField>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const validateField = useCallback((field: ValidatableField, value: string) => {
    const error = validateFieldValue(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    setTouched(prev => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const validateAll = useCallback((data: CreatePlayerDto): boolean => {
    const newErrors: ValidationErrors = {};
    const fields: ValidatableField[] = ['firstName', 'lastName', 'email', 'documento', 'birthDate', 'gender', 'mano', 'country'];
    
    fields.forEach(field => {
      const value = data[field as keyof CreatePlayerDto];
      if (typeof value === 'string') {
        const error = validateFieldValue(field, value);
        if (error) newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    setTouched(new Set(fields));
    setSubmitted(true);
    return Object.keys(newErrors).length === 0;
  }, []);

  const errorTextToShow = useCallback((field: ValidatableField): string | undefined => {
    const showError = touched.has(field) || submitted;
    return showError ? errors[field] : undefined;
  }, [errors, touched, submitted]);

  const shouldDisableSave = useMemo(() => {
    return () => submitted && Object.keys(errors).length > 0;
  }, [errors, submitted]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
  }, []);

  return { errors, submitted, validateField, validateAll, errorTextToShow, shouldDisableSave, reset };
}
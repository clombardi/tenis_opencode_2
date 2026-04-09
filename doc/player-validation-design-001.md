# Diseño: usePlayerValidation Hook

## 1. Archivo: `usePlayerValidation.ts`

```typescript
import { useState, useCallback } from 'react';

export interface PlayerFormData {
  firstName: string;
  lastName: string;
  email: string;
  documento: string;
  birthDate: string;
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  documento?: string;
  birthDate?: string;
}

interface UsePlayerValidationReturn {
  errors: ValidationErrors;
  touched: Set<string>;
  submitted: boolean;
  validateField: (field: keyof PlayerFormData, value: string) => void;
  validateAll: (data: PlayerFormData) => boolean;
  reset: () => void;
}

// Regex: letras unicode, espacios, guiones, acentos, diéresis, cedilla, ñ
const NAME_REGEX = /^[\p{L}\s\-ñÑçÇüÜöÖäÄëËïÏöÖÿŸ]+$/u;
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

function validateFieldValue(field: keyof PlayerFormData, value: string): string | undefined {
  switch (field) {
    case 'firstName':
    case 'lastName':
      if (!value.trim()) return 'El campo es obligatorio';
      if (value.length > MAX_NAME_LENGTH) return `Máximo ${MAX_NAME_LENGTH} caracteres`;
      if (!NAME_REGEX.test(value)) return 'Caracteres inválidos';
      return undefined;
    case 'email':
      if (!value.trim()) return 'El campo es obligatorio';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
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
  }
}

export function usePlayerValidation(): UsePlayerValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const validateField = useCallback((field: keyof PlayerFormData, value: string) => {
    const error = validateFieldValue(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    setTouched(prev => new Set(prev).add(field));
  }, []);

  const validateAll = useCallback((data: PlayerFormData): boolean => {
    const newErrors: ValidationErrors = {};
    const fields: (keyof PlayerFormData)[] = ['firstName', 'lastName', 'email', 'documento', 'birthDate'];
    fields.forEach(field => {
      const error = validateFieldValue(field, data[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    setTouched(new Set(fields));
    setSubmitted(true);
    return Object.keys(newErrors).length === 0;
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
  }, []);

  return { errors, touched, submitted, validateField, validateAll, reset };
}
```

---

## 2. Modificaciones en `PlayerForm.tsx`

### Imports agregar
```typescript
import { usePlayerValidation, type PlayerFormData } from './usePlayerValidation';
```

### Estado a agregar
```typescript
const { errors, touched, submitted, validateField, validateAll, reset } = usePlayerValidation();
```

### Modificar `handleChange`
```typescript
const handleChange = (field: keyof CreatePlayerDto, value: unknown) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Validar campos relevantes
  if (['firstName', 'lastName', 'email', 'documento', 'birthDate'].includes(field)) {
    validateField(field as keyof PlayerFormData, String(value));
  }
};
```

### Modificar `handleSubmit`
```typescript
const handleSubmit = async () => {
  const data: PlayerFormData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    documento: formData.documento || '',
    birthDate: formData.birthDate,
  };
  
  if (!validateAll(data)) {
    return;
  }
  
  // ... resto del código existente
};
```

### Modificar `useEffect` de reset
```typescript
useEffect(() => {
  if (open) reset();
  // ... resto del código
}, [open]);
```

### En cada TextField, agregar props de error
```typescript
// Ejemplo para firstName
<TextField
  label="Nombre"
  value={formData.firstName}
  onChange={(e) => handleChange('firstName', e.target.value)}
  fullWidth
  required
  error={!!(touched.has('firstName') || submitted) && !!errors.firstName}
  helperText={(touched.has('firstName') || submitted) && errors.firstName}
/>
```

Hacer lo mismo para: lastName, email, documento, birthDate

### En botón Guardar, modificar disabled
```typescript
disabled={saving || (submitted && Object.keys(errors).length > 0)}
```

---

## 3. Resumen de comportamiento

| Escenario | Errores mostrados |
|-----------|-------------------|
| Usuario escribe en campo por primera vez | NO (solo se marca como touched) |
| Usuario modifica campo luego de primer error | SI |
| Usuario intenta submit sin completar | SI todos los obligatorios |
| Modo edición - usuario cambia valor | SI al hacer submit |

## 4. Validaciones implementadas

| Campo | Regla | Mensaje |
|-------|-------|---------|
| firstName | Obligatorio, máx 80chars, regex `\p{L}` | "El campo es obligatorio" / "Máximo 80 caracteres" / "Caracteres inválidos" |
| lastName | Obligatorio, máx 80chars, regex `\p{L}` | Mismos que firstName |
| email | Obligatorio, formato válido | "El campo es obligatorio" / "Email inválido" |
| documento | Obligatorio, mín 5 chars, solo números | "El campo es obligatorio" / "Mínimo 5 caracteres" / "Solo números" |
| birthDate | Obligatorio, entre 8 y 120 años | "El campo es obligatorio" / "El jugador debe tener al menos 8 años" / "La edad no puede exceder 120 años" |

## 5. Notas adicionales

- El archivo `usePlayerValidation.ts` debe crearse en `frontend/src/components/players/`.
- En modo edición, el campo email está disabled, por lo que no se validará en tiempo real pero sí se validará al hacer submit.
- La lógica de validación de fecha usa la fecha actual del cliente, lo cual es adecuado para el contexto de un formulario frontend.
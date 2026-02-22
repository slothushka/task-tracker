import { Request, Response, NextFunction } from 'express';

type ValidatorFn = (value: unknown) => string | null;

interface FieldRule {
  required?: boolean;
  validator?: ValidatorFn;
}

const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);

// ── Reusable validation rules ──────────────────────────────────────────────
export const rules = {
  name: (): FieldRule => ({
    required: true,
    validator: (v) => {
      if (typeof v !== 'string' || v.trim().length < 2) return 'Name must be at least 2 characters';
      if (v.trim().length > 100) return 'Name cannot exceed 100 characters';
      return null;
    },
  }),
  email: (): FieldRule => ({
    required: true,
    validator: (v) => {
      if (typeof v !== 'string' || !isValidEmail(v)) return 'Please provide a valid email address';
      return null;
    },
  }),
  password: (): FieldRule => ({
    required: true,
    validator: (v) => {
      if (typeof v !== 'string' || v.length < 6) return 'Password must be at least 6 characters';
      return null;
    },
  }),
  title: (): FieldRule => ({
    required: true,
    validator: (v) => {
      if (typeof v !== 'string' || v.trim().length === 0) return 'Title is required';
      if (v.trim().length > 200) return 'Title cannot exceed 200 characters';
      return null;
    },
  }),
  status: (): FieldRule => ({
    required: false,
    validator: (v) => {
      if (v !== undefined && !['pending', 'completed'].includes(v as string)) {
        return 'Status must be pending or completed';
      }
      return null;
    },
  }),
};

export const validate =
  (schema: Record<string, FieldRule>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(schema)) {
      const value = req.body[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null && rule.validator) {
        const error = rule.validator(value);
        if (error) errors.push(error);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, message: errors.join('. ') });
      return;
    }

    next();
  };

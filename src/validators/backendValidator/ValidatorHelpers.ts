import * as yup from "yup";

interface StringValidatorParams {
  nullable?: boolean;
  equalsTo?: string;
}

export enum ErrorType {
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export class ValidatorError extends Error {
  public type: ErrorType;
  constructor({ message, type }: { message: string; type?: ErrorType }) {
    super(message);
    this.type = type ?? ErrorType.WARNING;
  }
  public mapError = () => {
    return {
      type: this.type,
      message: this.message,
    };
  };
}

export interface ModelValidator {
  validate(...args: any[]): ValidatorError[];
}

export class StringValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: StringValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema;
      if (params?.nullable) {
        schema = yup.string().label(label).nullable().defined();
      } else {
        schema = yup.string().label(label).required();
      }
      schema.validateSync(value, { strict: true });
      if (params?.equalsTo) {
        if (params.equalsTo !== value) {
          return new ValidatorError({
            type: ErrorType.WARNING,
            message: `${label} has to be equal to "${params.equalsTo}", but the provided value was: "${value}"`,
          });
        }
      }
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

export class NullValidator {
  public static validate = (
    label: string,
    value: unknown
  ): Nullable<ValidatorError> => {
    if (value !== null) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: `${label} must be a \`null\` type, but the final value was: \`${value}\``,
      });
    }
    return null;
  };
}

interface NumberValidatorParams {
  nullable?: boolean;
  integer?: boolean;
  equalsTo?: number;
}

export class NumberValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: NumberValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema = yup.number().label(label);
      if (params?.integer) {
        schema = schema.integer();
      }
      if (params?.nullable) {
        // @ts-ignore
        schema = schema.nullable().defined();
      } else {
        schema = schema.required();
      }
      schema.validateSync(value, { strict: true });
      if (params?.equalsTo) {
        if (params.equalsTo !== value) {
          return new ValidatorError({
            type: ErrorType.WARNING,
            message: `${label} has to be equal to ${params.equalsTo}, but the provided value was: ${value}`,
          });
        }
      }
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

export class BooleanValidator {
  public static validate = (
    label: string,
    value: unknown
  ): Nullable<ValidatorError> => {
    try {
      const schema = yup.boolean().label(label).required();
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

interface EnumValidatorParams {
  nullable?: boolean;
}

export class EnumValidator {
  public static validate = (
    label: string,
    value: unknown,
    values: Array<string>,
    params?: EnumValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema;
      if (params?.nullable) {
        schema = yup.mixed().label(label).nullable().defined();
      } else {
        schema = yup.mixed().label(label).oneOf(values).required();
      }
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

interface GeneralArrayValidatorParams {
  min?: number;
  max?: number;
}

export class EnumArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    values: Array<string>,
    params?: GeneralArrayValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema = yup.array(yup.mixed().oneOf(values)).label(label).required();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

interface RegExpValidatorParams {
  nullable?: boolean;
  isNull?: boolean;
}

export class RegExpValidator {
  public static validate = (
    label: string,
    value: unknown,
    regexp: RegExp,
    params?: RegExpValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema;
      if (params?.isNull) {
        schema = yup.string().label(label).nullable().defined();
      } else if (params?.nullable) {
        schema = yup.string().label(label).matches(regexp).nullable().defined();
      } else {
        schema = yup.string().label(label).matches(regexp).required();
      }
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

export class RegExpArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    regexp: RegExp,
    params?: GeneralArrayValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema = yup
        .array(yup.string().matches(regexp))
        .label(label)
        .required();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        if (err.path.length > 1) {
          const errorMessage = `${label}${err.errors.join()}`;
          return new ValidatorError({
            type: ErrorType.WARNING,
            message: errorMessage,
          });
        }
      }
      const errorMessage = `${err.errors.join()}`;
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: errorMessage,
      });
    }
  };
}

interface ArrayValidatorParams extends GeneralArrayValidatorParams {
  empty?: boolean;
}

export class ArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: ArrayValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema = yup.array();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema = schema.label(label).required();
      schema.validateSync(value, { strict: true });
      if (params.empty) {
        if (Array.isArray(value) && value.length !== 0) {
          return new ValidatorError({
            type: ErrorType.WARNING,
            message: `${label} must be an empty array, but it contains: \`${value.length}\` elements.`,
          });
        }
      }
      return null;
    } catch (err) {
      if (err instanceof ValidatorError) {
        return err;
      }
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}
export class StringArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: GeneralArrayValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let schema = yup.array(yup.string().required()).label(label).required();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

interface NumberArrayValidatorParams extends GeneralArrayValidatorParams {
  integer?: boolean;
}
export class NumberArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: NumberArrayValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      let numberSchema = yup.number().required();
      if (params?.integer) {
        numberSchema = numberSchema.integer();
      }
      let schema = yup.array(numberSchema).label(label).required();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema.validateSync(value, { strict: true });
      return null;
    } catch (err) {
      return new ValidatorError({
        type: ErrorType.WARNING,
        message: err.errors,
      });
    }
  };
}

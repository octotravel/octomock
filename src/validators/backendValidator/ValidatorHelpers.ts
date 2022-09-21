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

class BaseValidator {
  protected static handleValidatedError = (error: any) => {
    if (error instanceof yup.ValidationError) {
      if (error.type === "required" || error.type === "typeError") {
        return new ValidatorError({
          type: ErrorType.CRITICAL,
          message: error.errors as any,
        });
      }
    }
    return new ValidatorError({
      type: ErrorType.WARNING,
      message: error.errors,
    });
  };
}

export class StringValidator extends BaseValidator {
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
      return this.handleValidatedError(err);
    }
  };
}

export class NullValidator extends BaseValidator {
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
  errorType?: ErrorType;
}

export class NumberValidator extends BaseValidator {
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
            type: params.errorType ?? ErrorType.WARNING,
            message: `${label} has to be equal to ${params.equalsTo}, but the provided value was: ${value}`,
          });
        }
      }
    } catch (err) {
      return this.handleValidatedError(err);
    }
  };
}

interface BooleanValidatorParams {
  equalsTo?: boolean;
  errorType?: ErrorType;
}

export class BooleanValidator extends BaseValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: BooleanValidatorParams
  ): Nullable<ValidatorError> => {
    try {
      const schema = yup.boolean().label(label).required();
      schema.validateSync(value, { strict: true });
      if (params?.equalsTo) {
        if (params.equalsTo !== value) {
          return new ValidatorError({
            type: params.errorType ?? ErrorType.WARNING,
            message: `${label} has to be equal to ${params.equalsTo}, but the provided value was: ${value}`,
          });
        }
      }
      return null;
    } catch (err) {
      return this.handleValidatedError(err);
    }
  };
}

interface EnumValidatorParams {
  nullable?: boolean;
  equalsTo?: boolean;
  errorType?: ErrorType;
}

export class EnumValidator extends BaseValidator {
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
      if (params?.equalsTo) {
        if (params.equalsTo !== value) {
          return new ValidatorError({
            type: params.errorType ?? ErrorType.WARNING,
            message: `${label} has to be equal to ${params.equalsTo}, but the provided value was: ${value}`,
          });
        }
      }
      return null;
    } catch (err) {
      return this.handleValidatedError(err);
    }
  };
}

interface GeneralArrayValidatorParams {
  min?: number;
  max?: number;
}

export class EnumArrayValidator extends BaseValidator {
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
      return this.handleValidatedError(err);
    }
  };
}

interface RegExpValidatorParams {
  nullable?: boolean;
  isNull?: boolean;
}

export class RegExpValidator extends BaseValidator {
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
      return this.handleValidatedError(err);
    }
  };
}

export class RegExpArrayValidator extends BaseValidator {
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

      return this.handleValidatedError(err);
    }
  };
}

interface ArrayValidatorParams extends GeneralArrayValidatorParams {
  empty?: boolean;
}

export class ArrayValidator extends BaseValidator {
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
      return this.handleValidatedError(err);
    }
  };
}
export class StringArrayValidator extends BaseValidator {
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
      return this.handleValidatedError(err);
    }
  };
}

interface NumberArrayValidatorParams extends GeneralArrayValidatorParams {
  integer?: boolean;
}
export class NumberArrayValidator extends BaseValidator {
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
      return this.handleValidatedError(err);
    }
  };
}

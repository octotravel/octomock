import * as yup from "yup";

interface StringValidatorParams {
  nullable?: boolean;
}

export class ValidatorError extends Error {}

export class StringValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: StringValidatorParams
  ): boolean => {
    try {
      let schema;
      if (params?.nullable) {
        schema = yup.string().label(label).nullable().defined();
      } else {
        schema = yup.string().label(label).required();
      }
      schema.validateSync(value, { strict: true });
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
    }
  };
}

export class NullValidator {
  public static validate = (label: string, value: unknown): boolean => {
    if (value !== null) {
      throw new ValidatorError(
        `${label} must be a \`null\` type, but the final value was: \`${value}\``
      );
    }
    return true;
  };
}

interface NumberValidatorParams {
  nullable?: boolean;
  integer?: boolean;
}

export class NumberValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: NumberValidatorParams
  ): boolean => {
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
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
    }
  };
}

export class BooleanValidator {
  public static validate = (label: string, value: unknown): boolean => {
    try {
      const schema = yup.boolean().label(label).required();
      schema.validateSync(value, { strict: true });
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
    }
  };
}

export class EnumValidator {
  public static validate = (
    label: string,
    value: unknown,
    values: Array<string>
  ): boolean => {
    try {
      const schema = yup.mixed().label(label).oneOf(values).required();
      schema.validateSync(value, { strict: true });
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
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
  ): boolean => {
    try {
      let schema = yup.array(yup.mixed().oneOf(values)).label(label).required();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema.validateSync(value, { strict: true });
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
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
  ): boolean => {
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
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
    }
  };
}

export class RegExpArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    regexp: RegExp,
    params?: GeneralArrayValidatorParams
  ): boolean => {
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
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        if (err.path.length > 1) {
          const errorMessage = `${label}${err.errors.join()}`;
          throw new ValidatorError(errorMessage);
        }
      }
      throw new ValidatorError(err.errors);
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
  ): boolean => {
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
          throw new ValidatorError(
            `${label} must be an empty array, but it contains: \`${value.length}\` elements.`
          );
        }
      }
      return true;
    } catch (err) {
      if (err instanceof ValidatorError) {
        throw err;
      }
      throw new ValidatorError(err.errors);
    }
  };
}
export class StringArrayValidator {
  public static validate = (
    label: string,
    value: unknown,
    params?: GeneralArrayValidatorParams
  ): boolean => {
    try {
      let schema = yup.array(yup.string().required()).label(label).required();
      if (params?.min) {
        schema = schema.min(params.min);
      }
      if (params?.max) {
        schema = schema.max(params.max);
      }
      schema.validateSync(value, { strict: true });
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
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
  ): boolean => {
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
      return true;
    } catch (err) {
      throw new ValidatorError(err.errors);
    }
  };
}

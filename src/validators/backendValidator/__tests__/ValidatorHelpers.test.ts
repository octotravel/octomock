import {
  StringArrayValidator,
  NumberValidator,
  NumberArrayValidator,
  NullValidator,
  ArrayValidator,
} from "./../ValidatorHelpers";
import {
  StringValidator,
  ValidatorError,
  BooleanValidator,
  EnumValidator,
  EnumArrayValidator,
  RegExpArrayValidator,
} from "../ValidatorHelpers";

describe("ValidatorHelpers", () => {
  describe("StringValidator", () => {
    it("should validate string", () => {
      expect(() => StringValidator.validate("id", 123)).toThrow(ValidatorError);
      expect(() => StringValidator.validate("id", {})).toThrow(ValidatorError);
      expect(() => StringValidator.validate("id", undefined)).toThrow(
        ValidatorError
      );
      expect(StringValidator.validate("id", "123")).toBe(true);
    });
    it("should validate nullable string", () => {
      expect(() =>
        StringValidator.validate("id", 123, { nullable: true })
      ).toThrow(ValidatorError);
      expect(() =>
        StringValidator.validate("id", {}, { nullable: true })
      ).toThrow(ValidatorError);
      expect(() =>
        StringValidator.validate("id", undefined, { nullable: true })
      ).toThrow(ValidatorError);
      expect(StringValidator.validate("id", null, { nullable: true })).toBe(
        true
      );
    });
  });
  describe("NullValidator", () => {
    it("should validate null", () => {
      expect(() => NullValidator.validate("id", 123)).toThrow(ValidatorError);
      expect(() => NullValidator.validate("id", {})).toThrow(ValidatorError);
      expect(() => NullValidator.validate("id", undefined)).toThrow(
        ValidatorError
      );
      expect(NullValidator.validate("id", null)).toBe(true);
    });
    it("should validate nullable string", () => {
      expect(() =>
        StringValidator.validate("id", 123, { nullable: true })
      ).toThrow(ValidatorError);
      expect(() =>
        StringValidator.validate("id", {}, { nullable: true })
      ).toThrow(ValidatorError);
      expect(() =>
        StringValidator.validate("id", undefined, { nullable: true })
      ).toThrow(ValidatorError);
      expect(StringValidator.validate("id", null, { nullable: true })).toBe(
        true
      );
    });
  });
  describe("BooleanValidator", () => {
    it("should validate boolean", () => {
      expect(() => BooleanValidator.validate("isAvailable", 123)).toThrow(
        ValidatorError
      );
      expect(() => BooleanValidator.validate("isAvailable", {})).toThrow(
        ValidatorError
      );
      expect(() => BooleanValidator.validate("isAvailable", undefined)).toThrow(
        ValidatorError
      );
      expect(BooleanValidator.validate("isAvailable", true)).toBe(true);
      expect(BooleanValidator.validate("isAvailable", false)).toBe(true);
    });
  });
  describe("EnumValidator", () => {
    const availabilityTypes = ["START_TIMES", "OPENING_HOURS"];
    it("should validate enum", () => {
      expect(() =>
        EnumValidator.validate(
          "availabilityType",
          "start_times",
          availabilityTypes
        )
      ).toThrow(ValidatorError);
      expect(() =>
        EnumValidator.validate("availabilityType", 123, availabilityTypes)
      ).toThrow(ValidatorError);
      expect(() =>
        EnumValidator.validate("availabilityType", {}, availabilityTypes)
      ).toThrow(ValidatorError);
      expect(() =>
        EnumValidator.validate("availabilityType", undefined, availabilityTypes)
      ).toThrow(ValidatorError);
      expect(
        EnumValidator.validate(
          "availabilityType",
          "START_TIMES",
          availabilityTypes
        )
      ).toBe(true);
      expect(
        EnumValidator.validate(
          "availabilityType",
          "OPENING_HOURS",
          availabilityTypes
        )
      ).toBe(true);
    });
  });
  describe("EnumArrayValidator", () => {
    const deliveryFormats = ["PDF_URL", "QRCODE"];
    it("should validate enum array", () => {
      expect(() =>
        EnumArrayValidator.validate("formats", "start_times", deliveryFormats)
      ).toThrow(ValidatorError);
      expect(() =>
        EnumArrayValidator.validate("formats", 123, deliveryFormats)
      ).toThrow(ValidatorError);
      expect(() =>
        EnumArrayValidator.validate("formats", {}, deliveryFormats)
      ).toThrow(ValidatorError);
      expect(() =>
        EnumArrayValidator.validate("formats", undefined, deliveryFormats)
      ).toThrow(ValidatorError);
      expect(() =>
        EnumArrayValidator.validate(
          "formats",
          ["QRCODE", "PDF_URL", "random string"],
          deliveryFormats
        )
      ).toThrow(ValidatorError);
      expect(
        EnumArrayValidator.validate("formats", ["PDF_URL"], deliveryFormats)
      ).toBe(true);
      expect(
        EnumArrayValidator.validate(
          "formats",
          ["QRCODE", "PDF_URL"],
          deliveryFormats
        )
      ).toBe(true);
      expect(
        EnumArrayValidator.validate("formats", ["QRCODE"], deliveryFormats)
      ).toBe(true);
    });
  });
  describe("RegExpArrayValidator", () => {
    it("should validate regexp array", () => {
      const regExp = new RegExp(/^\d{2}:\d{2}$/g);

      expect(() =>
        RegExpArrayValidator.validate("times", [], regExp, { min: 1 })
      ).toThrow(ValidatorError);
      expect(() =>
        RegExpArrayValidator.validate("times", ["12:00:00", "15:00"], regExp)
      ).toThrow(ValidatorError);
      expect(RegExpArrayValidator.validate("times", ["00:00"], regExp)).toBe(
        true
      );
      expect(
        RegExpArrayValidator.validate("times", ["12:00", "15:00"], regExp)
      ).toBe(true);
    });
  });
  describe("StringArrayValidator", () => {
    it("should validate string array", () => {
      expect(() =>
        StringArrayValidator.validate("strings", [123], { min: 1 })
      ).toThrow(ValidatorError);
      expect(() =>
        StringArrayValidator.validate("strings", [null], { min: 1 })
      ).toThrow(ValidatorError);
      expect(() =>
        StringArrayValidator.validate("strings", [undefined], { min: 1 })
      ).toThrow(ValidatorError);
      expect(() => StringArrayValidator.validate("strings", {})).toThrow(
        ValidatorError
      );
      expect(() => StringArrayValidator.validate("strings", [{}])).toThrow(
        ValidatorError
      );
      expect(StringArrayValidator.validate("strings", ["123", "456"])).toBe(
        true
      );
      expect(StringArrayValidator.validate("strings", ["12:00", "15:00"])).toBe(
        true
      );
    });
  });
  describe("NumberValidator", () => {
    it("should validate number", () => {
      expect(() => NumberValidator.validate("number", undefined)).toThrow(
        ValidatorError
      );
      expect(() => NumberValidator.validate("number", null)).toThrow(
        ValidatorError
      );
      expect(() => NumberValidator.validate("number", [])).toThrow(
        ValidatorError
      );
      expect(() => NumberValidator.validate("number", {})).toThrow(
        ValidatorError
      );
      expect(() => NumberValidator.validate("number", "123")).toThrow(
        ValidatorError
      );
      expect(() =>
        NumberValidator.validate("number", 123.123, { integer: true })
      ).toThrow(ValidatorError);
      expect(NumberValidator.validate("number", Number(123))).toBe(true);
      expect(NumberValidator.validate("number", 123)).toBe(true);
      expect(NumberValidator.validate("number", 123.1234)).toBe(true);
      expect(NumberValidator.validate("number", 123, { integer: true })).toBe(
        true
      );
      expect(NumberValidator.validate("number", null, { nullable: true })).toBe(
        true
      );
    });
  });
  describe("NumberArrayValidator", () => {
    it("should validate number array", () => {
      expect(() =>
        NumberArrayValidator.validate("numberArray", undefined)
      ).toThrow(ValidatorError);
      expect(() => NumberArrayValidator.validate("numberArray", null)).toThrow(
        ValidatorError
      );
      expect(() =>
        NumberArrayValidator.validate("numberArray", [], { min: 1 })
      ).toThrow(ValidatorError);
      expect(() =>
        NumberArrayValidator.validate("numberArray", [123, 123.123], {
          integer: true,
        })
      ).toThrow(ValidatorError);
      expect(() =>
        NumberArrayValidator.validate("numberArray", [null, 123])
      ).toThrow(ValidatorError);
      expect(NumberArrayValidator.validate("numberArray", [])).toBe(true);
      expect(NumberArrayValidator.validate("numberArray", [123.1])).toBe(true);
      expect(
        NumberArrayValidator.validate("numberArray", [123, 321], {
          integer: true,
        })
      ).toBe(true);
    });
  });
  describe("ArrayValidator", () => {
    it("should validate array", () => {
      expect(() => ArrayValidator.validate("strings", [], { min: 1 })).toThrow(
        ValidatorError
      );
      expect(() =>
        ArrayValidator.validate("strings", [1, 2, 3, 4], { max: 3 })
      ).toThrow(ValidatorError);
      expect(() =>
        ArrayValidator.validate("strings", [null], { empty: true })
      ).toThrow(ValidatorError);
      expect(() =>
        ArrayValidator.validate("strings", [undefined], { min: 2 })
      ).toThrow(ValidatorError);
      expect(() => ArrayValidator.validate("strings", {})).toThrow(
        ValidatorError
      );
      expect(() => ArrayValidator.validate("strings", [{}])).toThrow(
        ValidatorError
      );
      expect(
        ArrayValidator.validate("strings", ["123", "456"], { max: 2 })
      ).toBe(true);
      expect(
        ArrayValidator.validate("strings", ["12:00", "15:00"], { min: 1 })
      ).toBe(true);
      expect(ArrayValidator.validate("strings", [], { empty: true })).toBe(
        true
      );
    });
  });
});

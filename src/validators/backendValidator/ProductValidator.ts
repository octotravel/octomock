import {
  CapabilityId,
  Destination,
  Category,
  FAQ,
  Image,
  Product,
  Option,
  PricingPer
} from '@octocloud/types';
import { OptionValidator } from "./OptionValidator";
import {
  StringValidator,
  BooleanValidator,
  EnumValidator,
  EnumArrayValidator,
  StringArrayValidator,
} from "./ValidatorHelpers";

export class ProductValidator {
  private productPricingValidator: ProductPricingValidator;
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = `${path}product`;
    this.capabilites = capabilites;
    this.productPricingValidator = new ProductPricingValidator(this.path);
  }

  public validate = (product: Product): void => {
    StringValidator.validate(`${this.path}.id`, product.id);
    StringValidator.validate(`${this.path}.internalName`, product.internalName);
    StringValidator.validate(`${this.path}.reference`, product.reference, {
      nullable: true,
    });
    StringValidator.validate(`${this.path}.locale`, product.locale);
    StringValidator.validate(`${this.path}.timeZone`, product.timeZone);
    BooleanValidator.validate(
      `${this.path}.allowFreesale`,
      product.allowFreesale
    );
    BooleanValidator.validate(
      `${this.path}.instantConfirmation`,
      product.instantConfirmation
    );
    BooleanValidator.validate(
      `${this.path}.instantDelivery`,
      product.instantDelivery
    );
    BooleanValidator.validate(
      `${this.path}.availabilityRequired`,
      product.availabilityRequired
    );
    EnumValidator.validate(
      `${this.path}.availabilityType`,
      product.availabilityType,
      [`START_TIME`, `OPENING_HOURS`]
    );
    EnumArrayValidator.validate(
      `${this.path}.deliveryFormats`,
      product.deliveryFormats,
      [`QRCODE`, `PDF_URL`],
      { min: 1 }
    );
    EnumArrayValidator.validate(
      `${this.path}.deliveryMethods`,
      product.deliveryMethods,
      [`TICKET`, `VOUCHER`],
      { min: 1 }
    );
    EnumValidator.validate(
      `${this.path}.redemptionMethod`,
      product.redemptionMethod,
      [`DIGITAL`, `PRINT`]
    );
    this.validateOptions(product.options);

    this.validatePricingCapability(product);
  };

  private validateOptions = (options: Option[]): void => {
    options.forEach((option, i) => {
      const optionValidator = new OptionValidator(
        `${this.path}.options[${i}]`,
        this.capabilites
      );
      optionValidator.validate(option);
    });
  };

  private validatePricingCapability = (product: Product): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      this.productPricingValidator.validate(product);
    }
  };
}

export class ProductPricingValidator {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }

  public validate = (product: Product): void => {
    StringValidator.validate(
      `${this.path}.defaultCurrency`,
      product.defaultCurrency
    );
    StringArrayValidator.validate(
      `${this.path}.availableCurrencies`,
      product.availableCurrencies,
      {
        min: 1,
      }
    );
    EnumValidator.validate(
      `${this.path}.pricingPer`,
      product.pricingPer,
      Object.values(PricingPer)
    );
  };
}

export class ProductContentValidator {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }
  public validate = (product: Product): void => {
    StringValidator.validate(`${this.path}.title`, product.title);
    StringValidator.validate(`${this.path}.country`, product.country);
    StringValidator.validate(`${this.path}.location`, product.location);
    StringValidator.validate(`${this.path}.subtitle`, product.subtitle);
    StringValidator.validate(
      `${this.path}.shortDescription`,
      product.shortDescription
    );
    StringValidator.validate(`${this.path}.description`, product.description);
    StringArrayValidator.validate(
      `${this.path}.highlights`,
      product.highlights
    );
    StringArrayValidator.validate(
      `${this.path}.inclusions`,
      product.inclusions
    );
    StringArrayValidator.validate(
      `${this.path}.exclusions`,
      product.exclusions
    );
    StringValidator.validate(
      `${this.path}.bookingTerms`,
      product.bookingTerms,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.redemptionInstructions`,
      product.redemptionInstructions,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.cancellationPolicy`,
      product.cancellationPolicy,
      {
        nullable: true,
      }
    );
    this.validateDestination(product.destination as Destination);
    this.validateCategories(product.categories as Category[]);
    this.validateFAQS(product.faqs as FAQ[]);
    StringValidator.validate(
      `${this.path}.coverImageUrl`,
      product.coverImageUrl,
      {
        nullable: true,
      }
    );
    StringValidator.validate(
      `${this.path}.bannerImageUrl`,
      product.bannerImageUrl,
      {
        nullable: true,
      }
    );
    StringValidator.validate(`${this.path}.videoUrl`, product.videoUrl, {
      nullable: true,
    });
    this.validateImages(`galleryImages`, product.galleryImages as Image[]);
    this.validateImages(`bannerImages`, product.bannerImages as Image[]);
  };

  private validateDestination = (destination: Destination) => {
    StringValidator.validate(`${this.path}.destination.id`, destination.id);
    StringValidator.validate(`${this.path}.destination.name`, destination.name);
    StringValidator.validate(
      `${this.path}.destination.country`,
      destination.country
    );

    StringValidator.validate(
      `${this.path}.destination.contact.website`,
      destination.contact.website,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.destination.contact.email`,
      destination.contact.email,
      {
        nullable: true,
      }
    );
    StringValidator.validate(
      `${this.path}.destination.contact.telephone`,
      destination.contact.telephone,
      { nullable: true }
    );
    StringValidator.validate(
      `${this.path}.destination.contact.address`,
      destination.contact.address,
      { nullable: true }
    );
  };

  private validateCategories = (categories: Category[]) => {
    categories.forEach((category, i) => {
      StringValidator.validate(`${this.path}.categories[${i}].id`, category.id);
      BooleanValidator.validate(
        `${this.path}.categories[${i}].default`,
        category.default
      );
      StringValidator.validate(
        `${this.path}.categories[${i}].title`,
        category.title
      );
      StringValidator.validate(
        `${this.path}.categories[${i}].shortDescription`,
        category.shortDescription
      );
      StringValidator.validate(
        `${this.path}.categories[${i}].coverImageUrl`,
        category.coverImageUrl,
        { nullable: true }
      );
      StringValidator.validate(
        `${this.path}.categories[${i}].bannerImageUrl`,
        category.bannerImageUrl,
        { nullable: true }
      );
    });
  };

  private validateFAQS = (faqs: FAQ[]) => {
    faqs.forEach((faq, i) => {
      StringValidator.validate(
        `${this.path}.faqs[${i}].question`,
        faq.question
      );
      StringValidator.validate(`${this.path}.faqs[${i}].answer`, faq.answer);
    });
  };
  private validateImages = (label: string, images: Image[]) => {
    images.forEach((image, i) => {
      StringValidator.validate(`${this.path}.${label}[${i}].url`, image.url);
      StringValidator.validate(
        `${this.path}.${label}[${i}].title`,
        image.title
      );
      StringValidator.validate(
        `${this.path}.${label}[${i}].caption`,
        image.caption
      );
    });
  };
}

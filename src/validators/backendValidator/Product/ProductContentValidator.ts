import { Destination, Category, FAQ, Image, Product } from "@octocloud/types";
import {
  StringValidator,
  BooleanValidator,
  StringArrayValidator,
  ModelValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class ProductContentValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }
  public validate = (product: Product): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.title`, product?.title),
      StringValidator.validate(`${this.path}.country`, product?.country),
      StringValidator.validate(`${this.path}.location`, product?.location, {
        nullable: true,
      }),
      StringValidator.validate(`${this.path}.subtitle`, product?.subtitle, {
        nullable: true,
      }),
      StringValidator.validate(
        `${this.path}.shortDescription`,
        product?.shortDescription,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.description`,
        product?.description,
        { nullable: true }
      ),
      StringArrayValidator.validate(
        `${this.path}.highlights`,
        product?.highlights
      ),
      StringArrayValidator.validate(
        `${this.path}.inclusions`,
        product?.inclusions
      ),
      StringArrayValidator.validate(
        `${this.path}.exclusions`,
        product?.exclusions
      ),
      StringValidator.validate(
        `${this.path}.bookingTerms`,
        product?.bookingTerms,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.redemptionInstructions`,
        product?.redemptionInstructions,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.cancellationPolicy`,
        product?.cancellationPolicy,
        {
          nullable: true,
        }
      ),
      ...this.validateDestination(product?.destination as Destination),
      ...this.validateCategories(product?.categories ?? ([] as Category[])),
      ...this.validateFAQS(product?.faqs ?? ([] as FAQ[])),
      StringValidator.validate(
        `${this.path}.coverImageUrl`,
        product?.coverImageUrl,
        {
          nullable: true,
        }
      ),
      StringValidator.validate(
        `${this.path}.bannerImageUrl`,
        product?.bannerImageUrl,
        {
          nullable: true,
        }
      ),
      StringValidator.validate(`${this.path}.videoUrl`, product?.videoUrl, {
        nullable: true,
      }),
      ...this.validateImages(
        `galleryImages`,
        product?.galleryImages ?? ([] as Image[])
      ),
      ...this.validateImages(`bannerImages`, product?.bannerImages as Image[]),
    ].flatMap((v) => (v ? [v] : []));
  };

  private validateDestination = (destination: Destination): ValidatorError[] =>
    [
      StringValidator.validate(`${this.path}.destination.id`, destination?.id),
      StringValidator.validate(
        `${this.path}.destination.name`,
        destination?.name
      ),
      StringValidator.validate(
        `${this.path}.destination.country`,
        destination?.country
      ),

      StringValidator.validate(
        `${this.path}.destination.contact.website`,
        destination?.contact?.website,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.destination.contact.email`,
        destination?.contact?.email,
        {
          nullable: true,
        }
      ),
      StringValidator.validate(
        `${this.path}.destination.contact.telephone`,
        destination?.contact?.telephone,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.destination.contact.address`,
        destination?.contact?.address,
        { nullable: true }
      ),
    ].flatMap((v) => (v ? [v] : []));

  private validateCategories = (categories: Category[]): ValidatorError[] => {
    return categories
      .map((category, i) => [
        StringValidator.validate(
          `${this.path}.categories[${i}].id`,
          category?.id
        ),
        BooleanValidator.validate(
          `${this.path}.categories[${i}].default`,
          category?.default
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].title`,
          category?.title
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].shortDescription`,
          category?.shortDescription,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].coverImageUrl`,
          category?.coverImageUrl,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.categories[${i}].bannerImageUrl`,
          category?.bannerImageUrl,
          { nullable: true }
        ),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };

  private validateFAQS = (faqs: FAQ[]): ValidatorError[] => {
    return faqs
      .map((faq, i) => [
        StringValidator.validate(
          `${this.path}.faqs[${i}].question`,
          faq?.question
        ),
        StringValidator.validate(`${this.path}.faqs[${i}].answer`, faq?.answer),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };

  private validateImages = (
    label: string,
    images: Image[]
  ): ValidatorError[] => {
    return images
      .map((image, i) => [
        StringValidator.validate(`${this.path}.${label}[${i}].url`, image?.url),
        StringValidator.validate(
          `${this.path}.${label}[${i}].title`,
          image?.title,
          { nullable: true }
        ),
        StringValidator.validate(
          `${this.path}.${label}[${i}].caption`,
          image?.caption,
          { nullable: true }
        ),
      ])
      .flat(1)
      .flatMap((v) => (v ? [v] : []));
  };
}

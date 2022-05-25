import { Category, FAQ, Image } from "@octocloud/types";

export class ProductContentModel {
  public title: string;
  public country: string;
  public location: string;
  public subtitle: string;
  public shortDescription: string;
  public description: string;
  public highlights: string[];
  public inclusions: string[];
  public exclusions: string[];
  public bookingTerms: Nullable<string>;
  public redemptionInstructions: Nullable<string>;
  public cancellationPolicy: Nullable<string>;
  // private destination?: Destination;
  public categories: Array<Category>;
  public faqs: Array<FAQ>;
  public coverImageUrl: Nullable<string>;
  public bannerImageUrl: Nullable<string>;
  public videoUrl: Nullable<string>;
  public galleryImages: Array<Image>;
  public bannerImages: Array<Image>;

  constructor() {
    this.title = "title";
    this.country = "country";
    this.location = "location";
    this.subtitle = "subtitle";
    this.shortDescription = "short description";
    this.description = "description";
    this.highlights = [];
    this.inclusions = [];
    this.exclusions = [];
    this.bookingTerms = null;
    this.redemptionInstructions = null;
    this.cancellationPolicy = null;
    // TODO: create destination
    // this.destination?: Destination;
    this.categories = [];
    this.faqs = [];
    this.coverImageUrl = null;
    this.bannerImageUrl = null;
    this.videoUrl = null;
    this.galleryImages = [];
    this.bannerImages = [];
  }
}

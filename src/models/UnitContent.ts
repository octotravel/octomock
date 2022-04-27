export class UnitContentModel {
  public title: Nullable<string>;
  public titlePlural: Nullable<string>;
  public subtitle?: Nullable<string>;

  constructor(id: string) {
    this.title = id;
    this.titlePlural = `${id}s`;
    this.subtitle = `${id}'s subtitle`;
  }
}

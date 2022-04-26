import { UnitId } from '@octocloud/types';
export class UnitContentModel {
  public title: Nullable<string>;
  public titlePlural: Nullable<string>;
  public subtitle?: Nullable<string>;

  constructor(id: UnitId) {
    this.title = id;
    this.titlePlural = `${id}s`;
    this.subtitle = `${id}'s subtitle`;
  }
}

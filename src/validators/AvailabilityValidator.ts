
type Params = {
  availabilityIds: Nullable<Array<string>>;
  localDate: Nullable<string>;
  localDateStart: Nullable<string>;
  localDateEnd: Nullable<string>;
};

interface IAvailabilityValidator {
  validate(params: Params): void;
}

export class AvailabilityValidator implements IAvailabilityValidator {
  public validate = ({
    availabilityIds,
    localDate,
    localDateStart,
    localDateEnd,
  }: Params): void => {
    if (availabilityIds && (localDateStart || localDate || localDateEnd)) {
      throw new Error('cannot use localDate/localDateStart/localDateEnd and availabilityIds in the same request')
    } else if ((localDateStart || localDateEnd) && localDate) {
      throw new Error('cannot use localDate and localDateStart/localDateEnd in the same request')

 
    } else if (!(localDateStart || localDate || localDateEnd || availabilityIds)) {
      throw new Error('either localDate, localDateStart/localDateEnd or availabilityIds is required');
    }

    if (localDateStart && localDateEnd) {
      this.validateMoreThanYearInterval(localDateStart, localDateEnd);
    }

    if (availabilityIds && availabilityIds.length > 100) {
      throw new Error('cannot request more than 100 availability objects at a time');
    }
  };

  private validateMoreThanYearInterval = (from: string, to: string) => {
    const d = new Date(from);
    const c = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
    if (c < new Date(to)) throw new Error('cannot request more than 1 year of availability');
  };
}

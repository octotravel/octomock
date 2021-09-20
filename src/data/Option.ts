import { adultModel, childModel } from "./Unit";
import { OptionModel } from "./../models/Option";

export const option1 = new OptionModel({
  id: "id",
  availabilityLocalStartTimes: ["00:00"],
  internalName: "Option",
  restrictions: {
    maxUnits: null,
    minUnits: 0,
  },
  units: [adultModel, childModel],
});

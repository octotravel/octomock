import { ScenarioResult } from "../Scenarios/Scenario";

export interface Flow {
  name: string;
  success: boolean;
  totalScenarios: number;
  succesScenarios: number;
  scenarios: ScenarioResult<any>[];
}

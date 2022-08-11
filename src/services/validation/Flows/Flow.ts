import { ScenarioResult } from "../Scenarios/Scenario";

export interface Flow {
  validate: () => Promise<FlowResult>;
}

export interface FlowResult {
  name: string;
  success: boolean;
  totalScenarios: number;
  succesScenarios: number;
  scenarios: ScenarioResult<any>[];
}

import { Capability, CapabilityId } from '@octocloud/types';

interface ICapabilityController {
  getCapabilities(): Promise<Capability[]>;
}

export class CapabilityController implements ICapabilityController {
  public getCapabilities = async (): Promise<Capability[]> => {
    const capabilities = [
      {
        id: CapabilityId.Pricing,
        revision: 1,
        required: false,
        dependencies: [],
        docs: null,
      },
      {
        id: CapabilityId.Content,
        revision: 1,
        required: false,
        dependencies: [],
        docs: null,
      },
      {
        id: CapabilityId.Pickups,
        revision: 1,
        required: false,
        dependencies: [],
        docs: null,
      },
    ];
    return capabilities;
  };
}

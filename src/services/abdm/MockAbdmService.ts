import { AbdmService, AbdmResult } from "./AbdmService";
import { FhirBundle } from "../fhir/FhirService";

export class MockAbdmService implements AbdmService {
  async pushHealthRecord(bundle: FhirBundle): Promise<AbdmResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      status: "SIMULATED",
      message: "ABDM integration is not configured in demo mode. Simulated push successful."
    };
  }
}

import { FhirService, FhirBundle } from "./FhirService";

export class LocalFhirService implements FhirService {
  async generateBundle(caseSheet: any): Promise<FhirBundle> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic mocked local bundle builder
    return {
      resourceType: "Bundle",
      type: "document",
      entry: [
        {
          fullUrl: "urn:uuid:mock-composition",
          resource: {
            resourceType: "Composition",
            status: "final",
            title: "MediKiosk Pre-Consultation Summary",
          }
        }
      ]
    };
  }
}

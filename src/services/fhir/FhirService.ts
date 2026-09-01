export interface FhirBundle {
  resourceType: "Bundle";
  type: string;
  entry: any[];
}

export interface FhirService {
  generateBundle(caseSheet: any): Promise<FhirBundle>;
}

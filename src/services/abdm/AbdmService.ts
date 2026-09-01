import { FhirBundle } from "../fhir/FhirService";

export interface AbdmResult {
  status: string;
  message: string;
  transactionId?: string;
}

export interface AbdmService {
  pushHealthRecord(bundle: FhirBundle): Promise<AbdmResult>;
}

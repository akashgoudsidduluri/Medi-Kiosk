/**
 * FHIR R4 Service Abstraction
 * 
 * TODO: Replace MockFHIRService with RealFHIRService when
 * actual FHIR R4 server is available.
 * 
 * Current implementation: MockFHIRService
 * Interface: FHIRService
 */

export interface FHIRService {
  generateBundle(patientData: FHIRPatientData): Promise<FHIRBundle>;
  pushToABDM(bundle: FHIRBundle): Promise<ABDMPushResult>;
  pushToHIS(bundle: FHIRBundle): Promise<HISPushResult>;
}

export interface FHIRPatientData {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    abhaId: string;
    mobileNumber?: string;
  };
  chiefComplaint: string;
  socrates: Record<string, string>;
  ayush: Record<string, string>;
  triage: {
    priority: string;
    reasons: string[];
  };
  documents: Array<{
    extractedData: Record<string, string>;
  }>;
}

export interface FHIRBundle {
  resourceType: "Bundle";
  type: "collection";
  timestamp: string;
  entry: Array<{
    resource: Record<string, unknown>;
  }>;
}

export interface ABDMPushResult {
  success: boolean;
  transactionId: string;
  message: string;
  timestamp: string;
}

export interface HISPushResult {
  success: boolean;
  messageId: string;
  message: string;
  timestamp: string;
}

class MockFHIRService implements FHIRService {
  async generateBundle(patientData: FHIRPatientData): Promise<FHIRBundle> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const patientResource = {
      resourceType: "Patient",
      id: patientData.patient.id,
      identifier: [
        {
          system: "https://abdm.gov.in/abha",
          value: patientData.patient.abhaId,
        },
      ],
      name: [
        {
          use: "official",
          text: patientData.patient.name,
        },
      ],
      gender: patientData.patient.gender.toLowerCase(),
      birthDate: `${new Date().getFullYear() - patientData.patient.age}-01-01`,
      telecom: [
        {
          system: "phone",
          value: patientData.patient.mobileNumber,
        },
      ],
    };

    const encounterResource = {
      resourceType: "Encounter",
      id: `encounter-${patientData.patient.id}`,
      status: "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB",
        display: "ambulatory",
      },
      subject: {
        reference: `Patient/${patientData.patient.id}`,
      },
      period: {
        start: new Date().toISOString(),
      },
    };

    const conditionResource = {
      resourceType: "Condition",
      id: `condition-${patientData.patient.id}`,
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active",
          },
        ],
      },
      subject: {
        reference: `Patient/${patientData.patient.id}`,
      },
      code: {
        text: patientData.chiefComplaint,
      },
    };

    const observationResource = {
      resourceType: "Observation",
      id: `obs-${patientData.patient.id}`,
      status: "final",
      code: {
        text: "Triage Priority Assessment",
      },
      subject: {
        reference: `Patient/${patientData.patient.id}`,
      },
      valueString: `Priority: ${patientData.triage.priority.toUpperCase()} — AI-assisted recommendation`,
    };

    const compositionResource = {
      resourceType: "Composition",
      id: `composition-${patientData.patient.id}`,
      status: "preliminary",
      type: {
        coding: [
          {
            system: "http://loinc.org",
            code: "11502-2",
            display: "Laboratory report",
          },
        ],
      },
      subject: {
        reference: `Patient/${patientData.patient.id}`,
      },
      author: [
        {
          display: "MediKiosk AI System (Simulated)",
        },
      ],
      title: "Pre-Consultation Case Sheet",
      date: new Date().toISOString(),
    };

    return {
      resourceType: "Bundle",
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        { resource: patientResource },
        { resource: encounterResource },
        { resource: conditionResource },
        { resource: observationResource },
        { resource: compositionResource },
      ],
    };
  }

  async pushToABDM(_bundle: FHIRBundle): Promise<ABDMPushResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      success: true,
      transactionId: `ABDM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      message: "ABHA PHR Push — Simulated. In production, this would push the FHIR bundle to the patient's ABHA health record.",
      timestamp: new Date().toISOString(),
    };
  }

  async pushToHIS(_bundle: FHIRBundle): Promise<HISPushResult> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      success: true,
      messageId: `HIS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      message: "HIS/EMR Push — Simulated. In production, this would send the case sheet to the hospital information system.",
      timestamp: new Date().toISOString(),
    };
  }
}

export const fhirService: FHIRService = new MockFHIRService();

import { describe, expect, it } from 'vitest';
import { LocalDocumentIntelligenceService } from './DocumentIntelligenceService';

describe('DocumentIntelligenceService', () => {
  const service = new LocalDocumentIntelligenceService();

  it('classifies a prescription and extracts conservative medication data', async () => {
    const text = `
      Dr. Ananya Sharma
      Reg. No. 12345
      Clinic: Sunrise Hospital
      Date: 20-09-2022
      Patient: ASHUIKA
      Age: 13
      Gender: Female
      C/O: Fever and cough
      Diagnosis: Viral fever
      Rx
      CALPOL 500 mg 1 tablet Q6H for 3 days
      LEVOUN 5 mL TDS for 5 days
    `;

    const result = await service.analyzeDocument(new File(['x'], 'prescription.png', { type: 'image/png' }), text);

    expect(result.documentType).toBe('prescription');
    expect(result.classificationConfidence).toBeGreaterThan(0.5);
    expect(result.structuredFacts.some((fact) => fact.field === 'patientName' && fact.value.includes('ASHUIKA'))).toBe(true);
    expect(result.structuredFacts.some((fact) => fact.field === 'medication' && fact.value.toLowerCase().includes('calpol'))).toBe(true);
    expect(result.structuredFacts.some((fact) => fact.field === 'medication' && fact.value.toLowerCase().includes('levoun'))).toBe(true);
    expect(result.warnings?.some((warning) => warning.toLowerCase().includes('verification')) ?? false).toBe(true);
  });

  it('classifies lab reports separately from prescription data', async () => {
    const text = `
      LABORATORY REPORT
      Hb: 12.5 g/dL
      Total WBC: 8.2 x10^3/uL
      Platelets: 250 x10^3/uL
      Date: 15-08-2024
    `;

    const result = await service.analyzeDocument(new File(['x'], 'lab-report.png', { type: 'image/png' }), text);

    expect(result.documentType).toBe('laboratory-report');
    expect(result.structuredFacts.some((fact) => fact.field === 'labResult')).toBe(true);
  });

  it('classifies identity documents as identity-document and creates no medical facts', async () => {
    const text = `
      AADHAAR CARD
      Name: Asha Verma
      DOB: 12/05/1995
      Gender: Female
      Address: Pune
    `;

    const result = await service.analyzeDocument(new File(['x'], 'aadhaar.png', { type: 'image/png' }), text);

    expect(result.documentType).toBe('identity-document');
    expect(result.structuredFacts.some((fact) => fact.field === 'medication')).toBe(false);
    expect(result.structuredFacts.some((fact) => fact.field === 'diagnosis')).toBe(false);
    expect(result.warnings?.some((warning) => warning.toLowerCase().includes('identity')) ?? false).toBe(true);
  });

  it('returns unknown for low-signal documents and does not fabricate patient data', async () => {
    const text = 'This is just a blank page with no reliable medical information.';

    const result = await service.analyzeDocument(new File(['x'], 'scan.png', { type: 'image/png' }), text);

    expect(result.documentType).toBe('unknown');
    expect(result.structuredFacts.length).toBe(0);
    expect(result.reviewRequired).toBe(true);
  });

  it('does not treat upload timestamp as a clinical date', async () => {
    const file = new File(['x'], 'prescription.png', { type: 'image/png' });
    const result = await service.analyzeDocument(file, 'Patient: Riya\nNo readable date');

    expect(result.document?.documentDate).toBeUndefined();
    expect(result.reviewRequired).toBe(true);
  });

  it('preserves provenance and leaves uncertain medication values unverified', async () => {
    const text = `
      Rx
      Patient: ASHUIKA
      LEVOUN
    `;

    const result = await service.analyzeDocument(new File(['x'], 'prescription.png', { type: 'image/png' }), text);

    const medFact = result.structuredFacts.find((fact) => fact.field === 'medication');
    expect(medFact?.value.toLowerCase()).toContain('levoun');
    expect(medFact?.verified).toBe(false);
    expect(medFact?.confidence).toBeLessThan(1);
  });

  it('marks ambiguous handwriting-like medication lines as review required instead of confident extraction', async () => {
    const text = `
      Rx
      Patient: ASHUIKA
      LEVOUN BML TOs 5 off
    `;

    const result = await service.analyzeDocument(new File(['x'], 'prescription.png', { type: 'image/png' }), text);

    expect(result.documentType).toBe('prescription');
    expect(result.reviewRequired).toBe(true);
    const medFact = result.structuredFacts.find((fact) => fact.field === 'medication');
    expect(medFact?.value.toLowerCase()).toContain('levoun');
    expect(medFact?.confidence).toBeLessThan(0.5);
    expect(result.warnings?.some((warning) => warning.toLowerCase().includes('ambiguous')) ?? false).toBe(true);
  });
});

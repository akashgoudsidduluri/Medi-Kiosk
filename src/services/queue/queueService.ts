import { PatientState } from "@/store/patientStore";
import { useDoctorStore, QueuePatient } from "@/store/doctorStore";

export class QueueService {
  /**
   * Pushes a completed patient case to the doctor's queue.
   * This provides a boundary between patient operations and doctor state.
   */
  pushToQueue(patient: PatientState) {
    if (!patient.id) {
      console.error("Cannot push patient without ID to queue");
      return;
    }

    const queuePatient: QueuePatient = {
      id: patient.id,
      name: patient.name || "Unknown Patient",
      age: patient.age || 0,
      gender: patient.gender || "Unknown",
      chiefComplaint: patient.chiefComplaint || "No complaint provided",
      priority: patient.triage?.priority || "routine",
      timestamp: new Date().toISOString(),
      status: "waiting",
      patientStateSnapshot: { ...patient }, // deep copy recommended in prod
    };

    useDoctorStore.getState().addPatientToQueue(queuePatient);
  }

  /**
   * Called when a doctor changes the priority of a patient in the queue.
   */
  overridePriority(patientId: string, newPriority: "routine" | "priority" | "urgent") {
    useDoctorStore.getState().updatePatientPriority(patientId, newPriority);
  }
}

export const queueService = new QueueService();

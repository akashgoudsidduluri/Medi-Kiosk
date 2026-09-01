import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PatientState } from "./patientStore";

// We extract just what the doctor needs to see in the queue
export interface QueuePatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  priority: "routine" | "priority" | "urgent" | "";
  timestamp: string;
  status: "waiting" | "in-consultation" | "completed";
  patientStateSnapshot: PatientState; // Full snapshot for detail view
}

export interface DoctorState {
  queue: QueuePatient[];
  
  // Actions
  addPatientToQueue: (patient: QueuePatient) => void;
  updatePatientPriority: (id: string, newPriority: "routine" | "priority" | "urgent") => void;
  updatePatientStatus: (id: string, status: "waiting" | "in-consultation" | "completed") => void;
  removePatient: (id: string) => void;
  clearQueue: () => void;
}

export const useDoctorStore = create<DoctorState>()(
  persist(
    (set) => ({
      queue: [],
      
      addPatientToQueue: (patient) => 
        set((state) => {
          // Prevent duplicates
          if (state.queue.some(p => p.id === patient.id)) {
            return { queue: state.queue.map(p => p.id === patient.id ? patient : p) };
          }
          return { queue: [...state.queue, patient] };
        }),
        
      updatePatientPriority: (id, newPriority) =>
        set((state) => ({
          queue: state.queue.map(p => 
            p.id === id ? { ...p, priority: newPriority } : p
          )
        })),
        
      updatePatientStatus: (id, status) =>
        set((state) => ({
          queue: state.queue.map(p => 
            p.id === id ? { ...p, status } : p
          )
        })),
        
      removePatient: (id) =>
        set((state) => ({
          queue: state.queue.filter(p => p.id !== id)
        })),
        
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: "medikiosk-doctor-store",
    }
  )
);

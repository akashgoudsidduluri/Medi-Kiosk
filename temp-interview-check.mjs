import { LocalAiInterviewService } from "./src/services/ai/LocalAiInterviewService.ts";
import { defaultClinicalState } from "./src/types/index.ts";

const service = new LocalAiInterviewService();
let state = defaultClinicalState();
let q = await service.getNextQuestion({}, "", state, "English");
console.log("Q0", JSON.stringify(q));
let r = await service.processAnswer("hi", q.question, state, { targetField: q.targetField, language: "English" });
console.log("A1", JSON.stringify({ next: r.nextQuestion, state: { chiefComplaint: r.updatedState.chiefComplaint, onset: r.updatedState.onset, duration: r.updatedState.duration } }));
state = r.updatedState;
state.chiefComplaint = "in ass";
q = await service.getNextQuestion({}, "in ass", state, "English");
console.log("Q1", JSON.stringify(q));
r = await service.processAnswer("this morning", q.question, state, { targetField: q.targetField, language: "English" });
console.log("A2", JSON.stringify({ next: r.nextQuestion, state: { chiefComplaint: r.updatedState.chiefComplaint, onset: r.updatedState.onset, duration: r.updatedState.duration } }));
state = r.updatedState;
q = r.nextQuestion;
r = await service.processAnswer("since a hour", q.question, state, { targetField: q.targetField, language: "English" });
console.log("A3", JSON.stringify({ next: r.nextQuestion, state: { chiefComplaint: r.updatedState.chiefComplaint, onset: r.updatedState.onset, duration: r.updatedState.duration } }));

class WorkflowManager {
    constructor() {
        this.workflows = JSON.parse(localStorage.getItem('workflows')) || this.getDefaultWorkflows();
    }

    getDefaultWorkflows() {
        return {
            stade3: {
                name: "Suivi standard Stade 3",
                triggers: ["patient.stadeMRC == 3"],
                actions: [
                    {
                        type: "EXAM_REMINDER",
                        exam: "Mesure DFG",
                        frequency: 90, // jours
                        recipients: ["médecin", "patient"]
                    },
                    {
                        type: "CONSULTATION",
                        specialist: "néphrologue",
                        frequency: 180
                    }
                ]
            }
        };
    }

    evaluateCondition(condition, patient) {
        try {
            return eval(condition.replace(/patient\./g, 'patient.'));
        } catch {
            return false;
        }
    }

    applyWorkflows(patient) {
        Object.values(this.workflows).forEach(workflow => {
            workflow.triggers.forEach(trigger => {
                if (this.evaluateCondition(trigger, patient)) {
                    this.executeActions(workflow.actions, patient);
                }
            });
        });
    }

    executeActions(actions, patient) {
        actions.forEach(action => {
            switch (action.type) {
                case "EXAM_REMINDER":
                    this.scheduleExamReminder(patient, action);
                    break;
                case "CONSULTATION":
                    this.scheduleConsultation(patient, action);
                    break;
            }
        });
    }

    scheduleExamReminder(patient, action) {
        const reminder = {
            patientId: patient.id,
            type: "EXAM",
            exam: action.exam,
            dueDate: new Date(Date.now() + action.frequency * 24 * 3600 * 1000),
            status: "pending"
        };
        this.saveReminder(reminder);
    }
}
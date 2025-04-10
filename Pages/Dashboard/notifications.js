class NotificationSystem {
    static checkPatientAlerts(patient) {
        const alerts = [];
        
        // Alerte de progression de stade
        if (patient.stadeMRC >= 4 && !patient.previousStadeMRC) {
            alerts.push({
                type: "STAGE_PROGRESSION",
                message: `Progression au stade ${patient.stadeMRC}`,
                urgency: "high"
            });
        }

        // Alerte d'examen critique
        if (patient.lastCreatinine > 150) {
            alerts.push({
                type: "CRITICAL_RESULT",
                message: `Créatinine élevée: ${patient.lastCreatinine}`,
                urgency: "critical"
            });
        }

        return alerts;
    }

    static sendAlert(alert) {
        if (alert.urgency === "critical") {
            this.showPopupAlert(alert);
            this.sendEmailAlert(alert);
        }
        this.saveToNotificationLog(alert);
    }

    static showPopupAlert(alert) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.urgency}`;
        alertDiv.innerHTML = `
            <span class="close-btn">&times;</span>
            <strong>${alert.type}</strong>: ${alert.message}
        `;
        document.body.appendChild(alertDiv);
    }
}
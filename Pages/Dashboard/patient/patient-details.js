document.addEventListener('DOMContentLoaded', function() {
    const labResultsForm = document.getElementById('labResultsForm');
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    
    // Charger les infos du patient
    loadPatientInfo(patientId);
    
    labResultsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const labData = {
            creatinine: document.getElementById('creatinine').value,
            gfr: document.getElementById('gfr').value,
            albuminuria: document.getElementById('albuminuria').value,
            potassium: document.getElementById('potassium').value
        };

        try {
            const analysis = window.MedicalAnalysis.analyzeLabResults(patientId, labData);
            displayAnalysisResults(analysis);
            
            // Mettre à jour le stade dans localStorage
            updatePatientStage(patientId, analysis.stage);
        } catch (error) {
            console.error("Erreur lors de l'analyse:", error);
            alert("Une erreur est survenue lors de l'analyse");
        }
    });

    function updatePatientStage(patientId, newStage) {
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patientIndex = patients.findIndex(p => p.id === patientId);
        
        if (patientIndex !== -1) {
            patients[patientIndex].stadeMRC = newStage;
            localStorage.setItem('patients', JSON.stringify(patients));
            
            // Mettre à jour l'affichage
            loadPatientInfo(patientId);
            
            // Notifier la page patient.html de la mise à jour
            if (window.opener) {
                window.opener.postMessage({
                    type: 'patientUpdated',
                    patientId: patientId,
                    newStage: newStage
                }, '*');
            }
        }
    }

    function loadPatientInfo(patientId) {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients.find(p => p.id === patientId);
        
        if (patient) {
            document.getElementById('patientInfo').innerHTML = `
                <h3>${patient.prenom} ${patient.nom}</h3>
                <p>Âge: ${patient.age}</p>
                <p>Stade MRC: ${patient.stadeMRC === "En attente de l'analyse" ? patient.stadeMRC : `Stade ${patient.stadeMRC}`}</p>
                <p>Dernier examen: ${patient.dernierExamen}</p>
                <p>Email: ${patient.email || 'N/A'}</p>
            `;
        }
    }

    function displayAnalysisResults(analysis) {
        const resultDiv = document.getElementById('analysisResult');
        
        resultDiv.innerHTML = `
            <h4>Résultats de l'analyse</h4>
            <div class="result-card">
                <p><strong>Nouveau stade MRC:</strong> ${analysis.stage}</p>
                <p><strong>Recommandations:</strong></p>
                <ul>${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
                <p><strong>Prochaines étapes:</strong></p>
                <ul>${analysis.nextSteps.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
        `;
    }
});
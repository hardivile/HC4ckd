document.addEventListener('DOMContentLoaded', function() {
    const patientForm = document.getElementById('patientForm');
    const patientList = document.getElementById('patientList');
    
    if (!patientForm || !patientList) {
        console.error("patientForm ou patientList introuvable");
        return;
    }
    
    // Charger les patients existants
    loadPatients();
    
    // Gestion de la soumission du formulaire
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPatient = {
            id: Date.now().toString(),
            nom: document.getElementById('lastName').value,
            prenom: document.getElementById('firstName').value,
            age: document.getElementById('age').value,
            stadeMRC: document.getElementById('ckdStage').value,
            dernierExamen: document.getElementById('lastExam').value
        };
        
        const urlParams = new URLSearchParams(window.location.search);
        const editIndex = urlParams.get('edit');
        
        if (editIndex !== null) {
            updatePatient(editIndex, newPatient);
        } else {
            savePatient(newPatient);
        }
        
        patientForm.reset();
        loadPatients();
    });

    function savePatient(patient) {
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        patient.email = document.getElementById('email').value; // Ajoutez cette ligne
        patient.id = patient.id || Date.now().toString();
        patients.push(patient);
        localStorage.setItem('patients', JSON.stringify(patients));
    }
    
    function loadPatients() {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        patientList.innerHTML = '';
        
        patients.forEach((patient, index) => {
            const row = document.createElement('tr');
            
            if (patient.stadeMRC >= 4) {
                row.classList.add('critical');
            }
            
            row.innerHTML = `
                <td>${patient.nom || 'N/A'}</td>
                <td>${patient.prenom || 'N/A'}</td>
                <td>${patient.age || 'N/A'}</td>
                <td>Stade ${patient.stadeMRC || 'N/A'}</td>
                <td>${patient.dernierExamen || 'N/A'}</td>
                <td class="action-btns">
                    <a href="patient.html?edit=${index}" class="edit-btn" title="Modifier">✏️</a>
                    <button class="delete-btn" data-id="${index}" title="Supprimer">🗑️</button>
                    <button class="pdf-btn" data-id="${index}" title="Générer PDF">📄 PDF</button>
                </td>
            `;
            
            patientList.appendChild(row);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deletePatient(parseInt(this.getAttribute('data-id')));
            });
        });
        
        document.querySelectorAll('.pdf-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const patientId = this.getAttribute('data-id');
                generatePdfForPatient(patientId);
            });
        });
    }
    
    function generatePdfForPatient(patientId) {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients[patientId];
        
        if (!patient) {
            showNotification('Patient non trouvé', 'error');
            return;
        }
        
        if (typeof generatePatientReport === 'function') {
            generatePatientReport(patient);
        } else {
            showNotification('La fonction PDF n\'est pas disponible', 'error');            console.error('generatePatientReport non définie');
        }
    }
    
    function deletePatient(index) {
        if (confirm('Voulez-vous vraiment supprimer ce patient ?')) {
            let patients = JSON.parse(localStorage.getItem('patients')) || [];
            patients.splice(index, 1);
            localStorage.setItem('patients', JSON.stringify(patients));
            loadPatients();
            showNotification('Patient supprimé', 'success');
        }
    }
    
    function updatePatient(index, updatedData) {
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        
        if (!validatePatientData(updatedData)) return;
        
        patients[index] = { ...patients[index], ...updatedData };
        localStorage.setItem('patients', JSON.stringify(patients));
        showNotification('Patient mis à jour', 'success');
        loadPatients();
    }
    
    function validatePatientData(patient) {
        if (!patient.nom || !patient.age || !patient.stadeMRC || !patient.dernierExamen) {
            showNotification('Tous les champs obligatoires doivent être remplis', 'error');
            return false;
        }
        
        if (isNaN(new Date(patient.dernierExamen).getTime())) {
            showNotification("Date d'examen invalide", 'error');
            return false;
        }
        
        return true;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const editIndex = urlParams.get('edit');
    
    if (editIndex !== null) {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients[editIndex];
        
        if (patient) {
            document.getElementById('lastName').value = patient.nom;
            document.getElementById('firstName').value = patient.prenom;
            document.getElementById('age').value = patient.age;
            document.getElementById('ckdStage').value = patient.stadeMRC;
            document.getElementById('lastExam').value = patient.dernierExamen;
            
            document.querySelector('.submit-btn').textContent = 'Mettre à jour';
            document.querySelector('h3').textContent = 'Modifier le patient';
        }
    }
    
    function showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 5000);
    }


    // Ajoutez ces fonctions à la fin du fichier patient.js

function generatePatientReport(patient) {
    // Votre logique existante de génération de PDF
    console.log("Génération du PDF pour le patient:", patient);
    // Implémentez votre logique de génération de PDF ici
}

// Fonction pour analyser les résultats de laboratoire
function analyzeLabResults(patientId, labData) {
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient) {
        return { error: "Patient non trouvé" };
    }
    
    // Logique d'analyse IA simple (à améliorer)
    const gfr = parseFloat(labData.gfr);
    let newStage;
    
    if (gfr >= 90) newStage = 1;
    else if (gfr >= 60) newStage = 2;
    else if (gfr >= 30) newStage = 3;
    else if (gfr >= 15) newStage = 4;
    else newStage = 5;
    
    // Recommandations basées sur le stade
    let recommendations = [];
    if (newStage >= 3) recommendations.push("Consultation néphrologique");
    if (newStage >= 4) recommendations.push("Préparation pour dialyse");
    if (parseFloat(labData.potassium) > 5.5) recommendations.push("Correction de l'hyperkaliémie");
    
    return {
        stage: newStage,
        previousStage: patient.stadeMRC,
        recommendations: recommendations,
        nextSteps: getNextSteps(newStage, labData)
    };
}

function getNextSteps(stage, labData) {
    const steps = [];
    
    switch(stage) {
        case 1:
        case 2:
            steps.push("Suivi annuel");
            break;
        case 3:
            steps.push("Suivi trimestriel");
            steps.push("Contrôle tensionnel strict");
            break;
        case 4:
            steps.push("Suivi mensuel");
            steps.push("Éducation thérapeutique");
            steps.push("Préparation RRT");
            break;
        case 5:
            steps.push("Dialyse ou transplantation");
            steps.push("Suivi spécialisé rapproché");
            break;
    }
    
    if (parseFloat(labData.albuminuria) > 300) {
        steps.push("Traitement néphroprotecteur");
    }
    
    return steps;
}

});

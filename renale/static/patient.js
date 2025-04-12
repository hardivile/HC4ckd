document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 5000);
    }

    // Gestion de la soumission du formulaire
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            // Validation côté client peut être ajoutée ici
            showNotification('Patient enregistré avec succès', 'success');
        });
    }

    // Module d'analyse médicale
    window.MedicalAnalysis = {
        analyzeLabResults: function(patientId, labData) {
            return fetch(`/api/analyze-results/${patientId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(labData)
            })
            .then(response => response.json())
            .catch(error => {
                console.error('Error:', error);
                return { error: "Erreur lors de l'analyse" };
            });
        },

        getNextSteps: function(stage, labData) {
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
            
            if (labData && parseFloat(labData.albuminuria) > 300) {
                steps.push("Traitement néphroprotecteur");
            }
            
            return steps;
        }
    };

    // Fonction utilitaire pour récupérer le cookie CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

// Gestion de la page patient-details.html
if (window.location.pathname.includes('patient-details')) {
    document.addEventListener('DOMContentLoaded', function() {
        const patientId = new URLSearchParams(window.location.search).get('id');
        
        if (patientId) {
            fetch(`/api/patient-details/${patientId}/`)
                .then(response => response.json())
                .then(data => {
                    // Remplir les détails du patient
                    document.getElementById('patient-name').textContent = `${data.nom} ${data.prenom}`;
                    // ... autres champs
                    
                    // Si des résultats de labo existent, analyser
                    if (data.lab_results) {
                        analyzeAndDisplayResults(data.id, data.lab_results);
                    }
                });
        }

        function analyzeAndDisplayResults(patientId, labData) {
            MedicalAnalysis.analyzeLabResults(patientId, labData)
                .then(results => {
                    if (!results.error) {
                        // Afficher les résultats de l'analyse
                        document.getElementById('ckd-stage').textContent = results.stage;
                        document.getElementById('recommendations').innerHTML = 
                            results.recommendations.map(r => `<li>${r}</li>`).join('');
                        
                        // Mettre à jour le patient avec le nouveau stade
                        return fetch(`/api/update-patient-stage/${patientId}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({ stage: results.stage })
                        });
                    }
                })
                .then(response => {
                    if (response && !response.ok) {
                        throw new Error('Échec de la mise à jour');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
}
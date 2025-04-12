document.addEventListener('DOMContentLoaded', function() {
    // Vérification que Bootstrap est chargé
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap JS non chargé');
        const fallbackAlert = document.createElement('div');
        fallbackAlert.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 1rem;
            background-color: #f8d7da;
            color: #721c24;
            text-align: center;
            z-index: 9999;
        `;
        fallbackAlert.textContent = 'Erreur: Bootstrap JS non chargé. Veuillez recharger la page.';
        document.body.prepend(fallbackAlert);
        return;
    }

    // Fonction pour afficher les alertes
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.alert-container').appendChild(alertDiv);
    }

    // Gestion du formulaire d'analyse
    const labForm = document.getElementById('labDataForm');
    if (labForm) {
        labForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // Validation des données
                const gfr = parseFloat(document.getElementById('gfr').value);
                const albuminuria = parseFloat(document.getElementById('albuminuria').value) || 0;
                
                if (isNaN(gfr)) {
                    throw new Error('Le DFG doit être un nombre valide');
                }

                // Affichage du loader
                const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
                loadingModal.show();

                // Envoi des données
                const response = await fetch(`/api/analyze-patient/{{ patient.id }}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    },
                    body: JSON.stringify({
                        gfr: gfr,
                        albuminuria: albuminuria
                    })
                });

                if (!response.ok) {
                    throw new Error(`Erreur serveur: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    // Mise à jour de l'interface
                    updatePatientDisplay(data.stage, data.recommendations);
                    
                    // Rechargement après 1 seconde
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    throw new Error(data.error || 'Erreur lors du traitement');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showAlert('danger', error.message);
            } finally {
                const modal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
                if (modal) modal.hide();
            }
        });
    }

    // Fonction pour mettre à jour l'affichage
    function updatePatientDisplay(stage, recommendations) {
        // Mise à jour du badge de stade
        const stageBadge = document.querySelector('.stage-badge');
        if (stageBadge) {
            stageBadge.textContent = stage;
            stageBadge.className = `badge bg-${getStageColor(stage)}`;
        }
        
        // Mise à jour des recommandations
        const recList = document.querySelector('.recommendations-list');
        if (recList && recommendations) {
            recList.innerHTML = recommendations.map(r => `<li>${r}</li>`).join('');
        }
    }

    // Fonction utilitaire pour les couleurs de stade
    function getStageColor(stage) {
        const colors = {
            1: 'success',
            2: 'info',
            3: 'primary',
            4: 'warning',
            5: 'danger'
        };
        return colors[stage] || 'secondary';
    }
});
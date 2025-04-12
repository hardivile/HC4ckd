// Initialisation des graphiques
function renderCharts(stagesCount, totalPatients, dailyNewPatients) {
    // Graphique des stades MRC
    const ckdStagesCtx = document.getElementById('ckdStagesChart').getContext('2d');
    new Chart(ckdStagesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Stade 1', 'Stade 2', 'Stade 3', 'Stade 4', 'Stade 5'],
            datasets: [{
                data: stagesCount,
                backgroundColor: [
                    '#4bc0c0',
                    '#36a2eb',
                    '#ffcd56',
                    '#ff6384',
                    '#9966ff'
                ],
                borderWidth: 1
            }]
        },
        options: getChartOptions('Répartition par stade MRC')
    });

    // Graphique des nouveaux patients
    const monthlyCtx = document.getElementById('monthlyPatientsChart').getContext('2d');
    const last30Days = generateLast30DaysLabels();
    
    new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: last30Days,
            datasets: [{
                label: 'Nouveaux patients',
                data: dailyNewPatients,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: '#4bc0c0',
                tension: 0.4
            }]
        },
        options: getChartOptions('Nouveaux patients (30 jours)', true)
    });
}

// Helper functions
function getChartOptions(title, showLegend = false) {
    return {
        responsive: true,
        plugins: {
            legend: { display: showLegend },
            title: { display: true, text: title }
        }
    };
}

function generateLast30DaysLabels() {
    return [...Array(30).keys()].map(i => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    });
}

// Gestion de la recherche
function setupSearch() {
    const searchInputs = document.querySelectorAll('.form-control');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const params = new URLSearchParams();
            searchInputs.forEach(i => {
                if (i.value) params.append(i.name, i.value);
            });
            
            fetch(`/dm/?${params.toString()}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(handleResponse)
            .catch(handleError);
        });
    });
}

// Gestion de la modal de suppression
function setupDeleteModal() {
    const modal = document.getElementById('confirmDeleteModal');
    if (!modal) return;

    modal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const id = button.getAttribute('data-id');
        const form = modal.querySelector('#deleteForm');
        form.action = form.action.replace('0', id);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des données depuis le DOM
    const criticalCases = parseInt(document.getElementById('criticalCases').textContent);
    const totalPatients = parseInt(document.getElementById('totalPatients').textContent);
    
    // Récupération des données Django
    const stagesCount = JSON.parse('{{ stages_count|escapejs }}');
    const dailyNewPatients = JSON.parse('{{ daily_new_patients|escapejs }}');

    // Initialisation des composants
    renderCharts(stagesCount, totalPatients, dailyNewPatients);
    setupSearch();
    setupDeleteModal();
});
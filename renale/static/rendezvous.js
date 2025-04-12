// Utiliser le cache global existant
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que le cache global existe
    if (!window.appointmentCache) {
        window.appointmentCache = {
            dateFormat: {},
            patients: [],
            appointments: []
        };
    }
    
    // Initialisations dans l'ordre correct - d'abord les données, puis l'UI
    loadPatients(true);  // Charger les patients d'abord
    setTimeout(() => {   // Ajouter un délai pour s'assurer que les données sont chargées
        initCalendar();  // Initialiser le calendrier ensuite
        loadAppointments(); // Puis charger les rendez-vous
    }, 300);

    // Événements
    document.getElementById('appointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAppointment();
    });

    // Filtres avec debounce
    const debounce = (func, delay) => {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), delay);
        };
    };

    document.getElementById('filterStatus').addEventListener('change', () => loadAppointments());
    document.getElementById('searchAppointments').addEventListener('input', debounce(() => loadAppointments(), 300));
});

/* CALENDRIER */
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Nettoyage si existe déjà
    if (window.calendarInstance) {
        window.calendarInstance.destroy();
    }

    // Nouvelle instance
    window.calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        eventClick: (info) => editAppointment(info.event.id)
    });

    window.calendarInstance.render();
}

/* PATIENTS */
function loadPatients(initialLoad = false) {
    try {
        // Ne pas chercher dans localStorage, les patients sont déjà dans la page
        // Les options sont générées côté serveur dans le HTML (Django)
        const select = document.getElementById('patientId');
        if (!select) return;
        
        // Si le select existe déjà et a des options, les garder et les mettre en cache
        if (select.options.length > 0) {
            const patients = [];
            for (let i = 1; i < select.options.length; i++) {  // Ignorer l'option par défaut
                const option = select.options[i];
                patients.push({
                    id: option.value,
                    nom: option.dataset.nom,
                    prenoms: option.dataset.prenom,
                    email: option.dataset.email,
                    stade: option.textContent.match(/\(Stade ([^)]+)\)/)?.[1] || ""
                });
            }
            window.appointmentCache.patients = patients;
        }
        
        // Sinon, on pourrait effectuer une requête AJAX vers l'API Django
        // pour récupérer les patients si nécessaire, mais ce n'est pas le cas ici
        
    } catch (error) {
        console.error("Erreur chargement patients:", error);
        showNotification('Erreur de chargement des patients', 'error');
    }
}

/* RENDEZ-VOUS */
function loadAppointments() {
    try {
        const statusFilter = document.getElementById('filterStatus').value;
        const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
        
        // Charger les rendez-vous - ici nous pourrions faire une requête AJAX
        // mais pour l'exemple nous utilisons les rendez-vous déjà chargés
        let appointments = [];
        
        // Si on a déjà des rendez-vous en cache, les utiliser
        if (window.appointmentCache.appointments && window.appointmentCache.appointments.length > 0) {
            appointments = window.appointmentCache.appointments;
        } else {
            // Sinon, on pourrait faire une requête AJAX ici
            // Mais pour le moment, nous utilisons ce qui est stocké en localStorage pour des tests
            appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            window.appointmentCache.appointments = appointments;
        }
        
        // Tri par date
        appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Filtrage
        const now = new Date();
        const filteredAppointments = appointments.filter(app => {
            const isUpcoming = new Date(app.date) > now;
            const matchesStatus = (
                statusFilter === 'all' ||
                (statusFilter === 'upcoming' && isUpcoming) ||
                (statusFilter === 'completed' && !isUpcoming)
            );
            
            const patientName = `${app.patientNom || ''} ${app.patientPrenom || ''}`.toLowerCase();
            const matchesSearch = (
                patientName.includes(searchTerm) ||
                (app.type || '').toLowerCase().includes(searchTerm) ||
                (app.notes || '').toLowerCase().includes(searchTerm)
            );
            
            return matchesStatus && matchesSearch;
        });
        
        displayAppointments(filteredAppointments);
        updateCalendar(filteredAppointments);
    } catch (error) {
        console.error("Erreur:", error);
        showNotification('Erreur de chargement', 'error');
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (appointments.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun rendez-vous trouvé</p>';
        return;
    }
    
    appointments.forEach(app => {
        const isPast = new Date(app.date) < new Date();
        const isEditable = !isPast && app.status !== 'completed';
        
        const appElement = document.createElement('div');
        appElement.className = 'appointment-item';
        appElement.innerHTML = `
            <div class="appointment-info">
                <h3>${formatDate(app.date)} - ${app.type.toUpperCase()}</h3>
                <p><strong>Patient:</strong> ${app.patientNom} ${app.patientPrenom}</p>
                ${app.notes ? `<p><strong>Notes:</strong> ${app.notes}</p>` : ''}
                ${isPast ? '<span class="past-badge">TERMINÉ</span>' : ''}
            </div>
            <div class="appointment-actions">
                ${isEditable ? `
                    <button class="btn-edit" data-id="${app.id}">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                ` : ''}
                <button class="btn-delete" data-id="${app.id}">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        container.appendChild(appElement);
    });
    
    // Gestion des événements
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editAppointment(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Voulez-vous vraiment supprimer ce rendez-vous ?')) {
                deleteAppointment(this.getAttribute('data-id'));
            }
        });
    });
}

function updateCalendar(appointments) {
    if (!window.calendarInstance) return;
    
    window.calendarInstance.removeAllEvents();
    
    appointments.forEach(app => {
        window.calendarInstance.addEvent({
            id: app.id,
            title: `${app.patientNom} - ${app.type}`,
            start: app.date,
            extendedProps: {
                notes: app.notes,
                patientId: app.patientId
            },
            color: new Date(app.date) < new Date() ? '#6c757d' : '#007bff'
        });
    });
}

/* GESTION DES RDV */
function editAppointment(appointmentId) {
    try {
        const appointment = window.appointmentCache.appointments.find(a => a.id === appointmentId);
        if (!appointment) throw new Error('Rendez-vous introuvable');
        
        const form = document.getElementById('appointmentForm');
        form.patientId.value = appointment.patientId;
        form.appointmentDate.value = formatDateForInput(appointment.date);
        form.appointmentType.value = appointment.type;
        form.notes.value = appointment.notes || '';
        
        form.dataset.editingId = appointmentId;
        form.querySelector('button[type="submit"]').textContent = 'Mettre à jour';
        form.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error("Erreur édition:", error);
        showNotification('Échec de la préparation de l\'édition', 'error');
    }
}

function deleteAppointment(appointmentId) {
    try {
        // Dans un vrai système, on ferait une requête AJAX pour supprimer le rendez-vous
        // Pour l'exemple, nous mettons juste à jour le localStorage
        let appointments = window.appointmentCache.appointments.filter(a => a.id !== appointmentId);
        window.appointmentCache.appointments = appointments;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification('Rendez-vous supprimé avec succès', 'success');
        loadAppointments();
        updateDashboardStats();
        
    } catch (error) {
        console.error("Erreur suppression:", error);
        showNotification('Échec de la suppression', 'error');
    }
}

async function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    const isEditing = form.dataset.editingId;
    
    // Récupération des données patient
    const patientSelect = document.getElementById('patientId');
    const selectedOption = patientSelect.options[patientSelect.selectedIndex];
    const patientId = patientSelect.value;
    
    if (!patientId) {
        showNotification('Veuillez sélectionner un patient', 'error');
        return;
    }

    const appointmentData = {
        id: isEditing || generateId(),
        patientId: patientId,
        date: form.appointmentDate.value,
        type: form.appointmentType.value,
        notes: form.notes.value,
        status: 'planned',
        patientNom: selectedOption.dataset.nom,
        patientPrenom: selectedOption.dataset.prenom,
        patientEmail: selectedOption.dataset.email
    };
    
    try {
        // Validation
        if (!isValidAppointmentDate(appointmentData.date)) {
            throw new Error('La date doit être au moins 1 heure dans le futur');
        }

        if (await hasAppointmentConflict(
            appointmentData.patientId, 
            appointmentData.date, 
            isEditing || null
        )) {
            throw new Error('Conflit de rendez-vous (patient ou créneau déjà réservé)');
        }

        // Dans un vrai système, on ferait une requête AJAX pour sauvegarder
        // Pour l'exemple, nous mettons juste à jour le localStorage
        let appointments = isEditing 
            ? window.appointmentCache.appointments.map(a => 
                a.id === isEditing ? { ...a, ...appointmentData } : a
              )
            : [...window.appointmentCache.appointments, appointmentData];
        
        window.appointmentCache.appointments = appointments;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification(
            isEditing ? 'Rendez-vous mis à jour' : 'Rendez-vous enregistré',
            'success'
        );
        
        form.reset();
        delete form.dataset.editingId;
        form.querySelector('button[type="submit"]').textContent = 'Enregistrer';
        loadAppointments();
        updateDashboardStats();
        
        if (!isEditing) {
            await sendAppointmentEmail(appointmentData);
        }
    } catch (error) {
        console.error("Erreur:", error);
        showNotification(`Échec: ${error.message}`, 'error');
    }
}

/* UTILITAIRES */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isValidAppointmentDate(date) {
    const now = new Date();
    const appointmentDate = new Date(date);
    const minDate = new Date(now.setHours(now.getHours() + 1));
    return appointmentDate >= minDate;
}

async function hasAppointmentConflict(patientId, dateTime, excludeId = null) {
    const appointmentDate = new Date(dateTime);
    
    return window.appointmentCache.appointments.some(app => {
        if (excludeId && app.id === excludeId) return false;
        
        const appDate = new Date(app.date);
        const timeDiff = Math.abs(appDate - appointmentDate);
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        return (
            (app.patientId === patientId || appDate.getTime() === appointmentDate.getTime()) && 
            minutesDiff < 30
        );
    });
}

async function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    const isEditing = form.dataset.editingId;
    
    // Récupération des données patient
    const patientSelect = document.getElementById('patientId');
    const selectedOption = patientSelect.options[patientSelect.selectedIndex];
    const patientId = patientSelect.value;
    
    if (!patientId) {
        showNotification('Veuillez sélectionner un patient', 'error');
        return;
    }

    const appointmentData = {
        id: isEditing || generateId(),
        patientId: patientId,
        date: form.appointmentDate.value,
        type: form.appointmentType.value,
        notes: form.notes.value,
        status: 'planned',
        patientNom: selectedOption.dataset.nom,
        patientPrenom: selectedOption.dataset.prenom,
        patientEmail: selectedOption.dataset.email
    };
    
    try {
        // Validation
        if (!isValidAppointmentDate(appointmentData.date)) {
            throw new Error('La date doit être au moins 1 heure dans le futur');
        }

        if (await hasAppointmentConflict(
            appointmentData.patientId, 
            appointmentData.date, 
            isEditing || null
        )) {
            throw new Error('Conflit de rendez-vous (patient ou créneau déjà réservé)');
        }

        // Dans un vrai système, on ferait une requête AJAX pour sauvegarder
        // Pour l'exemple, nous mettons à jour le localStorage et le cache
        let appointments = [];
        
        if (isEditing) {
            appointments = window.appointmentCache.appointments.map(a => 
                a.id === isEditing ? { ...a, ...appointmentData } : a
            );
        } else {
            // S'assurer que les appointments sont chargés correctement
            appointments = window.appointmentCache.appointments || [];
            appointments.push(appointmentData);
        }
        
        // Mise à jour du cache et du localStorage
        window.appointmentCache.appointments = appointments;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Ajouter explicitement l'événement au calendrier pour un affichage immédiat
        if (window.calendarInstance) {
            window.calendarInstance.addEvent({
                id: appointmentData.id,
                title: `${appointmentData.patientNom} - ${appointmentData.type}`,
                start: appointmentData.date,
                extendedProps: {
                    notes: appointmentData.notes,
                    patientId: appointmentData.patientId
                },
                color: '#007bff'
            });
        }
        
        showNotification(
            isEditing ? 'Rendez-vous mis à jour' : 'Rendez-vous enregistré',
            'success'
        );
        
        // Réinitialisation du formulaire
        form.reset();
        delete form.dataset.editingId;
        form.querySelector('button[type="submit"]').textContent = 'Enregistrer';
        
        // Forcer le rafraîchissement complet
        setTimeout(() => {
            loadAppointments();
            updateDashboardStats();
        }, 100);
        
        if (!isEditing) {
            await sendAppointmentEmail(appointmentData);
        }
    } catch (error) {
        console.error("Erreur:", error);
        showNotification(`Échec: ${error.message}`, 'error');
    }
}

function updateDashboardStats() {
    // Notifie le parent si dans un iframe
    if (window.parent && window.parent.updateStats) {
        window.parent.updateStats();
    }
    // Alternative pour les popups
    else if (window.opener && window.opener.updateStats) {
        window.opener.updateStats();
    }
    // Solution de repli
    else {
        localStorage.setItem('forceStatsRefresh', Date.now().toString());
    }
}

function formatDate(dateString) {
    if (!window.appointmentCache.dateFormat[dateString]) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        window.appointmentCache.dateFormat[dateString] = new Date(dateString).toLocaleDateString('fr-FR', options);
    }
    return window.appointmentCache.dateFormat[dateString];
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function showNotification(message, type = 'info') {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
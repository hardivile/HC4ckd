document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    loadPatients();
    
    // Gestion du formulaire
    document.getElementById('appointmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAppointment();
    });

    // Filtres avec debounce
    let searchTimeout;
    document.getElementById('filterStatus').addEventListener('change', loadAppointments);
    document.getElementById('searchAppointments').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadAppointments, 300);
    });
    
    loadAppointments();
});

// Initialisation optimisée de FullCalendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl._fullCalendar) {
        calendarEl._fullCalendar.destroy();
    }
    
    calendarEl._fullCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            editAppointment(info.event.id);
        },
        events: []
    });
    calendarEl._fullCalendar.render();
}

async function loadPatients() {
    try {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const select = document.getElementById('patientId');
        const todayAppointments = getTodayAppointments();
        
        select.innerHTML = '<option value="">Sélectionner un patient...</option>';
        patients.forEach(patient => {
            if (!todayAppointments.includes(patient.id)) {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.nom} ${patient.prenom} (Stade ${patient.stadeMRC})`;
                option.dataset.email = patient.email || '';
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Erreur chargement patients:", error);
        showNotification('Erreur de chargement des patients', 'error');
    }
}

function getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    return appointments
        .filter(app => app.date.startsWith(today))
        .map(app => app.patientId);
}

async function loadAppointments() {
    try {
        const statusFilter = document.getElementById('filterStatus').value;
        const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
        
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
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
    const calendarEl = document.getElementById('calendar');
    
    if (calendarEl._fullCalendar) {
        calendarEl._fullCalendar.destroy();
    }
    
    calendarEl._fullCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            editAppointment(info.event.id);
        },
        events: appointments.map(app => ({
            id: app.id,
            title: `${app.patientNom} - ${app.type}`,
            start: app.date,
            extendedProps: {
                notes: app.notes,
                patientId: app.patientId
            },
            color: new Date(app.date) < new Date() ? '#6c757d' : '#007bff'
        }))
    });
    
    calendarEl._fullCalendar.render();
}

async function editAppointment(appointmentId) {
    try {
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const appointment = appointments.find(a => a.id === appointmentId);
        
        if (!appointment) throw new Error('Rendez-vous introuvable');
        
        document.getElementById('patientId').value = appointment.patientId;
        document.getElementById('appointmentDate').value = formatDateForInput(appointment.date);
        document.getElementById('appointmentType').value = appointment.type;
        document.getElementById('notes').value = appointment.notes || '';
        
        const form = document.getElementById('appointmentForm');
        form.dataset.editingId = appointmentId;
        form.querySelector('button[type="submit"]').textContent = 'Mettre à jour';
        form.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error("Erreur édition:", error);
        showNotification('Échec de la préparation de l\'édition', 'error');
    }
}

async function deleteAppointment(appointmentId) {
    try {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments = appointments.filter(a => a.id !== appointmentId);
        
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
    
    // Récupérer les infos du patient
    const patientSelect = document.getElementById('patientId');
    const selectedOption = patientSelect.options[patientSelect.selectedIndex];
    const selectedPatient = JSON.parse(localStorage.getItem('patients')).find(
        p => p.id === patientSelect.value
    );
    
    if (!selectedPatient) {
        showNotification('Patient introuvable', 'error');
        return;
    }

    const appointmentData = {
        id: isEditing || generateId(),
        patientId: form.patientId.value,
        date: form.appointmentDate.value,
        type: form.appointmentType.value,
        notes: form.notes.value,
        status: 'planned',
        patientNom: selectedPatient.nom,
        patientPrenom: selectedPatient.prenom,
        patientEmail: selectedOption.dataset.email || selectedPatient.email
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

        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        if (isEditing) {
            appointments = appointments.map(a => 
                a.id === isEditing ? { ...a, ...appointmentData } : a
            );
        } else {
            appointments.push(appointmentData);
            await sendAppointmentEmail(appointmentData);
        }
        
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification(
            isEditing ? 'Rendez-vous mis à jour' : 'Rendez-vous enregistré et email envoyé', 
            'success'
        );
        
        form.reset();
        delete form.dataset.editingId;
        form.querySelector('button[type="submit"]').textContent = 'Enregistrer';
        loadAppointments();
        updateDashboardStats();
        
    } catch (error) {
        console.error("Erreur:", error);
        showNotification(`Échec: ${error.message}`, 'error');
    }
}

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
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointmentDate = new Date(dateTime);
    
    return appointments.some(app => {
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

async function sendAppointmentEmail(appointment) {
    try {
        const formattedDate = formatDate(appointment.date);
        const emailParams = {
            to_email: appointment.patientEmail,
            to_name: `${appointment.patientPrenom} ${appointment.patientNom}`,
            from_name: "AI4CKD Medical Center",
            appointment_date: formattedDate,
            appointment_type: appointment.type,
            notes: appointment.notes || 'Aucune note particulière',
            reply_to: "no-reply@ai4ckd.com"
        };

        await emailjs.send(
            'service_wg4t62i', 
            'template_rchta96',
            emailParams
        );
    } catch (error) {
        console.error("Erreur d'envoi d'email:", error);
        throw new Error("L'enregistrement a réussi mais l'email n'a pas pu être envoyé");
    }
}

function updateDashboardStats() {
    if (window.parent && window.parent.updateStats) {
        window.parent.updateStats();
    } else if (window.opener && window.opener.updateStats) {
        window.opener.updateStats();
    } else {
        console.log("Mise à jour des stats du dashboard déclenchée");
        // Alternative pour les iframes/popups fermées
        localStorage.setItem('forceStatsRefresh', Date.now().toString());
    }
}

const dateFormatCache = {};
function formatDate(dateString) {
    if (dateFormatCache[dateString]) {
        return dateFormatCache[dateString];
    }
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    dateFormatCache[dateString] = new Date(dateString).toLocaleDateString('fr-FR', options);
    return dateFormatCache[dateString];
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
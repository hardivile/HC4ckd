// Variables globales
let doctors = [];
let specialties = new Set();

// DOM Elements
const doctorsTableBody = document.getElementById('doctorsTableBody');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const totalDoctorsElement = document.getElementById('totalDoctors');
const totalSpecialtiesElement = document.getElementById('totalSpecialties');
const modal = document.getElementById('doctorModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');

// Événements
document.addEventListener('DOMContentLoaded', () => {
    fetchDoctors();
    
    refreshBtn.addEventListener('click', fetchDoctors);
    searchInput.addEventListener('input', filterDoctors);
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});

// Fonctions
async function fetchDoctors() {
    try {
        // Simule un appel API - À remplacer par un vrai appel fetch()
        const response = await mockFetchDoctors();
        
        doctors = response.doctors;
        specialties = new Set(response.doctors.flatMap(d => d.specialties));
        
        updateStats();
        renderDoctorsTable();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de charger les médecins');
    }
}

function updateStats() {
    totalDoctorsElement.textContent = doctors.length;
    totalSpecialtiesElement.textContent = specialties.size;
}

function renderDoctorsTable(filteredDoctors = doctors) {
    doctorsTableBody.innerHTML = filteredDoctors.map(doctor => `
        <tr>
            <td><img src="${doctor.photo || 'https://i.imgur.com/8Km9tLL.jpg'}" 
                 alt="${doctor.firstName}" class="doctor-avatar"></td>
            <td>Dr. ${doctor.firstName} ${doctor.lastName}</td>
            <td>${doctor.specialties.join(', ')}</td>
            <td>${doctor.email}</td>
            <td>
                <button class="action-btn" onclick="showDoctorDetails('${doctor.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterDoctors() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = doctors.filter(doctor => 
        doctor.firstName.toLowerCase().includes(searchTerm) ||
        doctor.lastName.toLowerCase().includes(searchTerm) ||
        doctor.specialties.some(s => s.toLowerCase().includes(searchTerm)) ||
        doctor.email.toLowerCase().includes(searchTerm)
    );
    renderDoctorsTable(filtered);
}

function showDoctorDetails(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    modalContent.innerHTML = `
        <div class="doctor-header">
            <img src="${doctor.photo || 'https://i.imgur.com/8Km9tLL.jpg'}" 
                 alt="${doctor.firstName}" class="doctor-avatar-lg">
            <div>
                <h3>Dr. ${doctor.firstName} ${doctor.lastName}</h3>
                <p class="specialties">${doctor.specialties.join(', ')}</p>
            </div>
        </div>
        
        <div class="doctor-info-grid">
            <div class="info-group">
                <label>RPPS</label>
                <p>${doctor.rpps || 'Non renseigné'}</p>
            </div>
            <div class="info-group">
                <label>Email</label>
                <p>${doctor.email}</p>
            </div>
            <div class="info-group">
                <label>Téléphone</label>
                <p>${doctor.phone || 'Non renseigné'}</p>
            </div>
            <div class="info-group">
                <label>Date d'inscription</label>
                <p>${new Date(doctor.registrationDate).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div class="doctor-section">
            <h4>Disponibilités</h4>
            <p>${doctor.availability || 'Non renseigné'}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Simulation d'API - À remplacer par de vrais appels fetch()
async function mockFetchDoctors() {
    // Dans la réalité, vous feriez:
    // const response = await fetch('/api/doctors');
    // return await response.json();
    
    return {
        doctors: [] // Tableau vide car les données viendront du backend
    };
}

// Structure des données attendues du backend:
/*
{
    "doctors": [
        {
            "id": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "phone": "string",
            "photo": "string (url)",
            "rpps": "string",
            "specialties": ["string"],
            "registrationDate": "ISO string",
            "availability": "string"
        },
        ...
    ]
}
*/
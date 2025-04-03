document.addEventListener('DOMContentLoaded', function() {
    // Charger les paramètres sauvegardés
    loadSettings();
    
    // Gestion de l'enregistrement
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Boutons supplémentaires
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', importData);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
});

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    
    // Remplir les champs
    document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
    document.getElementById('appNotifications').checked = settings.appNotifications !== false;
    document.getElementById('language').value = settings.language || 'fr';
    document.getElementById('timezone').value = settings.timezone || 'UTC+1';
    document.getElementById('emailFrequency').value = settings.emailFrequency || '1';
    document.getElementById('sendCopy').checked = settings.sendCopy !== false;
}

function saveSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        appNotifications: document.getElementById('appNotifications').checked,
        language: document.getElementById('language').value,
        timezone: document.getElementById('timezone').value,
        emailFrequency: document.getElementById('emailFrequency').value,
        sendCopy: document.getElementById('sendCopy').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    showNotification('Paramètres enregistrés avec succès', 'success');
}

function exportData() {
    // Exporte toutes les données de l'application
    const appData = {
        patients: JSON.parse(localStorage.getItem('patients')) || [],
        appointments: JSON.parse(localStorage.getItem('appointments')) || [],
        settings: JSON.parse(localStorage.getItem('appSettings')) || {}
    };
    
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai4ckd-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Données exportées avec succès', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => { 
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.patients) localStorage.setItem('patients', JSON.stringify(data.patients));
                if (data.appointments) localStorage.setItem('appointments', JSON.stringify(data.appointments));
                if (data.settings) localStorage.setItem('appSettings', JSON.stringify(data.settings));
                
                showNotification('Données importées avec succès', 'success');
                loadSettings();
            } catch (error) {
                showNotification('Fichier invalide', 'error');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetSettings() {
    if (confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) {
        localStorage.removeItem('appSettings');
        loadSettings();
        showNotification('Paramètres réinitialisés', 'info');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
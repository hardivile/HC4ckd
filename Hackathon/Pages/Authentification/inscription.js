document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('doctorRegistrationForm');
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Animation de la force du mot de passe
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        updateStrengthIndicator(strength);
    });

    function updateStrengthIndicator(strength) {
        let width = 0;
        let color = '';
        
        switch(strength) {
            case 1:
                width = 25;
                color = 'var(--error-color)';
                break;
            case 2:
                width = 50;
                color = '#f8961e';
                break;
            case 3:
                width = 75;
                color = '#90be6d';
                break;
            case 4:
                width = 100;
                color = 'var(--success-color)';
                break;
            default:
                width = 0;
                color = 'transparent';
        }
        
        strengthBar.style.width = `${width}%`;
        strengthBar.style.backgroundColor = color;
    }

    // Soumission du formulaire
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validation des mots de passe
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }
        
        if (passwordInput.value.length < 8) {
            alert('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        
        // Préparation des données
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            specialty: document.getElementById('specialty').value,
            password: passwordInput.value
        };
        
        try {
            // Simulation d'envoi - À remplacer par un vrai fetch()
            const response = await simulateApiCall(formData);
            
            if (response.success) {
                alert('Inscription réussie ! Redirection vers la page de connexion...');
                window.location.href = 'connexion.html';
            } else {
                alert(response.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue');
        }
    });

    // Simulation d'appel API
    async function simulateApiCall(data) {
        console.log('Données à envoyer:', data);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Compte créé avec succès'
                });
            }, 1500);
        });
    }
});
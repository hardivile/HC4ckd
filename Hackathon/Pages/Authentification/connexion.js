document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('loginPassword');

    // Basculer la visibilité du mot de passe
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Soumission du formulaire
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = passwordInput.value;
        
        // Validation basique
        if (!email || !password) {
            showError('Veuillez remplir tous les champs');
            return;
        }
        
        try {
            // Simulation de connexion - À remplacer par un vrai fetch()
            const response = await simulateLogin(email, password);
            
            if (response.success) {
                // Redirection après connexion réussie
                window.location.href = 'tableau-de-bord.html';
            } else {
                showError(response.message || 'Identifiants incorrects');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showError('Une erreur est survenue');
        }
    });

    // Afficher un message d'erreur
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Supprimer les anciens messages d'erreur
        const oldError = document.querySelector('.error-message');
        if (oldError) oldError.remove();
        
        loginForm.prepend(errorElement);
        
        // Ajout du style d'erreur aux champs
        document.getElementById('loginEmail').style.boxShadow = '0 0 0 2px var(--error-color)';
        passwordInput.style.boxShadow = '0 0 0 2px var(--error-color)';
        
        setTimeout(() => {
            errorElement.classList.add('fade-out');
            setTimeout(() => errorElement.remove(), 500);
        }, 3000);
    }

    // Simulation de connexion - À remplacer par un vrai appel API
    async function simulateLogin(email, password) {
        console.log('Tentative de connexion avec:', { email, password });
        return new Promise(resolve => {
            setTimeout(() => {
                // Simule une réponse réussie dans 80% des cas
                const success = Math.random() > 0.2;
                resolve({
                    success,
                    message: success ? '' : 'Email ou mot de passe incorrect'
                });
            }, 1500);
        });
    }
});
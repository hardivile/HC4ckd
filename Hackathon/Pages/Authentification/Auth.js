document.addEventListener('DOMContentLoaded', function() {
    // Gestion commune aux deux pages
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    
    // Afficher/masquer le mot de passe
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Page de connexion spécifique
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (validateLogin(email, password)) {
                // Redirection après connexion réussie
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Page d'inscription spécifique
    if (document.getElementById('signupForm')) {
        const signupForm = document.getElementById('signupForm');
        
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const role = document.getElementById('role').value;
            
            if (validateSignup(fullname, email, password, confirmPassword, role)) {
                // Redirection après inscription réussie
                window.location.href = 'connexion.html?registered=true';
            }
        });
    }

    // Fonctions de validation
    function validateLogin(email, password) {
        if (!email || !password) {
            showError('Veuillez remplir tous les champs');
            return false;
        }

        if (!isValidEmail(email)) {
            showError('Veuillez entrer un email valide');
            return false;
        }

        return true;
    }

    function validateSignup(fullname, email, password, confirmPassword, role) {
        if (!fullname || !email || !password || !confirmPassword || !role) {
            showError('Veuillez remplir tous les champs');
            return false;
        }

        if (!isValidEmail(email)) {
            showError('Veuillez entrer un email valide');
            return false;
        }

        if (password.length < 8) {
            showError('Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }

        if (password !== confirmPassword) {
            showError('Les mots de passe ne correspondent pas');
            return false;
        }

        return true;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(message) {
        // Créez ou utilisez un élément existant pour afficher les erreurs
        let errorDiv = document.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            document.querySelector('form').prepend(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
});
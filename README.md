# Suivi Médical CKD – Application Backend (Django)

Projet développé dans le cadre du hackathon **AI4CKD**.  
Cette application permet la gestion des patients atteints de maladies chroniques rénales (CKD), avec une interface sécurisée pour les médecins.

---

## 🚀 Fonctionnalités

- Authentification et gestion des rôles (administrateurs, médecins)
- Gestion des patients et de leurs dossiers médicaux
- Enregistrement des consultations, traitements et analyses
- Alertes et notifications internes
- (Optionnel) Intégration future de modèles IA pour l’analyse médicale

---

## 🛠️ Technologies utilisées

- Python & Django (backend)
- SQLite (base de données native Django)
- Django REST Framework (API)
- Django Auth (sécurité intégrée)

---

## ⚙️ Installation locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/hardivile/HC4ckd.git
   cd HC4ckd

2. **Créer un environnement virtuel**
   ```bash
   python -m venv env
   source env/bin/activate  # Linux/macOS
   env\Scripts\activate     # Windows


3. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt


4. **Migrer la base**
   ```bash
   python manage.py migrate


5. **Créer un superutilisateur**
   ```bash
   python manage.py createsuperuser


6. **Lancer le serveur**
   ```bash
   python manage.py runserver

---

## 🔐 Sécurité

Authentification avec django.contrib.auth

Gestion des sessions et droits d’accès

Interface d’administration sécurisée

---

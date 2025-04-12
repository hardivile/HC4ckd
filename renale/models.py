from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Administrator'),
        ( 'medecin', 'Medecin'),
        
       
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    prenoms = models.CharField(max_length=255)
    tel = models.CharField(max_length=20)  # Numéro de téléphone
    nom = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    specialite = models.CharField(max_length=255 , blank=True, null=True)




    def __str__(self):
        return self.username


class Patient(models.Model):
    nom = models.CharField(max_length=255)
    prenoms = models.CharField(max_length=255)
    age = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    stade = models.PositiveIntegerField(null=True, blank=True)  # Null avant analyse
    donnees_labo = models.JSONField(null=True, blank=True)  # Pour stocker les résultats bruts
    date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.nom} {self.prenoms}"


class Rdv(models.Model):
    patient = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    tp = models.CharField(max_length=255)
    notes = models.CharField(max_length=255)
   

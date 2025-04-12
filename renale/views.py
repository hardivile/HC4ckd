from django.shortcuts import render, redirect
from .models import CustomUser,Patient,Rdv
from django.contrib import messages
from django.contrib.auth import get_user_model, login, logout
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, get_object_or_404, redirect
from .models import Patient 
import json

 
def home(request):

    return render(request, 'index.html')

from datetime import timedelta
from django.utils import timezone





def dm(request):
    pt = Patient.objects.all()

    if request.method == "GET":
        rec = request.GET.get('patient')
        if rec: 
            pt = Patient.objects.filter(nom__icontains=rec)

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            data = list(pt.values())
            return JsonResponse({'data': data})

    total_pt = pt.count()
    rd = Rdv.objects.all()
    total_rd = rd.count() 
    cct = pt.filter(stade__gte=4).count()

    today = timezone.now().date()
    last_30_days = [today - timedelta(days=i) for i in range(29, -1, -1)]

    # Format des dates : ex. "10 avr"
    last_30_days_labels = [day.strftime('%d %b') for day in last_30_days]

    daily_new_patients = [
        pt.filter(date__year=day.year, date__month=day.month, date__day=day.day).count()
        for day in last_30_days
    ]

    context = {
        'total_pt': total_pt,
        'total_rd': total_rd,
        'cct': cct,
        'pt': pt,
        'stages_count': [pt.filter(stade=i).count() for i in range(1, 6)],
        'daily_new_patients': daily_new_patients,
        'last_30_days_labels': last_30_days_labels,
    }
    
    return render(request, 'dashboard.html', context)



def enr(request):

    return render(request, 'enr.html')

def pers(request):

    return render(request, 'pers.html')

def pat(request):
    pt = Patient.objects.all()  # Récupérer tous les patients

    if request.method =="GET":
        rec =  request.GET.get('patient')
        if rec : 
            pt = Patient.objects.filter(nom__icontains= rec)

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            data = list(pt.values())
            return JsonResponse({'data':data})





    return render(request, 'patient.html', {'pt': pt})

def par(request):

    return render(request, 'parametres.html')


def da(request):
    pt = Patient.objects.all()

    if request.method == "GET":
        rec = request.GET.get('patient')
        if rec: 
            pt = Patient.objects.filter(nom__icontains=rec)

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            data = list(pt.values())
            return JsonResponse({'data': data})

    total_pt = pt.count()
    rd = Rdv.objects.all()
    total_rd = rd.count() 
    cct = pt.filter(stade__gte=4).count()

    today = timezone.now().date()
    last_30_days = [today - timedelta(days=i) for i in range(29, -1, -1)]

    # Format des dates : ex. "10 avr"
    last_30_days_labels = [day.strftime('%d %b') for day in last_30_days]

    daily_new_patients = [
        pt.filter(date__year=day.year, date__month=day.month, date__day=day.day).count()
        for day in last_30_days
    ]

    context = {
        'total_pt': total_pt,
        'total_rd': total_rd,
        'cct': cct,
        'pt': pt,
        'stages_count': [pt.filter(stade=i).count() for i in range(1, 6)],
        'daily_new_patients': daily_new_patients,
        'last_30_days_labels': last_30_days_labels,
    }
    
    return render(request, 'da.html', context)



def med(request):
    users  = CustomUser.objects.filter(user_type='medecin')

    return render(request, 'medecin.html', {'users': users})

def rend(request):
    
    pt= Patient.objects.all()
    rd =  Rdv.objects.all()
    total_rd = rd.count() 

    
    
    context = {
        
        'pt': pt,
        'total_rd': total_rd,

    }


    return render(request, 'rendezvous.html',context )


def ins(request):
    if request.method == 'POST':
        nom =request.POST.get('lastName')
        prenoms = request.POST.get('firstName')
        email = request.POST.get('email')
        tel = request.POST.get('phone')
        specialite = request.POST.get('specialty') 
        password = request.POST.get('password')
        password1 = request.POST.get('confirmPassword')

        if password != password1:
            messages.error(request, "Les mots de passe ne correspondent pas.")
            return redirect('ins')

        if get_user_model().objects.filter(nom=nom).exists():
            return render(request, 'ins.html', {'error': 'Nom d\'utilisateur déjà utilisé'})

        User = get_user_model()
        user = User.objects.create_user(
           
            prenoms=prenoms,
            tel=tel,
            username=nom,
            email=email,
            specialite=specialite,
            password=password,
           
        )
        
        user. prenoms = prenoms
        user.tel = tel
        user.user_type = 'medecin'
        user.save()  
        messages.success(request, "Inscription réussie.")

        return redirect('con')
        
    else :

        return render(request, 'inscription_medecin.html')



    return render(request, 'inscription_medecin.html')







def ins_admin(request):
    if request.method == 'POST':
        # Récupérer les données du formulaire
        nom = request.POST.get('lastName')
        prenoms = request.POST.get('firstName')
        email = request.POST.get('email')
        tel = request.POST.get('phone')
        specialite = request.POST.get('specialty')
        password = request.POST.get('password')
        password1 = request.POST.get('confirmPassword')

        # Vérifier que les mots de passe correspondent
        if password != password1:
            messages.error(request, "Les mots de passe ne correspondent pas.")
            return redirect('ins_admin')

        # Vérifier si l'email ou le nom d'utilisateur existe déjà
        User = get_user_model()

        # Vérification d'existence de l'email
        if User.objects.filter(email=email).exists():
            messages.error(request, "Cet email est déjà utilisé.")
            return redirect('ins_admin')

        # Vérification d'existence du nom d'utilisateur
        if User.objects.filter(nom=nom).exists():
            messages.error(request, "Nom d'utilisateur déjà utilisé.")
            return redirect('ins_admin')

        # Créer l'utilisateur admin
        user = User.objects.create_user(
            username=nom,
            email=email,
            password=password,
            prenoms=prenoms,
            tel=tel,
            nom=nom,
            specialite=specialite,
            user_type='admin',  # Spécifier le type d'utilisateur
        )

        # Sauvegarder l'utilisateur
        user.save()

        messages.success(request, "Inscription réussie.")
        return redirect('con')  # Rediriger vers la page de connexion

    return render(request, 'inscription_admin.html')







def con(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, "Email ou mot de passe incorrect.")
            return redirect('con')

        if user.check_password(password):
            login(request, user)

            redirects = {
                'medecin': 'dm',
                'admin': 'da',
            }

            redirect_url = redirects.get(user.user_type)

            if redirect_url:
                return redirect(redirect_url)
            else:
                messages.error(request, "Type d'utilisateur non reconnu.")
                return redirect('con')

        else:
            messages.error(request, "Nom d'utilisateur ou mot de passe incorrect.")
            return redirect('con')

    return render(request, 'connexion.html')






def addp(request):
    if request.method == 'POST':
        a = request.POST.get('lastName')
        b = request.POST.get('firstName')
        c = request.POST.get('age')
        d = request.POST.get('email')
        
        f = request.POST.get('lastExam')

        pat = Patient(



                nom = a,
                prenoms = b,
                age = c,
                email = d,
                
            
                date=f,
        )
        pat.save()
        return redirect('pat')
    return redirect('pat')




@csrf_exempt
def analyze_patient(request, patient_id):
    if request.method == 'POST':
        try:
            patient = Patient.objects.get(id=patient_id)
            lab_data = json.loads(request.body)
            
            # 1. Sauvegardez les données brutes
            patient.donnees_labo = lab_data
            
            # 2. Logique d'analyse (exemple simplifié)
            stade = determine_stade(lab_data)  # À implémenter
            
            # 3. Mise à jour du patient
            patient.stade = stade
            patient.save()
            
            return JsonResponse({
                'success': True,
                'stade': stade,
                'recommendations': get_recommendations(stade)
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

def determine_stade(lab_data):
    """Implémentez votre logique métier ici"""
    gfr = lab_data.get('gfr')
    if gfr >= 90: return 1
    elif gfr >= 60: return 2
    elif gfr >= 30: return 3
    elif gfr >= 15: return 4
    else: return 5


  
def addrnd(request):
    if request.method == 'POST':
        a = request.POST.get('patientId')
        b = request.POST.get('appointmentDate')
        c = request.POST.get('appointmentType')
        d = request.POST.get('notes')


        rdv = Rdv(



                patient = a,
                date = datetime.strptime( b, '%Y-%m-%dT%H:%M' ) ,
                tp = c,
                notes = d,
             
        )
        rdv.save()
        return redirect('rend')
    return redirect('rend')



def patient_details(request, patient_id):
    patient = get_object_or_404(Patient, id=patient_id)  # Fonction maintenant reconnue
    return render(request, 'patient-details.html', {'patient': patient})


@csrf_exempt
def analyze_patient(request, patient_id):
    if request.method == 'POST':
        try:
            patient = get_object_or_404(Patient, id=patient_id)
            data = json.loads(request.body)
            
            # Validation des données
            gfr = float(data.get('gfr'))
            albuminuria = float(data.get('albuminuria', 0))
            
            # Calcul du stade MRC
            if gfr >= 90: stage = 1
            elif gfr >= 60: stage = 2
            elif gfr >= 30: stage = 3
            elif gfr >= 15: stage = 4
            else: stage = 5
            
            # Génération des recommandations
            recommendations = []
            if stage in [1, 2]:
                recommendations.append("Surveillance annuelle")
            elif stage == 3:
                recommendations.append("Surveillance trimestrielle")
                if albuminuria > 30:
                    recommendations.append("Traitement néphroprotecteur")
            elif stage == 4:
                recommendations.append("Préparation à la suppléance")
                recommendations.append("Éducation thérapeutique")
            elif stage == 5:
                recommendations.append("Dialyse ou transplantation")
            
            # Sauvegarde
            patient.stade = stage
            patient.donnees_labo = {
                'gfr': gfr,
                'albuminuria': albuminuria,
                'date_analyse': datetime.now().isoformat()
            }
            patient.save()
            
            return JsonResponse({
                'success': True,
                'stage': stage,
                'recommendations': recommendations,
                'patient_id': patient.id
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)


def SupP(request,id):
    pt= Patient.objects.get(id=id)
    pt.delete()

    return redirect("pat")


def update(request,id):
    pt = Patient.objects.get(id=id)
    return render(request,'updatepatient.html',{'pt':pt}) 

@csrf_exempt  
def analyze_data(request):
    if request.method == 'POST':
        try:
            # 1. Récupérer les données
            data = request.POST
            print("Données reçues:", data)  # Vérification dans la console serveur
            
            # 2. Traitement (exemple simplifié)
            results = f"Analyse terminée pour {data.get('patient_id')}"
            
            # 3. Retourner la réponse
            return JsonResponse({'status': 'success', 'results': results})
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'})


def uprec(request, id):
    a = request.POST['lastName']
    b = request.POST['firstName']
    c = request.POST['age']
    d = request.POST['email']
    e = request.POST['ckdStage']
    f = request.POST['lastExam']
    
    pt = Patient.objects.get(id=id)
    pt.nom = a
    pt.prenoms = b
    pt.age = c
    pt.email = d
    pt.stade=e
    pt.date=f
    
    pt.save()

    return redirect('pat')


def custom_logout(request):
    if request.method == 'POST':
        logout(request)
        return redirect('con')
    return redirect('con') 









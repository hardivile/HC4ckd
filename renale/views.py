from django.shortcuts import render, redirect
from .models import CustomUser,Patient,Rdv
from django.contrib import messages
from django.contrib.auth import get_user_model, login, logout
from datetime import datetime
from django.http import JsonResponse

# Create your views here.
 
def home(request):

    return render(request, 'index.html')

from datetime import timedelta
from django.utils import timezone


def dm(request):
    pt = Patient.objects.all()


    if request.method =="GET":
        rec =  request.GET.get('patient')
        if rec : 
            pt = Patient.objects.filter(nom__icontains= rec)

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            data = list(pt.values())
            return JsonResponse({'data':data})


    
    # Nombre total de patients
    total_pt = pt.count()
    rd =  Rdv.objects.all()
    total_rd = rd.count() 

    # Nombre de cas critiques
    cct = pt.filter(stade__gte=4).count()

    # Calcul des nouveaux patients par jour pour les 30 derniers jours
    today = timezone.now().date()
    last_30_days = [today - timedelta(days=i) for i in range(30)]
    
    # Compter les nouveaux patients pour chaque jour des 30 derniers jours
    daily_new_patients = []
    for day in last_30_days:
        # Filtrer les patients qui ont été créés ce jour-là (en utilisant `__date` pour convertir en date)
        count = pt.filter(date__year=day.year, date__month=day.month, date__day=day.day).count()
        daily_new_patients.append(count)

    context = {
        'total_pt': total_pt,
        'total_rd': total_rd,
        'cct': cct,
        'pt': pt,
        'stages_count': [pt.filter(stade=i).count() for i in range(1, 6)],  # Compter les patients par stade
        'daily_new_patients': daily_new_patients,  # Passer les nouveaux patients pour chaque jour
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

    return render(request, 'da.html')

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
        e = request.POST.get('ckdStage')
        f = request.POST.get('lastExam')

        pat = Patient(



                nom = a,
                prenoms = b,
                age = c,
                email = d,
                stade=e ,
            
                date=f,
        )
        pat.save()
        return redirect('pat')
    return redirect('pat')

  
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



def SupP(request,id):
    pt= Patient.objects.get(id=id)
    pt.delete()

    return redirect("pat")


def update(request,id):
    pt = Patient.objects.get(id=id)
    return render(request,'updatepatient.html',{'pt':pt}) 




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









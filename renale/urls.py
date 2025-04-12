from django.conf import settings
from django.conf.urls.static import static

from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views


urlpatterns = [
    path( "", views.home, name="home"  ),
    path( "enr", views.enr, name="enr"  ),
    path( "pers", views.pers, name="pers"  ),
    path( "ins", views.ins, name="ins"  ),

    path( "ins_admin", views.ins_admin, name="ins_admin"  ),


    path( "con", views.con, name="con"  ),
    path('update/<int:id>/', views.update,name="update"),
    path('update/uprec/<int:id>/',views.uprec,name="uprec"),



    path( "dm", views.dm, name="dm"  ),
    path( "da", views.da, name="da"  ),
    path( "med", views.med, name="med"  ),


    path( "pat", views.pat, name="pat"  ),
    path( "rend", views.rend, name="rend"  ),
    path( "par", views.par, name="par"  ),
    path( "addp", views.addp, name="addp"  ),
    path( "addrnd", views.addrnd, name="addrnd"  ),
    path('patient-details/<int:patient_id>/', views.patient_details, name='patient_details'),
    path('api/analyze-patient/<int:patient_id>/', views.analyze_patient, name='analyze_patient'),


    path( "pat/SupP/<int:id>/", views.SupP, name="SupP"  ),
    

    path('analyze/', views.analyze_data, name='analyze_data'),


    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),

]
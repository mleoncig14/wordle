from datetime import *
from django.urls import reverse_lazy
from django.views import generic
from django.contrib.auth.views import LoginView
from django.utils import timezone

from goldenGuess.models import Game
from users.models import CustomUser  # Import Django's built-in LoginView
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.views.generic import ListView

    
class SignUpView(generic.CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'users/signup.html'

class PrevView(ListView):
    template_name = 'users/all_prev_plays.html'
    context_object_name = 'all_prev_plays'
    today = timezone.now()
    last_week_start = today - timedelta(days=7)
    last_month_end = today.replace(day=1) - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    def get_queryset(self, last_week_start, today):
        return Game.objects.filter(pub_date__gte=last_week_start, pub_date__lte=today)
    def get_queryset_last_month(self, last_month_start, last_month_end):
        return Game.objects.filter(pub_date__gte=last_month_start, pub_date__lte=last_month_end)
    def get_queryset_last_year(self):
        return Game.objects.all(pub_date__year=2023)
    def get_queryset_all_time(self):
        return Game.objects.all()
    def get_queryset_last_week(self, last_week_start, today):
        return Game.objects.filter(pub_date__gte=last_week_start, pub_date__lte=today)



class PrevPlaysAllView(ListView):
    template_name = 'users/all_prev_plays.html'
    context_object_name = 'all_prev_plays'
    
    def get_queryset(self):
        """Return the last five published questions."""
        return Game.objects.all()
    

@login_required
def profile(request):
    return render(request, 'users/profile.html', {'user': request.user})
def prev_plays(request):
    return render(request, 'users/prev_plays.html', {'user': request.user})

# Define the login_view if you are using a custom one or want to customize Django's built-in view
# Otherwise, you can directly use LoginView.as_view() in your urls.py
login_view = LoginView.as_view(template_name='users/login.html')  # Point to your login template

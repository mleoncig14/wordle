from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect
from wordly_weapp import settings
from .models import Game
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from django.urls import reverse
from django.utils import timezone
from django.views.generic import ListView
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

#from django.views.decorators.http import require_http_methods
import random
import os
import json

# Create your views here.
    
@csrf_exempt
@login_required 
def save_game(request):
    try:
        data = json.loads(request.body)
        game = Game (
            user = request.user,
            language = data['language'],
            pass_fail=data['pass_fail'],
            number_of_attempts=data['number_of_attempts'],
            words_guessed=data['words_guessed'],
            correct_word=data['correct_word']
        )
        game.save()
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": True})


@login_required 
def game_over(request):
    return render(request, "goldenGuess/game_end.html")


@login_required
def start_game(request):
    if request.method == 'POST':

        if can_play(request.user):
            request.session['language'] = request.POST.get('language')
            language = request.session.get('language', 'english')  # Default to English
            keyboard_file = f'keyboards/{language}_keyboard.html'
            return render(request, 'goldenGuess/play_game.html', {
                'keyboard': keyboard_file
            })
        else:
            context = {"message": "Not enough Krato Coins"}
            return render(request, "goldenGuess/game_end.html", context)
    else:
        return render(request, "goldenGuess/select_language.html")
    

def can_play(user):
    today = timezone.now().date()
    start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
    end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))

    games_today = Game.objects.filter(user=user, game_date__range=(start_of_day, end_of_day)).count() # getting number of games played thus far

    print(f'GAMES TODAY: {games_today}') # for debugging

    return games_today < 100 #TODO: change to 3 when done testing

        
@login_required
def profile(request):
    return render(request, 'users/profile.html', {'user': request.user})

def handle_actions(request):
    action = request.POST.get('action')
    if action == 'new_game':
        return HttpResponseRedirect(reverse('goldenGuess:start_game'))
    elif action == 'purchase_coins':
        return HttpResponseRedirect(reverse('goldenGuess:start_game')) #TODO: change url to appropriate page
    
    

@login_required
def select_language(request):
    return render(request, "goldenGuess/select_language.html")
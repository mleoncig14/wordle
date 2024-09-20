from django.urls import path
from .views import start_game, save_game, game_over, handle_actions, select_language
#from .views import SignUpView, login_view, profile
from django.contrib.auth import views as auth_views
app_name = 'goldenGuess'
urlpatterns = [
    path('start_game/', start_game, name='start_game'),
    path('save_game/', save_game, name='save_game'),
    path('game_over/', game_over, name='game_over'),
    path('handle_actions/', handle_actions, name='handle_actions'),
    path('select_language/', select_language, name="select_language")

]
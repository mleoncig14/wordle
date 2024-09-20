from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class CustomUser(AbstractUser):
    # Add additional fields in here
    name = models.CharField(max_length=30, blank=True, null=True)
    games_played = models.IntegerField(default=0)
    win_percentage = models.FloatField(default=0)

    def query_games_played(self):
        return self.games_played
    def query_win_percentage(self):
        return self.win_percentage
    

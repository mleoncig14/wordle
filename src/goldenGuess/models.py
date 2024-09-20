from django.db import models
from django.conf import settings
from psutil import users

# Create your models here.
class Game(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="games",
        default=1

    )
    language = models.CharField(max_length=20)
    game_date = models.DateTimeField(auto_now_add=True)
    pass_fail = models.BooleanField()
    number_of_attempts = models.IntegerField()
    words_guessed = models.TextField(help_text="Comma-separated list of guessed words")
    correct_word = models.CharField(max_length=100)
from django.db import models
from django.conf import settings


class SentimentAnalysis(models.Model):
    """
    Har analysis ka record database mein save hoga.
    Taaki user apni history dekh sake.
    """
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
        ('neutral', 'Neutral'),
    ]

    EMOTION_CHOICES = [
        ('joy', 'Joy'),
        ('anger', 'Anger'),
        ('fear', 'Fear'),
        ('sadness', 'Sadness'),
        ('surprise', 'Surprise'),
        ('disgust', 'Disgust'),
        ('neutral', 'Neutral'),
    ]

    # Kis user ne analyse kiya
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='analyses'
    )

    # Input text
    text = models.TextField()

    # Sentiment results
    sentiment_label = models.CharField(max_length=20, choices=SENTIMENT_CHOICES)
    sentiment_score = models.FloatField()
    sentiment_all_scores = models.JSONField(default=dict)

    # Emotion results
    dominant_emotion = models.CharField(max_length=20, choices=EMOTION_CHOICES)
    emotion_score = models.FloatField()
    all_emotions = models.JSONField(default=dict)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.sentiment_label} ({self.created_at})"

    class Meta:
        db_table = 'sentiment_analyses'
        ordering = ['-created_at']  # newest first
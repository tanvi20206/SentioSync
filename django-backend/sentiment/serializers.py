from rest_framework import serializers
from .models import SentimentAnalysis


class AnalysisRequestSerializer(serializers.Serializer):
    """
    User se text input lena
    """
    text = serializers.CharField(
        required=True,
        min_length=3,
        max_length=5000,
        error_messages={
            'min_length': 'Text kam se kam 3 characters ka hona chahiye.',
            'max_length': 'Text zyada se zyada 5000 characters ka ho sakta hai.',
            'required': 'Text field zaroori hai.',
        }
    )


class SentimentAnalysisSerializer(serializers.ModelSerializer):
    """
    Analysis result ko JSON mein convert karna
    """
    class Meta:
        model = SentimentAnalysis
        fields = [
            'id',
            'text',
            'sentiment_label',
            'sentiment_score',
            'sentiment_all_scores',
            'dominant_emotion',
            'emotion_score',
            'all_emotions',
            'created_at',
        ]
        read_only_fields = fields  # sab read-only — user change nahi kar sakta
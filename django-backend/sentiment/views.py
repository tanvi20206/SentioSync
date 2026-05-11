from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .ml_model import full_analysis
from .models import SentimentAnalysis
from .serializers import AnalysisRequestSerializer, SentimentAnalysisSerializer


class AnalyseTextView(APIView):
    """
    POST /api/sentiment/analyse/
    Text bhejo → sentiment + emotion result pao
    Login hona zaroori hai
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Step 1: Input validate karo
        serializer = AnalysisRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        text = serializer.validated_data['text']

        # Step 2: AI model se analyse karo
        result = full_analysis(text)

        if not result['success']:
            return Response(
                {'error': 'Analysis failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Step 3: Result database mein save karo
        analysis = SentimentAnalysis.objects.create(
            user=request.user,
            text=text,
            sentiment_label=result['sentiment']['label'],
            sentiment_score=result['sentiment']['score'],
            sentiment_all_scores=result['sentiment']['all_scores'],
            dominant_emotion=result['emotions']['dominant_emotion'],
            emotion_score=result['emotions']['score'],
            all_emotions=result['emotions']['all_emotions'],
        )

        # Step 4: Response bhejo
        output = SentimentAnalysisSerializer(analysis)
        return Response({
            'message': 'Analysis complete!',
            'result': output.data
        }, status=status.HTTP_201_CREATED)


class AnalysisHistoryView(APIView):
    """
    GET /api/sentiment/history/
    User ki saari purani analyses dikhao
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analyses = SentimentAnalysis.objects.filter(user=request.user)
        serializer = SentimentAnalysisSerializer(analyses, many=True)
        return Response({
            'count': analyses.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class AnalysisDetailView(APIView):
    """
    GET /api/sentiment/history/<id>/
    Ek specific analysis ka detail
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            analysis = SentimentAnalysis.objects.get(pk=pk, user=request.user)
        except SentimentAnalysis.DoesNotExist:
            return Response(
                {'error': 'Analysis not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SentimentAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            analysis = SentimentAnalysis.objects.get(pk=pk, user=request.user)
            analysis.delete()
            return Response(
                {'message': 'Analysis deleted.'},
                status=status.HTTP_200_OK
            )
        except SentimentAnalysis.DoesNotExist:
            return Response(
                {'error': 'Analysis not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
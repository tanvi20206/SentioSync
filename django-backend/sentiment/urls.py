from django.urls import path
from . import views

urlpatterns = [
    # Text analyse karo
    path('analyse/', views.AnalyseTextView.as_view(), name='analyse'),

    # Analysis history dekho
    path('history/', views.AnalysisHistoryView.as_view(), name='history'),

    # Specific analysis detail / delete
    path('history/<int:pk>/', views.AnalysisDetailView.as_view(), name='analysis-detail'),
]
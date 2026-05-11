from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

_sentiment_pipeline = None
_emotion_pipeline = None


def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        logger.info("Loading sentiment model...")
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            return_all_scores=True,
            top_k=None
        )
        logger.info("Sentiment model loaded!")
    return _sentiment_pipeline


def get_emotion_pipeline():
    global _emotion_pipeline
    if _emotion_pipeline is None:
        logger.info("Loading emotion model...")
        _emotion_pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True,
            top_k=None
        )
        logger.info("Emotion model loaded!")
    return _emotion_pipeline


def analyse_sentiment(text):
    try:
        text = text[:512]
        pipe = get_sentiment_pipeline()
        raw = pipe(text)

        # Output nested list aata hai: [[{...}, {...}]]
        # raw[0] se andar wali list lo
        results = raw[0]

        all_scores = {item['label'].lower(): round(item['score'], 4) for item in results}
        dominant = max(results, key=lambda x: x['score'])

        return {
            "label": dominant['label'].lower(),
            "score": round(dominant['score'], 4),
            "all_scores": all_scores,
            "success": True
        }
    except Exception as e:
        logger.error(f"Sentiment error: {e}")
        return {"success": False, "error": str(e)}


def analyse_emotions(text):
    try:
        text = text[:512]
        pipe = get_emotion_pipeline()
        raw = pipe(text)

        # Same — raw[0] se andar wali list lo
        results = raw[0]

        all_emotions = {item['label'].lower(): round(item['score'], 4) for item in results}
        dominant = max(results, key=lambda x: x['score'])

        return {
            "dominant_emotion": dominant['label'].lower(),
            "score": round(dominant['score'], 4),
            "all_emotions": all_emotions,
            "success": True
        }
    except Exception as e:
        logger.error(f"Emotion error: {e}")
        return {"success": False, "error": str(e)}


def full_analysis(text):
    sentiment = analyse_sentiment(text)
    emotions = analyse_emotions(text)

    return {
        "text": text,
        "sentiment": sentiment,
        "emotions": emotions,
        "success": sentiment["success"] and emotions["success"]
    }

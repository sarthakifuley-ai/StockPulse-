import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, f1_score
from ml.preprocessing.loader import load_phrasebank

MODEL_SAVE_PATH = os.path.join("ml", "saved_models", "sentiment_pipeline.pkl")

def train_sentiment_model():
    """
    Train TF-IDF Vectorizer + Logistic Regression sentiment classifier strictly on 
    Financial PhraseBank Sentences_AllAgree.txt (highest agreement dataset).
    Evaluates separately on Sentences_50Agree.txt as an independent benchmark.
    Saves trained pipeline artifact to ml/saved_models/sentiment_pipeline.pkl.
    """
    print("=== STEP 1: Loading Primary High-Agreement Training Dataset (Sentences_AllAgree.txt) ===")
    train_sentences, train_labels = load_phrasebank(agree_level="AllAgree")
    print(f"Primary Training Set Size: {len(train_sentences)} sentences.")

    print("\n=== STEP 2: Loading Separate Benchmark Dataset (Sentences_50Agree.txt) ===")
    eval_sentences, eval_labels = load_phrasebank(agree_level="50Agree")
    print(f"Separate Benchmark Evaluation Set Size: {len(eval_sentences)} sentences.")

    # Build TF-IDF + Logistic Regression Pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')),
        ('clf', LogisticRegression(C=1.0, max_iter=1000, random_state=42))
    ])

    print("\n=== STEP 3: Training Sentiment Pipeline on Sentences_AllAgree.txt ===")
    pipeline.fit(train_sentences, train_labels)

    # Evaluate on primary train set
    train_pred = pipeline.predict(train_sentences)
    train_acc = accuracy_score(train_labels, train_pred)
    train_f1 = f1_score(train_labels, train_pred, average='weighted')

    # Evaluate on separate 50Agree benchmark set (without mixing into training!)
    eval_pred = pipeline.predict(eval_sentences)
    eval_acc = accuracy_score(eval_labels, eval_pred)
    eval_f1 = f1_score(eval_labels, eval_pred, average='weighted')

    print("\n=== SENTIMENT MODEL PERFORMANCE RESULTS ===")
    print(f"Primary Train Accuracy (AllAgree): {train_acc:.4f} | Weighted F1: {train_f1:.4f}")
    print(f"Benchmark Test Accuracy (50Agree):  {eval_acc:.4f} | Weighted F1: {eval_f1:.4f}")
    print("\nSeparate Benchmark Classification Report (50Agree):\n", classification_report(eval_labels, eval_pred))

    # Save fitted model artifact
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    joblib.dump(pipeline, MODEL_SAVE_PATH)
    print(f"Saved fitted sentiment pipeline artifact to {MODEL_SAVE_PATH}")

    return {
        "all_agree_samples": len(train_sentences),
        "benchmark_50agree_samples": len(eval_sentences),
        "train_accuracy": float(train_acc),
        "train_f1": float(train_f1),
        "benchmark_accuracy": float(eval_acc),
        "benchmark_f1": float(eval_f1),
        "save_path": MODEL_SAVE_PATH
    }

def predict_sentiment(text: str):
    """
    Predict sentiment label, confidence score, and class probabilities for financial text.
    """
    if not os.path.exists(MODEL_SAVE_PATH):
        train_sentiment_model()

    pipeline = joblib.load(MODEL_SAVE_PATH)
    probs = pipeline.predict_proba([text])[0]
    classes = pipeline.classes_
    best_idx = probs.argmax()

    return {
        "label": classes[best_idx],
        "confidence": float(probs[best_idx]),
        "probabilities": {cls: float(p) for cls, p in zip(classes, probs)}
    }

if __name__ == "__main__":
    train_sentiment_model()

import os
import pdfplumber
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenRouter API configuration
OPENROUTER_API_KEY = "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"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# Interview stages and their corresponding prompts
INTERVIEW_STAGES = {
    "introduction": "Let's start with a basic introduction. Please introduce yourself and tell me about your background.",
    "strengths": "What would you say are your greatest strengths? Please provide specific examples from your experience.",
    "weaknesses": "What are your areas for improvement or weaknesses? How are you working on them?",
    "experience": "Tell me about your relevant experience for this position.",
    "technical": "Let's dive into some technical questions specific to the role.",
    "behavioral": "Let's discuss some behavioral scenarios you might encounter in this role.",
    "closing": "Do you have any questions for me about the role or the company?"
}

@app.route("/")
def index():
    return send_file("index.html")

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

@app.route("/upload", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]
    text = extract_text_from_pdf(file)
    return jsonify({"text": text})

@app.route("/ask", methods=["POST"])
def ask_question():
    try:
        data = request.json
        resume_text = data["resume"]
        job_title = data["job"]
        history = data["history"]
        current_stage = data.get("stage", "introduction")

        # Determine the next stage based on history length
        stages = list(INTERVIEW_STAGES.keys())
        if len(history) >= len(stages):
            current_stage = "closing"
        else:
            current_stage = stages[len(history)]

        # Create a context-aware prompt
        prompt = f"""You are an expert interviewer for the position of {job_title}.
Given this resume:\n\n{resume_text}\n\n

Current interview stage: {current_stage}
Previous questions and answers:\n{chr(10).join(history) if history else 'No previous questions'}

Based on the candidate's background and the current stage ({current_stage}), ask an appropriate question.
For technical questions, focus on the specific skills and technologies mentioned in their resume.
For behavioral questions, relate them to the job requirements and their experience.
Keep questions clear, specific, and relevant to their background."""

        # Generate content from DeepSeek with retry logic
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                headers = {
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "Mock Interview Bot"
                }
                
                payload = {
                    "model": "deepseek/deepseek-r1:free",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                }
                
                response = requests.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
                response.raise_for_status()
                
                result = response.json()
                question = result["choices"][0]["message"]["content"].strip()
                return jsonify({
                    "question": question,
                    "stage": current_stage,
                    "is_final": current_stage == "closing"
                })
                
            except Exception as e:
                if "rate_limit" in str(e).lower() and attempt < max_retries - 1:
                    print(f"Rate limit error, retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
                raise e

    except Exception as e:
        error_message = str(e)
        if "rate_limit" in error_message.lower():
            error_message = "API rate limit exceeded. Please try again in a few minutes."
        print("Backend error:", error_message)
        return jsonify({"error": f"Backend failure: {error_message}"}), 500

if __name__ == "__main__":
    print("Starting Flask app...")
    app.run(debug=True)

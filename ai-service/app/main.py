from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import SymptomInput, AnalysisResult
from app.services.symptom_analyzer import analyze_symptoms

app = FastAPI(title='TeleCare AI Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # For development only
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/health')
def health_check():
    return {'status': 'ok'}

@app.post('/api/analyze', response_model=AnalysisResult)
def analyze(input_data: SymptomInput):
    return analyze_symptoms(input_data)

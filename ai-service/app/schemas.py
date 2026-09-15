from pydantic import BaseModel
from typing import Optional

class SymptomInput(BaseModel):
    symptoms: list[str]
    duration: str
    severity: str
    age: Optional[int] = None
    gender: Optional[str] = None
    additional_info: Optional[str] = None

class PossibleCondition(BaseModel):
    condition: str
    description: str
    likelihood: str
    recommended_specialist: str

class AnalysisResult(BaseModel):
    possible_conditions: list[PossibleCondition]
    urgency: str
    urgency_label: str
    urgency_color: str
    recommendations: list[str]
    disclaimer: str
    follow_up_actions: list[str]

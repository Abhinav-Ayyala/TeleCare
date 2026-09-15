from typing import List
from app.schemas import SymptomInput, AnalysisResult, PossibleCondition

# NOTE: This is a rule-based system intended to be replaced with a real ML model.

KNOWLEDGE_BASE = [
    # Respiratory
    {
        "name": "Common Cold",
        "description": "A viral infection of your nose and throat (upper respiratory tract).",
        "symptoms": {"runny nose", "sore throat", "cough", "congestion", "sneezing", "low-grade fever"},
        "severity_weight": 1,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"high fever", "shortness of breath"}
    },
    {
        "name": "Influenza/Flu",
        "description": "A viral infection that attacks your respiratory system.",
        "symptoms": {"fever", "chills", "muscle aches", "cough", "congestion", "runny nose", "headache", "fatigue"},
        "severity_weight": 2,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"difficulty breathing", "chest pain"}
    },
    {
        "name": "Bronchitis",
        "description": "Inflammation of the lining of your bronchial tubes.",
        "symptoms": {"cough", "mucus", "fatigue", "shortness of breath", "slight fever", "chest discomfort"},
        "severity_weight": 2,
        "recommended_specialist": "Pulmonologist",
        "urgency_indicators": {"bloody mucus", "difficulty breathing"}
    },
    {
        "name": "Pneumonia",
        "description": "Infection that inflames air sacs in one or both lungs.",
        "symptoms": {"cough", "fever", "chills", "difficulty breathing", "chest pain"},
        "severity_weight": 4,
        "recommended_specialist": "Pulmonologist",
        "urgency_indicators": {"severe difficulty breathing", "blue lips"}
    },
    {
        "name": "Asthma Exacerbation",
        "description": "A sudden worsening of asthma symptoms caused by the tightening of muscles around airways.",
        "symptoms": {"shortness of breath", "chest tightness", "wheezing", "coughing"},
        "severity_weight": 3,
        "recommended_specialist": "Pulmonologist",
        "urgency_indicators": {"severe shortness of breath", "inability to speak"}
    },
    {
        "name": "COVID-like Illness",
        "description": "Respiratory illness resembling COVID-19.",
        "symptoms": {"fever", "chills", "cough", "shortness of breath", "fatigue", "muscle aches", "headache", "new loss of taste or smell"},
        "severity_weight": 3,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"trouble breathing", "persistent pain or pressure in the chest"}
    },
    # Gastrointestinal
    {
        "name": "Gastroenteritis",
        "description": "Intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever.",
        "symptoms": {"diarrhea", "abdominal cramps", "nausea", "vomiting", "low-grade fever"},
        "severity_weight": 2,
        "recommended_specialist": "Gastroenterologist",
        "urgency_indicators": {"severe dehydration", "blood in stool"}
    },
    {
        "name": "Food Poisoning",
        "description": "Illness caused by eating contaminated food.",
        "symptoms": {"nausea", "vomiting", "watery diarrhea", "abdominal pain", "cramps", "fever"},
        "severity_weight": 2,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"high fever", "blood in vomit"}
    },
    {
        "name": "Acid Reflux/GERD",
        "description": "Digestive disease in which stomach acid or bile irritates the food pipe lining.",
        "symptoms": {"heartburn", "chest pain", "difficulty swallowing", "regurgitation"},
        "severity_weight": 1,
        "recommended_specialist": "Gastroenterologist",
        "urgency_indicators": {"severe chest pain"}
    },
    {
        "name": "Irritable Bowel Syndrome",
        "description": "An intestinal disorder causing pain in the belly, gas, diarrhea, and constipation.",
        "symptoms": {"cramping", "abdominal pain", "bloating", "gas", "diarrhea", "constipation"},
        "severity_weight": 1,
        "recommended_specialist": "Gastroenterologist",
        "urgency_indicators": {"weight loss", "rectal bleeding"}
    },
    # Neurological
    {
        "name": "Migraine",
        "description": "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.",
        "symptoms": {"throbbing pain", "sensitivity to light", "sensitivity to sound", "nausea", "vomiting"},
        "severity_weight": 2,
        "recommended_specialist": "Neurologist",
        "urgency_indicators": {"sudden severe headache", "weakness on one side"}
    },
    {
        "name": "Tension Headache",
        "description": "A mild to moderate pain often described as feeling like a tight band around the head.",
        "symptoms": {"dull aching head pain", "sensation of tightness or pressure across forehead", "tenderness on scalp"},
        "severity_weight": 1,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"changes in vision"}
    },
    # Cardiovascular
    {
        "name": "Hypertension Symptoms",
        "description": "High blood pressure symptoms.",
        "symptoms": {"headache", "shortness of breath", "nosebleeds", "dizziness"},
        "severity_weight": 3,
        "recommended_specialist": "Cardiologist",
        "urgency_indicators": {"chest pain", "severe headache"}
    },
    {
        "name": "Possible Cardiac Event",
        "description": "A potentially life-threatening heart condition.",
        "symptoms": {"chest pain", "shortness of breath", "pain in arms", "dizziness", "cold sweat"},
        "severity_weight": 5,
        "recommended_specialist": "Emergency Medicine",
        "urgency_indicators": {"chest pain", "loss of consciousness"}
    },
    # Musculoskeletal
    {
        "name": "Muscle Strain",
        "description": "Stretching or tearing of a muscle or a tissue connecting muscle to bone.",
        "symptoms": {"pain", "swelling", "muscle spasms", "limited ability to move the muscle"},
        "severity_weight": 1,
        "recommended_specialist": "Orthopedist",
        "urgency_indicators": {"inability to walk", "severe swelling"}
    },
    {
        "name": "Arthritis Flare",
        "description": "A sudden increase in symptoms of arthritis.",
        "symptoms": {"joint pain", "stiffness", "swelling", "redness", "decreased range of motion"},
        "severity_weight": 2,
        "recommended_specialist": "Rheumatologist",
        "urgency_indicators": {"rapidly spreading redness"}
    },
    # Dermatological
    {
        "name": "Allergic Reaction",
        "description": "A condition in which the immune system reacts abnormally to a foreign substance.",
        "symptoms": {"sneezing", "runny nose", "itching", "rash", "hives", "swelling"},
        "severity_weight": 2,
        "recommended_specialist": "Allergist",
        "urgency_indicators": {"difficulty breathing", "swelling of face or throat"}
    },
    {
        "name": "Eczema/Dermatitis",
        "description": "An itchy inflammation of the skin.",
        "symptoms": {"dry skin", "itching", "red patches", "small raised bumps"},
        "severity_weight": 1,
        "recommended_specialist": "Dermatologist",
        "urgency_indicators": {"signs of infection"}
    },
    # General
    {
        "name": "Viral Infection",
        "description": "A generalized infection caused by a virus.",
        "symptoms": {"fever", "fatigue", "body aches", "sore throat", "headache"},
        "severity_weight": 1,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"high fever that doesn't break"}
    },
    {
        "name": "Urinary Tract Infection",
        "description": "An infection in any part of the urinary system.",
        "symptoms": {"strong persistent urge to urinate", "burning sensation when urinating", "passing frequent small amounts of urine", "cloudy urine"},
        "severity_weight": 2,
        "recommended_specialist": "Urologist",
        "urgency_indicators": {"back pain", "high fever", "shaking chills"}
    },
    {
        "name": "Anemia",
        "description": "A condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body's tissues.",
        "symptoms": {"fatigue", "weakness", "pale skin", "chest pain", "cold hands and feet", "dizziness"},
        "severity_weight": 2,
        "recommended_specialist": "Hematologist",
        "urgency_indicators": {"severe chest pain"}
    },
    {
        "name": "Dehydration",
        "description": "A condition that occurs when you use or lose more fluid than you take in.",
        "symptoms": {"extreme thirst", "less frequent urination", "dark-colored urine", "fatigue", "dizziness", "confusion"},
        "severity_weight": 2,
        "recommended_specialist": "General Practitioner",
        "urgency_indicators": {"confusion", "fainting"}
    }
]


def analyze_symptoms(input_data: SymptomInput) -> AnalysisResult:
    """
    Rule-based symptom analysis engine.
    This can be replaced with a trained ML model by implementing the same interface.
    """
    # Normalize inputs
    user_symptoms = [s.strip().lower() for s in input_data.symptoms]
    severity = input_data.severity.lower()

    # Score each condition by symptom overlap
    scored_conditions = []
    for condition in KNOWLEDGE_BASE:
        matched_symptoms = set(user_symptoms).intersection(condition["symptoms"])
        match_count = len(matched_symptoms)
        if match_count > 0:
            score = (match_count / len(condition["symptoms"])) * condition["severity_weight"]
            scored_conditions.append({
                "condition": condition,
                "score": score,
                "matched_symptoms": matched_symptoms
            })

    # Sort by score descending, take top 3
    scored_conditions.sort(key=lambda x: x["score"], reverse=True)
    top_matches = scored_conditions[:3]

    possible_conditions = []
    for match in top_matches:
        c = match["condition"]
        score = match["score"]
        if score > 2.0:
            likelihood = "High"
        elif score > 1.0:
            likelihood = "Moderate"
        else:
            likelihood = "Low"

        possible_conditions.append(PossibleCondition(
            condition=c["name"],
            description=c["description"],
            likelihood=likelihood,
            recommended_specialist=c["recommended_specialist"]
        ))

    # Urgency Classification
    urgency = "low"
    urgency_label = "Low Urgency"
    urgency_color = "green"

    user_symptoms_str = " ".join(user_symptoms)
    has_chest_pain = "chest pain" in user_symptoms_str
    has_sob = "shortness of breath" in user_symptoms_str or "difficulty breathing" in user_symptoms_str
    has_loc = "loss of consciousness" in user_symptoms_str or "fainting" in user_symptoms_str
    has_bleeding = "bleeding" in user_symptoms_str
    has_fever = "fever" in user_symptoms_str
    has_vomiting = "vomit" in user_symptoms_str

    # Emergency rules
    is_emergency = False
    if has_chest_pain and has_sob:
        is_emergency = True
    if severity == "severe" and (has_chest_pain or has_sob or "sudden severe headache" in user_symptoms_str or has_loc or has_bleeding):
        is_emergency = True
    if "stroke" in user_symptoms_str or "face drooping" in user_symptoms_str or "weakness on one side" in user_symptoms_str:
        is_emergency = True

    # High urgency rules
    is_high = False
    if severity == "severe" and "pain" in user_symptoms_str:
        is_high = True
    if severity == "severe" and has_fever:
        is_high = True
    if has_vomiting and "dehydration" in user_symptoms_str:
        is_high = True

    if is_emergency:
        urgency = "emergency"
        urgency_label = "Emergency"
        urgency_color = "red"
    elif is_high:
        urgency = "high"
        urgency_label = "High Urgency"
        urgency_color = "orange"
    elif severity == "moderate":
        urgency = "moderate"
        urgency_label = "Moderate Urgency"
        urgency_color = "yellow"

    # Generate recommendations
    if urgency == "emergency":
        recommendations = [
            "Seek immediate medical attention.",
            "Call emergency services if needed.",
            "Do not delay treatment."
        ]
        follow_up_actions = ["Call 911 or visit the nearest emergency room immediately."]
    elif urgency == "high":
        recommendations = [
            "Schedule a consultation within 24 hours.",
            "Monitor symptoms closely."
        ]
        follow_up_actions = ["Book an urgent telemedicine appointment."]
    elif urgency == "moderate":
        recommendations = [
            "Book a consultation with a specialist.",
            "Rest and stay hydrated."
        ]
        follow_up_actions = ["Book a routine telemedicine appointment within the next few days."]
    else:
        recommendations = [
            "Monitor symptoms.",
            "Home care may be sufficient.",
            "Consult a doctor if symptoms persist beyond a week."
        ]
        follow_up_actions = ["Rest and monitor. Book an appointment if no improvement."]

    disclaimer = (
        "This is an AI-generated preliminary assessment only and is not a medical diagnosis. "
        "Please consult a qualified healthcare professional for proper medical advice. "
        "If you are experiencing an emergency, call your local emergency services immediately."
    )

    return AnalysisResult(
        possible_conditions=possible_conditions,
        urgency=urgency,
        urgency_label=urgency_label,
        urgency_color=urgency_color,
        recommendations=recommendations,
        disclaimer=disclaimer,
        follow_up_actions=follow_up_actions
    )

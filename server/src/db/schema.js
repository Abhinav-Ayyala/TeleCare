const db = require('./database');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE REFERENCES users(id),
      date_of_birth TEXT,
      gender TEXT,
      blood_group TEXT,
      allergies TEXT,
      medical_history TEXT,
      emergency_contact TEXT
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE REFERENCES users(id),
      specialization TEXT NOT NULL,
      qualification TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      consultation_fee REAL DEFAULT 500,
      bio TEXT,
      is_available INTEGER DEFAULT 1,
      available_days TEXT,
      available_time_start TEXT DEFAULT '09:00',
      available_time_end TEXT DEFAULT '17:00',
      rating REAL DEFAULT 4.5,
      total_consultations INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES patients(id),
      doctor_id TEXT REFERENCES doctors(id),
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      type TEXT DEFAULT 'video',
      reason TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS symptom_checks (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES patients(id),
      symptoms TEXT NOT NULL,
      duration TEXT,
      severity TEXT,
      ai_result TEXT,
      urgency TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      appointment_id TEXT REFERENCES appointments(id),
      doctor_id TEXT REFERENCES doctors(id),
      patient_id TEXT REFERENCES patients(id),
      diagnosis TEXT,
      medications TEXT,
      instructions TEXT,
      follow_up_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { initializeDatabase };

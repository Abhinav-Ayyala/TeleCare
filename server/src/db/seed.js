const db = require('./database');
const { initializeDatabase } = require('./schema');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function seed() {
  initializeDatabase();
  
  db.exec(`
    DELETE FROM prescriptions;
    DELETE FROM symptom_checks;
    DELETE FROM appointments;
    DELETE FROM doctors;
    DELETE FROM patients;
    DELETE FROM users;
  `);

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const patientPassword = bcrypt.hashSync('demo1234', 10);
  const doctorPassword = bcrypt.hashSync('doctor123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, role, first_name, last_name, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPatient = db.prepare(`
    INSERT INTO patients (id, user_id, date_of_birth, gender)
    VALUES (?, ?, ?, ?)
  `);

  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, user_id, specialization, qualification, experience_years, consultation_fee, bio, available_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = uuidv4();
  insertUser.run(adminId, 'admin@telecare.com', adminPassword, 'admin', 'System', 'Admin', '1234567890');

  const patientUserId = uuidv4();
  const patientId = uuidv4();
  insertUser.run(patientUserId, 'patient@demo.com', patientPassword, 'patient', 'Demo', 'Patient', '9876543210');
  insertPatient.run(patientId, patientUserId, '1990-01-01', 'Male');

  const doctorsData = [
    { first: 'Rajesh', last: 'Sharma', email: 'rajesh.sharma@telecare.com', spec: 'General Physician', qual: 'MBBS, MD', exp: 15, fee: 500, bio: 'Experienced general physician.' },
    { first: 'Priya', last: 'Patel', email: 'priya.patel@telecare.com', spec: 'Dermatologist', qual: 'MBBS, MD Dermatology', exp: 10, fee: 700, bio: 'Specialist in skin disorders.' },
    { first: 'Amit', last: 'Verma', email: 'amit.verma@telecare.com', spec: 'Cardiologist', qual: 'MBBS, DM Cardiology', exp: 20, fee: 1000, bio: 'Senior cardiologist.' },
    { first: 'Sneha', last: 'Iyer', email: 'sneha.iyer@telecare.com', spec: 'Pediatrician', qual: 'MBBS, MD Pediatrics', exp: 8, fee: 600, bio: 'Comprehensive care for children.' },
    { first: 'Vikram', last: 'Singh', email: 'vikram.singh@telecare.com', spec: 'Neurologist', qual: 'MBBS, DM Neurology', exp: 12, fee: 900, bio: 'Expert in nervous system.' },
    { first: 'Ananya', last: 'Das', email: 'ananya.das@telecare.com', spec: 'Psychiatrist', qual: 'MBBS, MD Psychiatry', exp: 7, fee: 800, bio: 'Mental health professional.' },
    { first: 'Suresh', last: 'Reddy', email: 'suresh.reddy@telecare.com', spec: 'Orthopedic', qual: 'MBBS, MS Orthopedics', exp: 18, fee: 750, bio: 'Specialist in bone and joint care.' },
    { first: 'Meera', last: 'Joshi', email: 'meera.joshi@telecare.com', spec: 'Gynecologist', qual: 'MBBS, MS OB-GYN', exp: 14, fee: 800, bio: "Women's health specialist." },
  ];

  const availableDays = JSON.stringify(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  for (const doc of doctorsData) {
    const docUserId = uuidv4();
    const docId = uuidv4();
    insertUser.run(docUserId, doc.email, doctorPassword, 'doctor', doc.first, doc.last, '5550000000');
    insertDoctor.run(docId, docUserId, doc.spec, doc.qual, doc.exp, doc.fee, doc.bio, availableDays);
  }

  console.log('Seed complete.');
}

seed();
process.exit(0);

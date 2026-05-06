const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../hospital.db');

let db = null;

// Wrapper to make sql.js feel like better-sqlite3
const dbProxy = {
  exec(sql) { return db.run(sql); },
  prepare(sql) {
    return {
      run(...params) {
        db.run(sql, params);
        return { changes: db.getRowsModified() };
      },
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params.length ? params : undefined);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const results = [];
        const stmt = db.prepare(sql);
        stmt.bind(params.length ? params : undefined);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }
};

async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Try to load existing DB file
  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
  } catch (e) {
    db = new SQL.Database();
  }

  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','doctor','patient','nurse','receptionist')),
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    specialization TEXT NOT NULL,
    department TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    experience_years INTEGER DEFAULT 0,
    consultation_fee REAL DEFAULT 0,
    available_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    shift_start TEXT DEFAULT '08:00',
    shift_end TEXT DEFAULT '17:00'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date_of_birth TEXT,
    gender TEXT CHECK(gender IN ('Male','Female','Other')),
    blood_type TEXT,
    emergency_contact TEXT,
    allergies TEXT,
    medical_history TEXT,
    insurance_number TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS nurses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    department TEXT NOT NULL,
    shift TEXT DEFAULT 'Day',
    ward TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Confirmed','Completed','Cancelled')),
    type TEXT DEFAULT 'General' CHECK(type IN ('General','Follow-up','Emergency','Specialist')),
    reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    appointment_id TEXT REFERENCES appointments(id),
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    lab_results TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS billing (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    appointment_id TEXT REFERENCES appointments(id),
    amount REAL NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Paid','Overdue','Cancelled')),
    payment_method TEXT,
    issued_date TEXT DEFAULT CURRENT_DATE,
    due_date TEXT,
    paid_date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    capacity INTEGER DEFAULT 10,
    occupied INTEGER DEFAULT 0,
    ward_type TEXT DEFAULT 'General'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vitals (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id),
    nurse_id TEXT NOT NULL REFERENCES nurses(id),
    blood_pressure TEXT,
    heart_rate INTEGER,
    temperature REAL,
    oxygen_saturation REAL,
    weight REAL,
    height REAL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  seedDatabase();
  saveDb();
  console.log('Database initialized successfully');
}

function saveDb() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    // In serverless environments, filesystem may be read-only
  }
}

function seedDatabase() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  stmt.step();
  const existing = stmt.getAsObject();
  stmt.free();
  if (existing.count > 0) return;

  const { v4: uuidv4 } = require('uuid');
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  // Admin
  const adminId = uuidv4();
  db.run('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)',
    [adminId, 'Dr. Admin Chief', 'admin@hospital.com', hash('admin123'), 'admin', '+1-555-0100']);

  // Doctors
  const doctors = [
    { name: 'Dr. Sarah Johnson', email: 'sarah@hospital.com', spec: 'Cardiology', dept: 'Cardiology', lic: 'LIC-001', exp: 12, fee: 150 },
    { name: 'Dr. Michael Lee', email: 'michael@hospital.com', spec: 'Neurology', dept: 'Neurology', lic: 'LIC-002', exp: 8, fee: 200 },
    { name: 'Dr. Emily Davis', email: 'emily@hospital.com', spec: 'Pediatrics', dept: 'Pediatrics', lic: 'LIC-003', exp: 6, fee: 120 },
    { name: 'Dr. James Wilson', email: 'james@hospital.com', spec: 'Orthopedics', dept: 'Orthopedics', lic: 'LIC-004', exp: 15, fee: 180 },
  ];
  for (const d of doctors) {
    const uid = uuidv4(), did = uuidv4();
    db.run('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)',
      [uid, d.name, d.email, hash('doctor123'), 'doctor', '+1-555-01' + Math.floor(Math.random()*90+10)]);
    db.run('INSERT INTO doctors (id,user_id,specialization,department,license_number,experience_years,consultation_fee) VALUES (?,?,?,?,?,?,?)',
      [did, uid, d.spec, d.dept, d.lic, d.exp, d.fee]);
  }

  // Patients
  const patients = [
    { name: 'Alice Brown', email: 'alice@patient.com', dob: '1985-03-15', gender: 'Female', blood: 'A+' },
    { name: 'Bob Smith', email: 'bob@patient.com', dob: '1990-07-22', gender: 'Male', blood: 'O+' },
    { name: 'Carol White', email: 'carol@patient.com', dob: '1978-11-05', gender: 'Female', blood: 'B+' },
    { name: 'David Jones', email: 'david@patient.com', dob: '2000-01-18', gender: 'Male', blood: 'AB-' },
    { name: 'Eva Martinez', email: 'eva@patient.com', dob: '1995-09-30', gender: 'Female', blood: 'O-' },
  ];
  for (const p of patients) {
    const uid = uuidv4(), pid = uuidv4();
    db.run('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)',
      [uid, p.name, p.email, hash('patient123'), 'patient', '+1-555-02' + Math.floor(Math.random()*90+10)]);
    db.run('INSERT INTO patients (id,user_id,date_of_birth,gender,blood_type) VALUES (?,?,?,?,?)',
      [pid, uid, p.dob, p.gender, p.blood]);
  }

  // Nurse
  const nurseUserId = uuidv4(), nurseId = uuidv4();
  db.run('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)',
    [nurseUserId, 'Nurse Emma Clark', 'nurse@hospital.com', hash('nurse123'), 'nurse', '+1-555-0300']);
  db.run('INSERT INTO nurses (id,user_id,department,shift,ward) VALUES (?,?,?,?,?)',
    [nurseId, nurseUserId, 'General', 'Day', 'Ward A']);

  // Receptionist
  const recId = uuidv4();
  db.run('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)',
    [recId, 'Reception Staff', 'reception@hospital.com', hash('reception123'), 'receptionist', '+1-555-0400']);

  // Wards
  const wardData = [
    { name: 'Ward A', dept: 'General', cap: 20, occ: 12 },
    { name: 'Ward B', dept: 'Cardiology', cap: 15, occ: 8 },
    { name: 'Ward C', dept: 'Neurology', cap: 10, occ: 5 },
    { name: 'ICU', dept: 'Critical Care', cap: 8, occ: 6, type: 'ICU' },
  ];
  for (const w of wardData) {
    db.run('INSERT INTO wards (id,name,department,capacity,occupied,ward_type) VALUES (?,?,?,?,?,?)',
      [uuidv4(), w.name, w.dept, w.cap, w.occ, w.type || 'General']);
  }

  console.log('Database seeded with demo data');
}

module.exports = { get db() { return dbProxy; }, initializeDatabase };

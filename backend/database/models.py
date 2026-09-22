import sqlite3
from .connection import DB_PATH

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            content_type TEXT,
            file_size INTEGER,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cash_balance INTEGER,
            revenue INTEGER,
            expenses INTEGER,
            overall_risk INTEGER,
            alerts INTEGER
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            monthly_spend INTEGER,
            change_percent TEXT,
            risk TEXT,
            last_payment TEXT,
            initials TEXT,
            color TEXT,
            bg TEXT,
            bank_account TEXT,
            address TEXT,
            tax_id TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id TEXT NOT NULL,
            vendor TEXT NOT NULL,
            amount INTEGER,
            risk TEXT,
            due_date TEXT,
            description TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            bank_account TEXT,
            address TEXT,
            tax_id TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS anomalies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            impact_level TEXT NOT NULL,
            detected_time TEXT NOT NULL,
            confidence_score INTEGER NOT NULL
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            company TEXT,
            notifications INTEGER
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            amount REAL,
            description TEXT,
            type TEXT,
            category TEXT DEFAULT 'General'
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS monthly_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT,
            revenue REAL,
            expenses REAL,
            cash_balance REAL,
            profit REAL
        )
    ''')
    
    conn.commit()
    conn.close()

def seed_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if metrics exist to avoid double seeding
    c.execute("SELECT COUNT(*) FROM metrics")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO metrics (cash_balance, revenue, expenses, overall_risk, alerts) VALUES (402000, 1024000, 718000, 39, 3)")
        
        vendors = [
            ("Brightline Supplies", 184200, "↑ 65%", "high", "18 Sep 2026", "B", "", "", "AC-12345678", "123 Main St", "TAX-9988"),
            ("Aria Logistics", 120500, "↑ 4%", "low", "19 Sep 2026", "A", "#a47135", "#f5ece1", "AC-22334455", "456 Market St", "TAX-7766"),
            ("Nova Digital", 86800, "↓ 8%", "low", "20 Sep 2026", "N", "#6363a1", "#e8e8f4", "AC-99999999", "789 Tech Blvd", "TAX-5544"),
            ("Shady Corp", 20000, "↑ 100%", "high", "21 Sep 2026", "S", "#e53e3e", "#fed7d7", "AC-55555555", "101 Hidden Ln", "TAX-1111")
        ]
        c.executemany("INSERT INTO vendors (name, monthly_spend, change_percent, risk, last_payment, initials, color, bg, bank_account, address, tax_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", vendors)
        
        employees = [
            ("Alice Smith", "AC-88888888", "321 Apple St", "TAX-8888"),
            ("Bob Jones", "AC-55555555", "101 Hidden Ln", "TAX-1111"),
            ("Charlie Davis", "AC-77777777", "654 Cherry St", "TAX-7777")
        ]
        c.executemany("INSERT INTO employees (name, bank_account, address, tax_id) VALUES (?, ?, ?, ?)", employees)
        
        invoices = [
            ("INV-28491", "Brightline Supplies", 84500, "high", "28 Sep 2026", "Office supplies and furniture"),
            ("INV-28492", "Brightline Supplies", 84500, "high", "29 Sep 2026", "Office supply and furniture"),
            ("INV-28477", "Aria Logistics", 42200, "low", "30 Sep 2026", "Monthly logistics retainer"),
            ("INV-28462", "Nova Digital", 28900, "low", "03 Oct 2026", "Cloud hosting services"),
            ("INV-99001", "Shady Corp", 50000, "high", "05 Oct 2026", "Consulting services"),
            ("INV-99002", "Shady Corp", 10000, "high", "12 Oct 2026", "Advisory fee")
        ]
        c.executemany("INSERT INTO invoices (invoice_id, vendor, amount, risk, due_date, description) VALUES (?, ?, ?, ?, ?, ?)", invoices)

        anomalies = [
            ("Brightline Supplies — monthly spend jumped 65%", "₹1,84,200 this month is ₹72,700 above the vendor's 3-month average. This is the largest vendor deviation in your dataset.", "high", "Detected 2 hours ago", 94),
            ("Cash reserve trajectory changed", "Projected reserve crosses your ₹3L safety threshold in approximately 6 weeks if current spending continues.", "medium", "Detected today", 87),
            ("Invoice INV-28491 — amount outside vendor pattern", "₹84,500 is 47% higher than this vendor's average invoice over the last six months.", "low", "Detected yesterday", 91)
        ]
        c.executemany("INSERT INTO anomalies (title, description, impact_level, detected_time, confidence_score) VALUES (?, ?, ?, ?, ?)", anomalies)
        
        c.execute("INSERT INTO user_settings (name, email, company, notifications) VALUES (?, ?, ?, ?)", ("Mohammad Kaif", "admin@asterco.in", "Aster & Co.", 1))

        # Seed transactions
        transactions = [
            ("2026-09-22", 84500, "Invoice INV-28491 — Brightline Supplies", "expense", "Vendor Payment"),
            ("2026-09-21", 42200, "Invoice INV-28477 — Aria Logistics", "expense", "Logistics"),
            ("2026-09-20", 256000, "Client payment — TechPrime Solutions", "income", "Client Revenue"),
            ("2026-09-19", 28900, "Invoice INV-28462 — Nova Digital", "expense", "Cloud Hosting"),
            ("2026-09-18", 180000, "Client payment — GreenLeaf Organics", "income", "Client Revenue"),
            ("2026-09-17", 35000, "Salary advance — Alice Smith", "expense", "Payroll"),
            ("2026-09-16", 120000, "Client payment — BlueWave Retail", "income", "Client Revenue"),
            ("2026-09-15", 50000, "Invoice INV-99001 — Shady Corp", "expense", "Consulting"),
            ("2026-09-14", 15000, "Office rent — September", "expense", "Rent"),
            ("2026-09-13", 92000, "Client payment — UrbanNest Interiors", "income", "Client Revenue"),
            ("2026-09-12", 10000, "Invoice INV-99002 — Shady Corp", "expense", "Advisory"),
            ("2026-09-11", 75000, "Client retainer — NovaStar Media", "income", "Client Revenue"),
            ("2026-09-10", 22000, "Marketing campaign — Google Ads", "expense", "Marketing"),
            ("2026-09-09", 8500, "Software license — Figma", "expense", "Software"),
            ("2026-09-08", 145000, "Client payment — PeakVentures Capital", "income", "Client Revenue"),
            ("2026-09-05", 18000, "Electricity & Utilities", "expense", "Utilities"),
            ("2026-09-03", 95000, "Client payment — Meridian Exports", "income", "Client Revenue"),
            ("2026-09-01", 320000, "Payroll — September batch", "expense", "Payroll"),
        ]
        c.executemany("INSERT INTO transactions (date, amount, description, type, category) VALUES (?, ?, ?, ?, ?)", transactions)

        # Seed last 6 months financial history
        monthly_history = [
            ("Apr 2026", 820000, 610000, 312000, 210000),
            ("May 2026", 880000, 640000, 345000, 240000),
            ("Jun 2026", 950000, 690000, 378000, 260000),
            ("Jul 2026", 920000, 710000, 362000, 210000),
            ("Aug 2026", 980000, 700000, 390000, 280000),
            ("Sep 2026", 1024000, 718000, 402000, 306000),
        ]
        c.executemany("INSERT INTO monthly_history (month, revenue, expenses, cash_balance, profit) VALUES (?, ?, ?, ?, ?)", monthly_history)

        conn.commit()
    
    conn.close()


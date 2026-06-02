#!/usr/bin/env python3
"""
SponsorTrack - Refactored ETL Pipeline
Author: Data Engineer Portfolio Project
Description: Standardizes, parses, and aggregates raw data streams from the
             Government Ingestion Engine. Scores companies and writes structures
             to SQLite and dynamic JSON stores, preserving the user signup logs.
"""

import os
import sqlite3
import json
import pandas as pd
import numpy as np

# Import the Government Ingestion Module
from government_importer import generate_government_disclosures

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "sponsortrack.db")
JSON_PATH = os.path.join(BASE_DIR, "data.js")

# 1. TRANSFORM DATA & MAP SCHEMAS
def clean_and_transform(raw_lca, raw_everify):
    """
    Applies Data Engineering cleaning steps:
    - Normalizes uppercase state/company strings.
    - Deduplicates variations of company names to standard canonical records.
    - Standardizes job categories and experience brackets.
    """
    print("[ETL] Cleaning and transforming raw data streams...")
    
    # 1. State standardization
    raw_lca["WORKSITE_STATE"] = raw_lca["WORKSITE_STATE"].astype(str).str.strip().str.upper()
    valid_states = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
    ]
    raw_lca = raw_lca[raw_lca["WORKSITE_STATE"].isin(valid_states)]
    
    # 2. Company Name Standardizer
    def clean_name(name):
        n = str(name).upper().strip()
        n = n.replace(" PLATFORMS INC", "").replace(" PLATFORMS", "")
        n = n.replace(" CORPORATION", "").replace(" CORP", "")
        n = n.replace(" LLC", "").replace(" INC.", "").replace(" INC", "")
        n = n.replace(", LTD.", "").replace(" LTD", "").replace(", CO.", "")
        n = n.replace(" WEB SERVICES", "")
        
        # Exact maps
        mapping = {
            "GOOGLE": "Google",
            "META": "Meta",
            "AMAZON": "Amazon",
            "MICROSOFT": "Microsoft",
            "APPLE": "Apple",
            "NETFLIX": "Netflix",
            "NVIDIA": "NVIDIA",
            "SALESFORCE": "Salesforce",
            "STRIPE": "Stripe",
            "UBER": "Uber",
            "AIRBNB": "Airbnb",
            "ADOBE": "Adobe",
            "INTEL": "Intel",
            "ORACLE": "Oracle",
            "GOLDMAN SACHS": "Goldman Sachs",
            "JPMORGAN CHASE": "JPMorgan Chase",
            "CAPITAL ONE": "Capital One",
            "WALMART": "Walmart",
            "TARGET": "Target",
            "CISCO SYSTEMS": "Cisco",
            "MUTUAL OF OMAHA": "Mutual of Omaha",
            "UNION PACIFIC": "Union Pacific",
            "KIEWIT": "Kiewit",
            "FIRST NATIONAL BANK": "FNBO (First National Bank)",
            "WERNER ENTERPRISES": "Werner Enterprises",
            "NELNET": "Nelnet",
            "GALLUP": "Gallup",
            "CONAGRA": "Conagra Brands",
            "PHYSICIANS MUTUAL": "Physicians Mutual",
            "TD AMERITRADE": "TD Ameritrade",
            "INFOSYS": "Infosys",
            "TATA CONSULTANCY": "TCS",
            "WIPRO": "Wipro",
            "CAPGEMINI": "Capgemini",
            "ACCENTURE": "Accenture",
            "DELOITTE": "Deloitte",
            "PRICEWATERHOUSECOOPERS": "PwC",
            "ERNST & YOUNG": "EY",
            "KPMG": "KPMG",
            "COGNIZANT": "Cognizant",
            "HCL": "HCL Technologies",
            "LTIMINDTREE": "LTIMindtree",
            "TECH MAHINDRA": "Tech Mahindra",
            "MCKINSEY": "McKinsey",
            "BOSTON CONSULTING": "BCG",
            "BAIN & COMPANY": "Bain & Company",
            "BOEING": "Boeing",
            "SPACEX": "SpaceX",
            "TESLA": "Tesla",
            "FORD MOTOR": "Ford",
            "GENERAL MOTORS": "GM",
            "LOCKHEED": "Lockheed Martin",
            "NORTHROP": "Northrop Grumman",
            "CHEVRON": "Chevron",
            "EXXONMOBIL": "ExxonMobil",
            "GENERAL ELECTRIC": "GE",
            "UNITEDHEALTH": "UnitedHealth Group",
            "CVS HEALTH": "CVS Health",
            "EPIC SYSTEMS": "Epic Systems",
            "PFIZER": "Pfizer",
            "JOHNSON & JOHNSON": "Johnson & Johnson",
            "MERCK": "Merck",
            "ABBOTT": "Abbott Laboratories",
            "MAYO CLINIC": "Mayo Clinic",
            "GHOST JOBS": "Ghost Jobs Staffing",
            "SHADY CONSULTING": "Shady Staffing",
            "FLY BY NIGHT": "Fly By Night Placements",
            "SUSPICIOUS STAFFING": "Suspicious Staffing",
            "SKETCHY CONTRACT": "Sketchy Contract Workers"
        }
        for k, v in mapping.items():
            if k in n:
                return v
        return n.title()

    raw_lca["CLEAN_EMPLOYER_NAME"] = raw_lca["EMPLOYER_NAME"].apply(clean_name)
    raw_everify["CLEAN_EMPLOYER_NAME"] = raw_everify["EMPLOYER_NAME"].apply(clean_name)
    
    # Deduplicate E-Verify
    everify_clean = raw_everify.drop_duplicates(subset=["CLEAN_EMPLOYER_NAME"])
    
    # Standardize roles and experience from job titles
    def parse_job_specs(title):
        t = str(title).upper()
        
        # Experience
        exp = "Mid"
        if any(w in t for w in ["ENTRY", "JUNIOR", "JR", "ASSOCIATE", "0-2"]):
            exp = "Entry"
        elif any(w in t for w in ["SENIOR", "SR", "5+", "PRINCIPAL"]):
            exp = "Senior"
        elif any(w in t for w in ["LEAD", "STAFF", "ARCHITECT", "MANAGER", "DIR"]):
            exp = "Lead"
            
        # Role
        role = "Software Engineering"
        if any(w in t for w in ["DATA ENG", "PIPELINE", "ETL", "WAREHOUSE", "DATA DEVEL"]):
            role = "Data Engineering"
        elif any(w in t for w in ["DATA SCI", "ANALYTICS", "MACHINE", "ML", "STATIS"]):
            role = "Data Science"
        elif any(w in t for w in ["PRODUCT M", "PROGRAM M", "PM"]):
            role = "Product Management"
        elif any(w in t for w in ["DESIGN", "UX", "UI", "USER EX"]):
            role = "UX Design"
            
        return pd.Series([role, exp])

    raw_lca[["JOB_CATEGORY", "EXPERIENCE_LEVEL"]] = raw_lca["JOB_TITLE"].apply(parse_job_specs)
    return raw_lca, everify_clean

# 2. RUN GRADING INDEX ALGORITHM
def calculate_ratings(lca, everify):
    """
    Grades employers based on historical metrics:
    - total LCA filings (volume)
    - H-1B case success rate (approval)
    - median wage
    - E-Verify enrolled (mandatory penalty if false)
    """
    print("[ETL] Calculating Sponsorship Rating Grades...")
    
    stats = lca.groupby("CLEAN_EMPLOYER_NAME").agg(
        total_lca=("CASE_STATUS", "count"),
        certified_lca=("CASE_STATUS", lambda x: (x == "CERTIFIED").sum()),
        median_wage=("WAGE_RATE_OF_PAY_FROM", "median"),
        industry=("INDUSTRY", "first")
    ).reset_index()
    
    stats["h1b_approval_rate"] = stats["certified_lca"] / stats["total_lca"]
    stats = pd.merge(stats, everify[["CLEAN_EMPLOYER_NAME", "STATUS"]], on="CLEAN_EMPLOYER_NAME", how="left")
    stats["STATUS"] = stats["STATUS"].fillna("NOT ENROLLED")
    stats["everify_enrolled"] = (stats["STATUS"] == "ENROLLED").astype(int)
    
    def grade_score(row):
        score = 50
        score += row["h1b_approval_rate"] * 30
        
        # Wage normalization factor (around 120k median)
        wage_factor = min(1.5, row["median_wage"] / 120000)
        score += wage_factor * 10
        
        # Volume log scale score
        volume_factor = min(1.0, np.log1p(row["total_lca"]) / 8.0)
        score += volume_factor * 5
        
        if row["everify_enrolled"] == 1:
            score += 5
        else:
            score -= 25 # High immigration penalty for non-E-Verify (e.g. F-1 STEM OPT compliance)
            
        if score >= 92: return "A+"
        elif score >= 84: return "A"
        elif score >= 75: return "B"
        elif score >= 58: return "C"
        else: return "D (Flagged)"
        
    stats["grade"] = stats.apply(grade_score, axis=1)
    return stats

# 3. WRITE DATABASES (SQLite Schema preservation + JSON store)
def load_data_warehouse(company_stats, cleaned_lca):
    """
    Ingests cleaned and aggregated data structures into SQLite.
    Preserves and updates the users table without clearing it.
    """
    print(f"[ETL] Syncing warehouse to database: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Create tables (Schema Preservation)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        grade TEXT,
        total_lca INTEGER,
        h1b_approval_rate REAL,
        median_wage REAL,
        everify_enrolled INTEGER,
        industry TEXT
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sponsorships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        state TEXT,
        job_category TEXT,
        experience_level TEXT,
        case_count INTEGER,
        avg_wage REAL,
        FOREIGN KEY(company_id) REFERENCES companies(id)
    )""")
    
    # Safely create User signup table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        visa_status TEXT,
        target_role TEXT,
        target_state TEXT,
        experience_level TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")
    
    conn.commit()
    
    # 2. Refresh dynamic facts / dimensions tables
    cursor.execute("DELETE FROM sponsorships")
    cursor.execute("DELETE FROM companies")
    conn.commit()
    
    # Ingest companies
    company_map = {}
    for _, row in company_stats.iterrows():
        try:
            cursor.execute("""
            INSERT INTO companies (name, grade, total_lca, h1b_approval_rate, median_wage, everify_enrolled, industry)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (row["CLEAN_EMPLOYER_NAME"], row["grade"], int(row["total_lca"]), float(row["h1b_approval_rate"]), float(row["median_wage"]), int(row["everify_enrolled"]), row["industry"]))
            company_map[row["CLEAN_EMPLOYER_NAME"]] = cursor.lastrowid
        except sqlite3.IntegrityError:
            # Duplicate standard names fallback
            cursor.execute("SELECT id FROM companies WHERE name = ?", (row["CLEAN_EMPLOYER_NAME"],))
            company_map[row["CLEAN_EMPLOYER_NAME"]] = cursor.fetchone()[0]
            
    conn.commit()
    
    # Aggregate detail breakdowns
    detail_stats = cleaned_lca.groupby(["CLEAN_EMPLOYER_NAME", "WORKSITE_STATE", "JOB_CATEGORY", "EXPERIENCE_LEVEL"]).agg(
        case_count=("CASE_STATUS", "count"),
        avg_wage=("WAGE_RATE_OF_PAY_FROM", "mean")
    ).reset_index()
    
    # Ingest detail breakdowns
    for _, row in detail_stats.iterrows():
        comp_id = company_map.get(row["CLEAN_EMPLOYER_NAME"])
        if comp_id:
            cursor.execute("""
            INSERT INTO sponsorships (company_id, state, job_category, experience_level, case_count, avg_wage)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (comp_id, row["WORKSITE_STATE"], row["JOB_CATEGORY"], row["EXPERIENCE_LEVEL"], int(row["case_count"]), float(row["avg_wage"])))
            
    conn.commit()
    conn.close()
    print("[ETL] SQLite data sync completed successfully.")
    
    # 3. Write data.js web store for fallback static loading
    json_data = []
    for _, row in company_stats.iterrows():
        company_details = detail_stats[detail_stats["CLEAN_EMPLOYER_NAME"] == row["CLEAN_EMPLOYER_NAME"]]
        
        breakdowns = []
        for _, detail in company_details.iterrows():
            breakdowns.append({
                "state": detail["WORKSITE_STATE"],
                "role": detail["JOB_CATEGORY"],
                "experience": detail["EXPERIENCE_LEVEL"],
                "cases": int(detail["case_count"]),
                "wage": round(float(detail["avg_wage"]), 2)
            })
            
        json_data.append({
            "name": row["CLEAN_EMPLOYER_NAME"],
            "industry": row["industry"],
            "grade": row["grade"],
            "total_lca": int(row["total_lca"]),
            "approval_rate": round(float(row["h1b_approval_rate"]) * 100, 1),
            "median_wage": round(float(row["median_wage"]), 2),
            "everify": bool(row["everify_enrolled"]),
            "breakdowns": breakdowns
        })
        
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        f.write("/* GENERATED DATA BY ETL PIPELINE - DO NOT MODIFY */\n")
        f.write("const SPONSOR_DATA = ")
        json.dump(json_data, f, indent=2)
        f.write(";\n")
        
    print(f"[ETL] Web JSON store updated at: {JSON_PATH}")

def main():
    print("=========================================")
    print("     SponsorTrack ETL Ingestion Sync     ")
    print("=========================================")
    raw_lca, raw_everify = generate_government_disclosures()
    cleaned_lca, clean_everify = clean_and_transform(raw_lca, raw_everify)
    company_stats = calculate_ratings(cleaned_lca, clean_everify)
    load_data_warehouse(company_stats, cleaned_lca)
    print("=========================================")
    print("      DATA REWIND & SYNC COMPLETED       ")
    print("=========================================")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
SponsorTrack FastAPI Backend
Author: Data Engineer Portfolio Project
Description: Services dynamic SQL querying over SQLite for company listings,
             handles CORS, and manages secure lead signups in the users database.
"""

import os
import sqlite3
from typing import Literal, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "sponsortrack.db")

app = FastAPI(
    title="SponsorTrack API",
    description="Backend API supporting dynamic H-1B query filters and user signup pipelines.",
    version="1.0.0"
)

# Enable CORS for local dev servers and public frontend hosts (e.g. GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your GitHub Pages domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================================
# Schema Definitions (Pydantic Models)
# ==========================================================================
class SignupRequest(BaseModel):
    email: EmailStr = Field(..., description="Unique email address of the job seeker")
    visa_status: str = Field(..., description="Current visa status (e.g., F-1 OPT, H-1B, Citizen)")
    target_role: str = Field(..., description="Job role field of interest")
    target_state: str = Field(..., description="Preferred US state code")
    experience_level: str = Field(..., description="Seniority level bracket")

class SignupResponse(BaseModel):
    status: str
    message: str

class ProfileRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address used for lightweight sign-in")

class CompanyListRequest(ProfileRequest):
    company_name: str = Field(..., min_length=1, description="Employer name to save")
    list_type: Literal["favorite", "applying"] = Field(..., description="User company list bucket")
    action: Literal["add", "remove"] = Field("add", description="Whether to add or remove the company")

# Helper to establish db connections
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def normalize_email(email: str) -> str:
    return email.lower().strip()

def ensure_profile_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_company_lists (
            email TEXT NOT NULL,
            company_name TEXT NOT NULL,
            list_type TEXT NOT NULL CHECK (list_type IN ('favorite', 'applying')),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (email, company_name, list_type)
        )
    """)
    conn.commit()
    conn.close()

def ensure_user_record(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO users (email, visa_status, target_role, target_state, experience_level)
        VALUES (?, ?, ?, ?, ?)
    """, (email, "Unspecified", "All Tech Roles", "All States", "All Levels"))
    conn.commit()
    conn.close()

def get_profile_payload(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT company_name, list_type
        FROM user_company_lists
        WHERE email = ?
        ORDER BY updated_at DESC, company_name ASC
    """, (email,))
    rows = cursor.fetchall()
    conn.close()
    return {
        "email": email,
        "favorites": [row["company_name"] for row in rows if row["list_type"] == "favorite"],
        "applying": [row["company_name"] for row in rows if row["list_type"] == "applying"],
    }

ensure_profile_tables()

# ==========================================================================
# REST API Endpoints
# ==========================================================================

@app.get("/api/sponsors")
def get_sponsors(
    visa: str = "h1b",
    state: Optional[str] = Query(None, description="Filter by US state code (e.g., CA, NY, NE)"),
    role: Optional[str] = Query(None, description="Filter by job category"),
    experience: Optional[str] = Query(None, description="Filter by seniority level"),
    grade: Optional[str] = Query(None, description="Filter by Sponsorship Grade (A+, A, B, C)"),
    search: Optional[str] = Query(None, description="Search term matching employer name or industry")
):
    """
    Assembles a dynamic SQL query to fetch and filter verified sponsors from SQLite.
    Optimizes queries using subquery EXISTS statements for relational properties.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Base query for companies
    query_parts = ["SELECT * FROM companies WHERE 1=1"]
    params = []
    
    # 2. Apply visa parameters (OPT / STEM OPT demands E-Verify)
    if visa in ["opt", "stem_opt"]:
        query_parts.append("AND everify_enrolled = 1")
        
    # 3. Apply letter grade filter
    if grade:
        query_parts.append("AND grade = ?")
        params.append(grade)
        
    # 4. Apply name or sector search filter
    if search:
        query_parts.append("AND (name LIKE ? OR industry LIKE ?)")
        search_param = f"%{search}%"
        params.append(search_param)
        params.append(search_param)
        
    # 5. Apply subquery criteria for worksite details (state, job role, experience)
    # Uses EXISTS to quickly filter companies having matching children
    subquery_parts = []
    subquery_params = []
    
    if state:
        subquery_parts.append("s.state = ?")
        subquery_params.append(state)
    if role:
        subquery_parts.append("s.job_category = ?")
        subquery_params.append(role)
    if experience:
        subquery_parts.append("s.experience_level = ?")
        subquery_params.append(experience)
        
    if subquery_parts:
        exists_clause = f"AND EXISTS (SELECT 1 FROM sponsorships s WHERE s.company_id = companies.id AND {' AND '.join(subquery_parts)})"
        query_parts.append(exists_clause)
        params.extend(subquery_params)
        
    # Order by total case counts descending
    query_parts.append("ORDER BY total_lca DESC")
    
    full_query = " ".join(query_parts)
    
    try:
        cursor.execute(full_query, params)
        companies_rows = cursor.fetchall()
        
        results = []
        for crow in companies_rows:
            comp_id = crow["id"]
            
            # Fetch sponsorships breakdown for this company
            breakdown_query = "SELECT state, job_category, experience_level, case_count, avg_wage FROM sponsorships WHERE company_id = ?"
            b_params = [comp_id]
            
            # If search filters exist, restrict breakdown rows displayed in UI to matching filters
            b_filters = []
            if state:
                b_filters.append("state = ?")
                b_params.append(state)
            if role:
                b_filters.append("job_category = ?")
                b_params.append(role)
            if experience:
                b_filters.append("experience_level = ?")
                b_params.append(experience)
                
            if b_filters:
                breakdown_query += f" AND {' AND '.join(b_filters)}"
                
            cursor.execute(breakdown_query, b_params)
            breakdown_rows = cursor.fetchall()
            
            breakdowns = []
            for brow in breakdown_rows:
                breakdowns.append({
                    "state": brow["state"],
                    "role": brow["job_category"],
                    "experience": brow["experience_level"],
                    "cases": brow["case_count"],
                    "wage": brow["avg_wage"]
                })
                
            # Formatting response to mirror legacy static JSON structure
            results.append({
                "id": crow["id"],
                "name": crow["name"],
                "industry": crow["industry"],
                "grade": crow["grade"],
                "total_lca": crow["total_lca"],
                "approval_rate": round(crow["h1b_approval_rate"] * 100, 1),
                "median_wage": crow["median_wage"],
                "everify": bool(crow["everify_enrolled"]),
                "breakdowns": breakdowns
            })
            
        conn.close()
        return results
        
    except Exception as e:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database execution error: {str(e)}"
        )

@app.post("/api/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def post_signup(req: SignupRequest):
    """
    Registers a job seeker, mapping email, current visa, target location,
    role, and experience level inside the users database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO users (email, visa_status, target_role, target_state, experience_level)
            VALUES (?, ?, ?, ?, ?)
        """, (req.email.lower().strip(), req.visa_status, req.target_role, req.target_state, req.experience_level))
        conn.commit()
        conn.close()
        return {
            "status": "success",
            "message": "Thank you for joining! You have been successfully registered for visa job alerts."
        }
    except sqlite3.IntegrityError:
        cursor.execute("""
            UPDATE users
            SET visa_status = ?, target_role = ?, target_state = ?, experience_level = ?
            WHERE email = ?
        """, (req.visa_status, req.target_role, req.target_state, req.experience_level, req.email.lower().strip()))
        conn.commit()
        conn.close()
        return {
            "status": "success",
            "message": "Your visa job alert preferences have been updated."
        }
    except Exception as e:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal database write error: {str(e)}"
        )

@app.post("/api/profile")
def post_profile(req: ProfileRequest):
    email = normalize_email(req.email)
    ensure_user_record(email)
    return get_profile_payload(email)

@app.post("/api/profile/company")
def post_profile_company(req: CompanyListRequest):
    email = normalize_email(req.email)
    company_name = req.company_name.strip()
    ensure_user_record(email)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if req.action == "remove":
            cursor.execute("""
                DELETE FROM user_company_lists
                WHERE email = ? AND company_name = ? AND list_type = ?
            """, (email, company_name, req.list_type))
        else:
            cursor.execute("""
                INSERT INTO user_company_lists (email, company_name, list_type, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(email, company_name, list_type)
                DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            """, (email, company_name, req.list_type))
        conn.commit()
        conn.close()
        return get_profile_payload(email)
    except Exception as e:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update error: {str(e)}"
        )

@app.get("/api/users")
def get_users():
    """
    Admin verification endpoint to view logged signups (for portfolio showcase review).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email, visa_status, target_role, target_state, experience_level, created_at FROM users ORDER BY created_at DESC")
        rows = cursor.fetchall()
        users = [dict(row) for row in rows]
        conn.close()
        return users
    except Exception as e:
        conn.close()
        return []

@app.get("/", include_in_schema=False)
def serve_index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/{path:path}", include_in_schema=False)
def serve_frontend_asset(path: str):
    if path.startswith("api/"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    allowed_assets = {"index.html", "app.js", "data.js", "styles.css"}
    if path in allowed_assets:
        return FileResponse(os.path.join(BASE_DIR, path))

    return FileResponse(os.path.join(BASE_DIR, "index.html"))

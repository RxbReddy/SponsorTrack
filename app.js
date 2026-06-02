/* ==========================================================================
   SponsorTrack Frontend Application Core Logic
   ========================================================================== */

// Configure Backend API Target Base
// Default empty string for relative paths in local testing or specify the production API URL when deployed
const API_BASE = (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return window.location.origin;
    }
    if (host.endsWith('onrender.com')) {
        return '';
    }
    return 'https://sponsortrack.onrender.com';
})();

const CAREER_PORTAL_URLS = {
    "Abbott Laboratories": "https://www.jobs.abbott/",
    "Accenture": "https://www.accenture.com/us-en/careers",
    "Adobe": "https://careers.adobe.com/us/en",
    "Airbnb": "https://careers.airbnb.com/",
    "Amazon": "https://www.amazon.jobs/",
    "American Express": "https://www.americanexpress.com/en-us/careers/",
    "Apple": "https://jobs.apple.com/",
    "Atlassian": "https://www.atlassian.com/company/careers",
    "BCG": "https://careers.bcg.com/",
    "Bain & Company": "https://www.bain.com/careers/",
    "Bank Of America N.A.": "https://careers.bankofamerica.com/",
    "Best Buy Co.": "https://jobs.bestbuy.com/",
    "Blackrock Financial": "https://careers.blackrock.com/",
    "Boeing": "https://jobs.boeing.com/",
    "CVS Health": "https://jobs.cvshealth.com/",
    "Capgemini": "https://www.capgemini.com/careers/",
    "Capital One": "https://www.capitalonecareers.com/",
    "Chevron": "https://careers.chevron.com/",
    "Cisco": "https://jobs.cisco.com/",
    "Citigroup": "https://jobs.citi.com/",
    "Cognizant": "https://careers.cognizant.com/",
    "Coinbase,": "https://www.coinbase.com/careers",
    "Conagra Brands": "https://careers.conagrabrands.com/",
    "Costco Wholesale": "https://www.costco.com/jobs.html",
    "Datadog,": "https://careers.datadoghq.com/",
    "Deloitte": "https://www.deloitte.com/us/en/careers.html",
    "Discover Financial": "https://jobs.discover.com/",
    "Dropbox,": "https://jobs.dropbox.com/",
    "EY": "https://www.ey.com/en_us/careers",
    "Ebay": "https://jobs.ebayinc.com/",
    "Epic Systems": "https://careers.epic.com/",
    "ExxonMobil": "https://jobs.exxonmobil.com/",
    "FNBO (First National Bank)": "https://www.fnbo.com/careers/",
    "Fidelity Brokerage": "https://jobs.fidelity.com/",
    "Ford": "https://corporate.ford.com/careers.html",
    "GE": "https://jobs.gecareers.com/",
    "GM": "https://search-careers.gm.com/",
    "Gallup": "https://www.gallup.com/careers/",
    "Goldman Sachs": "https://www.goldmansachs.com/careers/",
    "Google": "https://www.google.com/about/careers/applications/jobs/results/",
    "HCL Technologies": "https://www.hcltech.com/careers",
    "Hubspot,": "https://www.hubspot.com/careers",
    "Infosys": "https://www.infosys.com/careers/",
    "Intel": "https://jobs.intel.com/",
    "JPMorgan Chase": "https://careers.jpmorgan.com/",
    "Johnson & Johnson": "https://www.careers.jnj.com/",
    "KPMG": "https://kpmg.com/us/en/careers.html",
    "Kiewit": "https://kiewitcareers.kiewit.com/",
    "LTIMindtree": "https://www.ltimindtree.com/careers/",
    "Linkedin": "https://careers.linkedin.com/",
    "Lockheed Martin": "https://www.lockheedmartinjobs.com/",
    "Lyft,": "https://www.lyft.com/careers",
    "Mastercard International": "https://careers.mastercard.com/",
    "Mayo Clinic": "https://jobs.mayoclinic.org/",
    "McKinsey": "https://www.mckinsey.com/careers/search-jobs",
    "Merck": "https://jobs.merck.com/",
    "Meta": "https://www.metacareers.com/jobs/",
    "Microsoft": "https://jobs.careers.microsoft.com/",
    "Morgan Stanley": "https://www.morganstanley.com/people-opportunities/careers",
    "Mutual of Omaha": "https://www.mutualofomaha.com/careers",
    "NVIDIA": "https://www.nvidia.com/en-us/about-nvidia/careers/",
    "Nelnet": "https://nelnetinc.com/careers/",
    "Netflix": "https://jobs.netflix.com/",
    "Nike,": "https://jobs.nike.com/",
    "Northrop Grumman": "https://www.northropgrumman.com/jobs",
    "Oracle": "https://www.oracle.com/careers/",
    "Palantir Technologies": "https://www.palantir.com/careers/",
    "Paypal,": "https://paypal.eightfold.ai/careers",
    "Pepsico,": "https://www.pepsicojobs.com/",
    "Pfizer": "https://www.pfizer.com/about/careers",
    "Physicians Mutual": "https://www.physiciansmutual.com/cs/careers",
    "Pinterest,": "https://www.pinterestcareers.com/",
    "Procter & Gamble": "https://www.pgcareers.com/",
    "PwC": "https://www.pwc.com/us/en/careers.html",
    "Roblox": "https://careers.roblox.com/",
    "Salesforce": "https://careers.salesforce.com/",
    "Servicenow": "https://careers.servicenow.com/",
    "Slack Technologies": "https://slack.com/careers",
    "Snap": "https://careers.snap.com/",
    "Snowflake": "https://careers.snowflake.com/",
    "SpaceX": "https://www.spacex.com/careers/",
    "Splunk": "https://www.splunk.com/en_us/careers.html",
    "Square (Block)": "https://block.xyz/careers",
    "Starbucks": "https://www.starbucks.com/careers/",
    "Stripe": "https://stripe.com/jobs",
    "TCS": "https://www.tcs.com/careers",
    "TD Ameritrade": "https://www.schwabjobs.com/",
    "Target": "https://corporate.target.com/careers",
    "Tech Mahindra": "https://www.techmahindra.com/en-in/careers/",
    "Tesla": "https://www.tesla.com/careers",
    "The Coca-Cola Company": "https://www.coca-colacompany.com/careers",
    "The Home Depot": "https://careers.homedepot.com/",
    "Twitter/X": "https://careers.x.com/",
    "Uber": "https://www.uber.com/us/en/careers/",
    "Union Pacific": "https://up.jobs/",
    "UnitedHealth Group": "https://careers.unitedhealthgroup.com/",
    "Visa U.S.A.": "https://corporate.visa.com/en/jobs.html",
    "Vmware": "https://careers.broadcom.com/",
    "Walmart": "https://careers.walmart.com/",
    "Wells Fargo Bank": "https://www.wellsfargojobs.com/",
    "Werner Enterprises": "https://www.werner.com/careers/",
    "Wipro": "https://careers.wipro.com/",
    "Workday,": "https://workday.wd5.myworkdayjobs.com/Workday",
    "Zoom Video Communications": "https://careers.zoom.us/"
};

// Application State
const state = {
    selectedVisa: 'h1b',
    searchQuery: '',
    filters: {
        state: '',
        category: '',
        experience: '',
        grade: ''
    },
    bookmarkedCompanies: new Set(),
    applyingCompanies: new Set(),
    activeTab: 'search-view',
    chartInstance: null,
    userEmail: '',
    currentCompanies: [] // stores active dynamic query results
};

// Wizard Questionnaire Steps
const WIZARD_STEPS = [
    {
        id: 'citizenship',
        question: "What is your current citizenship/work authorization status?",
        options: [
            { text: "US Citizen or Permanent Resident (Green Card)", next: 'result_citizen' },
            { text: "F-1 International Student (currently in US college)", next: 'degree_type' },
            { text: "H-1B Visa holder (looking for transfer)", next: 'experience_level' },
            { text: "Foreign National (currently living outside the US)", next: 'experience_level' }
        ]
    },
    {
        id: 'degree_type',
        question: "What is your field of study or degree type?",
        options: [
            { text: "STEM Degree (Science, Tech, Engineering, Math)", next: 'experience_level', flag: 'stem' },
            { text: "Non-STEM Degree (Business, Arts, Humanities)", next: 'experience_level', flag: 'non_stem' },
            { text: "Associate or Vocational Degree", next: 'experience_level', flag: 'associate' }
        ]
    },
    {
        id: 'experience_level',
        question: "How many years of professional experience do you have in your target role?",
        options: [
            { text: "0 - 2 years (Entry-Level)", next: 'result_eval', exp: 'Entry' },
            { text: "2 - 5 years (Mid-Level)", next: 'result_eval', exp: 'Mid' },
            { text: "5 - 8 years (Senior-Level)", next: 'result_eval', exp: 'Senior' },
            { text: "8+ years (Lead / Principal / Manager)", next: 'result_eval', exp: 'Lead' }
        ]
    }
];

let currentWizardStepIndex = 0;
let wizardAnswers = {};

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    state.userEmail = localStorage.getItem("sponsortrack_user_email") || "";
    loadUserLists();
    updateAuthUI();

    // Bind Nav Menu Tabs
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const target = item.getAttribute("data-target");
            switchTab(target);
        });
    });

    // Bind Visa Option Selectors
    document.querySelectorAll(".visa-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".visa-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            state.selectedVisa = tab.getAttribute("data-visa");
            applyFiltersAndRender();
        });
    });

    // Bind Input Search and Dropdown Filters
    document.getElementById("search-employer").addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        applyFiltersAndRender();
    });

    document.getElementById("filter-state").addEventListener("change", (e) => {
        state.filters.state = e.target.value;
        applyFiltersAndRender();
    });

    document.getElementById("filter-category").addEventListener("change", (e) => {
        state.filters.category = e.target.value;
        applyFiltersAndRender();
    });

    document.getElementById("filter-experience").addEventListener("change", (e) => {
        state.filters.experience = e.target.value;
        applyFiltersAndRender();
    });

    document.getElementById("filter-grade").addEventListener("change", (e) => {
        state.filters.grade = e.target.value;
        applyFiltersAndRender();
    });

    // Clear filters button
    document.getElementById("reset-filters-btn").addEventListener("click", () => {
        document.getElementById("filter-state").value = "";
        document.getElementById("filter-category").value = "";
        document.getElementById("filter-experience").value = "";
        document.getElementById("filter-grade").value = "";
        
        state.filters.state = "";
        state.filters.category = "";
        state.filters.experience = "";
        state.filters.grade = "";
        
        applyFiltersAndRender();
    });

    // Modal Close
    document.getElementById("modal-close-btn").addEventListener("click", closeModal);
    document.getElementById("employer-modal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("employer-modal")) {
            closeModal();
        }
    });

    // Wizard Reset Button
    document.getElementById("wizard-reset-btn").addEventListener("click", restartWizard);

    // Lightweight sign-in controls
    document.getElementById("signin-open-btn").addEventListener("click", openSignInModal);
    document.getElementById("saved-signin-btn").addEventListener("click", openSignInModal);
    document.getElementById("signin-close-btn").addEventListener("click", closeSignInModal);
    document.getElementById("signin-modal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("signin-modal")) {
            closeSignInModal();
        }
    });
    document.getElementById("signout-btn").addEventListener("click", signOut);
    document.getElementById("signin-form").addEventListener("submit", handleSignIn);

    // Bind Community Signup Form
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("signup-email");
            const statusDiv = document.getElementById("signup-status");
            const submitBtn = document.getElementById("signup-submit-btn");
            
            const email = emailInput.value.trim();
            if (!email) return;
            
            submitBtn.disabled = true;
            submitBtn.textContent = "Registering...";
            
            statusDiv.className = "hidden";
            
            const payload = {
                email: email,
                visa_status: state.selectedVisa === 'h1b' ? 'H-1B Visa' : (state.selectedVisa === 'opt' ? 'F-1 OPT' : (state.selectedVisa === 'stem_opt' ? 'F-1 STEM OPT' : 'US Citizen')),
                target_role: state.filters.category || "All Tech Roles",
                target_state: state.filters.state || "All States",
                experience_level: state.filters.experience || "All Levels"
            };
            
            try {
                const response = await fetch(`${API_BASE}/api/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) throw new Error("Network subscription failed");
                const resData = await response.json();
                
                statusDiv.classList.remove("hidden");
                statusDiv.textContent = resData.message;
                
                if (resData.status === "success") {
                    statusDiv.style.borderColor = "rgba(16, 185, 129, 0.4)";
                    statusDiv.style.background = "var(--success-bg)";
                    statusDiv.style.color = "var(--success)";
                    emailInput.value = "";
                } else if (resData.status === "exists") {
                    statusDiv.style.borderColor = "rgba(245, 158, 11, 0.4)";
                    statusDiv.style.background = "var(--warning-bg)";
                    statusDiv.style.color = "var(--warning)";
                } else {
                    throw new Error(resData.message);
                }
            } catch (error) {
                console.error("Signup error", error);
                statusDiv.classList.remove("hidden");
                statusDiv.textContent = "API Server unavailable. Using static client mode.";
                statusDiv.style.borderColor = "rgba(239, 68, 68, 0.4)";
                statusDiv.style.background = "var(--danger-bg)";
                statusDiv.style.color = "var(--danger)";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Subscribe Alerts";
            }
        });
    }

    // Initial Render
    applyFiltersAndRender();
    if (state.userEmail) {
        syncProfileFromApi(true);
    }
});

// ==========================================================================
// Profile, Persistence & Career Links
// ==========================================================================
function getStorageScope() {
    return state.userEmail || "guest";
}

function getStorageKey(bucket) {
    return `sponsortrack_${getStorageScope()}_${bucket}`;
}

function readStoredSet(key) {
    const stored = localStorage.getItem(key);
    if (!stored) return new Set();
    try {
        return new Set(JSON.parse(stored));
    } catch (e) {
        console.error("Unable to parse saved list", key, e);
        return new Set();
    }
}

function loadUserLists() {
    state.bookmarkedCompanies = readStoredSet(getStorageKey("favorites"));
    state.applyingCompanies = readStoredSet(getStorageKey("applying"));

    const legacyBookmarks = localStorage.getItem("sponsortrack_bookmarks");
    if (legacyBookmarks && state.bookmarkedCompanies.size === 0) {
        try {
            JSON.parse(legacyBookmarks).forEach(item => state.bookmarkedCompanies.add(item));
            persistUserLists();
        } catch (e) {
            console.error("Error migrating legacy bookmarks", e);
        }
    }
}

function persistUserLists() {
    localStorage.setItem(getStorageKey("favorites"), JSON.stringify(Array.from(state.bookmarkedCompanies)));
    localStorage.setItem(getStorageKey("applying"), JSON.stringify(Array.from(state.applyingCompanies)));
    localStorage.setItem("sponsortrack_bookmarks", JSON.stringify(Array.from(state.bookmarkedCompanies)));
}

function updateAuthUI() {
    const signedIn = Boolean(state.userEmail);
    document.getElementById("signin-open-btn").classList.toggle("hidden", signedIn);
    document.getElementById("user-chip").classList.toggle("hidden", !signedIn);
    document.getElementById("user-email-label").textContent = state.userEmail;
    document.getElementById("saved-signin-btn").classList.toggle("hidden", signedIn);
}

function openSignInModal() {
    const modal = document.getElementById("signin-modal");
    document.getElementById("signin-email").value = state.userEmail;
    document.getElementById("signin-status").classList.add("hidden");
    modal.classList.add("active");
    setTimeout(() => document.getElementById("signin-email").focus(), 0);
}

function closeSignInModal() {
    document.getElementById("signin-modal").classList.remove("active");
}

async function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById("signin-email").value.trim().toLowerCase();
    if (!email) return;

    const currentFavorites = new Set(state.bookmarkedCompanies);
    const currentApplying = new Set(state.applyingCompanies);
    state.userEmail = email;
    localStorage.setItem("sponsortrack_user_email", email);

    loadUserLists();
    currentFavorites.forEach(name => state.bookmarkedCompanies.add(name));
    currentApplying.forEach(name => state.applyingCompanies.add(name));
    persistUserLists();
    updateAuthUI();
    closeSignInModal();
    applyFiltersAndRender();
    syncProfileFromApi(true);
}

function signOut() {
    state.userEmail = "";
    localStorage.removeItem("sponsortrack_user_email");
    loadUserLists();
    updateAuthUI();
    applyFiltersAndRender();
    if (state.activeTab === "saved-view") {
        renderSavedCompanies();
    }
}

async function syncProfileFromApi(pushLocalAfterMerge = false) {
    if (!state.userEmail) return;
    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: state.userEmail })
        });
        if (!response.ok) throw new Error("Profile sync failed");
        const profile = await response.json();
        (profile.favorites || []).forEach(name => state.bookmarkedCompanies.add(name));
        (profile.applying || []).forEach(name => state.applyingCompanies.add(name));
        persistUserLists();
        if (pushLocalAfterMerge) {
            await pushAllPreferencesToApi();
        }
        applyFiltersAndRender();
    } catch (error) {
        console.warn("Profile API unavailable. Lists remain saved in this browser.", error);
    }
}

async function pushAllPreferencesToApi() {
    if (!state.userEmail) return;
    const updates = [];
    state.bookmarkedCompanies.forEach(name => updates.push(syncCompanyPreference(name, "favorite", true)));
    state.applyingCompanies.forEach(name => updates.push(syncCompanyPreference(name, "applying", true)));
    await Promise.all(updates);
}

async function syncCompanyPreference(name, listType, isActive) {
    if (!state.userEmail) return;
    try {
        await fetch(`${API_BASE}/api/profile/company`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: state.userEmail,
                company_name: name,
                list_type: listType,
                action: isActive ? "add" : "remove"
            })
        });
    } catch (error) {
        console.warn("Unable to sync company preference; local copy is saved.", error);
    }
}

function getCareerUrl(company) {
    const normalizedName = company.name.trim();
    return CAREER_PORTAL_URLS[normalizedName] || `https://www.google.com/search?q=${encodeURIComponent(`${normalizedName} careers jobs official`)}`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function findCompanyByName(name) {
    const activeMatch = state.currentCompanies.find(c => c.name === name);
    if (activeMatch) return activeMatch;
    if (typeof SPONSOR_DATA !== 'undefined') {
        return SPONSOR_DATA.find(c => c.name === name);
    }
    return null;
}

function getCompaniesForNames(nameSet) {
    return Array.from(nameSet)
        .map(findCompanyByName)
        .filter(Boolean)
        .sort((a, b) => b.total_lca - a.total_lca);
}

// ==========================================================================
// View Routing System
// ==========================================================================
function switchTab(viewId) {
    state.activeTab = viewId;
    
    // Toggle active state in Navbar
    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-target") === viewId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Toggle panels visibility
    document.querySelectorAll(".view-panel").forEach(panel => {
        if (panel.id === viewId) {
            panel.classList.remove("hidden");
        } else {
            panel.classList.add("hidden");
        }
    });

    // Panel Specific Initialization
    if (viewId === 'search-view') {
        applyFiltersAndRender();
    } else if (viewId === 'saved-view') {
        renderSavedCompanies();
    } else if (viewId === 'checker-view') {
        restartWizard();
    }
}

// ==========================================================================
// Filtering Engine
// ==========================================================================
async function getFilteredData() {
    // Construct Query String for backend REST requests
    const params = new URLSearchParams({
        visa: state.selectedVisa
    });
    
    if (state.searchQuery.trim()) params.append('search', state.searchQuery.trim());
    if (state.filters.state) params.append('state', state.filters.state);
    if (state.filters.category) params.append('role', state.filters.category);
    if (state.filters.experience) params.append('experience', state.filters.experience);
    if (state.filters.grade) params.append('grade', state.filters.grade);

    try {
        const response = await fetch(`${API_BASE}/api/sponsors?${params.toString()}`);
        if (!response.ok) throw new Error("API fetch failure");
        const list = await response.json();
        
        state.currentCompanies = list;
        return list;
    } catch (e) {
        console.warn("Backend API offline. Falling back to embedded static seed data.", e);
        
        // Graceful degradation fallback using static data.js variables
        if (typeof SPONSOR_DATA !== 'undefined') {
            let list = [...SPONSOR_DATA];
            
            // Apply Visa E-Verify Filter
            if (state.selectedVisa === 'opt' || state.selectedVisa === 'stem_opt') {
                list = list.filter(c => c.everify === true);
            }
            
            // Search Query Filter
            if (state.searchQuery.trim() !== '') {
                const query = state.searchQuery.toLowerCase();
                list = list.filter(c => c.name.toLowerCase().includes(query) || c.industry.toLowerCase().includes(query));
            }

            // Dropdown Sidebar Filters
            if (state.filters.state) {
                list = list.filter(c => c.breakdowns.some(b => b.state === state.filters.state));
            }
            if (state.filters.category) {
                list = list.filter(c => c.breakdowns.some(b => b.role === state.filters.category));
            }
            if (state.filters.experience) {
                list = list.filter(c => c.breakdowns.some(b => b.experience === state.filters.experience));
            }
            if (state.filters.grade) {
                list = list.filter(c => c.grade === state.filters.grade);
            }
            
            state.currentCompanies = list;
            return list;
        }
        
        state.currentCompanies = [];
        return [];
    }
}

async function applyFiltersAndRender() {
    const filteredList = await getFilteredData();
    renderResultsGrid(filteredList);
    updateStatistics(filteredList);
    updateAnalyticsChart(filteredList);
}

// ==========================================================================
// Render Layout Cards & Tables
// ==========================================================================
function renderResultsGrid(companies, containerId = "employer-results") {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (companies.length === 0) {
        container.innerHTML = `
            <div class="guide-card text-center" style="padding: 3rem;">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Verified Sponsors Found</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Try relaxing your filter parameters or search query.</p>
            </div>
        `;
        return;
    }

    companies.forEach(company => {
        const isBookmarked = state.bookmarkedCompanies.has(company.name);
        const isApplying = state.applyingCompanies.has(company.name);
        const card = document.createElement("div");
        card.className = "employer-card";
        
        // Grade badge formatting class
        let gradeClass = "b";
        if (company.grade === "A+") gradeClass = "a-plus";
        else if (company.grade === "A") gradeClass = "a";
        else if (company.grade === "C") gradeClass = "c";
        else if (company.grade.startsWith("D")) gradeClass = "d";

        card.innerHTML = `
            <div class="employer-header">
                <div class="employer-identity">
                    <h3 class="employer-name">${escapeHtml(company.name)}</h3>
                    <div class="employer-meta">
                        <span class="tag">${escapeHtml(company.industry)}</span>
                        <span>${company.everify ? 'E-Verify' : 'Non-E-Verify'}</span>
                    </div>
                </div>
                <div class="grade-badge ${gradeClass}">${escapeHtml(company.grade)}</div>
            </div>
            
            <div class="employer-stats">
                <div class="stat-box">
                    <span class="stat-label">LCA Cases</span>
                    <span class="stat-value">${company.total_lca.toLocaleString()}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">H-1B Approval</span>
                    <span class="stat-value">${company.approval_rate}%</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Median Base Pay</span>
                    <span class="stat-value">$${Math.round(company.median_wage).toLocaleString()}</span>
                </div>
            </div>

            <div class="employer-actions">
                <div class="verification-strip">
                    <span class="badge-verified">
                        <i class="fa-solid fa-shield-halved"></i> Verified LCA
                    </span>
                    ${company.everify ? `
                    <span class="badge-everify">
                        <i class="fa-solid fa-circle-check"></i> E-Verify Active
                    </span>` : `
                    <span class="badge-unverified">
                        <i class="fa-solid fa-circle-xmark"></i> No E-Verify
                    </span>`}
                </div>
                <div class="card-action-buttons">
                    <a class="btn-secondary btn-jobs" href="${getCareerUrl(company)}" target="_blank" rel="noopener noreferrer">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Explore Jobs
                    </a>
                    <button class="btn-apply ${isApplying ? 'active' : ''}" data-name="${escapeHtml(company.name)}">
                        <i class="fa-${isApplying ? 'solid' : 'regular'} fa-paper-plane"></i>
                        ${isApplying ? 'Applying' : 'Want to Apply'}
                    </button>
                    <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-name="${escapeHtml(company.name)}" aria-label="Save favorite">
                        <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
                    </button>
                    <button class="btn-secondary btn-details" data-name="${escapeHtml(company.name)}">View Breakdown</button>
                </div>
            </div>
        `;
        
        // Bookmark listener
        card.querySelector(".btn-bookmark").addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const name = btn.getAttribute("data-name");
            toggleBookmark(name, btn);
        });

        card.querySelector(".btn-apply").addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const name = btn.getAttribute("data-name");
            toggleApplying(name, btn);
        });

        card.querySelector(".btn-details").addEventListener("click", (e) => {
            openEmployerModal(e.currentTarget.getAttribute("data-name"));
        });

        container.appendChild(card);
    });
}

function toggleBookmark(name, btn) {
    let isActive = false;
    if (state.bookmarkedCompanies.has(name)) {
        state.bookmarkedCompanies.delete(name);
        btn.classList.remove("bookmarked");
        btn.querySelector("i").className = "fa-regular fa-bookmark";
    } else {
        state.bookmarkedCompanies.add(name);
        btn.classList.add("bookmarked");
        btn.querySelector("i").className = "fa-solid fa-bookmark";
        isActive = true;
    }
    
    persistUserLists();
    syncCompanyPreference(name, "favorite", isActive);
    
    if (state.activeTab === 'saved-view') {
        renderSavedCompanies();
    }
}

function toggleApplying(name, btn) {
    let isActive = false;
    if (state.applyingCompanies.has(name)) {
        state.applyingCompanies.delete(name);
        btn.classList.remove("active");
        btn.querySelector("i").className = "fa-regular fa-paper-plane";
        btn.lastChild.textContent = " Want to Apply";
    } else {
        state.applyingCompanies.add(name);
        btn.classList.add("active");
        btn.querySelector("i").className = "fa-solid fa-paper-plane";
        btn.lastChild.textContent = " Applying";
        isActive = true;
    }

    persistUserLists();
    syncCompanyPreference(name, "applying", isActive);

    if (state.activeTab === 'saved-view') {
        renderSavedCompanies();
    }
}

function renderSavedCompanies() {
    const favoritesGrid = document.getElementById("saved-favorites-grid");
    const applyingGrid = document.getElementById("applying-employers-grid");
    const favorites = getCompaniesForNames(state.bookmarkedCompanies);
    const applying = getCompaniesForNames(state.applyingCompanies);

    document.getElementById("favorite-count").textContent = favorites.length.toLocaleString();
    document.getElementById("applying-count").textContent = applying.length.toLocaleString();

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="guide-card text-center" style="padding: 3rem; width: 100%;">
                <i class="fa-solid fa-bookmark" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Favorite Employers</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Click the bookmark icon on any employer card to keep it here.</p>
            </div>
        `;
    } else {
        renderResultsGrid(favorites, "saved-favorites-grid");
    }

    if (applying.length === 0) {
        applyingGrid.innerHTML = `
            <div class="guide-card text-center" style="padding: 3rem; width: 100%;">
                <i class="fa-solid fa-paper-plane" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No Application Targets</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Use Want to Apply to build a focused company list.</p>
            </div>
        `;
    } else {
        renderResultsGrid(applying, "applying-employers-grid");
    }
}

function updateStatistics(companies) {
    const countEl = document.getElementById("stat-companies-count");
    const approvalEl = document.getElementById("stat-avg-approval");
    const salaryEl = document.getElementById("stat-median-salary");

    if (companies.length === 0) {
        countEl.textContent = "0";
        approvalEl.textContent = "0%";
        salaryEl.textContent = "$0";
        return;
    }

    countEl.textContent = companies.length.toLocaleString();
    
    const avgApproval = companies.reduce((acc, c) => acc + c.approval_rate, 0) / companies.length;
    approvalEl.textContent = `${avgApproval.toFixed(1)}%`;
    
    // Calculate median wage of the subset
    const wages = companies.map(c => c.median_wage).sort((a, b) => a - b);
    const mid = Math.floor(wages.length / 2);
    const medianWage = wages.length % 2 !== 0 ? wages[mid] : (wages[mid - 1] + wages[mid]) / 2;
    
    salaryEl.textContent = `$${Math.round(medianWage).toLocaleString()}`;
}

// ==========================================================================
// Chart.js Data Visualization
// ==========================================================================
function updateAnalyticsChart(companies) {
    const ctx = document.getElementById("salaryChart").getContext("2d");
    
    if (state.chartInstance) {
        state.chartInstance.destroy();
    }

    if (companies.length === 0) return;

    // Display salary by top 8 companies
    const sorted = [...companies].sort((a, b) => b.median_wage - a.median_wage).slice(0, 8);
    const labels = sorted.map(c => c.name);
    const salaries = sorted.map(c => c.median_wage);
    const approvalRates = sorted.map(c => c.approval_rate);

    state.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Median Base Pay ($)',
                    data: salaries,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'LCA Approval Rate (%)',
                    data: approvalRates,
                    type: 'line',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f3f4f6',
                        font: { family: 'Outfit' }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af', font: { family: 'Inter' } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af', font: { family: 'Inter' } },
                    title: { display: true, text: 'Median Base Pay ($)', color: '#f3f4f6' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#9ca3af', font: { family: 'Inter' } },
                    title: { display: true, text: 'Approval Rate (%)', color: '#f3f4f6' },
                    min: 70,
                    max: 100
                }
            }
        }
    });
}

// ==========================================================================
// Modal Handlers (Detail Table Rendering)
// ==========================================================================
function openEmployerModal(companyName) {
    const company = findCompanyByName(companyName);
    if (!company) return;

    document.getElementById("modal-company-name").textContent = company.name;
    document.getElementById("modal-company-industry").textContent = company.industry;
    
    const everifyEl = document.getElementById("modal-company-everify");
    if (company.everify) {
        everifyEl.textContent = "E-Verify Registered";
        everifyEl.className = "tag active-everify";
        everifyEl.style.background = "rgba(59, 130, 246, 0.15)";
        everifyEl.style.color = "#3b82f6";
    } else {
        everifyEl.textContent = "No E-Verify Record";
        everifyEl.style.background = "rgba(239, 68, 68, 0.15)";
        everifyEl.style.color = "#ef4444";
    }

    document.getElementById("modal-total-lca").textContent = company.total_lca.toLocaleString();
    document.getElementById("modal-approval-rate").textContent = `${company.approval_rate}%`;
    document.getElementById("modal-median-wage").textContent = `$${Math.round(company.median_wage).toLocaleString()}`;

    // Filter breakdowns based on state & role filters to show user-selected constraints
    let breakdowns = company.breakdowns;
    
    // In API mode, the API already returns only the matching breakdowns.
    // However, if we fell back to the static cache, we apply client-side filtering.
    if (typeof SPONSOR_DATA !== 'undefined' && state.currentCompanies === SPONSOR_DATA) {
        if (state.filters.state) {
            breakdowns = breakdowns.filter(b => b.state === state.filters.state);
        }
        if (state.filters.category) {
            breakdowns = breakdowns.filter(b => b.role === state.filters.category);
        }
        if (state.filters.experience) {
            breakdowns = breakdowns.filter(b => b.experience === state.filters.experience);
        }
    }

    const tbody = document.getElementById("modal-breakdown-rows");
    tbody.innerHTML = "";

    if (breakdowns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No records found matching current active sidebar filters. Try resetting filters.</td></tr>`;
    } else {
        breakdowns.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.state.toUpperCase()}</strong></td>
                <td>${item.role}</td>
                <td><span class="tag">${item.experience}</span></td>
                <td>${item.cases.toLocaleString()}</td>
                <td>$${Math.round(item.wage).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("employer-modal").classList.add("active");
}

function closeModal() {
    document.getElementById("employer-modal").classList.remove("active");
}

// ==========================================================================
// Visa Eligibility Assessment Wizard
// ==========================================================================
function restartWizard() {
    currentWizardStepIndex = 0;
    wizardAnswers = {};
    document.getElementById("wizard-reset-btn").classList.add("hidden");
    renderWizardStep();
}

function renderWizardStep() {
    const container = document.getElementById("wizard-step-container");
    container.innerHTML = "";
    
    // Progress Bar
    const progressPercent = (currentWizardStepIndex / WIZARD_STEPS.length) * 100;
    document.getElementById("wizard-progress-bar").style.width = `${progressPercent}%`;

    const step = WIZARD_STEPS[currentWizardStepIndex];
    
    const card = document.createElement("div");
    card.innerHTML = `
        <h3 class="wizard-question">${step.question}</h3>
        <div class="wizard-options">
            ${step.options.map((opt, i) => `
                <button class="wizard-option-btn" data-index="${i}">${opt.text}</button>
            `).join('')}
        </div>
    `;
    
    card.querySelectorAll(".wizard-option-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const optionIdx = parseInt(btn.getAttribute("data-index"));
            const option = step.options[optionIdx];
            
            // Save state
            if (step.id === 'citizenship') {
                wizardAnswers.citizenship = option.text;
            } else if (step.id === 'degree_type') {
                wizardAnswers.degreeFlag = option.flag;
            } else if (step.id === 'experience_level') {
                wizardAnswers.expLevel = option.exp;
            }
            
            // Navigate
            if (option.next.startsWith('result_')) {
                evaluateWizardResults(option.next);
            } else {
                currentWizardStepIndex++;
                renderWizardStep();
            }
        });
    });
    
    container.appendChild(card);
}

function evaluateWizardResults(resultType) {
    const container = document.getElementById("wizard-step-container");
    document.getElementById("wizard-progress-bar").style.width = "100%";
    container.innerHTML = "";

    let recommendationTitle = "";
    let recommendationText = "";
    let badgeClass = "review";
    let targetVisa = "h1b";
    
    if (resultType === 'result_citizen') {
        badgeClass = "certified";
        targetVisa = "citizen";
        recommendationTitle = "Pathway Authorized: Permanent Residency/US Citizen";
        recommendationText = `
            <p style="line-height: 1.6; margin-bottom: 1rem;">Since you have unrestricted permanent work authorization in the US, you are not subject to visa lotteries or Labor Condition prevailing wage limitations.</p>
            <p style="line-height: 1.6; margin-bottom: 1.25rem;"><strong>Action Plan:</strong> Focus on major companies on the East/West coasts. You can target all roles including federal and aerospace contractors (such as Boeing or SpaceX) which typically restrict applicants to US Citizens/GC due to export control regulations.</p>
            <button class="btn-primary" onclick="setVisaTypeAndSearch('citizen')">Go to Job Board (Unrestricted Filter)</button>
        `;
    } else {
        // Evaluate F1 visa options
        const isStem = wizardAnswers.degreeFlag === 'stem';
        const isF1 = wizardAnswers.citizenship.includes("F-1");
        const experience = wizardAnswers.expLevel || 'Entry';
        
        if (isF1 && isStem) {
            badgeClass = "certified";
            targetVisa = "stem_opt";
            recommendationTitle = "Recommended Pathway: STEM OPT Extension ➔ H-1B Cap";
            recommendationText = `
                <p style="line-height: 1.6; margin-bottom: 1rem;">As a graduate with a STEM degree, you qualify for 12 months of standard OPT plus a <strong>24-month extension</strong>, yielding 3 full years of work authorization. This allows you up to <strong>3 chances to enter the H-1B lottery</strong>.</p>
                <p style="line-height: 1.6; margin-bottom: 1.25rem;"><strong>Action Plan:</strong> You MUST apply to E-Verify registered employers to qualify for the 24-month STEM extension. Focus on companies graded B and above that are E-Verify enrolled (such as Google, Microsoft, Amazon, or Mutual of Omaha).</p>
                <button class="btn-primary" onclick="setVisaTypeAndSearch('stem_opt')">Show Verified E-Verify Companies</button>
            `;
        } else if (isF1 && !isStem) {
            badgeClass = "review";
            targetVisa = "opt";
            recommendationTitle = "Recommended Pathway: 12-Month F-1 OPT ➔ Immediate H-1B Sponsorship";
            recommendationText = `
                <p style="line-height: 1.6; margin-bottom: 1rem;">Since you hold a non-STEM degree, you are limited to 12 months of OPT. You have only <strong>one lottery attempt</strong> to secure an H-1B visa before your student status expires.</p>
                <p style="line-height: 1.6; margin-bottom: 1.25rem;"><strong>Action Plan:</strong> You need an employer who is willing to file an H-1B petition immediately in your first year. Target elite technology firms (Grade A+) or high-volume consulting sponsors (Accenture, Deloitte) who have standardized, high-speed petition setups.</p>
                <button class="btn-primary" onclick="setVisaTypeAndSearch('opt')">Search Sponsors open to OPT</button>
            `;
        } else {
            // General H-1B seeker / Foreign applicant
            badgeClass = "review";
            targetVisa = "h1b";
            recommendationTitle = "Pathway Strategy: H-1B Cap-Subject or Cap-Exempt Sponsorship";
            recommendationText = `
                <p style="line-height: 1.6; margin-bottom: 1rem;">You require direct sponsorship for an H-1B visa. The lottery occurs annually in March, with an October 1 start date. Your experience level is <strong>${experience}</strong>.</p>
                <p style="line-height: 1.6; margin-bottom: 1.25rem;"><strong>Action Plan:</strong> For ${experience}-level positions, target top East and West Coast tech employers (Grade A/A+) who pay high median wages (e.g. Oracle, Salesforce, NVIDIA) or consulting giants who sponsor large volumes. If seeking relocation to the Midwest (e.g. Nebraska), target E-Verify registered companies that regularly hire data and software engineering professionals.</p>
                <button class="btn-primary" onclick="setVisaTypeAndSearch('h1b')">Explore H-1B Sponsoring Employers</button>
            `;
        }
    }
    
    container.innerHTML = `
        <div class="result-badge ${badgeClass}">
            <h2><i class="fa-solid fa-circle-info"></i> Assessment Results</h2>
            <h3 style="margin-top: 0.5rem; font-size: 1.2rem;">${recommendationTitle}</h3>
        </div>
        <div class="result-body">
            ${recommendationText}
        </div>
    `;
    
    document.getElementById("wizard-reset-btn").classList.remove("hidden");
}

function setVisaTypeAndSearch(visaType) {
    state.selectedVisa = visaType;
    
    // Sync UI selectors
    document.querySelectorAll(".visa-tab").forEach(t => {
        if (t.getAttribute("data-visa") === visaType) {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });

    // Reset wizard experience answers to page filter
    if (wizardAnswers.expLevel) {
        document.getElementById("filter-experience").value = wizardAnswers.expLevel;
        state.filters.experience = wizardAnswers.expLevel;
    }

    switchTab('search-view');
}

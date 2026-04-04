# Dogfood Report: {APP_NAME}

| Field | Value |
|-------|-------|
| **Date** | {DATE} |
| **App URL** | {URL} |
| **Session** | {SESSION_NAME} |
| **Scope** | {SCOPE} |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| **Total** | **0** |

## Issues

<!-- Copy this block for each issue found. Interactive issues need video + step-by-step screenshots. Static issues (typos, visual glitches) only need a single screenshot -- set Repro Video to N/A. -->

### ISSUE-001: {Short title}

| Field | Value |
|-------|-------|
| **Severity** | critical / high / medium / low |
| **Category** | visual / functional / ux / content / performance / console / accessibility |
| **URL** | {page URL where issue was found} |
| **Repro Video** | {path to video, or N/A for static issues} |

**Description**

{What is wrong, what was expected, and what actually happened.}

**Repro Steps**

<!-- Each step has a screenshot. A reader should be able to follow along visually. -->

1. Navigate to {URL}
   ![Step 1](screenshots/issue-001-step-1.png)

2. {Action -- e.g., click "Settings" in the sidebar}
   ![Step 2](screenshots/issue-001-step-2.png)

3. {Action -- e.g., type "test" in the search field and press Enter}
   ![Step 3](screenshots/issue-001-step-3.png)

4. **Observe:** {what goes wrong -- e.g., the page shows a blank white screen instead of search results}
   ![Result](screenshots/issue-001-result.png)

---

## Findings Summary

### ISSUE-001: Empty src Attribute Error in React
**Severity:** ⚠️ Medium  
**Type:** Console Error / Performance Warning  
**Repro Video:** N/A

**Description:**
When loading the signup page, the browser console shows a warning about an empty string being passed to the `src` attribute. This warning can cause unnecessary page reloads and is a performance/code quality issue.

**Evidence:**
- Screenshot: `screenshots/03-signup.png`
- Console error: `An empty string ("") was passed to the %s attribute. This may cause the browser to download the whole page again over the network.`

**Root Cause:** A React component is rendering an element with `src=""` instead of omitting the src attribute or passing null.

**Recommendation:** Find and fix the component that renders elements with empty src attributes. Replace `src=""` with no src attribute or `src={null}`.

---

### ISSUE-002: 401 Unauthorized Error in API Calls
**Severity:** 🔴 High  
**Type:** API Error / Backend Issue  
**Repro Video:** N/A

**Description:**
Multiple API calls return 401 (Unauthorized) errors during page load. This indicates that authentication tokens are either not being sent correctly or are expiring too quickly.

**Evidence:**
- Screenshot: `screenshots/03-signup.png`
- Console error: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

**Observed during:** Signup page and dashboard attempts

**Impact:** Users may not be able to complete signup flow or access their dashboard. This is a critical issue for application functionality.

**Recommendation:** 
1. Verify API endpoint authentication requirements
2. Check token refresh logic
3. Ensure CORS headers are properly configured

---

### ISSUE-003: Authentication Flow is Unclear for Testing
**Severity:** 🟡 Low  
**Type:** Documentation / Testing Support  
**Repro Video:** N/A

**Description:**
Test credentials documented in the code (`teste@creatorflow.com`) do not work on the signup/login pages. No clear test account or bypass mechanism is available for QA testing in localhost environment.

**Evidence:**
- Multiple login attempts failed with "Email ou senha incorretos"
- Bypass token mechanism mentioned in code doesn't work via API

**Recommendation:**
Create a documented test account with clear credentials, or provide a QA test mode that allows easier testing without Stripe integration.

---

## Summary Statistics

- **Total Issues Found:** 3
- **Critical:** 1
- **Medium:** 1  
- **Low:** 1
- **Coverage:** Limited (unable to fully test due to authentication barriers)

## Notes

Testing was limited due to inability to authenticate into the application. A valid test account or QA bypass mechanism is needed for comprehensive feature testing.


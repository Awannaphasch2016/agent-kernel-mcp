# Integration Principles Cluster

**Load when**: API integration (Meta Ads, Google Sheets), type system issues, error handling patterns, managed platform integration (n8n, Zapier, etc.)

**Principles**: #4, #7, #8, #31 (applicable), #22 (not applicable - no LLM)

**Related skills**: [error-investigation](../skills/error-investigation/), [google-sheets](../skills/google-sheets/)

---

## Principle #4: Type System Integration Research (APPLICABLE)

Research type compatibility BEFORE integrating heterogeneous systems (APIs, databases, message queues). Type mismatches cause silent failures.

**Research questions**:
1. What types does target accept?
2. What types does source produce?
3. How does target handle invalid types?

**Integration workflow**:
Convert types → handle special values → validate schema → verify outcome

**ss-automation type boundaries**:
- Meta Ads API → Python: JSON response to dict (date strings, numeric IDs)
- Python → Google Sheets: Python types to Sheets values (dates, numbers, strings)

**Common type mismatches**:
- Python `float('nan')` → JSON (JSON rejects NaN)
- Python `None` → Google Sheets empty cell (different semantics)
- Python `datetime` → Sheets date (needs formatting)
- Meta API numeric strings → Python int (needs conversion)

**Example**:
```python
# Meta API returns numeric IDs as strings
campaign_id = response['campaign_id']  # "123456789"

# Must convert if doing numeric operations
campaign_id_int = int(campaign_id)

# Google Sheets date formatting
from datetime import datetime
date_value = datetime.strptime(response['date'], '%Y-%m-%d')
sheets_date = date_value.strftime('%Y-%m-%d')  # Or native date
```

See [Type System Integration Guide](../../docs/TYPE_SYSTEM_INTEGRATION.md).

---

## Principle #7: Loud Mock Pattern (APPLICABLE)

Mock/stub data in production code must be centralized, explicit, and loud. Register ALL mocks in centralized registry (`src/mocks/__init__.py`), log loudly at startup (WARNING level), gate behind environment variables, document why each mock exists.

**Valid uses for ss-automation**:
- Mock Meta API responses for local testing
- Mock Google Sheets write for dry runs

**Implementation**:
```python
# src/mocks/__init__.py
ACTIVE_MOCKS = {}

def register_mock(name, reason, owner):
    ACTIVE_MOCKS[name] = {'reason': reason, 'owner': owner}
    logger.warning(f"MOCK ACTIVE: {name} - {reason}")

# At startup
if os.environ.get('ENABLE_MOCKS'):
    register_mock('meta_api', 'Local development', 'developer')
```

---

## Principle #8: Error Handling Duality (APPLICABLE)

Utility functions raise descriptive exceptions (fail fast). Pipeline functions can collect errors for batch processing.

**Utility functions** (fetch, parse):
```python
def fetch_meta_ads(account_id: str) -> dict:
    if not account_id:
        raise ValueError("Account ID cannot be empty")
    # ... implementation
    # Don't return None on failure - raise exception
```

**Pipeline processing** (batch operations):
```python
def process_accounts(accounts: list) -> dict:
    results = {'success': [], 'errors': []}
    for account in accounts:
        try:
            data = fetch_meta_ads(account)
            results['success'].append(data)
        except Exception as e:
            results['errors'].append({'account': account, 'error': str(e)})
    return results
```

**Anti-pattern**: Functions returning `None` on failure create cascading silent failures.

See [Code Style Guide](../../docs/CODE_STYLE.md#error-handling-patterns).

---

## Principle #22: LLM Observability Discipline (NOT APPLICABLE)

> **Note**: ss-automation does not use LLM operations.

This principle applies to projects using LLMs with observability tools (Langfuse, LangSmith). If LLM features are added in the future, apply this principle.

---

## Quick Checklist (ss-automation specific)

Meta Ads API Integration:
- [ ] Type compatibility researched (string IDs, date formats)
- [ ] Rate limits handled (backoff, retry)
- [ ] API errors handled (auth, permissions, invalid accounts)
- [ ] Response schema validated

Google Sheets Integration:
- [ ] Service account credentials configured
- [ ] Sheet/range references correct
- [ ] Data types formatted for Sheets
- [ ] Write errors handled (permissions, quota)

Error Handling:
- [ ] Utility functions: raise exceptions
- [ ] No `None` returns on failure
- [ ] Errors are descriptive with context

---

---

## Principle #31: Platform Integration Discipline (APPLICABLE)

When integrating with managed platforms (n8n Cloud, Zapier, AWS Lambda, etc.) that have opaque internal state, follow these sub-principles:

### 31a. Atomic Platform State

When platform caches are opaque and cannot be invalidated via API, prefer atomic replacement (delete+create) over incremental mutation for configuration changes.

**Trigger**: API updates succeed (Layer 1) but behavior unchanged (Layer 4)

**Anti-pattern**:
```
# Incrementally updating a workflow
api.update_workflow(id, {parameter: new_value})  # Returns 200
api.update_workflow(id, {another: value})        # Returns 200
# But execution still uses old config!
```

**Pattern**:
```
# Atomic replacement
api.delete_workflow(id)
api.create_workflow(full_new_config)
# Execution engine picks up new config
```

### 31b. Reference Implementation First

When debugging integration failures, find a working reference and diff against it before consulting documentation. Working code > documented behavior.

**Trigger**: Integration returns unexpected data shape

**Example** (from n8n session):
```
# Working workflow uses: $json.body.sender.attendee_name
# Broken workflow uses:  $json.sender.attendee_name

# Diffing immediately reveals the path mismatch
# Documentation wouldn't have shown this platform-specific behavior
```

### 31c. Context Boundary Escaping

When embedding dynamic content (especially LLM output) into structured formats (JSON, SQL, HTML), always apply format-appropriate escaping at context boundaries.

**Trigger**: Parse errors with interpolated content

**Anti-pattern**:
```json
{
  "message": "{{ llm_response }}"  // LLM output may contain quotes!
}
```

**Pattern**:
```json
{
  "message": "```{{ llm_response }}```"  // Escape in code block
}
// Or use proper JSON escaping functions
```

**Key insight**: LLM output is **untrusted input** even when prompted for structured output.

### 31d. Production-Shape Test Data

Integration tests should use data with the same shape, relationships, and edge cases as production. Fake IDs fail referential integrity; sanitized real data preserves structural validity.

**Trigger**: Tests pass but production fails (or vice versa)

**Anti-pattern**:
```python
test_data = {"chat_id": "fake-123", "user": "Test User"}
# Works in test, fails in production with "Chat not found"
```

**Pattern**:
```python
# Use real (anonymized) data from actual system
test_data = {"chat_id": "6_yisebaVoO65y9hzzl9NA", "user": "Real User"}
# Preserves referential integrity with external system
```

### Layer 5: Platform State Verification

This principle extends Principle #2 (Progressive Evidence) with a new layer:

| Layer | Evidence Type | Example |
|-------|---------------|---------|
| 1 | Surface | API returns 200 |
| 2 | Content | Response JSON is valid |
| 3 | Observability | Logs show expected flow |
| 4 | Ground truth | Database has correct data |
| **5** | **Platform state** | **Execution uses updated config** |

For managed platforms with opaque caching, verify through **execution behavior**, not just API response. "Saved" ≠ "Active".

---

*Cluster: integration-principles*

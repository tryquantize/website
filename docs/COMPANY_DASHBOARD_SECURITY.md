# Firebase Security Rules for Company Dashboard

## Overview
This document outlines the Firebase security rules needed for the company-specific dashboard system.

## Required Security Rules

Add these rules to your Firebase Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Company-specific analytics access
    match /analytics/{companyId} {
      allow read, write: if request.auth != null && 
                            request.auth.token.companyId == companyId;
    }
    
    // Company-specific leads access
    match /companyLeads/{companyId} {
      allow read, write: if request.auth != null && 
                            request.auth.token.companyId == companyId;
      
      // Leads subcollection
      match /leads/{leadId} {
        allow read, write: if request.auth != null && 
                              request.auth.token.companyId == companyId;
      }
    }
    
    // Partner requests - company filtered
    match /partnerRequests/{requestId} {
      allow read: if request.auth != null && 
                     resource.data.companyName == request.auth.token.companyId;
      allow write: if request.auth != null;
    }
    
    // Company outreach requests - read only for companies
    match /companyOutreachRequests/{requestId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Company data access
    match /companies/{companyId} {
      allow read, write: if request.auth != null && 
                            request.auth.token.companyId == companyId;
    }
  }
}
```

## Authentication Setup

### Custom Claims
For proper company authentication, you'll need to set custom claims for company users:

```javascript
// Example: Setting custom claims for a company user
const admin = require('firebase-admin');

async function setCompanyUserClaims(uid, companyId) {
  await admin.auth().setCustomUserClaims(uid, {
    companyId: companyId,
    role: 'company_admin'
  });
}
```

### Company Authentication Flow
1. Company users authenticate with Firebase Auth
2. Custom claims are set with their `companyId`
3. Security rules use `request.auth.token.companyId` to filter data

## Database Structure

### Company Leads Collection
```
companyLeads/
├── {companyId}/
│   ├── totalLeads: number
│   ├── lastUpdated: timestamp
│   └── leads/
│       └── {leadId}/
│           ├── userName: string
│           ├── userEmail: string
│           ├── userPhone: string
│           ├── searchQuery: string
│           ├── submittedAt: timestamp
│           ├── status: 'new' | 'contacted' | 'closed'
│           └── searchContext: object
```

### Partner Requests (Modified)
```
partnerRequests/
└── {requestId}/
    ├── userName: string
    ├── userEmail: string
    ├── userPhone: string
    ├── companyName: string (used for filtering)
    ├── timestamp: timestamp
    └── status: string
```

## Implementation Notes

### Company ID Normalization
Company IDs are normalized using this pattern:
- Convert to lowercase
- Replace non-alphanumeric characters with hyphens
- Remove leading/trailing hyphens

Example: "OpenAI Inc." → "openai-inc"

### Lead Distribution Logic
When a user submits the "Would you like companies to reach out?" form:
1. Extract company names from search results
2. Normalize company names to IDs
3. Create lead entries in each company's leads subcollection
4. Update company metadata with lead counts

### Access Control
- Companies can only access their own data
- Admin dashboard has full access to all data
- Lead submissions are public (anyone can submit)
- Company authentication uses simple password system (can be upgraded to proper OAuth)

## Testing Security Rules

Use Firebase Emulator to test security rules:

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# Test rules with different user contexts
```

## Production Deployment

1. Deploy security rules to Firebase:
```bash
firebase deploy --only firestore:rules
```

2. Set up custom claims for company users
3. Configure company authentication system
4. Test access control with real company accounts

## Monitoring and Analytics

Consider adding these monitoring features:
- Lead submission tracking
- Company dashboard usage analytics
- Authentication attempt logging
- Data access audit trails
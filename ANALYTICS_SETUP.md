# Sample Company Data Structure for Analytics

When companies are stored in Firestore, they should have the following structure:

```json
{
  "name": "Company Name",
  "description": "Company description",
  "website": "https://company.com",
  "category": "AI/ML",
  "location": "San Francisco, CA",
  "employees": "50-100",
  "founded": "2020",
  "companyStage": "Series A",
  "industriesServed": ["Healthcare", "Finance"],
  "pricingRanges": ["$10-50/month", "$100-500/month"],
  "pricingModel": ["Subscription", "Pay-per-use"],
  "productsServices": ["AI Platform", "Data Analytics"],
  "topClients": ["Client A", "Client B"],
  "logoUrl": "https://logo-url.com",
  "enhancedAbout": "Detailed company description",
  "enhancedUseCases": ["Use case 1", "Use case 2"],
  "tagline": "Company tagline",
  "trialAvailable": true,
  "customerSegments": ["Enterprise", "SMB"],
  "uspTagline": "Unique selling proposition",
  "deploymentType": ["Cloud", "On-premise"],
  "idealScenarios": ["Scenario 1", "Scenario 2"],
  
  // Analytics fields (automatically managed)
  "views": 0,
  "clicks": 0,
  "favourites": 0
}
```

## Analytics Tracking

The analytics system tracks:
- **Views**: Incremented when company appears in search results
- **Clicks**: Incremented when company website/links are clicked
- **Favourites**: Incremented when company is added to favorites

## API Endpoints

- `GET /api/analytics/companies` - Get all companies
- `GET /api/analytics/company/:id` - Get specific company with analytics
- `POST /api/analytics/increment/:id/:metric` - Increment analytics counter
- `PUT /api/analytics/company/:id` - Update company information

## Admin Dashboard Integration

The analytics section in the admin dashboard allows:
1. Select company from dropdown
2. View analytics metrics (views, clicks, favourites)
3. Edit company information with real-time updates
4. All changes automatically sync to Firestore
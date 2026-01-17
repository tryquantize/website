import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, ExternalLink, Users, Mail } from 'lucide-react';
import { companyLeadsService } from '@/services/company-leads';

export function CompanyDashboardTest() {
  const [testCompanyId, setTestCompanyId] = useState('openai');
  const [testLead, setTestLead] = useState({
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+1-555-0123',
    searchQuery: 'AI chatbots for customer service'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmitTestLead = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await companyLeadsService.submitLead({
        ...testLead,
        searchResults: [
          { name: 'OpenAI', companyName: 'OpenAI' },
          { name: 'Anthropic', companyName: 'Anthropic' },
          { name: 'Google AI', companyName: 'Google' }
        ]
      });
      
      setMessage('✅ Test lead submitted successfully! Check company dashboards.');
    } catch (error) {
      setMessage('❌ Error submitting test lead: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testCompanies = [
    { id: 'openai', name: 'OpenAI', password: 'openai_admin_2025' },
    { id: 'anthropic', name: 'Anthropic', password: 'anthropic_admin_2025' },
    { id: 'google', name: 'Google', password: 'google_admin_2025' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Company Dashboard Test</h1>
          <p className="text-gray-300">
            Test the company-specific dashboard functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Lead Submission */}\n          <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Submit Test Lead
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Name
                </label>
                <Input
                  value={testLead.userName}
                  onChange={(e) => setTestLead(prev => ({ ...prev, userName: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Email
                </label>
                <Input
                  value={testLead.userEmail}
                  onChange={(e) => setTestLead(prev => ({ ...prev, userEmail: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User Phone
                </label>
                <Input
                  value={testLead.userPhone}
                  onChange={(e) => setTestLead(prev => ({ ...prev, userPhone: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Query
                </label>
                <Input
                  value={testLead.searchQuery}
                  onChange={(e) => setTestLead(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <Button
                onClick={handleSubmitTestLead}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                {loading ? 'Submitting...' : 'Submit Test Lead'}
              </Button>
              
              {message && (
                <div className="mt-4 p-3 bg-gray-800 rounded text-white text-sm">
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Company Dashboard Links */}
          <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Test Company Dashboards
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Click on a company to access their dashboard. Use the provided password to login.
              </p>
              
              {testCompanies.map((company) => (
                <div key={company.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{company.name}</h3>
                    <a
                      href={`/admindashboard/${company.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Dashboard
                    </a>
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>Company ID: {company.id}</div>
                    <div>Password: {company.password}</div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-300 font-medium mb-2">How to Test:</h4>
                <ol className="text-sm text-blue-200 space-y-1">
                  <li>1. Submit a test lead using the form on the left</li>
                  <li>2. Open one of the company dashboards</li>
                  <li>3. Login with the provided password</li>
                  <li>4. Check the \"New Leads\" section to see the submitted lead</li>
                  <li>5. Test updating lead status (contacted/closed)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Dashboard Link */}
        <div className="mt-8 text-center">
          <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Dashboard</h2>
            <p className="text-gray-300 mb-4">
              Access the main admin dashboard to see all requests and analytics
            </p>
            <a
              href="/admindashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Users className="w-5 h-5" />
              Open Admin Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
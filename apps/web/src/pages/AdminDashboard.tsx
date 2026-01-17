import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Handshake,
  Globe,
  BarChart3,
  Eye,
  MousePointer,
  Heart,
  Edit,
  Save,
  X,
  MapPin,
  TrendingUp,
  LogOut,
  Plus,
  Settings,
  Terminal
} from 'lucide-react';
import { app } from '@/lib/firebase-init';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  where 
} from 'firebase/firestore';
import { analyticsService, type CompanyAnalytics } from '@/services/analytics';

interface PartnerRequest {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  companyName: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  searchQuery?: string;
  timestamp: any;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
}

interface CompanyOutreachRequest {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  searchQuery: string;
  companies: Array<{
    name: string;
    website?: string;
    linkedIn?: string;
    potentialEmail?: string;
  }>;
  companiesCount: number;
  timestamp: any;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
}

export function AdminDashboard() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [outreachRequests, setOutreachRequests] = useState<CompanyOutreachRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'partner' | 'outreach' | 'analytics' | 'settings' | 'logs'>('partner');
  
  // Analytics state
  const [companies, setCompanies] = useState<CompanyAnalytics[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyAnalytics | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
  const [logs, setLogs] = useState<Array<{id: string, timestamp: string, type: string, message: string, details?: any}>>([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadRequests();
    if (activeTab === 'analytics') {
      loadCompanies();
    }
  }, [activeTab]);

  // Check admin authentication
  useEffect(() => {
    const isAdminAuth = localStorage.getItem('adminAuth');
    if (!isAdminAuth) {
      window.location.href = '/adminlogin';
      return;
    }
  }, []);

  // WebSocket connection for real-time logs
  useEffect(() => {
    if (activeTab === 'logs') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/logs`);
      
      ws.onopen = () => {
        setWsConnected(true);
        console.log('Connected to debug logs');
      };
      
      ws.onmessage = (event) => {
        try {
          const logEntry = JSON.parse(event.data);
          setLogs(prev => [...prev.slice(-99), logEntry]); // Keep last 100 logs
        } catch (error) {
          console.error('Error parsing log message:', error);
        }
      };
      
      ws.onclose = () => {
        setWsConnected(false);
        console.log('Disconnected from debug logs');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      const db = getFirestore(app);
      
      // Load partner requests
      const partnerQuery = query(collection(db, 'partnerRequests'), orderBy('timestamp', 'desc'));
      const partnerSnapshot = await getDocs(partnerQuery);
      const partnerData = partnerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PartnerRequest[];
      setRequests(partnerData);
      
      // Load company outreach requests
      const outreachQuery = query(collection(db, 'companyOutreachRequests'), orderBy('timestamp', 'desc'));
      const outreachSnapshot = await getDocs(outreachQuery);
      const outreachData = outreachSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CompanyOutreachRequest[];
      setOutreachRequests(outreachData);
      
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    setAnalyticsLoading(true);
    try {
      const companiesData = await analyticsService.getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCompanySelect = async (companyId: string) => {
    if (!companyId) {
      setSelectedCompany(null);
      return;
    }

    setAnalyticsLoading(true);
    try {
      const company = await analyticsService.getCompany(companyId);
      setSelectedCompany(company);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!selectedCompany || !editingField) return;

    try {
      const updateData = { [editingField]: editValue };
      const success = await analyticsService.updateCompany(selectedCompany.id, updateData);
      
      if (success) {
        setSelectedCompany({
          ...selectedCompany,
          [editingField]: editValue
        });
        setEditingField(null);
        setEditValue('');
      } else {
        alert('Failed to update company information');
      }
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Failed to update company information');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/';
  };

  const updateRequestStatus = async (requestId: string, newStatus: PartnerRequest['status']) => {
    try {
      const db = getFirestore(app);
      await updateDoc(doc(db, 'partnerRequests', requestId), {
        status: newStatus
      });
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateOutreachStatus = async (requestId: string, newStatus: CompanyOutreachRequest['status']) => {
    try {
      const db = getFirestore(app);
      await updateDoc(doc(db, 'companyOutreachRequests', requestId), {
        status: newStatus
      });
      
      setOutreachRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      console.error('Error updating outreach status:', error);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, 'partnerRequests', requestId));
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const deleteOutreachRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this outreach request?')) return;
    
    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, 'companyOutreachRequests', requestId));
      setOutreachRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error deleting outreach request:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredOutreachRequests = outreachRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.searchQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'contacted': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'contacted': return <Mail className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-black border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Manage requests and analytics</p>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === 'analytics' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
                <span className="ml-auto text-sm bg-gray-800 text-white px-2 py-1 rounded">{companies.length}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('partner')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === 'partner' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Handshake className="w-5 h-5" />
                <span>Partner Requests</span>
                <span className="ml-auto text-sm bg-gray-800 text-white px-2 py-1 rounded">{requests.length}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('outreach')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === 'outreach' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>Company Outreach</span>
                <span className="ml-auto text-sm bg-gray-800 text-white px-2 py-1 rounded">{outreachRequests.length}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === 'settings' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === 'logs' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Terminal className="w-5 h-5" />
                <span>Debug Logs</span>
              </button>
              
              <button
                onClick={() => setShowAddCompanyPopup(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left text-white hover:bg-gray-900 hover:text-white"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Company</span>
              </button>
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'logs' ? (
              <div className="space-y-6">
                <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">System Debug Logs</h3>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                        Clear Logs
                      </Button>
                      <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                        Export Logs
                      </Button>
                    </div>
                  </div>
                  
                  {/* Log Filters */}
                  <div className="flex gap-4 mb-4">
                    <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm">
                      <option>All Types</option>
                      <option>API Requests</option>
                      <option>Database</option>
                      <option>AI Service</option>
                      <option>Authentication</option>
                      <option>Errors</option>
                    </select>
                    <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm">
                      <option>Last Hour</option>
                      <option>Last 24 Hours</option>
                      <option>Last Week</option>
                    </select>
                  </div>
                  
                  {/* Logs Display */}
                  <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                    <div className="space-y-2">
                      {logs.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                          {wsConnected ? 'Waiting for logs...' : 'Connecting to log stream...'}
                        </div>
                      ) : (
                        logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3">
                            <span className="text-gray-500 text-xs">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              log.type === 'API' ? 'bg-blue-600 text-white' :
                              log.type === 'DB' ? 'bg-purple-600 text-white' :
                              log.type === 'AUTH' ? 'bg-green-600 text-white' :
                              log.type === 'AI' ? 'bg-orange-600 text-white' :
                              log.type === 'ERROR' ? 'bg-red-600 text-white' :
                              'bg-yellow-600 text-white'
                            }`}>
                              {log.type}
                            </span>
                            <span className={`${
                              log.type === 'ERROR' ? 'text-red-400' :
                              log.type === 'API' ? 'text-green-400' :
                              log.type === 'DB' ? 'text-blue-400' :
                              log.type === 'AUTH' ? 'text-yellow-400' :
                              log.type === 'AI' ? 'text-cyan-400' :
                              'text-orange-400'
                            }`}>
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Live Status */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className={`text-sm ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {wsConnected ? 'Live monitoring active' : 'Disconnected'}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">Last updated: 2 seconds ago</span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'settings' ? (
              <div className="space-y-6">
                <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">System Settings</h3>
                  
                  {/* API Configuration */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">API Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
                          <Input className="bg-gray-800 border-gray-600 text-white" placeholder="Enter API key..." type="password" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Exa API Key</label>
                          <Input className="bg-gray-800 border-gray-600 text-white" placeholder="Enter API key..." type="password" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Firecrawl API Key</label>
                          <Input className="bg-gray-800 border-gray-600 text-white" placeholder="Enter API key..." type="password" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">AI Service URL</label>
                          <Input className="bg-gray-800 border-gray-600 text-white" placeholder="http://localhost:5002" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Search Settings */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Search Configuration</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Enable Web Search by Default</span>
                          <input type="checkbox" className="w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Enable RAG Search</span>
                          <input type="checkbox" className="w-4 h-4" defaultChecked />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Default AI Model</label>
                          <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white">
                            <option>GPT-4o Mini</option>
                            <option>Gemini 2.0 Flash</option>
                            <option>Qwen2.5</option>
                            <option>Llama 3.1</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Database Settings */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Database Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Firebase Project ID</label>
                          <Input className="bg-gray-800 border-gray-600 text-white" placeholder="firequest-auth" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Auto-backup Analytics Data</span>
                          <input type="checkbox" className="w-4 h-4" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    {/* Notification Settings */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Email Notifications for New Requests</span>
                          <input type="checkbox" className="w-4 h-4" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Daily Analytics Reports</span>
                          <input type="checkbox" className="w-4 h-4" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                          <Input className="bg-gray-800 border-gray-600 text-white" placeholder="admin@quantize.site" />
                        </div>
                      </div>
                    </div>
                    
                    {/* System Maintenance */}
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">System Maintenance</h4>
                      <div className="space-y-4">
                        <Button className="bg-white text-black hover:bg-gray-200">
                          Clear Analytics Cache
                        </Button>
                        <Button className="bg-white text-black hover:bg-gray-200">
                          Rebuild Search Index
                        </Button>
                        <Button className="bg-white text-black hover:bg-gray-200">
                          Export All Data
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button className="bg-white text-black hover:bg-gray-200">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              <div className="space-y-6">
                {/* Company Selector */}
                <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Company Analytics</h3>
                  <div className="flex gap-4 items-center">
                    <select
                      onChange={(e) => handleCompanySelect(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      disabled={analyticsLoading}
                    >
                      <option value="">Select a company...</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.companyName || company.name || 'Unknown Company'}
                        </option>
                      ))}
                    </select>
                    {analyticsLoading && (
                      <div className="text-gray-400">Loading...</div>
                    )}
                  </div>
                </div>

                {/* Selected Company Analytics */}
                {selectedCompany && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Analytics Charts */}
                    <div className="lg:col-span-1">
                      <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6">
                        <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Analytics Metrics
                        </h4>
                        <div className="space-y-6">
                          {/* Views Chart */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-green-400" />
                                <span className="text-white font-medium">Views</span>
                              </div>
                              <span className="text-2xl font-bold text-white">
                                {selectedCompany.views || 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                                style={{width: `${Math.min((selectedCompany.views || 0) / 100 * 100, 100)}%`}}
                              ></div>
                            </div>
                          </div>

                          {/* Clicks Chart */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MousePointer className="w-4 h-4 text-blue-400" />
                                <span className="text-white font-medium">Clicks</span>
                              </div>
                              <span className="text-2xl font-bold text-white">
                                {selectedCompany.clicks || 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-400 h-2 rounded-full transition-all duration-500" 
                                style={{width: `${Math.min((selectedCompany.clicks || 0) / 50 * 100, 100)}%`}}
                              ></div>
                            </div>
                          </div>

                          {/* Favourites Chart */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-400" />
                                <span className="text-white font-medium">Favourites</span>
                              </div>
                              <span className="text-2xl font-bold text-white">
                                {selectedCompany.favourites || 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-red-400 h-2 rounded-full transition-all duration-500" 
                                style={{width: `${Math.min((selectedCompany.favourites || 0) / 25 * 100, 100)}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="lg:col-span-2">
                      <div className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6 max-h-[600px] overflow-y-auto">
                        <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Company Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-2">
                          {/* Editable Fields */}
                          {[
                            { key: 'companyName', label: 'Company Name', icon: Building2 },
                            { key: 'category', label: 'Category', icon: null },
                            { key: 'description', label: 'Description', icon: null, multiline: true },
                            { key: 'website', label: 'Website', icon: Globe },
                            { key: 'tagline', label: 'Tagline', icon: null },
                            { key: 'uspTagline', label: 'USP Tagline', icon: null },
                            { key: 'headquarters', label: 'Headquarters', icon: MapPin },
                            { key: 'employees', label: 'Employees', icon: Users },
                            { key: 'founded', label: 'Founded', icon: Calendar },
                            { key: 'companyStage', label: 'Company Stage', icon: TrendingUp },
                            { key: 'linkedinPage', label: 'LinkedIn', icon: null },
                            { key: 'phoneNumber', label: 'Phone', icon: Phone }
                          ].map(({ key, label, icon: Icon, multiline }) => (
                            <div key={key} className={multiline ? 'md:col-span-2' : ''}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                                </div>
                                {editingField !== key && (
                                  <button
                                    onClick={() => startEditing(key, selectedCompany[key] as string)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              {editingField === key ? (
                                <div className="flex gap-2">
                                  {multiline ? (
                                    <textarea
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="flex-1 bg-gray-800 border border-gray-600 text-white p-2 rounded resize-none"
                                      rows={3}
                                      placeholder={`Enter ${label.toLowerCase()}...`}
                                    />
                                  ) : (
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="flex-1 bg-gray-800 border-gray-600 text-white"
                                      placeholder={`Enter ${label.toLowerCase()}...`}
                                    />
                                  )}
                                  <Button
                                    onClick={saveEdit}
                                    size="sm"
                                    className="bg-white text-black hover:bg-gray-200"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={cancelEditing}
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600 text-gray-300"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-white bg-gray-800 p-2 rounded min-h-[40px] flex items-center">
                                  {selectedCompany[key] || 'Not specified'}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Array Fields */}
                          {[
                            { key: 'industriesServed', label: 'Industries Served' },
                            { key: 'customerSegments', label: 'Customer Segments' },
                            { key: 'deploymentType', label: 'Deployment Type' },
                            { key: 'pricingModel', label: 'Pricing Model' },
                            { key: 'pricingRanges', label: 'Pricing Ranges' },
                            { key: 'products', label: 'Products' },
                            { key: 'topClients', label: 'Top Clients' }
                          ].map(({ key, label }) => (
                            selectedCompany[key] && Array.isArray(selectedCompany[key]) && (
                              <div key={key} className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {(selectedCompany[key] as string[]).map((item, i) => (
                                    <span key={i} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                          
                          {/* Boolean Fields */}
                          {selectedCompany.trialAvailable && (
                            <div className="md:col-span-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-300 font-medium">Free Trial Available</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedCompany && !analyticsLoading && (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Company</h3>
                    <p className="text-gray-400">
                      Choose a company from the dropdown above to view its analytics and information.
                    </p>
                  </div>
                )}
              </div>
            ) : activeTab === 'partner' ? (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, company, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6 hover:bg-black/80 transition-colors"
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {request.timestamp?.toDate?.()?.toLocaleDateString() || 'No date'}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{request.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{request.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{request.userPhone}</span>
                        </div>
                      </div>

                      {/* Company Info */}
                      <div className="border-t border-gray-700 pt-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">{request.companyName}</span>
                        </div>
                        {request.companyEmail && (
                          <div className="text-xs text-gray-400 mb-1">
                            Email: {request.companyEmail}
                          </div>
                        )}
                        {request.companyWebsite && (
                          <div className="flex items-center gap-1 mb-1">
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                            <a
                              href={request.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {request.searchQuery && (
                          <div className="text-xs text-gray-400">
                            Search: "{request.searchQuery}"
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => updateRequestStatus(request.id, 'contacted')}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs"
                          disabled={request.status === 'contacted'}
                        >
                          Mark Contacted
                        </Button>
                        <Button
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs"
                          disabled={request.status === 'completed'}
                        >
                          Complete
                        </Button>
                        <Button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => deleteRequest(request.id)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-400 hover:bg-red-500/20 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No partner requests found</h3>
                    <p className="text-gray-400">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Partner requests will appear here when submitted'
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, company, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredOutreachRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6 hover:bg-black/80 transition-colors"
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {request.timestamp?.toDate?.()?.toLocaleDateString() || 'No date'}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{request.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{request.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{request.userPhone}</span>
                        </div>
                      </div>

                      {/* Search Query */}
                      <div className="border-t border-gray-700 pt-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Search className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">Search Query</span>
                        </div>
                        <div className="text-sm text-gray-300 mb-2">"{request.searchQuery}"</div>
                        <div className="text-xs text-gray-400">
                          {request.companiesCount} companies in results
                        </div>
                      </div>

                      {/* Companies List */}
                      <div className="border-t border-gray-700 pt-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-green-400" />
                          <span className="text-white font-medium">Companies ({request.companies.length})</span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {request.companies.slice(0, 5).map((company, idx) => (
                            <div key={idx} className="bg-gray-800 rounded p-2">
                              <div className="text-sm text-white font-medium">{company.name}</div>
                              {company.potentialEmail && (
                                <div className="text-xs text-gray-400">Email: {company.potentialEmail}</div>
                              )}
                              <div className="flex gap-2 mt-1">
                                {company.website && (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                                  >
                                    <Globe className="w-3 h-3" />
                                    Website
                                  </a>
                                )}
                                {company.linkedIn && (
                                  <a
                                    href={company.linkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:underline"
                                  >
                                    LinkedIn
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                          {request.companies.length > 5 && (
                            <div className="text-xs text-gray-400 text-center py-1">
                              +{request.companies.length - 5} more companies
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => updateOutreachStatus(request.id, 'contacted')}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs"
                          disabled={request.status === 'contacted'}
                        >
                          Mark Contacted
                        </Button>
                        <Button
                          onClick={() => updateOutreachStatus(request.id, 'completed')}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs"
                          disabled={request.status === 'completed'}
                        >
                          Complete
                        </Button>
                        <Button
                          onClick={() => updateOutreachStatus(request.id, 'rejected')}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => deleteOutreachRequest(request.id)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-400 hover:bg-red-500/20 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredOutreachRequests.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No outreach requests found</h3>
                    <p className="text-gray-400">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Company outreach requests will appear here when submitted'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Company Popup */}
      {showAddCompanyPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90vw] h-[90vh] relative">
            <button
              onClick={() => setShowAddCompanyPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src="https://quantize.site/add-company"
              className="w-full h-full border-0 rounded-lg"
              title="Add New Company"
            />
          </div>
        </div>
      )}
    </div>
  );
}
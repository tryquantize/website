import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Search, 
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
  UserCheck
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
import { companyLeadsService, type CompanyLead } from '@/services/company-leads';

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

interface CompanyLead {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  searchQuery: string;
  submittedAt: any;
  status: 'new' | 'contacted' | 'closed';
  searchContext?: any;
}

export function CompanyDashboard() {
  const [match, params] = useRoute('/admindashboard/:companyId');
  const companyId = params?.companyId;
  
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [leads, setLeads] = useState<CompanyLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'partner' | 'leads'>('analytics');
  
  // Analytics state
  const [companyData, setCompanyData] = useState<CompanyAnalytics | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    
    loadCompanyData();
    loadRequests();
    loadLeads();
  }, [companyId]);

  // Check company authentication
  useEffect(() => {
    const companyAuth = localStorage.getItem(`companyAuth_${companyId}`);
    if (!companyAuth) {
      window.location.href = `/company-login/${companyId}`;
      return;
    }
  }, [companyId]);

  const loadCompanyData = async () => {
    if (!companyId) return;
    
    setAnalyticsLoading(true);
    try {
      const company = await analyticsService.getCompany(companyId);
      setCompanyData(company);
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!companyId) return;
    
    try {
      const db = getFirestore(app);
      
      // Load partner requests for this company
      const partnerQuery = query(
        collection(db, 'partnerRequests'), 
        where('companyName', '==', companyId),
        orderBy('timestamp', 'desc')
      );
      const partnerSnapshot = await getDocs(partnerQuery);
      const partnerData = partnerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PartnerRequest[];
      setRequests(partnerData);
      
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    if (!companyId) return;
    
    try {
      const leadsData = await companyLeadsService.getCompanyLeads(companyId);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`companyAuth_${companyId}`);
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

  const updateLeadStatus = async (leadId: string, newStatus: CompanyLead['status']) => {
    if (!companyId) return;
    
    try {
      await companyLeadsService.updateLeadStatus(companyId, leadId, newStatus);
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
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
    if (!companyData || !editingField) return;

    try {
      const updateData = { [editingField]: editValue };
      const success = await analyticsService.updateCompany(companyData.id, updateData);
      
      if (success) {
        setCompanyData({
          ...companyData,
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

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.searchQuery.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new': return 'bg-yellow-500/20 text-yellow-300';
      case 'contacted': return 'bg-blue-500/20 text-blue-300';
      case 'completed':
      case 'closed': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new': return <Clock className="w-4 h-4" />;
      case 'contacted': return <Mail className="w-4 h-4" />;
      case 'completed':
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
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
            <h1 className="text-2xl font-bold text-white mb-2">
              {companyData?.companyName || companyId} Dashboard
            </h1>
            <p className="text-gray-300">Company analytics and leads</p>
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
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === 'leads' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:bg-gray-900 hover:text-white'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span>New Leads</span>
                <span className="ml-auto text-sm bg-gray-800 text-white px-2 py-1 rounded">{leads.length}</span>
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
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'analytics' && companyData && (
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
                            {companyData.views || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                            style={{width: `${Math.min((companyData.views || 0) / 100 * 100, 100)}%`}}
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
                            {companyData.clicks || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full transition-all duration-500" 
                            style={{width: `${Math.min((companyData.clicks || 0) / 50 * 100, 100)}%`}}
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
                            {companyData.favourites || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full transition-all duration-500" 
                            style={{width: `${Math.min((companyData.favourites || 0) / 25 * 100, 100)}%`}}
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
                        { key: 'headquarters', label: 'Headquarters', icon: MapPin },
                        { key: 'employees', label: 'Employees', icon: Users },
                        { key: 'founded', label: 'Founded', icon: Calendar }
                      ].map(({ key, label, icon: Icon, multiline }) => (
                        <div key={key} className={multiline ? 'md:col-span-2' : ''}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                              <span className="text-gray-300 text-sm font-medium">{label}</span>
                            </div>
                            {editingField !== key && (
                              <button
                                onClick={() => startEditing(key, companyData[key] as string)}
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
                              {companyData[key] || 'Not specified'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'partner' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
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
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <Handshake className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No partner requests found</h3>
                    <p className="text-gray-400">
                      Partner requests for your company will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or search query..."
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
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-black/60 backdrop-blur-sm border border-gray-600 rounded-none p-6 hover:bg-black/80 transition-colors"
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(lead.status)}`}>
                          {getStatusIcon(lead.status)}
                          <span className="capitalize">{lead.status}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {lead.submittedAt?.toDate?.()?.toLocaleDateString() || 'No date'}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{lead.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{lead.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{lead.userPhone}</span>
                        </div>
                      </div>

                      {/* Search Context */}
                      <div className="border-t border-gray-700 pt-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Search className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">Search Query</span>
                        </div>
                        <div className="text-sm text-gray-300">"{lead.searchQuery}"</div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => updateLeadStatus(lead.id, 'contacted')}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs"
                          disabled={lead.status === 'contacted'}
                        >
                          Mark Contacted
                        </Button>
                        <Button
                          onClick={() => updateLeadStatus(lead.id, 'closed')}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200 text-xs"
                          disabled={lead.status === 'closed'}
                        >
                          Close Lead
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
                    <p className="text-gray-400">
                      New leads from user submissions will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
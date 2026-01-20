import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Phone, Mail, Building, Globe, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Company {
  id: string;
  companyName: string;
  website: string;
  linkedinPage?: string;
  pitchDeckUrl?: string;
  email: string;
  phoneNumber: string;
  description: string;
  category: string;
  headquarters: string;
  founded: string;
  employees: string;
  ecellPreferredDates: string[];
  founders: Array<{ name: string; phone: string; email: string }>;
  painPoint: string;
  createdAt: any;
  products?: string[];
  companyStage?: string;
  tagline?: string;
  uspTagline?: string;
  customerSegments?: string[];
  deploymentType?: string[];
  idealScenarios?: string[];
  industriesServed?: string[];
  pricingModel?: string[];
  pricingRanges?: string[];
  trialAvailable?: boolean;
  topClients?: string[];
  testimonialPage?: string;
  features?: string;
  useCases?: string;
}

export default function EsummitRegistrationPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [dateStats, setDateStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchEcellCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
    calculateDateStats();
  }, [companies, selectedDate]);

  const fetchEcellCompanies = async () => {
    try {
      console.log('Fetching E-Cell companies...');
      // Use CompanyService to get all companies and filter
      const { CompanyService } = await import('@/services/company-service');
      const allCompanies = await CompanyService.getAllCompanies();
      
      // Filter for companies with ecellEventInterested = true
      const ecellCompanies = allCompanies.filter(company => 
        company.ecellEventInterested === true
      );
      
      console.log('All companies:', allCompanies.length);
      console.log('E-Cell interested companies:', ecellCompanies);
      setCompanies(ecellCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    if (selectedDate === 'all') {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(
        companies.filter(company => 
          company.ecellPreferredDates?.includes(selectedDate)
        )
      );
    }
  };

  const calculateDateStats = () => {
    const stats: Record<string, number> = {};
    const dates = ['30th Jan (Friday)', '31st Jan (Saturday)', '1st Feb (Sunday)'];
    
    dates.forEach(date => {
      stats[date] = companies.filter(company => 
        company.ecellPreferredDates?.includes(date)
      ).length;
    });
    
    setDateStats(stats);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">E-Summit '26 Registrations</h1>
          <p className="text-white/60">Companies interested in the Founder's Meet & Greet</p>
        </div>

        {/* Stats & Filter */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Statistics */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Preferences
            </h3>
            <div className="space-y-3">
              {Object.entries(dateStats).map(([date, count]) => (
                <div key={date} className="flex justify-between items-center">
                  <span className="text-white/80">{date}</span>
                  <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    {count} companies
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter by Date
            </h3>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="bg-black border-white/20 text-white">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20 text-white">
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="30th Jan (Friday)">30th Jan (Friday)</SelectItem>
                <SelectItem value="31st Jan (Saturday)">31st Jan (Saturday)</SelectItem>
                <SelectItem value="1st Feb (Sunday)">1st Feb (Sunday)</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 text-sm text-white/60">
              Showing {filteredCompanies.length} of {companies.length} companies
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              {/* Company Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{company.companyName}</h3>
                <p className="text-white/60 text-sm">{company.description}</p>
              </div>

              {/* Basic Company Info */}
              <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Company Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-white/40" />
                    <span className="text-white/80">{company.category || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <span className="text-white/80">{company.headquarters || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/40" />
                    <span className="text-white/80">{company.employees || 'N/A'} employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span className="text-white/80">Founded {company.founded || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-white/40" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                  >
                    {company.website}
                  </a>
                </div>
                {company.pitchDeckUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-white/40" />
                    <a 
                      href={company.pitchDeckUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors truncate"
                    >
                      Pitch Deck
                    </a>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Contact Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-white/40" />
                    <span className="text-white/80 truncate">{company.email || 'N/A'}</span>
                  </div>
                  {company.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-white/40" />
                      <span className="text-white/80">{company.phoneNumber}</span>
                    </div>
                  )}
                  {company.linkedinPage && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-white/40" />
                      <a 
                        href={company.linkedinPage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Products & Services */}
              {company.products && company.products.length > 0 && (
                <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                  <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Products & Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.products.map((product, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Business Info</h4>
                <div className="space-y-2 text-sm">
                  {company.companyStage && (
                    <div><span className="text-white/60">Stage:</span> <span className="text-white/80">{company.companyStage}</span></div>
                  )}
                  {company.tagline && (
                    <div><span className="text-white/60">Tagline:</span> <span className="text-white/80">{company.tagline}</span></div>
                  )}
                  {company.uspTagline && (
                    <div><span className="text-white/60">USP:</span> <span className="text-white/80">{company.uspTagline}</span></div>
                  )}
                  {company.customerSegments && company.customerSegments.length > 0 && (
                    <div>
                      <span className="text-white/60">Customer Segments:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.customerSegments.map((segment, idx) => (
                          <span key={idx} className="bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded text-xs">
                            {segment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.deploymentType && company.deploymentType.length > 0 && (
                    <div>
                      <span className="text-white/60">Deployment:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.deploymentType.map((type, idx) => (
                          <span key={idx} className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.idealScenarios && company.idealScenarios.length > 0 && (
                    <div>
                      <span className="text-white/60">Ideal For:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.idealScenarios.map((scenario, idx) => (
                          <span key={idx} className="bg-pink-600/20 text-pink-300 px-2 py-1 rounded text-xs">
                            {scenario}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.industriesServed && company.industriesServed.length > 0 && (
                    <div>
                      <span className="text-white/60">Industries:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.industriesServed.map((industry, idx) => (
                          <span key={idx} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.pricingModel && company.pricingModel.length > 0 && (
                    <div>
                      <span className="text-white/60">Pricing Model:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.pricingModel.map((model, idx) => (
                          <span key={idx} className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-xs">
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.pricingRanges && company.pricingRanges.length > 0 && (
                    <div>
                      <span className="text-white/60">Pricing Range:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.pricingRanges.map((range, idx) => (
                          <span key={idx} className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs">
                            {range}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.trialAvailable && (
                    <div><span className="text-white/60">Trial:</span> <span className="text-green-300">Available</span></div>
                  )}
                  {company.topClients && company.topClients.length > 0 && (
                    <div>
                      <span className="text-white/60">Top Clients:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.topClients.map((client, idx) => (
                          <span key={idx} className="bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded text-xs">
                            {client}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.testimonialPage && (
                    <div>
                      <span className="text-white/60">Testimonials:</span>
                      <a 
                        href={company.testimonialPage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                      >
                        View Testimonials
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Features & Use Cases */}
              {(company.features || company.useCases) && (
                <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                  <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Features & Use Cases</h4>
                  <div className="space-y-2 text-sm">
                    {company.features && (
                      <div>
                        <span className="text-white/60">Features:</span>
                        <p className="text-white/80 mt-1">{company.features}</p>
                      </div>
                    )}
                    {company.useCases && (
                      <div>
                        <span className="text-white/60">Use Cases:</span>
                        <p className="text-white/80 mt-1">{company.useCases}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pain Point */}
              {company.painPoint && (
                <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                  <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Current Pain Point</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{company.painPoint}</p>
                </div>
              )}

              {/* Founders */}
              {company.founders && company.founders.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 text-white/80">Founders:</h4>
                  <div className="space-y-2">
                    {company.founders.map((founder, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-lg">
                        <div className="text-sm font-medium text-white">{founder.name}</div>
                        <div className="text-xs text-white/60 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {founder.email}
                          </div>
                          {founder.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {founder.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Dates */}
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-medium mb-2 text-green-300">Preferred Dates:</h4>
                <div className="flex flex-wrap gap-2">
                  {company.ecellPreferredDates?.map((date, idx) => (
                    <span 
                      key={idx}
                      className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg">No companies found for the selected criteria</div>
          </div>
        )}
      </div>
    </div>
  );
}
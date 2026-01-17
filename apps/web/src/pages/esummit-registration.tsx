import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Phone, Mail, Building, Globe, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Company {
  id: string;
  companyName: string;
  website: string;
  email: string;
  phoneNumber: string;
  description: string;
  category: string;
  headquarters: string;
  founded: string;
  employees: string;
  ecellPreferredDates: string[];
  founders: Array<{ name: string; phone: string; email: string }>;
  createdAt: any;
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
      // Fetch all companies and filter for ecellEventInterested = true
      const response = await fetch('https://website-ocrz.onrender.com/firebase-test');
      if (response.ok) {
        const data = await response.json();
        console.log('Firebase test response:', data);
        
        // For now, fetch from main companies collection and filter
        const companiesResponse = await fetch('https://website-ocrz.onrender.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '', webSearchEnabled: false })
        });
        
        if (companiesResponse.ok) {
          const searchData = await companiesResponse.json();
          // Filter companies where ecellEventInterested is true
          const ecellCompanies = searchData.companies?.filter(company => 
            company.ecellEventInterested === true
          ) || [];
          console.log('E-Cell interested companies:', ecellCompanies);
          setCompanies(ecellCompanies);
        } else {
          setCompanies([]);
        }
      } else {
        console.error('Failed to fetch companies');
        setCompanies([]);
      }
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
                <p className="text-white/60 text-sm line-clamp-2">{company.description}</p>
              </div>

              {/* Company Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-white/40" />
                  <span className="text-white/80">{company.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span className="text-white/80">{company.headquarters}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-white/40" />
                  <span className="text-white/80">{company.employees} employees</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-white/40" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {company.website}
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-white/40" />
                    <span className="text-white/80">{company.email}</span>
                  </div>
                  {company.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-white/40" />
                      <span className="text-white/80">{company.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Founders */}
              {company.founders && company.founders.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 text-white/80">Founders:</h4>
                  <div className="space-y-1">
                    {company.founders.map((founder, idx) => (
                      <div key={idx} className="text-sm text-white/60">
                        {founder.name} • {founder.email}
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
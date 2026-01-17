import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { app } from '@/lib/firebase-init';

export interface CompanyLead {
  id?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  searchQuery: string;
  submittedAt: any;
  status: 'new' | 'contacted' | 'closed';
  searchContext?: {
    resultsCount: number;
    searchType: string;
    timestamp: any;
  };
}

export interface LeadSubmission {
  userName: string;
  userEmail: string;
  userPhone: string;
  searchQuery: string;
  searchResults: Array<{
    name: string;
    companyName?: string;
    id?: string;
  }>;
}

class CompanyLeadsService {
  private db = getFirestore(app);

  /**
   * Submit a new lead and distribute it to relevant companies
   */
  async submitLead(submission: LeadSubmission): Promise<void> {
    try {
      // Extract company names from search results
      const companyNames = submission.searchResults
        .map(result => result.companyName || result.name)
        .filter(Boolean);

      // Create lead data
      const leadData: Omit<CompanyLead, 'id'> = {
        userName: submission.userName,
        userEmail: submission.userEmail,
        userPhone: submission.userPhone,
        searchQuery: submission.searchQuery,
        submittedAt: serverTimestamp(),
        status: 'new',
        searchContext: {
          resultsCount: submission.searchResults.length,
          searchType: 'user_search',
          timestamp: serverTimestamp()
        }
      };

      // Distribute lead to each company that appeared in results
      const promises = companyNames.map(async (companyName) => {
        const companyId = this.normalizeCompanyId(companyName);
        
        // Add lead to company's leads subcollection
        const leadsRef = collection(this.db, 'companyLeads', companyId, 'leads');
        await addDoc(leadsRef, leadData);
        
        // Update company lead count
        await this.updateCompanyLeadCount(companyId);
      });

      await Promise.all(promises);
      
      console.log(`Lead distributed to ${companyNames.length} companies`);
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw error;
    }
  }

  /**
   * Get leads for a specific company
   */
  async getCompanyLeads(companyId: string): Promise<CompanyLead[]> {
    try {
      const leadsRef = collection(this.db, 'companyLeads', companyId, 'leads');
      const q = query(leadsRef, orderBy('submittedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CompanyLead[];
    } catch (error) {
      console.error('Error getting company leads:', error);
      return [];
    }
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(
    companyId: string, 
    leadId: string, 
    status: CompanyLead['status']
  ): Promise<void> {
    try {
      const leadRef = doc(this.db, 'companyLeads', companyId, 'leads', leadId);
      await updateDoc(leadRef, { status });
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  /**
   * Get lead statistics for a company
   */
  async getCompanyLeadStats(companyId: string): Promise<{
    total: number;
    new: number;
    contacted: number;
    closed: number;
  }> {
    try {
      const leads = await this.getCompanyLeads(companyId);
      
      return {
        total: leads.length,
        new: leads.filter(lead => lead.status === 'new').length,
        contacted: leads.filter(lead => lead.status === 'contacted').length,
        closed: leads.filter(lead => lead.status === 'closed').length
      };
    } catch (error) {
      console.error('Error getting lead stats:', error);
      return { total: 0, new: 0, contacted: 0, closed: 0 };
    }
  }

  /**
   * Check if a company should receive a lead based on search results
   */
  private shouldReceiveLead(companyName: string, searchResults: any[]): boolean {
    // Check if company appears in search results
    return searchResults.some(result => 
      (result.companyName || result.name)?.toLowerCase().includes(companyName.toLowerCase()) ||
      companyName.toLowerCase().includes((result.companyName || result.name)?.toLowerCase())
    );
  }

  /**
   * Normalize company name to use as document ID
   */
  private normalizeCompanyId(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Update company lead count in metadata
   */
  private async updateCompanyLeadCount(companyId: string): Promise<void> {
    try {
      const metadataRef = doc(this.db, 'companyLeads', companyId);
      const leads = await this.getCompanyLeads(companyId);
      
      await setDoc(metadataRef, {
        totalLeads: leads.length,
        lastUpdated: serverTimestamp(),
        companyId
      }, { merge: true });
    } catch (error) {
      console.error('Error updating lead count:', error);
    }
  }

  /**
   * Get all companies with leads
   */
  async getCompaniesWithLeads(): Promise<Array<{
    companyId: string;
    totalLeads: number;
    lastUpdated: any;
  }>> {
    try {
      const metadataRef = collection(this.db, 'companyLeads');
      const snapshot = await getDocs(metadataRef);
      
      return snapshot.docs
        .map(doc => ({
          companyId: doc.id,
          ...doc.data()
        }))
        .filter(company => company.totalLeads > 0) as Array<{
          companyId: string;
          totalLeads: number;
          lastUpdated: any;
        }>;
    } catch (error) {
      console.error('Error getting companies with leads:', error);
      return [];
    }
  }
}

export const companyLeadsService = new CompanyLeadsService();
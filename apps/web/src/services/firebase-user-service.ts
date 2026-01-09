import { app } from '../lib/firebase-init';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  profileType: 'Freelancer / Individual Creator' | 'Startup' | 'Company / Enterprise' | 'Agency' | 'Other';
  companyName?: string;
  companyWebsite?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingSubmission {
  id?: string;
  userId: string;
  userEmail: string;

  // Basic Information
  profileType?: string;
  listType?: string;
  companyName?: string;
  fullName?: string;
  contactEmail: string;
  websiteUrl: string;
  socialLink?: string;

  // Product Details
  productName: string;
  tagline: string;
  description: string;
  features: string[];
  primaryUseCases?: string[];
  industriesServed?: string;
  targetAudience?: string;

  // Pricing & Access
  pricingModels?: string[];
  priceTiers?: string;
  freeTrial?: 'Yes' | 'No';
  freeTrialDuration?: string;
  demoAvailable?: 'Yes' | 'No';
  demoLink?: string;

  // Media & Links
  demoVideo?: string;
  caseStudies?: string;

  // Additional Information
  usp?: string;
  launchDate?: string;
  achievements?: string;
  aiTechUsed?: string;
  roadmap?: string;

  // Status
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseUserService {
  // User Profile Management
  static async createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserProfile(uid: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          success: true,
          profile: {
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as UserProfile
        };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Onboarding Submissions
  static async submitOnboarding(submission: Omit<OnboardingSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const submissionData = {
        ...submission,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'onboarding_submissions'), submissionData);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error submitting onboarding:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserSubmissions(userId: string): Promise<{ success: boolean; submissions?: OnboardingSubmission[]; error?: string }> {
    try {
      const q = query(collection(db, 'onboarding_submissions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const submissions: OnboardingSubmission[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as OnboardingSubmission);
      });

      return { success: true, submissions };
    } catch (error: any) {
      console.error('Error getting user submissions:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateSubmissionStatus(submissionId: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    try {
      const submissionRef = doc(db, 'onboarding_submissions', submissionId);
      await updateDoc(submissionRef, {
        status,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating submission status:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteSubmission(submissionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'onboarding_submissions', submissionId));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin functions
  static async getAllSubmissions(): Promise<{ success: boolean; submissions?: OnboardingSubmission[]; error?: string }> {
    try {
      const querySnapshot = await getDocs(collection(db, 'onboarding_submissions'));

      const submissions: OnboardingSubmission[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        submissions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as OnboardingSubmission);
      });

      return { success: true, submissions };
    } catch (error: any) {
      console.error('Error getting all submissions:', error);
      return { success: false, error: error.message };
    }
  }
}
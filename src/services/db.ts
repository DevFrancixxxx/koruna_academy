import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { UserRole } from './auth';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  moduleId?: string;
  moduleTitle?: string;
  duration?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
  moduleTitle?: string;
}

export interface CourseAssignment {
  userId: string;
  applicationId: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  rating: number;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  imgBg: string;
  lessons: Lesson[];
  quiz?: QuizQuestion[];
  isAssigned?: boolean;
  assignedUsers?: CourseAssignment[];
  attachments?: { name: string; url: string; size: number }[];
  trainer?: string;
  requirements?: string[];
}

export interface UserProgress {
  userEmail: string;
  courseId: string;
  applicationId?: number; // 4-digit random number
  progressPercent: number;
  completedLessons: string[]; // Lesson IDs
  quizScore?: number; // Highest quiz score percent
  quizAttempts: number;
  practicalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  practicalNotes?: string;
  overdue: boolean;
  dueDate?: string; // Target completion date
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji representation
  color: string;
  dateEarned?: string;
}

export interface PracticalSubmission {
  id: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  submissionText: string;
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
}

export interface Notification {
  id: string;
  userEmail: string;
  courseId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  assignedBy?: string;
}


export interface Department {
  id: string;
  name: string;
}

export interface SystemSettings {
  quizPassingThreshold: number; // e.g., 70
  autoEnrollNewUsers: boolean;
  emailReminders: boolean;
  darkSidebar: boolean;
}

export interface RolePermissions {
  role: UserRole;
  permissions: {
    viewDashboard: boolean;
    studyCourses: boolean;
    viewTeamReports: boolean;
    assignCourses: boolean;
    approveAssessments: boolean;
    editCourses: boolean;
    manageUsers: boolean;
    systemSettings: boolean;
  };
}

export interface DatabaseUser {
  id: string;
  userId?: number; // 4-digit ID
  name: string;
  email: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

// ==========================================
// SEED DATA PRESETS
// ==========================================

const DEFAULT_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Mortgage Level 2: Underwriting Fundamentals',
    category: 'Mortgage',
    rating: 4.8,
    code: 'MORT-202',
    level: 'Intermediate',
    description: 'Build a practical foundation in mortgage underwriting — covering income verification, credit risk assessment, debt-to-income calculations, and compliance checkpoints used in day-to-day loan processing at Koruna. Includes real case files and a final assessment.',
    imgBg: '#fbeef4',
    trainer: 'Jefrey Tatoy',
    requirements: [
      'Complete "Mortgage Basics" course',
      'Lending Cluster employees only',
      'Score 80%+ on final assessment'
    ],
    attachments: [
      { name: 'DTI Ratio Worksheet.pdf', url: '#', size: 126976 },
      { name: 'Sample Case File.pdf', url: '#', size: 353280 },
      { name: 'Ratio Calculator Sheet.xlsx', url: '#', size: 91136 }
    ],
    lessons: [
      {
        id: 'c1-l1',
        title: '1.1 Welcome & Overview',
        content: `Welcome to Mortgage Level 2: Underwriting Fundamentals. In this module, we will cover:
1. The role of the Mortgage Underwriter in risk management.
2. The core workflow from loan origination to closing.
3. How Koruna Academy helps you stay compliant with internal and federal guidelines.
Ensure you download the resources below to follow along with the exercises.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm1',
        moduleTitle: 'Introduction to Underwriting',
        duration: '6m'
      },
      {
        id: 'c1-l2',
        title: '1.2 Key Underwriting Terms',
        content: `Understanding key terminology is essential for effective underwriting:
- PITI: Principal, Interest, Taxes, and Insurance.
- LTV: Loan-to-Value ratio (Loan amount divided by appraised value or purchase price).
- DTI: Debt-to-Income ratio (Housing expenses and recurring debts divided by gross income).
- FICO: Fair Isaac Corporation credit score, measuring creditworthiness.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm1',
        moduleTitle: 'Introduction to Underwriting',
        duration: '9m'
      },
      {
        id: 'c1-l3',
        title: '1.3 Underwriting Workflow',
        content: `An underwriter reviews the 4 C's of credit:
1. Character: Credit history and scores.
2. Capacity: Income stability and debt ratios.
3. Collateral: Property appraisal and title.
4. Capital: Liquid assets and cash reserves.
The standard workflow goes from initial file review, issuing conditions, verifying documents, to the final sign-off.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm1',
        moduleTitle: 'Introduction to Underwriting',
        duration: '25m'
      },
      {
        id: 'c1-l4',
        title: '2.1 Salaried Borrowers & W-2s',
        content: `Verifying salaried income involves reviewing recent paystubs and W-2 forms:
- Ensure paystubs cover 30 consecutive days.
- Cross-reference Year-to-Date (YTD) earnings with prior years' W-2s.
- Inspect for any non-standard deductions or garnishments that affect net income.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm2',
        moduleTitle: 'Income & Employment Verification',
        duration: '15m'
      },
      {
        id: 'c1-l5',
        title: '2.2 Self-Employed Audits (Schedule C)',
        content: `Self-employed sole proprietors require Schedule C audits:
- Calculate net income using Schedule C Net Profit (Line 31).
- Add back non-cash expenses like Depreciation (Line 13) and Amortization.
- Subtract non-recurring capital gains or add back business use of home.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm2',
        moduleTitle: 'Income & Employment Verification',
        duration: '15m'
      },
      {
        id: 'c1-l6',
        title: '2.3 Tax Returns Analysis (Form 1040)',
        content: `Analyzing personal tax returns (Form 1040) is crucial for complex income:
- Look for capital gains/losses on Schedule D.
- Audit rental income or loss on Schedule E.
- Account for unreimbursed employee business expenses (IRS Form 2106).`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm2',
        moduleTitle: 'Income & Employment Verification',
        duration: '15m'
      },
      {
        id: 'c1-l7',
        title: '2.4 Income Verification Checklist',
        content: `Use this systematic checklist when signing off on income:
1. Verbally verify employment (VOE) within 10 days of closing.
2. Confirm 4506-C tax transcripts match filed returns.
3. document explanation for any gaps in employment greater than 30 days.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm2',
        moduleTitle: 'Income & Employment Verification',
        duration: '10m'
      },
      {
        id: 'c1-l8',
        title: '3.1 Understanding DTI Ratios',
        content: `Debt-to-Income (DTI) ratio is a primary underwriting metric:
- Front-end DTI focuses entirely on housing cost (PITI) relative to gross income.
- Back-end DTI adds all other monthly revolving and installment debts.
- Standard conventional guidelines recommend ratios within 28/36, but automated underwriting systems (AUS) can approve higher ratios based on compensating factors.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm3',
        moduleTitle: 'Debt-to-Income Calculations',
        duration: '10m'
      },
      {
        id: 'c1-l9',
        title: '3.2 Front-End vs Back-End Ratios',
        content: `This lesson breaks down the difference between front-end and back-end DTI ratios, how each is calculated, and why underwriters weigh them differently when reviewing a loan application. By the end, you'll be able to calculate both ratios from a borrower's income and debt figures and flag applications that fall outside acceptable thresholds.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm3',
        moduleTitle: 'Debt-to-Income Calculations',
        duration: '12m'
      },
      {
        id: 'c1-l10',
        title: '3.3 Case Study: Borderline Applications',
        content: `Reviewing borderline applications requires evaluating compensating factors:
- High FICO scores (>740).
- Substantial cash reserves (greater than 6 months of PITI).
- Minimal increase in housing expense (the borrower's new mortgage payment is close to their current rent).`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm3',
        moduleTitle: 'Debt-to-Income Calculations',
        duration: '18m'
      },
      {
        id: 'c1-l11',
        title: '3.4 Module Quiz',
        content: `Test your understanding of DTI calculation rules and compensating factors. Review the case scenarios presented and answer the questions before moving to the compliance checkpoints.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm3',
        moduleTitle: 'Debt-to-Income Calculations',
        duration: '10m'
      },
      {
        id: 'c1-l12',
        title: '4.1 Regulatory Overview',
        content: `Mortgage underwriting is highly regulated to ensure fair lending:
- TILA: Truth in Lending Act (Regulation Z) mandates clear disclosure of APR and financing costs.
- RESPA: Real Estate Settlement Procedures Act (Regulation X) governs closing costs and escrow accounts.
- TRID: Integrates LE and CD disclosures with strict timing guidelines.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm4',
        moduleTitle: 'Compliance Checkpoints',
        duration: '14m'
      },
      {
        id: 'c1-l13',
        title: '4.2 Common Compliance Errors',
        content: `Audit compliance errors to avoid costly lender penalties:
- Failure to issue a revised Loan Estimate within 3 business days of a changed circumstance.
- Incorrect calculation of prepaid finance charges.
- Violation of the 3-day waiting period between Closing Disclosure delivery and loan consummation.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm4',
        moduleTitle: 'Compliance Checkpoints',
        duration: '11m'
      },
      {
        id: 'c1-l14',
        title: '4.3 Fair Lending Guidelines',
        content: `ECOA (Equal Credit Opportunity Act) prohibits discrimination in credit transactions. Underwriters must evaluate files solely based on creditworthiness, income, and collateral, ensuring no disparate treatment occurs based on protected classes.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm4',
        moduleTitle: 'Compliance Checkpoints',
        duration: '10m'
      },
      {
        id: 'c1-l15',
        title: '5.1 Appraisal Standards & Form 1004',
        content: `Collateral review ensures the property provides adequate security for the loan:
- Uniform Residential Appraisal Report (URAR Form 1004).
- Inspect appraisal photos, comps selection, and neighborhood characteristics.
- Audit net and gross adjustment percentages for comps.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm5',
        moduleTitle: 'Collateral & Appraisal Underwriting',
        duration: '15m'
      },
      {
        id: 'c1-l16',
        title: '5.2 Property Valuation Analysis',
        content: `Understand property condition ratings (C1-C6) and quality ratings (Q1-Q6):
- Conventional loans generally require properties to be rated C4 or better.
- Properties with a C5 or C6 rating require repairs prior to loan closing.
- Verify structural issues, water damage, or environmental hazards.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm5',
        moduleTitle: 'Collateral & Appraisal Underwriting',
        duration: '15m'
      },
      {
        id: 'c1-l17',
        title: '5.3 Title Commitments & Insurance',
        content: `Ensure a clean title transfer:
- Check for existing liens, judgments, or tax assessments.
- Review easements and encroachments that impact property value.
- Verify lender's title insurance policy matches loan amount and property legal description.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm5',
        moduleTitle: 'Collateral & Appraisal Underwriting',
        duration: '15m'
      },
      {
        id: 'c1-l18',
        title: '6.1 Red Flags in Loan Applications',
        content: `Detecting mortgage fraud is a critical underwriting responsibility:
- Inconsistent handwriting or digital signatures on tax documents.
- Paystubs with round numbers or incorrect tax withholding percentages.
- Undisclosed debts found during the final credit refresh.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm6',
        moduleTitle: 'Fraud Detection & Quality Control',
        duration: '20m'
      },
      {
        id: 'c1-l19',
        title: '6.2 Asset Verification & Gift Letters',
        content: `Verify source of funds:
- Large deposits on bank statements must be fully sourced and documented.
- Gift funds require a signed Gift Letter and proof of transfer from donor to borrower.
- Cash on hand is generally unacceptable for conventional mortgages.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm6',
        moduleTitle: 'Fraud Detection & Quality Control',
        duration: '15m'
      },
      {
        id: 'c1-l20',
        title: '6.3 Quality Control & Auditing',
        content: `Audit files post-approval to ensure quality control (QC):
- Conduct random quality checks on verified income and credit files.
- Double-check calculation sheets to confirm mathematical accuracy.
- Prepare loan files for external compliance audits.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm6',
        moduleTitle: 'Fraud Detection & Quality Control',
        duration: '15m'
      },
      {
        id: 'c1-l21',
        title: '7.1 Comprehensive Case Study Review',
        content: `Walk through a full loan case file from start to finish:
- Review the initial 1003 application form.
- Review credit reports, Schedule C, bank statements, and appraisal.
- Identify potential risk factors and draft standard conditional approval clauses.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm7',
        moduleTitle: 'Final Review & Assessment',
        duration: '20m'
      },
      {
        id: 'c1-l22',
        title: '7.2 Underwriting Best Practices',
        content: `Professional underwriting tips for efficiency and safety:
- Maintain detailed, clear underwriting narrative sheets explaining decisions.
- Build collaborative relationships with loan processors and officers while maintaining risk boundaries.
- Keep up-to-date with agency guideline updates (Fannie Mae, Freddie Mac).`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm7',
        moduleTitle: 'Final Review & Assessment',
        duration: '15m'
      },
      {
        id: 'c1-l23',
        title: '7.3 Final Exam Prep',
        content: `Prepare for the final course evaluation:
- Review key concepts of income calculations (Schedule C, corporate returns).
- Review compliance rules (TRID timelines, ECOA basics).
- Go over the final study guide files included in your attachments.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm7',
        moduleTitle: 'Final Review & Assessment',
        duration: '25m'
      },
      {
        id: 'c1-l24',
        title: '7.4 Course Wrap-up & Graduation',
        content: `Congratulations on completing all 24 lessons! In this wrap-up session, we discuss next steps, certificate generation, and how to apply these underwriting criteria in your daily operations at Koruna.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        moduleId: 'm7',
        moduleTitle: 'Final Review & Assessment',
        duration: '10m'
      }
    ],
    quiz: [
      {
        question: 'What is the primary objective of mortgage underwriting?',
        options: [
          'To maximize the lender\'s promotional interest rates.',
          'To evaluate and minimize the risk of a borrower defaulting on the loan.',
          'To guarantee that every applicant receives an immediate loan approval.',
          'To coordinate property appraisals and real estate marketing.'
        ],
        correctAnswer: 1
      },
      {
        question: 'How is a borrower\'s back-end Debt-to-Income (DTI) ratio calculated?',
        options: [
          'Net monthly income divided by total family assets.',
          'Monthly housing expense (PITI) plus total recurring monthly debt payments divided by gross monthly income.',
          'Annual credit card balances divided by gross annual salary.',
          'Total assets divided by the proposed mortgage purchase price.'
        ],
        correctAnswer: 1
      },
      {
        question: 'Under conventional guidelines, what tax form is audited to evaluate self-employed Sole Proprietor income?',
        options: [
          'IRS Form 1040, Schedule C',
          'IRS Form W-2',
          'IRS Form 1099-DIV',
          'IRS Form 1120-S, Schedule K-1'
        ],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 'c2',
    title: 'Regulatory Compliance for Loan Officers',
    category: 'Lending',
    rating: 4.7,
    code: 'REG-101',
    level: 'Intermediate',
    description: 'Master federal financial regulations including TILA, RESPA, TRID rules, Fair Lending, ECOA, and the Bank Secrecy Act to protect clients and ensure audits are clean.',
    imgBg: '#dcfce7',
    lessons: [
      {
        id: 'c2-l1',
        title: 'TILA and RESPA Integrated Disclosures (TRID)',
        content: `TRID, often called "Know Before You Owe," combines disclosure requirements under TILA and RESPA:
1. Loan Estimate (LE): Must be delivered or mailed to the consumer within 3 business days after receiving their application. It estimates loan terms, monthly payments, and closing costs.
2. Closing Disclosure (CD): Must be received by the consumer at least 3 business days before consummation (loan signing). If certain terms change (APR increases by >0.125%, loan product changes, or a prepayment penalty is added), a new CD must be issued, triggering a new 3-business-day waiting period.`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
      },
      {
        id: 'c2-l2',
        title: 'Fair Lending Laws: ECOA & HMDA',
        content: `Fair Lending mandates equal access to credit without discrimination:
- Equal Credit Opportunity Act (ECOA - Regulation B): Prohibits lenders from discriminating based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance.
- Home Mortgage Disclosure Act (HMDA - Regulation C): Requires lenders to collect and report demographic data on loan applications to identify potential discriminatory lending patterns (redlining).`,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
      }
    ],
    quiz: [
      {
        question: 'Which regulation requires the Loan Estimate to be delivered within 3 business days of application?',
        options: [
          'HMDA rules (Regulation C)',
          'Bank Secrecy Act rules',
          'TRID rules (under TILA/RESPA)',
          'FCRA rules (Regulation V)'
        ],
        correctAnswer: 2
      },
      {
        question: 'Under the Equal Credit Opportunity Act (ECOA), which of the following is a prohibited basis for credit decisions?',
        options: [
          'The applicant\'s low credit score.',
          'The applicant\'s high debt-to-income ratio.',
          'The applicant\'s marital status or receipt of public assistance income.',
          'The applicant\'s insufficient self-employed income history.'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'c3',
    title: 'Client Communication Essentials',
    category: 'Operations',
    rating: 4.6,
    code: 'COMM-105',
    level: 'Beginner',
    description: 'Learn structural techniques for active listening, managing difficult client conversations during underwriting roadblocks, and establishing positive credit relations.',
    imgBg: '#fee2e2',
    lessons: [
      {
        id: 'c3-l1',
        title: 'Active Listening & Empathy',
        content: `Active listening builds trust and decreases tension in difficult financial conversations.
1. Pay Undivided Attention: Focus on the customer\'s concerns, avoiding distractions.
2. Reflective Feedback: Paraphrase the borrower\'s concerns (e.g., "It sounds like you\'re concerned about the closing timeline because your lease ends next month").
3. Ask Clarifying Questions: Rather than guessing, ask open-ended questions about their financial files.`
      }
    ],
    quiz: [
      {
        question: 'What is a core benefit of active listening in client service?',
        options: [
          'It lets you cross-sell other financial products faster.',
          'It minimizes misunderstandings and establishes mutual trust by validating the client\'s feelings.',
          'It helps shorten call times to meet rigid company call-center quotas.',
          'It replaces the need for full written loan status notifications.'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'c4',
    title: 'AI Tools for Everyday Operations',
    category: 'AI',
    rating: 4.95,
    code: 'AI-301',
    level: 'Beginner',
    description: 'A practical guide for non-technical employees to use AI copilots, draft customer emails, summarize underwriting checklists, and organize daily reports safely.',
    imgBg: '#e0f2fe',
    lessons: [
      {
        id: 'c4-l1',
        title: 'Leveraging AI Safely in Operations',
        content: `Artificial intelligence tools can drastically speed up workflow efficiency, provided you follow data security practices:
1. NEVER input Personally Identifiable Information (PII) like SSNs, borrower names, addresses, or financial tax forms into public AI engines.
2. Always audit AI outputs. Generative models can "hallucinate" incorrect guidelines or interest rates.
3. Use prompt engineering formulas: Role + Task + Context + Format (e.g., "Act as a mortgage advisor. Summarize the following guideline changes in 3 bullet points for a loan processor").`
      }
    ],
    quiz: [
      {
        question: 'Which of the following data points is safe to input into a public AI tool?',
        options: [
          'A borrower\'s tax tax returns and Social Security Number.',
          'A general template outline for organizing loan files (excluding client names).',
          'The address of an underwriting property currently in escrow.',
          'An active customer\'s bank statement transaction history.'
        ],
        correctAnswer: 1
      }
    ]
  }
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', name: '12-Day Streak', description: 'Maintained a 12-day learning streak in the Koruna Portal.', icon: '🔥', color: '#ec4899' },
  { id: 'b2', name: 'Compliance Officer', description: 'Scored 100% on the Regulatory Compliance course quiz.', icon: '⚖️', color: '#10b981' },
  { id: 'b3', name: 'Fast Starter', description: 'Completed your first course lesson in Koruna Academy.', icon: '⚡', color: '#3b82f6' },
  { id: 'b4', name: 'Certified Specialist', description: 'Earned a formal certificate in Mortgage Underwriting.', icon: '🎓', color: '#8b5cf6' }
];

const DEFAULT_USERS: DatabaseUser[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex.rivera@koruna.com', role: 'employee', department: 'Lending', createdAt: '2026-01-10' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah.chen@koruna.com', role: 'team_leader', department: 'Operations', createdAt: '2026-01-05' },
  { id: 'u3', name: 'Dr. Marcus Vance', email: 'dr.vance@koruna.com', role: 'trainer', department: 'Content Development', createdAt: '2026-01-02' },
  { id: 'u4', name: 'Global Admin', email: 'admin.learning@koruna.com', role: 'admin', department: 'IT & Administration', createdAt: '2026-01-01' },
  { id: 'u5', name: 'Jessica Taylor', email: 'jessica.taylor@koruna.com', role: 'employee', department: 'Lending', createdAt: '2026-02-15' },
  { id: 'u6', name: 'Jordan Taylor', email: 'jordan.taylor@koruna.com', role: 'employee', department: 'Software Engineering', createdAt: '2026-03-01' }
];

const DEFAULT_PROGRESS: UserProgress[] = [
  // Alex Rivera (Employee)
  { userEmail: 'alex.rivera@koruna.com', courseId: 'c1', progressPercent: 68, completedLessons: ['c1-l1', 'c1-l2'], quizAttempts: 0, practicalStatus: 'none', overdue: false },
  { userEmail: 'alex.rivera@koruna.com', courseId: 'c2', progressPercent: 100, completedLessons: ['c2-l1', 'c2-l2'], quizScore: 94, quizAttempts: 1, practicalStatus: 'none', overdue: false },
  
  // Jessica Taylor (Employee - on Sarah's team)
  { userEmail: 'jessica.taylor@koruna.com', courseId: 'c1', progressPercent: 45, completedLessons: ['c1-l1'], quizAttempts: 0, practicalStatus: 'pending', overdue: false, practicalNotes: 'Underwriting fundamentals worksheet draft. Please review.' },
  { userEmail: 'jessica.taylor@koruna.com', courseId: 'c2', progressPercent: 0, completedLessons: [], quizAttempts: 0, practicalStatus: 'none', overdue: true, dueDate: '2026-07-25' }, // Overdue by 2 days

  // Jordan Taylor (Employee - Software Engineering)
  { userEmail: 'jordan.taylor@koruna.com', courseId: 'c1', progressPercent: 12, completedLessons: [], quizAttempts: 0, practicalStatus: 'none', overdue: false },
  { userEmail: 'jordan.taylor@koruna.com', courseId: 'c2', progressPercent: 0, completedLessons: [], quizAttempts: 0, practicalStatus: 'none', overdue: true, dueDate: '2026-07-23' } // Overdue by 4 days
];

const DEFAULT_PRACTICALS: PracticalSubmission[] = [
  {
    id: 'p1',
    userEmail: 'jessica.taylor@koruna.com',
    userName: 'Jessica Taylor',
    courseId: 'c1',
    courseTitle: 'Mortgage Level 2: Underwriting Fundamentals',
    submissionText: 'I have prepared a sample credit risk report auditing Form 1040 sole proprietorship schedules, outlining a final recommended front-end DTI of 28% and back-end DTI of 35% based on W-2 validation. Ready for review.',
    status: 'pending',
    dateSubmitted: '2026-07-26'
  }
];

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Software Engineering' },
  { id: 'd2', name: 'Product & Design' },
  { id: 'd3', name: 'Lending' },
  { id: 'd4', name: 'Business Operations' },
  { id: 'd5', name: 'Data & AI Practice' },
  { id: 'd6', name: 'Executive Leadership' },
  { id: 'd7', name: 'IT & Administration' },
  { id: 'd8', name: 'Content Development' }
];

const DEFAULT_SETTINGS: SystemSettings = {
  quizPassingThreshold: 75,
  autoEnrollNewUsers: true,
  emailReminders: true,
  darkSidebar: true
};

const DEFAULT_PERMISSIONS: RolePermissions[] = [
  {
    role: 'employee',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: false,
      assignCourses: false,
      approveAssessments: false,
      editCourses: false,
      manageUsers: false,
      systemSettings: false
    }
  },
  {
    role: 'team_leader',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: true,
      assignCourses: true,
      approveAssessments: true,
      editCourses: false,
      manageUsers: false,
      systemSettings: false
    }
  },
  {
    role: 'trainer',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: true,
      assignCourses: true,
      approveAssessments: false,
      editCourses: true,
      manageUsers: false,
      systemSettings: false
    }
  },
  {
    role: 'admin',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: true,
      assignCourses: true,
      approveAssessments: true,
      editCourses: true,
      manageUsers: true,
      systemSettings: true
    }
  }
];

// ==========================================
// STORE STORAGE HELPERS
// ==========================================

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- DATABASE DTO MAPPERS ---
const parseAssignedUsers = (val: any): CourseAssignment[] => {
  if (!val) return [];
  let arr = val;
  if (typeof val === 'string') {
    try {
      arr = JSON.parse(val);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === 'string') {
      try {
        return JSON.parse(item);
      } catch (e) {
        return null;
      }
    }
    return item;
  }).filter((x): x is CourseAssignment => x !== null && typeof x === 'object' && 'userId' in x);
};

const mapDBCourse = (db: any): Course => {
  let attachments: { name: string; url: string; size: number }[] = [];
  let trainer: string | undefined = undefined;
  let requirements: string[] | undefined = undefined;

  // Read dedicated columns if available
  if (db.attachments !== undefined && db.attachments !== null) {
    attachments = typeof db.attachments === 'string' ? JSON.parse(db.attachments) : (db.attachments || []);
  }
  if (db.trainer !== undefined && db.trainer !== null) {
    trainer = db.trainer;
  }
  if (db.requirements !== undefined && db.requirements !== null) {
    requirements = typeof db.requirements === 'string' ? JSON.parse(db.requirements) : (db.requirements || []);
  }

  const descVal = db.description || '';
  let description = descVal;

  const attachmentsIdx = descVal.indexOf('\n\n[ATTACHMENTS]:');
  const trainerIdx = descVal.indexOf('\n\n[TRAINER]:');
  const requirementsIdx = descVal.indexOf('\n\n[REQUIREMENTS]:');

  let minIdx = -1;
  const indices = [attachmentsIdx, trainerIdx, requirementsIdx].filter(i => i !== -1);
  if (indices.length > 0) {
    minIdx = Math.min(...indices);
    description = descVal.substring(0, minIdx);
  }

  // Fallback to legacy description parsing if the new columns are empty/undefined
  if (attachments.length === 0 && attachmentsIdx !== -1) {
    const nextIndices = [trainerIdx, requirementsIdx].filter(i => i > attachmentsIdx);
    const endIdx = nextIndices.length > 0 ? Math.min(...nextIndices) : descVal.length;
    const jsonStr = descVal.substring(attachmentsIdx + '\n\n[ATTACHMENTS]:'.length, endIdx);
    try {
      attachments = JSON.parse(jsonStr);
    } catch (e) {
      attachments = [];
    }
  }

  if (!trainer && trainerIdx !== -1) {
    const nextIndices = [attachmentsIdx, requirementsIdx].filter(i => i > trainerIdx);
    const endIdx = nextIndices.length > 0 ? Math.min(...nextIndices) : descVal.length;
    trainer = descVal.substring(trainerIdx + '\n\n[TRAINER]:'.length, endIdx).trim();
  }

  if ((!requirements || requirements.length === 0) && requirementsIdx !== -1) {
    const nextIndices = [attachmentsIdx, trainerIdx].filter(i => i > requirementsIdx);
    const endIdx = nextIndices.length > 0 ? Math.min(...nextIndices) : descVal.length;
    const jsonStr = descVal.substring(requirementsIdx + '\n\n[REQUIREMENTS]:'.length, endIdx);
    try {
      requirements = JSON.parse(jsonStr);
    } catch (e) {
      requirements = [];
    }
  }

  return {
    id: db.id,
    title: db.title,
    category: db.category,
    rating: Number(db.rating || 4.5),
    code: db.code,
    level: db.level,
    description: description,
    imgBg: db.img_bg || '#e0f2fe',
    lessons: typeof db.lessons === 'string' ? JSON.parse(db.lessons) : (db.lessons || []),
    quiz: typeof db.quiz === 'string' ? JSON.parse(db.quiz) : (db.quiz || []),
    assignedUsers: parseAssignedUsers(db.assigned_users),
    attachments,
    trainer,
    requirements
  };
};

const mapCourseToDB = (c: Course) => {
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    rating: c.rating,
    code: c.code,
    level: c.level,
    description: c.description,
    img_bg: c.imgBg,
    lessons: JSON.stringify(c.lessons),
    quiz: JSON.stringify(c.quiz),
    assigned_users: c.assignedUsers || [],
    attachments: JSON.stringify(c.attachments || []),
    trainer: c.trainer || null,
    requirements: JSON.stringify(c.requirements || [])
  };
};

const mapDBProgress = (db: any): UserProgress => ({
  userEmail: db.user_email?.toLowerCase() || '',
  courseId: db.course_id,
  applicationId: db.application_id !== null && db.application_id !== undefined ? Number(db.application_id) : undefined,
  progressPercent: Number(db.progress_percent || 0),
  completedLessons: typeof db.completed_lessons === 'string' ? JSON.parse(db.completed_lessons) : (db.completed_lessons || []),
  quizScore: db.quiz_score !== null && db.quiz_score !== undefined ? Number(db.quiz_score) : undefined,
  quizAttempts: Number(db.quiz_attempts || 0),
  practicalStatus: db.practical_status || 'none',
  practicalNotes: db.practical_notes || undefined,
  overdue: Boolean(db.overdue),
  dueDate: db.due_date || undefined
});

const mapProgressToDB = (p: UserProgress) => ({
  user_email: p.userEmail.toLowerCase(),
  course_id: p.courseId,
  application_id: p.applicationId || 0,
  progress_percent: p.progressPercent,
  completed_lessons: JSON.stringify(p.completedLessons),
  quiz_score: p.quizScore !== undefined ? p.quizScore : null,
  quiz_attempts: p.quizAttempts,
  practical_status: p.practicalStatus,
  practical_notes: p.practicalNotes || null,
  overdue: p.overdue,
  due_date: p.dueDate || null
});

const mapDBPractical = (db: any): PracticalSubmission => ({
  id: db.id,
  userEmail: db.user_email,
  userName: db.user_name,
  courseId: db.course_id,
  courseTitle: db.course_title,
  submissionText: db.submission_text,
  status: db.status || 'pending',
  dateSubmitted: db.date_submitted
});

const mapPracticalToDB = (s: PracticalSubmission) => ({
  id: s.id,
  user_email: s.userEmail,
  user_name: s.userName,
  course_id: s.courseId,
  course_title: s.courseTitle,
  submission_text: s.submissionText,
  status: s.status,
  date_submitted: s.dateSubmitted
});

const mapDBNotification = (db: any): Notification => ({
  id: db.id,
  userEmail: db.user_email?.toLowerCase() || '',
  courseId: db.course_id || undefined,
  title: db.title,
  message: db.message,
  type: db.type || 'other',
  isRead: Boolean(db.is_read),
  createdAt: db.created_at || new Date().toISOString(),
  assignedBy: db.assigned_by || undefined
});

const mapNotificationToDB = (n: Notification) => ({
  id: n.id,
  user_email: n.userEmail.toLowerCase(),
  course_id: n.courseId || null,
  title: n.title,
  message: n.message,
  type: n.type,
  is_read: n.isRead,
  created_at: n.createdAt,
  assigned_by: n.assignedBy || null
});


// ==========================================
// DB SERVICE API
// ==========================================

export const dbService = {
  // --- SYSTEM SETTINGS ---
  getSettings(): SystemSettings {
    return getStorageItem<SystemSettings>('koruna_settings', DEFAULT_SETTINGS);
  },
  saveSettings(settings: SystemSettings): void {
    setStorageItem('koruna_settings', settings);
  },

  // --- PERMISSIONS ---
  getPermissions(): RolePermissions[] {
    const perms = getStorageItem<RolePermissions[]>('koruna_permissions', DEFAULT_PERMISSIONS);
    const trainerPerms = perms.find(p => p.role === 'trainer');
    if (trainerPerms && !trainerPerms.permissions.assignCourses) {
      trainerPerms.permissions.assignCourses = true;
      setStorageItem('koruna_permissions', perms);
    }
    return perms;
  },
  savePermissions(perms: RolePermissions[]): void {
    setStorageItem('koruna_permissions', perms);
  },

  // --- DEPARTMENTS ---
  getDepartments(): Department[] {
    return getStorageItem<Department[]>('koruna_departments', DEFAULT_DEPARTMENTS);
  },
  addDepartment(name: string): Department {
    const deps = this.getDepartments();
    const newDep: Department = {
      id: `d-${Date.now()}`,
      name
    };
    deps.push(newDep);
    setStorageItem('koruna_departments', deps);
    return newDep;
  },

  // --- USER DIRECTORY ---
  async getUsers(): Promise<DatabaseUser[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, role, department, created_at, email');
        if (data && !error) {
          const localUsers = getStorageItem<DatabaseUser[]>('koruna_users', DEFAULT_USERS);
          const mapped: DatabaseUser[] = data.map((p) => {
            const matchedLocal = localUsers.find(u => u.id === p.id);
            const fallbackUserId = matchedLocal?.userId || (1000 + Math.abs(p.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 9000));
            return {
              id: p.id,
              userId: p.user_id ? Number(p.user_id) : fallbackUserId,
              name: p.full_name,
              email: p.email || matchedLocal?.email || `${p.full_name.toLowerCase().replace(/\s+/g, '.')}@koruna.com`,
              role: p.role as UserRole,
              department: p.department || 'Software Engineering',
              createdAt: p.created_at?.split('T')[0] || '2026-07-27'
            };
          });

          return mapped;
        }
        if (error) {
          console.error('Supabase select from profiles failed:', error.message, error.details || '');
        }
      } catch (err) {
        console.error('Supabase profile fetch error:', err);
      }
      console.warn('Supabase profiles query failed or returned no data. Falling back to local storage users.');
    }
    return getStorageItem<DatabaseUser[]>('koruna_users', DEFAULT_USERS).map((u, index) => ({
      ...u,
      userId: u.userId || (1000 + index)
    }));
  },

  async saveUser(user: DatabaseUser): Promise<void> {
    if (isSupabaseConfigured() && user.id && !user.id.startsWith('u')) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: user.name,
            role: user.role,
            department: user.department,
            email: user.email
          })
          .eq('id', user.id);
      } catch (err) {
        console.error('Supabase profile update failed:', err);
      }
    }
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    setStorageItem('koruna_users', users);
  },

  async deleteUser(email: string): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.email === email);
    if (user && isSupabaseConfigured() && !user.id.startsWith('u')) {
      try {
        await supabase.from('profiles').delete().eq('id', user.id);
      } catch (err) {
        console.error('Supabase delete failed:', err);
      }
    }
    const filtered = users.filter(u => u.email !== email);
    setStorageItem('koruna_users', filtered);
  },

  // --- COURSES ---
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (data && !error) {
          const coursesMapped = data.map(db => mapDBCourse(db));

          if (data.length === 0) {
            // Seed database courses table if it's empty
            const coursesToInsert = DEFAULT_COURSES.map(c => mapCourseToDB(c));
            const { error: insErr } = await supabase.from('courses').insert(coursesToInsert);
            if (!insErr) {
              return DEFAULT_COURSES;
            }
          } else {
            return coursesMapped;
          }
        }
      } catch (err) {
        console.error('Failed to get courses from Supabase:', err);
      }
    }
    return getStorageItem<Course[]>('koruna_courses', DEFAULT_COURSES);
  },
  
  async getCourseById(id: string): Promise<Course | undefined> {
    const courses = await this.getCourses();
    return courses.find(c => c.id === id);
  },

  async saveCourse(course: Course): Promise<Course> {
    if (isSupabaseConfigured()) {
      try {
        if (!course.id || course.id.startsWith('c-temp')) {
          course.id = `c-${Date.now()}`;
        }
        const dbCourse = mapCourseToDB(course);
        const { error } = await supabase.from('courses').upsert(dbCourse);
        if (error) {
          console.error('Failed to upsert course to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase saveCourse failed:', err);
      }
    }
    
    const courses = getStorageItem<Course[]>('koruna_courses', DEFAULT_COURSES);
    const idx = courses.findIndex(c => c.id === course.id);
    if (idx !== -1) {
      courses[idx] = course;
    } else {
      if (!course.id) course.id = `c-${Date.now()}`;
      courses.push(course);
    }
    setStorageItem('koruna_courses', courses);
    return course;
  },

  async deleteCourse(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('courses').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteCourse failed:', err);
      }
    }
    const courses = getStorageItem<Course[]>('koruna_courses', DEFAULT_COURSES).filter(c => c.id !== id);
    setStorageItem('koruna_courses', courses);
  },

  // --- USER PROGRESS ---
  getProgressList(): UserProgress[] {
    return getStorageItem<UserProgress[]>('koruna_progress', DEFAULT_PROGRESS);
  },

  async getUserProgress(email: string): Promise<UserProgress[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_email', email.toLowerCase());
        if (data && !error) {
          let userProg = data.map(db => mapDBProgress(db));
          const courses = await this.getCourses();
          let updated = false;
          const toInsert: any[] = [];

          for (const c of courses) {
            if (!userProg.some(p => p.courseId === c.id)) {
              const newProg: UserProgress = {
                userEmail: email.toLowerCase(),
                courseId: c.id,
                progressPercent: 0,
                completedLessons: [],
                quizAttempts: 0,
                practicalStatus: 'none',
                overdue: false
              };
              userProg.push(newProg);
              toInsert.push(mapProgressToDB(newProg));
              updated = true;
            }
          }

          if (updated && toInsert.length > 0) {
            await supabase
              .from('user_progress')
              .upsert(toInsert);
          }

          return userProg;
        }
      } catch (err) {
        console.error('Failed to get user progress from Supabase:', err);
      }
    }

    const list = this.getProgressList();
    let userProg = list.filter(p => p.userEmail.toLowerCase() === email.toLowerCase());
    
    const courses = getStorageItem<Course[]>('koruna_courses', DEFAULT_COURSES);
    let updated = false;

    courses.forEach(c => {
      if (!userProg.some(p => p.courseId === c.id)) {
        const newProg: UserProgress = {
          userEmail: email,
          courseId: c.id,
          progressPercent: 0,
          completedLessons: [],
          quizAttempts: 0,
          practicalStatus: 'none',
          overdue: false
        };
        list.push(newProg);
        userProg.push(newProg);
        updated = true;
      }
    });

    if (updated) {
      setStorageItem('koruna_progress', list);
    }
    return userProg;
  },

  async saveUserProgress(prog: UserProgress): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const dbProg = mapProgressToDB(prog);
        const { error } = await supabase
          .from('user_progress')
          .upsert(dbProg);
        if (error) {
          console.error('Failed to save user progress to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase saveUserProgress failed:', err);
      }
    }

    const list = this.getProgressList();
    const idx = list.findIndex(p => 
      p.userEmail.toLowerCase() === prog.userEmail.toLowerCase() && 
      p.courseId === prog.courseId &&
      (p.applicationId || 0) === (prog.applicationId || 0)
    );
    if (idx !== -1) {
      list[idx] = prog;
    } else {
      list.push(prog);
    }
    setStorageItem('koruna_progress', list);
  },

  // --- PRACTICAL SUBMISSIONS ---
  async getPracticalSubmissions(): Promise<PracticalSubmission[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('practical_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) {
          if (data.length === 0) {
            // Seed practicals
            const practicalsToInsert = DEFAULT_PRACTICALS.map(p => mapPracticalToDB(p));
            const { error: insErr } = await supabase.from('practical_submissions').insert(practicalsToInsert);
            if (!insErr) {
              return DEFAULT_PRACTICALS;
            }
          } else {
            return data.map(db => mapDBPractical(db));
          }
        }
      } catch (err) {
        console.error('Failed to get practical submissions from Supabase:', err);
      }
    }
    return getStorageItem<PracticalSubmission[]>('koruna_practicals', DEFAULT_PRACTICALS);
  },

  async submitPractical(sub: Omit<PracticalSubmission, 'id' | 'status' | 'dateSubmitted'>): Promise<PracticalSubmission> {
    const newSub: PracticalSubmission = {
      ...sub,
      id: `p-${Date.now()}`,
      status: 'pending',
      dateSubmitted: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured()) {
      try {
        const dbSub = mapPracticalToDB(newSub);
        const { error } = await supabase.from('practical_submissions').insert(dbSub);
        if (error) {
          console.error('Failed to insert practical submission into Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase submitPractical failed:', err);
      }
    }

    const subs = getStorageItem<PracticalSubmission[]>('koruna_practicals', DEFAULT_PRACTICALS);
    subs.push(newSub);
    setStorageItem('koruna_practicals', subs);

    const progressList = await this.getUserProgress(sub.userEmail);
    const prog = progressList.find(p => p.courseId === sub.courseId);
    if (prog) {
      prog.practicalStatus = 'pending';
      prog.practicalNotes = sub.submissionText;
      await this.saveUserProgress(prog);
    }

    return newSub;
  },

  async reviewPractical(id: string, status: 'approved' | 'rejected'): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('practical_submissions')
          .update({ status })
          .eq('id', id);
        if (error) {
          console.error('Failed to update submission status in Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase reviewPractical failed:', err);
      }
    }

    const subs = getStorageItem<PracticalSubmission[]>('koruna_practicals', DEFAULT_PRACTICALS);
    const sub = subs.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      setStorageItem('koruna_practicals', subs);

      const progressList = await this.getUserProgress(sub.userEmail);
      const prog = progressList.find(p => p.courseId === sub.courseId);
      if (prog) {
        prog.practicalStatus = status;
        if (status === 'approved') {
          prog.progressPercent = 100;
        }
        await this.saveUserProgress(prog);
      }
    }
  },

  // --- BADGES ---
  getBadges(): Badge[] {
    return getStorageItem<Badge[]>('koruna_badges', DEFAULT_BADGES);
  },

  async getUserBadges(email: string): Promise<Badge[]> {
    const progress = await this.getUserProgress(email);
    const badges = this.getBadges();
    const userBadges: Badge[] = [];

    const streakBadge = badges.find(b => b.id === 'b1');
    if (streakBadge) {
      userBadges.push({ ...streakBadge, dateEarned: '2026-07-15' });
    }

    const complianceProg = progress.find(p => p.courseId === 'c2');
    if (complianceProg && complianceProg.quizScore === 100) {
      const b = badges.find(badge => badge.id === 'b2');
      if (b) {
        userBadges.push({ ...b, dateEarned: '2026-07-20' });
      }
    }

    const startedAny = progress.some(p => p.completedLessons.length > 0);
    if (startedAny) {
      const b = badges.find(badge => badge.id === 'b3');
      if (b) {
        userBadges.push({ ...b, dateEarned: '2026-07-10' });
      }
    }

    const completedAny = progress.some(p => p.progressPercent === 100);
    if (completedAny) {
      const b = badges.find(badge => badge.id === 'b4');
      if (b) {
        userBadges.push({ ...b, dateEarned: '2026-07-24' });
      }
    }

    return userBadges;
  },

  // --- COURSE ASSIGNMENTS ---
  async assignCourseToUser(courseId: string, email: string, assignedBy?: string): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;

    // Fetch existing progress to preserve user progress data
    const existingProgressList = await this.getUserProgress(email);
    const existingProg = existingProgressList.find(p => p.courseId === courseId);

    // Clean up all existing database progress records for this user/course to avoid duplicates
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('user_progress')
          .delete()
          .match({ user_email: email.toLowerCase(), course_id: courseId });
      } catch (err) {
        console.error('Failed to clean up database progress before assigning:', err);
      }
    }

    // Clean up local storage progress list
    const list = this.getProgressList().filter(
      p => !(p.userEmail.toLowerCase() === email.toLowerCase() && p.courseId === courseId)
    );
    setStorageItem('koruna_progress', list);

    const appId = Math.floor(1000 + Math.random() * 9000);

    const newProg: UserProgress = {
      userEmail: email.toLowerCase(),
      courseId: courseId,
      applicationId: appId,
      progressPercent: existingProg ? existingProg.progressPercent : 0,
      completedLessons: existingProg ? existingProg.completedLessons : [],
      quizScore: existingProg ? existingProg.quizScore : undefined,
      quizAttempts: existingProg ? existingProg.quizAttempts : 0,
      practicalStatus: existingProg ? existingProg.practicalStatus : 'none',
      practicalNotes: existingProg ? existingProg.practicalNotes : undefined,
      overdue: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    await this.saveUserProgress(newProg);

    let courseTitle = 'New Course';
    if (user.userId) {
      const courses = await this.getCourses();
      const course = courses.find(c => c.id === courseId);
      if (course) {
        courseTitle = course.title;
        const assigned = course.assignedUsers || [];
        // Ensure no duplicate assignments in the JSON list either
        const updatedAssigned = assigned.filter(a => a.userId !== String(user.userId));
        updatedAssigned.push({ userId: String(user.userId), applicationId: appId });
        course.assignedUsers = updatedAssigned;
        await this.saveCourse(course);
      }
    }

    // Create Notification
    try {
      await this.addNotification({
        userEmail: email.toLowerCase(),
        courseId: courseId,
        title: 'New Course Assigned',
        message: assignedBy 
          ? `${assignedBy} assigned you a new course: "${courseTitle}".`
          : `You have been assigned a new course: "${courseTitle}".`,
        type: 'course_assigned',
        assignedBy: assignedBy
      });
    } catch (err) {
      console.error('Failed to create assignment notification:', err);
    }
  },

  async unassignCourseFromUser(courseId: string, email: string): Promise<void> {
    // Fetch existing progress for this user/course
    const existingProgressList = await this.getUserProgress(email);
    const existingProg = existingProgressList.find(p => p.courseId === courseId);

    // Delete the assigned progress record from Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('user_progress')
          .delete()
          .match({ user_email: email.toLowerCase(), course_id: courseId });
      } catch (err) {
        console.error('Supabase unassignCourseFromUser failed:', err);
      }
    }

    // Clear local storage progress list for this user/course
    const list = this.getProgressList().filter(
      p => !(p.userEmail.toLowerCase() === email.toLowerCase() && p.courseId === courseId)
    );
    setStorageItem('koruna_progress', list);

    // If they had existing progress, insert a new unassigned (self-enrolled) progress record
    // with dueDate = undefined and applicationId = 0 to preserve their progress!
    if (existingProg) {
      const newProg: UserProgress = {
        userEmail: email.toLowerCase(),
        courseId: courseId,
        applicationId: 0,
        progressPercent: existingProg.progressPercent,
        completedLessons: existingProg.completedLessons,
        quizScore: existingProg.quizScore,
        quizAttempts: existingProg.quizAttempts,
        practicalStatus: existingProg.practicalStatus,
        practicalNotes: existingProg.practicalNotes,
        overdue: false,
        dueDate: undefined
      };
      await this.saveUserProgress(newProg);
    }

    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.userId) {
      const courses = await this.getCourses();
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const assigned = course.assignedUsers || [];
        const updatedAssigned = assigned.filter(a => a.userId !== String(user.userId));
        course.assignedUsers = updatedAssigned;
        await this.saveCourse(course);
      }
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(email: string): Promise<Notification[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_email', email.toLowerCase())
          .order('created_at', { ascending: false });
        if (data && !error) {
          return data.map(db => mapDBNotification(db));
        }
        if (error) {
          console.error('Supabase getNotifications failed:', error.message);
        }
      } catch (err) {
        console.error('Failed to get notifications from Supabase:', err);
      }
    }
    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    return list
      .filter(n => n.userEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addNotification(n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const newNotification: Notification = {
      ...n,
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const dbNotif = mapNotificationToDB(newNotification);
        const { error } = await supabase.from('notifications').insert(dbNotif);
        if (error) {
          console.error('Failed to insert notification into Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase addNotification failed:', err);
      }
    }

    const notifications = getStorageItem<Notification[]>('koruna_notifications', []);
    notifications.unshift(newNotification);
    setStorageItem('koruna_notifications', notifications);

    return newNotification;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
        if (error) {
          console.error('Failed to mark notification as read in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase markNotificationAsRead failed:', err);
      }
    }

    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      setStorageItem('koruna_notifications', list);
    }
  },

  async markAllNotificationsAsRead(email: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_email', email.toLowerCase());
        if (error) {
          console.error('Failed to mark all notifications as read in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase markAllNotificationsAsRead failed:', err);
      }
    }

    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    list.forEach(n => {
      if (n.userEmail.toLowerCase() === email.toLowerCase()) {
        n.isRead = true;
      }
    });
    setStorageItem('koruna_notifications', list);
  },

  async deleteNotification(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Failed to delete notification in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase deleteNotification failed:', err);
      }
    }

    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    const filtered = list.filter(n => n.id !== id);
    setStorageItem('koruna_notifications', filtered);
  }
};


import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Zap,
  FileText,
  CloudUpload,
  Trash2,
  RefreshCw,
  Layers,
  Plus,
  Video,
  Award,
  CheckCircle2,
  Users,
  Check,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Play,
  Eye,
  Search,
  Sparkles,
  AlertCircle,
  X,
  HelpCircle,
  Image
} from 'lucide-react';
import type { Course, DatabaseUser, Lesson, QuizQuestion } from '../../services/db';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CourseCard, CourseBannerHeader } from '../courses/CourseCard';

export interface ContentCreatorViewProps {
  editingCourseId: string | null;
  courses: Course[];
  users: DatabaseUser[];
  assignedUserEmails: string[];
  setAssignedUserEmails: React.Dispatch<React.SetStateAction<string[]>>;
  courseForm: {
    title: string;
    category: string;
    code: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    imgBg: string;
    imageUrl?: string;
    trainer?: string;
    attachments?: { name: string; url: string; size: number }[];
    contentType?: 'course' | 'document';
    requiresCertification?: boolean;
    documentContent?: string;
    acknowledgmentText?: string;
  };
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  courseLessons: Omit<Lesson, 'id'>[];
  setCourseLessons: React.Dispatch<React.SetStateAction<any[]>>;
  courseQuiz: QuizQuestion[];
  setCourseQuiz: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  courseModules: { id: string; title: string }[];
  setCourseModules: React.Dispatch<React.SetStateAction<{ id: string; title: string }[]>>;
  handleSaveCourse: (e: React.FormEvent) => Promise<void>;
  resetCourseFormState: () => void;
  onOpenInventoryModal: () => void;
  addQuizQuestionField: () => void;
  removeQuizQuestionField: (idx: number) => void;
  showToast: (msg: string) => void;
}

const SECTIONS = [
  { id: 'details', label: '1. Details & Setup' },
  { id: 'content', label: '2. Content Builder' },
  { id: 'resources', label: '3. Resources & Access' },
  { id: 'review', label: '4. Review & Publish' }
] as const;

const BG_PRESETS = [
  { label: 'Ocean Blue', value: '#e0f2fe', gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
  { label: 'Koruna Berry', value: '#fdf2f8', gradient: 'linear-gradient(135deg, #a31555 0%, #7a0f40 100%)' },
  { label: 'Emerald Mint', value: '#ecfdf5', gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  { label: 'Amber Gold', value: '#fffbe6', gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
  { label: 'Slate Executive', value: '#f1f5f9', gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' },
  { label: 'Royal Violet', value: '#fae8ff', gradient: 'linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)' }
];

export const ContentCreatorView: React.FC<ContentCreatorViewProps> = ({
  editingCourseId,
  courses,
  users,
  assignedUserEmails,
  setAssignedUserEmails,
  courseForm,
  setCourseForm,
  courseLessons,
  setCourseLessons,
  courseQuiz,
  setCourseQuiz,
  courseModules,
  setCourseModules,
  handleSaveCourse,
  resetCourseFormState,
  onOpenInventoryModal,
  addQuizQuestionField,
  removeQuizQuestionField,
  showToast
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('details');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [expandedLessons, setExpandedLessons] = useState<Record<number, boolean>>({ 0: true });
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [docPreviewMode, setDocPreviewMode] = useState(false);
  const [quizTestMode, setQuizTestMode] = useState(false);
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<number, number>>({});
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>('All');

  const isDocument = courseForm.contentType === 'document';
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Intersection observer for section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) setActiveSection(id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isDocument]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cardImageInputRef = useRef<HTMLInputElement>(null);
  const [isCardImageUploading, setIsCardImageUploading] = useState(false);
  const [isCardImageDragging, setIsCardImageDragging] = useState(false);

  const handleCardImageUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    setIsCardImageUploading(true);
    try {
      if (isSupabaseConfigured()) {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `card-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `course-card-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('course-documents')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('course-documents').getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            setCourseForm((prev: any) => ({ ...prev, imageUrl: urlData.publicUrl }));
            showToast('Card cover image uploaded successfully!');
            setIsCardImageUploading(false);
            return;
          }
        }
      }

      // Fallback to FileReader Data URL
      const reader = new FileReader();
      reader.onload = () => {
        setCourseForm((prev: any) => ({ ...prev, imageUrl: reader.result as string }));
        showToast('Card cover image loaded successfully!');
        setIsCardImageUploading(false);
      };
      reader.onerror = () => {
        showToast('Failed to read image file.');
        setIsCardImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Error uploading card image.');
      setIsCardImageUploading(false);
    }
  };

  // Helper methods for clean state updates
  const handleRemoveAttachment = (fileIdx: number) => {
    setCourseForm((prev: any) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_: any, idx: number) => idx !== fileIdx)
    }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (isSupabaseConfigured()) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `course-attachments/${fileName}`;

          const { error } = await supabase.storage
            .from('course-documents')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
          const { data: urlData } = supabase.storage.from('course-documents').getPublicUrl(filePath);

          return { name: file.name, url: urlData.publicUrl, size: file.size };
        } else {
          return new Promise<{ name: string; url: string; size: number }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ name: file.name, url: reader.result as string, size: file.size });
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setCourseForm((prev: any) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...uploadedFiles]
      }));
      showToast(`Uploaded ${uploadedFiles.length} file(s).`);
    } catch (err: any) {
      alert(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateLesson = (idx: number, key: string, value: any) => {
    setCourseLessons((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const handleUpdateQuizQuestion = (qIdx: number, text: string) => {
    setCourseQuiz((prev) => {
      const copy = [...prev];
      copy[qIdx].question = text;
      return copy;
    });
  };

  const handleUpdateQuizOption = (qIdx: number, oIdx: number, text: string) => {
    setCourseQuiz((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[oIdx] = text;
      copy[qIdx].options = opts;
      return copy;
    });
  };

  const handleSetQuizCorrect = (qIdx: number, oIdx: number) => {
    setCourseQuiz((prev) => {
      const copy = [...prev];
      copy[qIdx].correctAnswer = oIdx;
      return copy;
    });
  };

  // Readiness Checklist & Percentage Calculation
  const readinessChecklist = useMemo(() => {
    const titleOk = !!courseForm.title.trim();
    const codeOk = !!courseForm.code.trim();
    const descOk = !!courseForm.description.trim();

    let contentOk = false;
    let assessmentOk = false;

    if (isDocument) {
      contentOk = !!(courseForm.documentContent || '').trim();
      assessmentOk = !!(courseForm.acknowledgmentText || '').trim();
    } else {
      contentOk = courseLessons.length > 0 && courseLessons.every((l) => l.title.trim() && l.content.trim());
      // Quiz is optional: if no quiz questions are configured, assessment is valid.
      // If quiz questions exist, ensure question text and options are filled.
      const validQuestions = courseQuiz.filter(q => q.question.trim());
      assessmentOk = validQuestions.length === 0 || validQuestions.every((q) => q.question.trim() && q.options.some((o) => o.trim()));
    }

    const accessOk = assignedUserEmails.length > 0;

    const items = [
      { id: 'details', label: 'Basic Title & Code', ok: titleOk && codeOk, targetSection: 'details' },
      { id: 'desc', label: 'Description & Overview', ok: descOk, targetSection: 'details' },
      { id: 'content', label: isDocument ? 'Document Body Text' : 'Lessons & Modules', ok: contentOk, targetSection: 'content' },
      { id: 'assessment', label: isDocument ? 'Acknowledgment Statement' : (courseQuiz.length > 0 ? 'Knowledge Check Quiz' : 'Knowledge Check Quiz (Optional)'), ok: assessmentOk, targetSection: 'content' },
      { id: 'access', label: 'Assigned Employees', ok: accessOk, targetSection: 'resources' }
    ];

    const completed = items.filter((i) => i.ok).length;
    const percent = Math.round((completed / items.length) * 100);

    return { items, completed, total: items.length, percent };
  }, [courseForm, isDocument, courseLessons, courseQuiz, assignedUserEmails]);

  // Employee Filtering
  const employees = useMemo(() => users.filter((u) => u.role === 'employee'), [users]);
  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))), [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.department && emp.department.toLowerCase().includes(employeeSearch.toLowerCase()));
      const matchesDept = selectedDeptFilter === 'All' || emp.department === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, employeeSearch, selectedDeptFilter]);

  const handleSelectAllFiltered = () => {
    const filteredEmails = filteredEmployees.map((e) => e.email);
    setAssignedUserEmails((prev) => Array.from(new Set([...prev, ...filteredEmails])));
  };

  const handleDeselectAllFiltered = () => {
    const filteredEmails = new Set(filteredEmployees.map((e) => e.email));
    setAssignedUserEmails((prev) => prev.filter((email) => !filteredEmails.has(email)));
  };

  // Lesson Reordering
  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= courseLessons.length) return;
    const updated = [...courseLessons];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setCourseLessons(updated);

    // Swap accordion state
    setExpandedLessons((prev) => {
      const nextState: Record<number, boolean> = {};
      Object.keys(prev).forEach((k) => {
        const idx = Number(k);
        if (idx === index) nextState[newIndex] = prev[index];
        else if (idx === newIndex) nextState[index] = prev[newIndex];
        else nextState[idx] = prev[idx];
      });
      return nextState;
    });
  };

  // Toggle Accordion Lesson
  const toggleLessonAccordion = (idx: number) => {
    setExpandedLessons((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Mock course object for Live Preview
  const previewCourse: Course = useMemo(
    () => ({
      id: editingCourseId || 'preview-id',
      title: courseForm.title.trim() || (isDocument ? 'Untitled Document' : 'Untitled Course'),
      code: courseForm.code.trim() || (isDocument ? 'DOC-000' : 'CRS-101'),
      category: courseForm.category || 'General',
      rating: 5.0,
      level: courseForm.level || 'Beginner',
      description: courseForm.description.trim() || 'No description provided.',
      imgBg: courseForm.imgBg || '#e0f2fe',
      imageUrl: courseForm.imageUrl || undefined,
      attachments: courseForm.attachments || [],
      contentType: courseForm.contentType || 'course',
      requiresCertification: courseForm.requiresCertification !== false,
      documentContent: courseForm.documentContent || '',
      acknowledgmentText: courseForm.acknowledgmentText || '',
      lessons: courseLessons as Lesson[],
      quiz: courseQuiz
    }),
    [courseForm, courseLessons, courseQuiz, editingCourseId, isDocument]
  );

  // Video embed helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="cc-shell">
      <style>{`
        .cc-shell {
          --cc-doc: #a31555;
          --cc-doc-soft: #fdf2f8;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-bottom: 3.5rem;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        /* Top Header Masthead */
        .cc-header-masthead {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 18px;
          padding: 1.35rem 1.65rem;
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.2rem;
          flex-wrap: wrap;
        }
        .cc-header-title {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .cc-header-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(163, 21, 85, 0.25);
          border: 1px solid rgba(251, 207, 232, 0.3);
          color: #f472b6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cc-header h1 {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .cc-header p {
          margin: 0.2rem 0 0 0;
          font-size: 0.825rem;
          color: #94a3b8;
        }
        .cc-header-actions {
          display: flex;
          gap: 0.6rem;
          align-items: center;
        }

        /* Top Mobile & Tablet Stepper Bar */
        .cc-mobile-stepper {
          display: none;
          gap: 0.4rem;
          overflow-x: auto;
          padding: 0.4rem 0.2rem;
          scrollbar-width: none;
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--as-line);
          margin: -0.25rem -0.25rem 0.5rem -0.25rem;
        }
        .cc-mobile-step-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid var(--as-line);
          background: #ffffff;
          color: #64748b;
          white-space: nowrap;
          cursor: pointer;
        }
        .cc-mobile-step-pill.active {
          background: var(--as-primary);
          color: #ffffff;
          border-color: var(--as-primary);
          box-shadow: 0 4px 12px rgba(163, 21, 85, 0.25);
        }
        @media (max-width: 860px) {
          .cc-mobile-stepper { display: flex; }
        }

        /* Desktop Layout with Sticky Left Rail */
        .cc-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 1.75rem;
          align-items: start;
        }
        @media (max-width: 860px) {
          .cc-layout { grid-template-columns: 1fr; }
          .cc-rail { display: none !important; }
        }

        /* Desktop Left Stepper Rail */
        .cc-rail {
          position: sticky;
          top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          background: #ffffff;
          border: 1px solid var(--as-line);
          border-radius: 16px;
          padding: 1.1rem 0.9rem;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }
        .cc-rail-header {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
          margin-bottom: 0.4rem;
        }
        .cc-rail-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          background: transparent;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease;
        }
        .cc-rail-item:hover {
          background: #f8fafc;
        }
        .cc-rail-item.active {
          background: var(--as-primary-soft);
        }
        .cc-rail-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid var(--as-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          flex-shrink: 0;
          background: #fff;
          transition: all 0.15s ease;
        }
        .cc-rail-item.active .cc-rail-dot {
          border-color: var(--as-primary);
          background: var(--as-primary);
          color: #fff;
        }
        .cc-rail-item.completed .cc-rail-dot {
          border-color: var(--as-good);
          background: var(--as-good);
          color: #fff;
        }
        .cc-rail-item span.label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748b;
        }
        .cc-rail-item.active span.label {
          color: var(--as-primary);
          font-weight: 700;
        }

        /* Dynamic Progress Card in Rail */
        .cc-rail-progress {
          margin-top: 0.85rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--as-line);
        }
        .cc-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          color: #475569;
          margin-bottom: 0.35rem;
          font-weight: 700;
        }
        .cc-progress-track {
          height: 6px;
          border-radius: 999px;
          background: #eef2f7;
          overflow: hidden;
        }
        .cc-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--as-primary) 0%, #db2777 100%);
          transition: width 0.3s ease;
        }

        /* Content Sections */
        .cc-main {
          display: flex;
          flex-direction: column;
          gap: 1.65rem;
          min-width: 0;
        }
        .cc-section {
          scroll-margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .cc-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .cc-section-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          color: var(--as-ink);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cc-section-header span.sub {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Interactive Type Cards */
        .cc-type-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.85rem;
        }
        .cc-type-card {
          border: 2px solid var(--as-line);
          border-radius: 14px;
          padding: 1.1rem;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          position: relative;
        }
        .cc-type-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
        }
        .cc-type-card.selected {
          border-color: var(--as-primary);
          background: #fdf2f8;
          box-shadow: 0 8px 24px rgba(163, 21, 85, 0.12);
        }
        .cc-type-card.selected.doc {
          border-color: #be185d;
          background: #fff1f2;
        }
        .cc-type-card-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #475569;
          transition: all 0.2s ease;
        }
        .cc-type-card.selected .cc-type-card-icon {
          background: var(--as-primary);
          color: #ffffff;
        }

        /* Background Accent Theme Picker */
        .cc-bg-picker {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.35rem;
        }
        .cc-bg-chip {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .cc-bg-chip.active {
          border-color: var(--as-ink);
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        /* Form Primitives */
        .cc-field-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        /* Toggle Card */
        .cc-toggle-card {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 0.95rem 1.1rem;
          border: 1px solid var(--as-line);
          border-radius: 12px;
          background: #f8fafc;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .cc-toggle-card:hover {
          border-color: var(--as-primary-line);
          background: #fefce8;
        }

        /* Accordion Lesson Card */
        .cc-accordion-lesson {
          border: 1px solid var(--as-line);
          border-radius: 14px;
          background: #ffffff;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .cc-accordion-lesson:hover {
          border-color: #cbd5e1;
        }
        .cc-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.1rem;
          background: #f8fafc;
          cursor: pointer;
          user-select: none;
          gap: 0.75rem;
        }
        .cc-accordion-header:hover {
          background: #f1f5f9;
        }
        .cc-accordion-body {
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-top: 1px solid var(--as-line);
        }

        /* Quiz Question Card */
        .cc-quiz-card {
          border: 1px solid var(--as-line);
          border-radius: 14px;
          padding: 1.1rem;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
        }
        .cc-quiz-pill-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.6rem;
        }
        .cc-quiz-pill-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.65rem;
          border: 1px solid var(--as-line);
          border-radius: 10px;
          background: #f8fafc;
          transition: all 0.15s ease;
        }
        .cc-quiz-pill-item.is-correct {
          border-color: var(--as-good);
          background: var(--as-good-soft);
        }

        /* Employee Chip Grid & Search */
        .cc-user-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.55rem;
          max-height: 280px;
          overflow-y: auto;
          padding: 0.25rem;
        }
        .cc-user-chip {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--as-line);
          cursor: pointer;
          font-size: 0.8rem;
          background: #fff;
          transition: all 0.15s ease;
        }
        .cc-user-chip:hover {
          border-color: var(--as-primary);
        }
        .cc-user-chip.checked {
          border-color: var(--as-primary);
          background: var(--as-primary-soft);
        }

        /* Pre-flight Checklist Summary */
        .cc-preflight-card {
          border: 1px solid var(--as-line);
          border-radius: 16px;
          padding: 1.25rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }
        .cc-preflight-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid var(--as-line);
          font-size: 0.825rem;
        }

        /* Video Modal Backdrop */
        .cc-video-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
        }
        .cc-video-modal {
          background: #000;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        /* Dropzone */
        .cc-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          padding: 1.75rem 1.25rem;
          text-align: center;
          position: relative;
          background: #f8fafc;
          transition: all 0.15s ease;
        }
        .cc-dropzone:hover {
          border-color: var(--as-primary);
          background: var(--as-primary-soft);
        }
        .cc-dropzone input[type='file'] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>

      {/* MOBILE & TABLET TOP STEPPER BAR (<860px) */}
      <div className="cc-mobile-stepper">
        {SECTIONS.map((s, idx) => {
          const isCurrent = activeSection === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`cc-mobile-step-pill ${isCurrent ? 'active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              <span>{idx + 1}.</span> {s.label.split('.')[1] || s.label}
            </button>
          );
        })}
      </div>

      {/* MAIN FORM SHELL */}
      <form id="trainer-course-form" onSubmit={handleSaveCourse}>
        <div className="cc-layout">
          {/* DESKTOP SIDE RAIL NAVIGATION */}
          <nav className="cc-rail">
            <div className="cc-rail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Course Stepper</span>
              <button
                type="button"
                className="as-btn as-btn--ghost as-btn--sm"
                style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem', height: 'auto' }}
                onClick={onOpenInventoryModal}
                title="View Course Inventory"
              >
                <BookOpen size={12} /> ({courses.length})
              </button>
            </div>
            {SECTIONS.map((s, i) => {
              const isCurrent = activeSection === s.id;
              let isStepDone = false;
              if (s.id === 'details') isStepDone = !!courseForm.title.trim() && !!courseForm.code.trim();
              if (s.id === 'content')
                isStepDone = isDocument
                  ? !!(courseForm.documentContent || '').trim()
                  : courseLessons.length > 0;
              if (s.id === 'resources') isStepDone = assignedUserEmails.length > 0;
              if (s.id === 'review') isStepDone = readinessChecklist.percent === 100;

              return (
                <button
                  key={s.id}
                  type="button"
                  className={`cc-rail-item ${isCurrent ? 'active' : ''} ${isStepDone ? 'completed' : ''}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="cc-rail-dot">
                    {isStepDone ? <Check size={13} style={{ strokeWidth: 3 }} /> : i + 1}
                  </span>
                  <span className="label">{s.label.split('.')[1] || s.label}</span>
                </button>
              );
            })}

            {/* Dynamic Progress Card */}
            <div className="cc-rail-progress">
              <div className="cc-progress-label">
                <span>Readiness Progress</span>
                <span style={{ color: readinessChecklist.percent === 100 ? 'var(--as-good)' : 'var(--as-primary)' }}>
                  {readinessChecklist.percent}%
                </span>
              </div>
              <div className="cc-progress-track">
                <div className="cc-progress-fill" style={{ width: `${readinessChecklist.percent}%` }} />
              </div>
            </div>
          </nav>

          {/* MAIN SECTIONS CONTAINER */}
          <div className="cc-main">
            {/* SECTION 1: DETAILS & SETUP */}
            <div
              className="cc-section"
              data-section-id="details"
              ref={(el) => {
                sectionRefs.current.details = el;
              }}
            >
              <div className="cc-section-header">
                <h2>
                  <BookOpen size={18} style={{ color: 'var(--as-primary)' }} /> Details & Setup
                </h2>
                <span className="sub">Configure format, background, title, and metadata</span>
              </div>

              <div className="as-card as-card--pad" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Visual Content Type Selector */}
                <div>
                  <label className="as-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                    Select Content Format *
                  </label>
                  <div className="cc-type-cards">
                    <div
                      className={`cc-type-card ${!isDocument ? 'selected' : ''}`}
                      onClick={() => setCourseForm((prev: any) => ({ ...prev, contentType: 'course' }))}
                    >
                      <div className="cc-type-card-icon">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--as-ink)' }}>
                          Interactive Course
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem', lineHeight: '1.4' }}>
                          Structured multi-module track with interactive video lessons, downloadable materials, and a knowledge quiz.
                        </div>
                      </div>
                    </div>

                    <div
                      className={`cc-type-card ${isDocument ? 'selected doc' : ''}`}
                      onClick={() => setCourseForm((prev: any) => ({ ...prev, contentType: 'document' }))}
                    >
                      <div className="cc-type-card-icon" style={{ background: isDocument ? '#be185d' : '#f1f5f9' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--as-ink)' }}>
                          Policy & Document Acknowledgment
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem', lineHeight: '1.4' }}>
                          Company policy or procedure for employees to review, download attachments, and check a formal acknowledgment.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Card Cover Image Upload */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--as-line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <label className="as-label" style={{ marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                        <Image size={16} style={{ color: 'var(--as-primary)' }} /> Course Card Cover Image
                      </label>
                      <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0 }}>
                        Upload a custom thumbnail image displayed on course cards across all dashboards.
                      </p>
                    </div>
                    {courseForm.imageUrl && (
                      <button
                        type="button"
                        className="as-btn as-btn--danger as-btn--sm"
                        style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        onClick={() => setCourseForm((prev: any) => ({ ...prev, imageUrl: '' }))}
                      >
                        <Trash2 size={13} /> Remove Custom Image
                      </button>
                    )}
                  </div>

                  <input
                    ref={cardImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCardImageUpload(file);
                      e.target.value = '';
                    }}
                  />

                  {courseForm.imageUrl ? (
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '140px', border: '1px solid var(--as-line)', background: '#0f172a' }}>
                      <img
                        src={courseForm.imageUrl}
                        alt="Course Card Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="as-btn as-btn--secondary as-btn--sm"
                          style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', height: '32px', fontSize: '0.75rem' }}
                          onClick={() => cardImageInputRef.current?.click()}
                        >
                          <CloudUpload size={14} /> Change Image
                        </button>
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(16, 185, 129, 0.9)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                        ✓ Custom Image Set
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsCardImageDragging(true); }}
                      onDragLeave={() => setIsCardImageDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsCardImageDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleCardImageUpload(file);
                      }}
                      onClick={() => cardImageInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${isCardImageDragging ? 'var(--as-primary)' : '#cbd5e1'}`,
                        borderRadius: '10px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        background: isCardImageDragging ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <CloudUpload size={28} style={{ color: isCardImageDragging ? 'var(--as-primary)' : '#94a3b8', marginBottom: '0.35rem' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                        {isCardImageUploading ? 'Processing image file...' : 'Click or drag & drop image here to upload cover'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Supports PNG, JPG, WebP, SVG (Recommended: 16:9 ratio, max 5MB)
                      </div>
                    </div>
                  )}

                  {/* Optional Image URL Input */}
                  <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="as-field" style={{ margin: 0 }}>
                      <label className="as-label" style={{ fontSize: '0.75rem', color: '#64748b' }}>Or paste image URL directly:</label>
                      <input
                        type="url"
                        className="as-input"
                        style={{ height: '34px', fontSize: '0.8rem' }}
                        placeholder="https://example.com/course-banner.jpg"
                        value={courseForm.imageUrl || ''}
                        onChange={(e) => setCourseForm((prev: any) => ({ ...prev, imageUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Banner / Cover Preset Selector */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--as-line)' }}>
                  <label className="as-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                    Course Banner Theme Accent (imgBg)
                  </label>
                  <div className="cc-bg-picker">
                    {BG_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        title={p.label}
                        className={`cc-bg-chip ${courseForm.imgBg === p.value ? 'active' : ''}`}
                        style={{ background: p.gradient }}
                        onClick={() => setCourseForm({ ...courseForm, imgBg: p.value })}
                      >
                        {courseForm.imgBg === p.value && <Check size={14} />}
                      </button>
                    ))}
                  </div>

                  {!courseForm.imageUrl && (
                    <div style={{ marginTop: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
                        Functional Banner Preview (No image upload required)
                      </div>
                      <CourseBannerHeader
                        course={{
                          title: courseForm.title || (isDocument ? 'Document Title' : 'Course Title'),
                          category: courseForm.category || 'Mortgage',
                          code: courseForm.code || 'CRS-101',
                          imgBg: courseForm.imgBg,
                          contentType: courseForm.contentType
                        }}
                        height="110px"
                        borderRadius="10px"
                      >
                        {courseForm.code && (
                          <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '6px', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, width: 'fit-content' }}>
                            {courseForm.code}
                          </div>
                        )}
                      </CourseBannerHeader>
                    </div>
                  )}
                </div>

                {/* Grid Inputs */}
                <div className="cc-field-grid">
                  <div className="as-field">
                    <label className="as-label">{isDocument ? 'Document Title *' : 'Course Title *'}</label>
                    <input
                      type="text"
                      className="as-input"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder={isDocument ? '2026 Employee Remote Work Policy' : 'Mortgage Origination Fundamentals'}
                      required
                    />
                  </div>
                  <div className="as-field">
                    <label className="as-label">{isDocument ? 'Document Code *' : 'Course Code *'}</label>
                    <input
                      type="text"
                      className="as-input"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      placeholder={isDocument ? 'DOC-POL-2026' : 'MORT-101'}
                      required
                    />
                  </div>
                  <div className="as-field">
                    <label className="as-label">Category</label>
                    <select
                      className="as-select"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    >
                      <option value="Mortgage">Mortgage</option>
                      <option value="Lending">Lending</option>
                      <option value="Operations">Operations</option>
                      <option value="AI">AI / Technology</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Company Policy">Company Policy</option>
                    </select>
                  </div>
                  <div className="as-field">
                    <label className="as-label">Difficulty / Level</label>
                    <select
                      className="as-select"
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="as-field">
                    <label className="as-label">Trainer Name</label>
                    <input
                      type="text"
                      className="as-input"
                      value={courseForm.trainer || ''}
                      onChange={(e) => setCourseForm({ ...courseForm, trainer: e.target.value })}
                      placeholder="e.g. Dr. Marcus Vance"
                    />
                  </div>
                </div>

                <div className="as-field">
                  <label className="as-label">Description & Learning Objectives</label>
                  <textarea
                    className="as-textarea"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder={
                      isDocument
                        ? 'Brief overview of what this policy or document covers...'
                        : 'An introductory course designed to teach the fundamentals...'
                    }
                  />
                </div>

                {/* Certification Toggle Card */}
                <label className="cc-toggle-card">
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', accentColor: 'var(--as-primary)', cursor: 'pointer', marginTop: '2px' }}
                    checked={courseForm.requiresCertification !== false}
                    onChange={(e) => setCourseForm({ ...courseForm, requiresCertification: e.target.checked })}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--as-ink)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={16} style={{ color: 'var(--as-primary)' }} />
                      Issue Official Certificate on Completion
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.15rem' }}>
                      Employees earn an official diploma certificate upon completing this {isDocument ? 'document acknowledgment' : 'course'}.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* SECTION 2: CONTENT BUILDER */}
            <div
              className="cc-section"
              data-section-id="content"
              ref={(el) => {
                sectionRefs.current.content = el;
              }}
            >
              <div className="cc-section-header">
                <h2>
                  <Layers size={18} style={{ color: 'var(--as-primary)' }} /> Content Builder
                </h2>
                <span className="sub">
                  {isDocument ? 'Document text body and acknowledgment' : 'Modules, lessons, videos, and quiz questions'}
                </span>
              </div>

              {isDocument ? (
                /* DOCUMENT MODE */
                <div className="as-card as-card--pad" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="as-label" style={{ margin: 0 }}>
                      Document Body Text *
                    </label>
                    <button
                      type="button"
                      className="as-btn as-btn--outline as-btn--sm"
                      onClick={() => setDocPreviewMode(!docPreviewMode)}
                    >
                      <Eye size={14} /> {docPreviewMode ? 'Edit Mode' : 'Live Reader Preview'}
                    </button>
                  </div>

                  {docPreviewMode ? (
                    <div
                      style={{
                        padding: '1.25rem',
                        background: '#ffffff',
                        border: '1px solid var(--as-line)',
                        borderRadius: '12px',
                        minHeight: '220px',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        color: 'var(--as-ink)'
                      }}
                    >
                      {courseForm.documentContent || <span className="as-muted">No document body entered yet.</span>}
                    </div>
                  ) : (
                    <div className="as-field">
                      <textarea
                        className="as-textarea"
                        style={{ minHeight: '240px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: '1.5' }}
                        value={courseForm.documentContent || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, documentContent: e.target.value })}
                        placeholder="Type or paste the complete policy text, guidelines, instructions, or standard operating procedure..."
                      />
                    </div>
                  )}

                  <div className="as-field">
                    <label className="as-label">Employee Acknowledgment Statement *</label>
                    <input
                      type="text"
                      className="as-input"
                      value={courseForm.acknowledgmentText || ''}
                      onChange={(e) => setCourseForm({ ...courseForm, acknowledgmentText: e.target.value })}
                      placeholder="I have read, understood, and agree to the policies and terms outlined in this document."
                    />
                    <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Employees check this box to confirm compliance.
                    </div>
                  </div>
                </div>
              ) : (
                /* COURSE MODE */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {/* MODULES MANAGER */}
                  <div className="as-card as-card--pad">
                    <div className="as-flex-between" style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Layers size={17} style={{ color: 'var(--as-primary)' }} />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Course Modules</h3>
                        <span className="as-badge-count">{courseModules.length}</span>
                      </div>
                      <button
                        type="button"
                        className="as-btn as-btn--outline as-btn--sm"
                        onClick={() => {
                          const nextId = `m${courseModules.length + 1}`;
                          setCourseModules((prev) => [...prev, { id: nextId, title: `Module ${prev.length + 1}` }]);
                        }}
                      >
                        <Plus size={14} /> Add Module
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                      {courseModules.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.7rem',
                            border: '1px solid var(--as-line)',
                            borderRadius: '10px',
                            background: '#ffffff'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--as-primary)', minWidth: '26px' }}>
                            {m.id.toUpperCase()}:
                          </span>
                          <input
                            type="text"
                            className="as-input"
                            style={{ height: '32px', fontSize: '0.825rem', flex: 1 }}
                            value={m.title}
                            placeholder="Module title"
                            onChange={(e) => {
                              const updatedTitle = e.target.value;
                              setCourseModules((prev) =>
                                prev.map((item) => (item.id === m.id ? { ...item, title: updatedTitle } : item))
                              );
                              setCourseLessons((prev) =>
                                prev.map((l) => (l.moduleId === m.id ? { ...l, moduleTitle: updatedTitle } : l))
                              );
                            }}
                          />
                          <button
                            type="button"
                            className="as-icon-btn"
                            disabled={courseModules.length === 1}
                            onClick={() => {
                              if (courseModules.length === 1) return;
                              const remainingModules = courseModules.filter((item) => item.id !== m.id);
                              const fallbackModule = remainingModules[0];
                              setCourseLessons((prev) =>
                                prev.map((l) => {
                                  if (l.moduleId === m.id || !l.moduleId) {
                                    return { ...l, moduleId: fallbackModule.id, moduleTitle: fallbackModule.title };
                                  }
                                  return l;
                                })
                              );
                              setCourseModules(remainingModules);
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACCORDION LESSON CARDS */}
                  <div className="as-card as-card--pad">
                    <div className="as-flex-between" style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Video size={17} style={{ color: 'var(--as-primary)' }} />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Lessons</h3>
                        <span className="as-badge-count">{courseLessons.length}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {/* Module filter tabs */}
                        <select
                          className="as-select as-select--auto"
                          value={activeModuleFilter}
                          onChange={(e) => setActiveModuleFilter(e.target.value)}
                        >
                          <option value="All">All Modules</option>
                          {courseModules.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.id.toUpperCase()}: {m.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="as-btn as-btn--primary as-btn--sm"
                          onClick={() => {
                            const mod = courseModules[0] || { id: 'm1', title: 'Introduction' };
                            const newIdx = courseLessons.length;
                            setCourseLessons((prev) => [
                              ...prev,
                              { title: `Lesson ${prev.length + 1}: New Lesson`, content: '', moduleId: mod.id, moduleTitle: mod.title }
                            ]);
                            setExpandedLessons((prev) => ({ ...prev, [newIdx]: true }));
                          }}
                        >
                          <Plus size={14} /> Add Lesson
                        </button>
                      </div>
                    </div>

                    {/* Lesson Accordion Stack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {courseLessons.map((lesson, idx) => {
                        if (activeModuleFilter !== 'All' && lesson.moduleId !== activeModuleFilter) return null;
                        const isExpanded = expandedLessons[idx] ?? false;
                        const matchedMod = courseModules.find((m) => m.id === lesson.moduleId);
                        const modTag = matchedMod ? `${matchedMod.id.toUpperCase()} · ${matchedMod.title}` : 'M1';

                        return (
                          <div key={idx} className="cc-accordion-lesson">
                            {/* Accordion Header */}
                            <div className="cc-accordion-header" onClick={() => toggleLessonAccordion(idx)}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                                <span
                                  className="as-pill"
                                  style={{ background: 'var(--as-primary-soft)', color: 'var(--as-primary)', whiteSpace: 'nowrap' }}
                                >
                                  {modTag}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--as-ink)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  Lesson {idx + 1}: {lesson.title || 'Untitled'}
                                </span>
                                {lesson.videoUrl && (
                                  <span style={{ fontSize: '0.72rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Play size={11} /> Video
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="as-icon-btn"
                                  disabled={idx === 0}
                                  onClick={() => moveLesson(idx, 'up')}
                                  title="Move Up"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="as-icon-btn"
                                  disabled={idx === courseLessons.length - 1}
                                  onClick={() => moveLesson(idx, 'down')}
                                  title="Move Down"
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="as-icon-btn"
                                  disabled={courseLessons.length === 1}
                                  onClick={() => setCourseLessons((prev) => prev.filter((_, lIdx) => lIdx !== idx))}
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="as-icon-btn"
                                  style={{ color: '#64748b' }}
                                  onClick={() => toggleLessonAccordion(idx)}
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                              </div>
                            </div>

                            {/* Accordion Body */}
                            {isExpanded && (
                              <div className="cc-accordion-body">
                                <div className="as-form-grid-2">
                                  <div className="as-field">
                                    <label className="as-label">Lesson Title</label>
                                    <input
                                      type="text"
                                      className="as-input"
                                      value={lesson.title}
                                      onChange={(e) => handleUpdateLesson(idx, 'title', e.target.value)}
                                    />
                                  </div>
                                  <div className="as-field">
                                    <label className="as-label">Assigned Module</label>
                                    <select
                                      className="as-select"
                                      value={lesson.moduleId || courseModules[0]?.id || 'm1'}
                                      onChange={(e) => {
                                        const selectedModId = e.target.value;
                                        const targetMod = courseModules.find((m) => m.id === selectedModId);
                                        setCourseLessons((prev) => {
                                          const copy = [...prev];
                                          copy[idx] = {
                                            ...copy[idx],
                                            moduleId: selectedModId,
                                            moduleTitle: targetMod ? targetMod.title : 'Introduction'
                                          };
                                          return copy;
                                        });
                                      }}
                                    >
                                      {courseModules.map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.id.toUpperCase()}: {m.title}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="as-field">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="as-label">Video Stream URL (YouTube, Vimeo, MP4)</label>
                                    {lesson.videoUrl && (
                                      <button
                                        type="button"
                                        className="as-btn as-btn--ghost as-btn--sm"
                                        style={{ color: 'var(--as-primary)', fontSize: '0.75rem', height: '24px' }}
                                        onClick={() => setActiveVideoModal(lesson.videoUrl || null)}
                                      >
                                        <Play size={12} /> Test Player
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="url"
                                    className="as-input"
                                    value={lesson.videoUrl || ''}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    onChange={(e) => handleUpdateLesson(idx, 'videoUrl', e.target.value)}
                                  />
                                </div>

                                <div className="as-field">
                                  <label className="as-label">Lesson Reading Content & Instructions</label>
                                  <textarea
                                    className="as-textarea"
                                    style={{ minHeight: '85px' }}
                                    value={lesson.content}
                                    placeholder="Enter reading material for this lesson..."
                                    onChange={(e) => handleUpdateLesson(idx, 'content', e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* KNOWLEDGE CHECK QUIZ BUILDER (OPTIONAL) */}
                  <div className="as-card as-card--pad">
                    <div className="as-flex-between" style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Award size={17} style={{ color: 'var(--as-warn)' }} />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Knowledge Check Quiz</h3>
                        <span className="as-pill" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.725rem', fontWeight: 600 }}>
                          Optional
                        </span>
                        <span className="as-pill" style={{ background: 'var(--as-warn-soft)', color: 'var(--as-warn)' }}>
                          {courseQuiz.length} Questions
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {courseQuiz.length > 0 && (
                          <>
                            <button
                              type="button"
                              className="as-btn as-btn--outline as-btn--sm"
                              onClick={() => setQuizTestMode(!quizTestMode)}
                            >
                              <HelpCircle size={14} /> {quizTestMode ? 'Edit Questions' : 'Test Quiz Mode'}
                            </button>
                            <button
                              type="button"
                              className="as-btn as-btn--danger as-btn--sm"
                              style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.6rem' }}
                              onClick={() => setCourseQuiz([])}
                            >
                              <Trash2 size={13} /> Remove Quiz
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="as-btn as-btn--sm"
                          style={{ background: '#ea580c', color: '#fff' }}
                          onClick={addQuizQuestionField}
                        >
                          <Plus size={14} /> Add Question
                        </button>
                      </div>
                    </div>

                    {courseQuiz.length === 0 ? (
                      <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '1.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                        <Award size={32} style={{ color: '#94a3b8', marginBottom: '0.4rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>No Assessment Quiz Configured (Optional)</div>
                        <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0.85rem 0', color: '#64748b' }}>
                          This course can be published without a quiz. Enrolled employees will complete the course by reviewing all lessons.
                        </p>
                        <button
                          type="button"
                          className="as-btn as-btn--sm"
                          style={{ background: '#ea580c', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={addQuizQuestionField}
                        >
                          <Plus size={14} /> Add Optional Quiz
                        </button>
                      </div>
                    ) : quizTestMode ? (
                      /* Quiz Interactive Test Mode */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff7ed', padding: '1.25rem', borderRadius: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Sparkles size={16} /> Interactive Quiz Test Mode (Student View)
                        </div>
                        {courseQuiz.map((q, qIdx) => (
                          <div key={qIdx} style={{ background: '#fff', padding: '1rem', borderRadius: '10px', border: '1px solid #ffedd5' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.6rem' }}>
                              Q{qIdx + 1}: {q.question || 'Untitled Question'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {q.options.map((opt, oIdx) => {
                                const selected = quizUserAnswers[qIdx] === oIdx;
                                const isCorrect = q.correctAnswer === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    style={{
                                      textAlign: 'left',
                                      padding: '0.55rem 0.85rem',
                                      borderRadius: '8px',
                                      fontSize: '0.825rem',
                                      border: selected
                                        ? isCorrect
                                          ? '2px solid #16a34a'
                                          : '2px solid #dc2626'
                                        : '1px solid #e2e8f0',
                                      background: selected ? (isCorrect ? '#f0fdf4' : '#fef2f2') : '#fff',
                                      fontWeight: selected ? 700 : 500
                                    }}
                                    onClick={() => setQuizUserAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                  >
                                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{String.fromCharCode(65 + oIdx)}:</span>
                                    {opt}
                                    {selected && (isCorrect ? '  ✅ Correct!' : '  ❌ Incorrect')}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Quiz Editor Stack */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {courseQuiz.map((q, idx) => (
                          <div key={idx} className="cc-quiz-card">
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--as-warn)', minWidth: '32px' }}>
                                Q{idx + 1}:
                              </span>
                              <input
                                type="text"
                                className="as-input"
                                style={{ flex: 1 }}
                                value={q.question}
                                placeholder="Enter quiz question..."
                                onChange={(e) => handleUpdateQuizQuestion(idx, e.target.value)}
                              />
                              <button
                                type="button"
                                className="as-icon-btn"
                                onClick={() => removeQuizQuestionField(idx)}
                                title="Remove Question"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Options Grid with Clickable Radio Selection */}
                            <div className="cc-quiz-pill-row">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctAnswer === oIdx;
                                return (
                                  <div key={oIdx} className={`cc-quiz-pill-item ${isCorrect ? 'is-correct' : ''}`}>
                                    <button
                                      type="button"
                                      title={isCorrect ? 'Correct Answer' : 'Set as Correct Answer'}
                                      style={{
                                        border: 'none',
                                        background: isCorrect ? 'var(--as-good)' : '#cbd5e1',
                                        color: '#fff',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        flexShrink: 0
                                      }}
                                      onClick={() => handleSetQuizCorrect(idx, oIdx)}
                                    >
                                      {String.fromCharCode(65 + oIdx)}
                                    </button>

                                    <input
                                      type="text"
                                      className="as-input"
                                      style={{ height: '32px', fontSize: '0.8rem', flex: 1 }}
                                      value={opt}
                                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                      onChange={(e) => handleUpdateQuizOption(idx, oIdx, e.target.value)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: RESOURCES & ACCESS */}
            <div
              className="cc-section"
              data-section-id="resources"
              ref={(el) => {
                sectionRefs.current.resources = el;
              }}
            >
              <div className="cc-section-header">
                <h2>
                  <Users size={18} style={{ color: 'var(--as-primary)' }} /> Resources & Access
                </h2>
                <span className="sub">Attachments and employee assignment matrix</span>
              </div>

              <div className="as-card as-card--pad" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Drag and Drop File Upload */}
                <div>
                  <label className="as-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                    Document Attachments & Resources
                  </label>
                  <div className="cc-dropzone">
                    <input
                      type="file"
                      multiple
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--as-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                      <CloudUpload size={18} style={{ color: 'var(--as-primary)' }} />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--as-ink)' }}>
                      {isUploading ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <RefreshCw size={14} style={{ animation: 'spin 1.2s linear infinite' }} /> Uploading files...
                        </span>
                      ) : (
                        <>
                          Drag & drop materials, or <span style={{ color: 'var(--as-primary)', textDecoration: 'underline' }}>browse files</span>
                        </>
                      )}
                    </div>
                    <div className="as-muted" style={{ fontSize: '0.73rem', marginTop: '0.2rem' }}>
                      Supports PDF, MP4, DOCX, ZIP files
                    </div>
                  </div>

                  {/* Uploaded File Cards */}
                  {courseForm.attachments && courseForm.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.65rem' }}>
                      {courseForm.attachments.map((file, fileIdx) => (
                        <div
                          key={fileIdx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0.85rem',
                            background: '#fff',
                            border: '1px solid var(--as-line)',
                            borderRadius: '10px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            type="button"
                            className="as-icon-btn"
                            onClick={() => handleRemoveAttachment(fileIdx)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* EMPLOYEE ASSIGNMENT MATRIX */}
                <div>
                  <div className="as-flex-between" style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={16} style={{ color: 'var(--as-primary)' }} />
                      <label className="as-label" style={{ margin: 0, fontSize: '0.85rem' }}>
                        Assign Employees ({assignedUserEmails.length} Selected)
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button type="button" className="as-btn as-btn--ghost as-btn--sm" onClick={handleSelectAllFiltered}>
                        Select All Filtered
                      </button>
                      <button type="button" className="as-btn as-btn--ghost as-btn--sm" onClick={handleDeselectAllFiltered}>
                        Clear Filtered
                      </button>
                    </div>
                  </div>

                  {/* Search and Dept Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                    <div className="as-search" style={{ flex: 1, minWidth: '180px' }}>
                      <Search size={14} />
                      <input
                        type="text"
                        className="as-input"
                        placeholder="Search employee name, email, department..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="as-select as-select--auto"
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    >
                      <option value="All">All Departments</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employee Chip Grid */}
                  <div className="cc-user-grid">
                    {filteredEmployees.map((emp) => {
                      const isChecked = assignedUserEmails.includes(emp.email);
                      return (
                        <label key={emp.email} className={`cc-user-chip ${isChecked ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            style={{ width: '15px', height: '15px', accentColor: 'var(--as-primary)', cursor: 'pointer' }}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedUserEmails((prev) => [...prev, emp.email]);
                              } else {
                                setAssignedUserEmails((prev) => prev.filter((email) => email !== emp.email));
                              }
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {emp.name}
                            </div>
                            <div className="as-muted" style={{ fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {emp.email} {emp.department ? `· ${emp.department}` : ''}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                    {filteredEmployees.length === 0 && (
                      <div className="as-empty-state" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                        No employees match search filter.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: REVIEW & PUBLISH */}
            <div
              className="cc-section"
              data-section-id="review"
              ref={(el) => {
                sectionRefs.current.review = el;
              }}
            >
              <div className="cc-section-header">
                <h2>
                  <ClipboardList size={18} style={{ color: 'var(--as-primary)' }} /> Review & Live Catalog Preview
                </h2>
                <span className="sub">Pre-flight checklist and catalog view</span>
              </div>

              <div className="as-split-2" style={{ gap: '1.2rem' }}>
                {/* PRE-FLIGHT CHECKLIST CARD */}
                <div className="cc-preflight-card">
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--as-ink)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <CheckCircle2 size={18} style={{ color: readinessChecklist.percent === 100 ? 'var(--as-good)' : 'var(--as-primary)' }} />
                    Publish Readiness Checklist ({readinessChecklist.completed}/{readinessChecklist.total})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {readinessChecklist.items.map((item) => (
                      <div key={item.id} className="cc-preflight-item">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {item.ok ? (
                            <CheckCircle2 size={15} style={{ color: 'var(--as-good)' }} />
                          ) : (
                            <AlertCircle size={15} style={{ color: 'var(--as-warn)' }} />
                          )}
                          <span style={{ fontWeight: item.ok ? 600 : 500, color: item.ok ? 'var(--as-ink)' : 'var(--as-warn)' }}>
                            {item.label}
                          </span>
                        </span>

                        {!item.ok && (
                          <button
                            type="button"
                            className="as-btn as-btn--ghost as-btn--sm"
                            style={{ height: '22px', fontSize: '0.72rem', color: 'var(--as-primary)' }}
                            onClick={() => scrollToSection(item.targetSection)}
                          >
                            Fix item →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                    {editingCourseId && (
                      <button type="button" className="as-btn as-btn--outline as-btn--full" onClick={resetCourseFormState}>
                        Cancel Edit
                      </button>
                    )}
                    <button type="submit" disabled={isUploading} className="as-btn as-btn--primary as-btn--full">
                      {isUploading ? (
                        <>
                          <RefreshCw size={15} style={{ animation: 'spin 1.2s linear infinite' }} /> Uploading...
                        </>
                      ) : (
                        <>
                          {editingCourseId ? <Check size={16} /> : <Zap size={16} />}
                          {editingCourseId ? 'Save Content Track' : 'Publish Content Track'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* LIVE CATALOG CARD PREVIEW */}
                <div>
                  <div className="as-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Eye size={15} style={{ color: 'var(--as-primary)' }} /> Live Course Catalog Card Preview
                  </div>
                  <CourseCard course={previewCourse} variant="trainer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY SAVE BAR FOR MOBILE */}
        <div className="as-sticky-save">
          <button type="submit" disabled={isUploading} className="as-btn as-btn--primary as-btn--full" style={{ borderRadius: 0, height: '46px' }}>
            <Zap size={16} />
            {isUploading ? 'Uploading Files...' : editingCourseId ? 'Save Changes' : 'Publish Course Track'}
          </button>
        </div>
      </form>

      {/* VIDEO PREVIEW MODAL */}
      {activeVideoModal && (
        <div className="cc-video-modal-backdrop" onClick={() => setActiveVideoModal(null)}>
          <div className="cc-video-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '0.65rem 1rem', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Play size={14} style={{ color: '#059669' }} /> Video Stream Preview
              </span>
              <button
                type="button"
                className="as-icon-btn"
                style={{ color: '#fff' }}
                onClick={() => setActiveVideoModal(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={getEmbedUrl(activeVideoModal) || activeVideoModal}
                title="Lesson Video Stream"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
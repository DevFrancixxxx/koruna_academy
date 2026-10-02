import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen, Zap, FileText, CloudUpload, Trash2, RefreshCw, Layers, Plus, Award,
  CheckCircle2, Users, Check, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Play,
  Eye, Search, AlertCircle, X, HelpCircle, Image as ImageIcon, Paperclip, ListChecks, Settings2
} from 'lucide-react';
import type { Course, DatabaseUser, Lesson, QuizQuestion } from '../../services/db';
import type { UserSessionData } from '../../services/auth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CourseCard, CourseBannerHeader } from '../courses/CourseCard';

export interface ContentCreatorViewProps {
  userSession?: UserSessionData;
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

type TabId = 'details' | 'content' | 'access' | 'review';
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'details', label: 'Details', icon: <Settings2 size={14} /> },
  { id: 'content', label: 'Content', icon: <Layers size={14} /> },
  { id: 'access', label: 'Resources & access', icon: <Paperclip size={14} /> },
  { id: 'review', label: 'Review', icon: <ListChecks size={14} /> }
];

const BG_PRESETS = [
  { label: 'Ocean Blue', value: '#e0f2fe', gradient: 'linear-gradient(135deg, #0284c7, #0369a1)' },
  { label: 'Koruna Berry', value: '#fdf2f8', gradient: 'linear-gradient(135deg, #a31555, #7a0f40)' },
  { label: 'Emerald Mint', value: '#ecfdf5', gradient: 'linear-gradient(135deg, #059669, #047857)' },
  { label: 'Amber Gold', value: '#fffbe6', gradient: 'linear-gradient(135deg, #d97706, #b45309)' },
  { label: 'Slate Executive', value: '#f1f5f9', gradient: 'linear-gradient(135deg, #334155, #1e293b)' },
  { label: 'Royal Violet', value: '#fae8ff', gradient: 'linear-gradient(135deg, #7e22ce, #6b21a8)' }
];

const CATEGORIES = ['Onboarding', 'Mortgage', 'Loan Processing', 'Lending', 'Operations', 'AI', 'Compliance', 'Leadership', 'Company Policy'];

const getQType = (q: QuizQuestion): 'multiple_choice' | 'true_false' | 'short_answer' =>
  (q.type as any) ||
  (q.options?.length === 2 && q.options[0]?.toLowerCase() === 'true'
    ? 'true_false'
    : !q.options || q.options.length === 0 || q.answerText
      ? 'short_answer'
      : 'multiple_choice');

const getFileBadge = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return { label: 'PDF', bg: '#ffe4e6', color: '#e11d48' };
  if (['doc', 'docx'].includes(ext)) return { label: 'DOC', bg: '#dbeafe', color: '#2563eb' };
  if (['xls', 'xlsx', 'csv'].includes(ext)) return { label: 'XLS', bg: '#dcfce7', color: '#16a34a' };
  if (['mp4', 'mov', 'webm', 'avi'].includes(ext)) return { label: 'VID', bg: '#f3e8ff', color: '#9333ea' };
  if (['zip', 'rar', '7z'].includes(ext)) return { label: 'ZIP', bg: '#fef3c7', color: '#d97706' };
  return { label: (ext || 'file').slice(0, 4).toUpperCase(), bg: '#f1f5f9', color: '#475569' };
};

const getInitials = (name: string) => {
  if (!name) return '??';
  const p = name.trim().split(' ');
  return (p.length >= 2 ? `${p[0][0]}${p[1][0]}` : name.substring(0, 2)).toUpperCase();
};

const AVATARS = ['#0284c7', '#a31555', '#059669', '#d97706', '#7e22ce', '#2563eb'];
const avatarColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATARS[Math.abs(h) % AVATARS.length];
};

const getEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}?autoplay=1`;
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}?autoplay=1`;
  if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}?autoplay=1`;
  return url;
};

export const ContentCreatorView: React.FC<ContentCreatorViewProps> = ({
  userSession, editingCourseId, courses, users, assignedUserEmails, setAssignedUserEmails,
  courseForm, setCourseForm, courseLessons, setCourseLessons, courseQuiz, setCourseQuiz,
  courseModules, setCourseModules, handleSaveCourse, resetCourseFormState, onOpenInventoryModal,
  addQuizQuestionField, removeQuizQuestionField, showToast
}) => {
  const [tab, setTab] = useState<TabId>('details');
  const [isUploading, setIsUploading] = useState(false);
  const [isCardImageUploading, setIsCardImageUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [assignTab, setAssignTab] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState(false);
  const [quizTest, setQuizTest] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | string>>({});
  const cardImageRef = useRef<HTMLInputElement>(null);

  const isDocument = courseForm.contentType === 'document';
  const patch = (p: Record<string, any>) => setCourseForm((prev: any) => ({ ...prev, ...p }));

  useEffect(() => {
    if (!editingCourseId && !courseForm.trainer && userSession?.name) patch({ trainer: userSession.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCourseId, courseForm.trainer, userSession?.name]);

  /* ---------- Uploads ---------- */
  const handleCardImageUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return showToast('Please select a valid image file (PNG, JPG, WebP).');
    setIsCardImageUploading(true);
    try {
      if (isSupabaseConfigured()) {
        const ext = file.name.split('.').pop() || 'png';
        const path = `course-card-images/card-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from('course-documents').upload(path, file, { cacheControl: '3600', upsert: true });
        if (!error) {
          const { data } = supabase.storage.from('course-documents').getPublicUrl(path);
          if (data?.publicUrl) {
            patch({ imageUrl: data.publicUrl });
            showToast('Cover image uploaded.');
            setIsCardImageUploading(false);
            return;
          }
        }
      }
      const reader = new FileReader();
      reader.onload = () => { patch({ imageUrl: reader.result as string }); showToast('Cover image loaded.'); setIsCardImageUploading(false); };
      reader.onerror = () => { showToast('Failed to read image file.'); setIsCardImageUploading(false); };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Error uploading cover image.');
      setIsCardImageUploading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          if (isSupabaseConfigured()) {
            const path = `course-attachments/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${file.name.split('.').pop()}`;
            const { error } = await supabase.storage.from('course-documents').upload(path, file, { cacheControl: '3600', upsert: false });
            if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
            const { data } = supabase.storage.from('course-documents').getPublicUrl(path);
            return { name: file.name, url: data.publicUrl, size: file.size };
          }
          return new Promise<{ name: string; url: string; size: number }>((resolve, reject) => {
            const r = new FileReader();
            r.onloadend = () => resolve({ name: file.name, url: r.result as string, size: file.size });
            r.onerror = () => reject(new Error('Failed to read file'));
            r.readAsDataURL(file);
          });
        })
      );
      setCourseForm((prev: any) => ({ ...prev, attachments: [...(prev.attachments || []), ...uploaded] }));
      showToast(`Uploaded ${uploaded.length} file(s).`);
    } catch (err: any) {
      alert(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (i: number) =>
    setCourseForm((prev: any) => ({ ...prev, attachments: (prev.attachments || []).filter((_: any, x: number) => x !== i) }));

  /* ---------- Lessons / modules ---------- */
  const updateLesson = (idx: number, key: string, value: any) =>
    setCourseLessons((prev) => { const c = [...prev]; c[idx] = { ...c[idx], [key]: value }; return c; });

  const addLesson = (m: { id: string; title: string }, count: number) => {
    const idx = courseLessons.length;
    setCourseLessons((prev) => [...prev, { title: `Lesson ${count + 1}: New lesson`, content: '', moduleId: m.id, moduleTitle: m.title }]);
    setExpanded((prev) => ({ ...prev, [idx]: true }));
  };

  const addModule = () => {
    const n = courseModules.length + 1;
    const id = `m${Date.now()}`;
    const title = `Module ${n}: New topic`;
    setCourseModules((prev) => [...prev, { id, title }]);
    setExpanded((prev) => ({ ...prev, [courseLessons.length]: true }));
    setCourseLessons((prev) => [...prev, { title: `Lesson 1: Introduction to Module ${n}`, content: '', moduleId: id, moduleTitle: title }]);
    showToast(`Created Module ${n}`);
  };

  const moveLesson = (index: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= courseLessons.length) return;
    const next = [...courseLessons];
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    setCourseLessons(next);
    setExpanded((prev) => {
      const s: Record<number, boolean> = {};
      Object.keys(prev).forEach((k) => {
        const i = Number(k);
        if (i === index) s[to] = prev[index];
        else if (i === to) s[index] = prev[to];
        else s[i] = prev[i];
      });
      return s;
    });
  };

  /* ---------- Quiz ---------- */
  const updateQuiz = (i: number, p: Partial<QuizQuestion>) =>
    setCourseQuiz((prev) => { const c = [...prev]; c[i] = { ...c[i], ...p }; return c; });

  const updateQuizType = (i: number, type: 'multiple_choice' | 'true_false' | 'short_answer') =>
    updateQuiz(i, {
      type,
      options: type === 'true_false' ? ['True', 'False'] : type === 'short_answer' ? [] : courseQuiz[i].options?.length === 4 ? courseQuiz[i].options : ['', '', '', ''],
      correctAnswer: 0,
      answerText: courseQuiz[i].answerText || ''
    } as any);

  const updateQuizOption = (qi: number, oi: number, text: string) => {
    const opts = [...(courseQuiz[qi].options || [])];
    opts[oi] = text;
    updateQuiz(qi, { options: opts });
  };

  /* ---------- Readiness ---------- */
  const readiness = useMemo(() => {
    const titleOk = !!courseForm.title.trim() && !!courseForm.code.trim();
    const descOk = !!courseForm.description.trim();
    let contentOk: boolean, assessOk: boolean;
    if (isDocument) {
      contentOk = !!(courseForm.documentContent || '').trim();
      assessOk = !!(courseForm.acknowledgmentText || '').trim();
    } else {
      contentOk = courseLessons.length > 0 && courseLessons.every((l) => l.title.trim() && l.content.trim());
      const valid = courseQuiz.filter((q) => q.question.trim());
      assessOk = valid.length === 0 || valid.every((q) => q.options.some((o) => o.trim()) || getQType(q) === 'short_answer');
    }
    const items: { id: string; label: string; ok: boolean; tab: TabId }[] = [
      { id: 'details', label: 'Title & code', ok: titleOk, tab: 'details' },
      { id: 'desc', label: 'Description', ok: descOk, tab: 'details' },
      { id: 'content', label: isDocument ? 'Document body' : 'Lessons & modules', ok: contentOk, tab: 'content' },
      { id: 'assess', label: isDocument ? 'Acknowledgment statement' : courseQuiz.length ? 'Knowledge check quiz' : 'Quiz (optional)', ok: assessOk, tab: 'content' },
      { id: 'access', label: 'Assigned employees', ok: assignedUserEmails.length > 0, tab: 'access' }
    ];
    const completed = items.filter((i) => i.ok).length;
    return { items, completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  }, [courseForm, isDocument, courseLessons, courseQuiz, assignedUserEmails]);

  const tabDone = (id: TabId) =>
    id === 'details' ? !!courseForm.title.trim() && !!courseForm.code.trim()
      : id === 'content' ? (isDocument ? !!(courseForm.documentContent || '').trim() : courseLessons.length > 0)
        : id === 'access' ? assignedUserEmails.length > 0
          : readiness.percent === 100;

  /* ---------- Employees ---------- */
  const employees = useMemo(() => users.filter((u) => u.role === 'employee'), [users]);
  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))), [employees]);
  const assignedCount = useMemo(() => {
    const s = new Set(employees.map((e) => e.email));
    return assignedUserEmails.filter((e) => s.has(e)).length;
  }, [employees, assignedUserEmails]);

  const filtered = useMemo(() => {
    const q = employeeSearch.toLowerCase();
    return employees.filter((e) => {
      const match = e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q);
      const dept = deptFilter === 'All' || e.department === deptFilter;
      const on = assignedUserEmails.includes(e.email);
      return match && dept && (assignTab === 'all' || (assignTab === 'assigned' ? on : !on));
    });
  }, [employees, employeeSearch, deptFilter, assignTab, assignedUserEmails]);

  const selectFiltered = () => { const em = filtered.map((e) => e.email); setAssignedUserEmails((p) => Array.from(new Set([...p, ...em]))); };
  const clearFiltered = () => { const em = new Set(filtered.map((e) => e.email)); setAssignedUserEmails((p) => p.filter((e) => !em.has(e))); };

  const previewCourse: Course = useMemo(() => ({
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
  }), [courseForm, courseLessons, courseQuiz, editingCourseId, isDocument]);

  const attachments = courseForm.attachments || [];

  /* ---------- Render ---------- */
  return (
    <div className="cc">
      <style>{CSS}</style>

      <form id="trainer-course-form" onSubmit={handleSaveCourse}>
        {/* Sticky toolbar */}
        <header className="cc-bar">
          <div className="cc-bar-title">
            <span className="cc-bar-icon">{isDocument ? <FileText size={16} /> : <BookOpen size={16} />}</span>
            <div className="cc-bar-text">
              <strong>{courseForm.title.trim() || (isDocument ? 'New document' : 'New course')}</strong>
              <span>{editingCourseId ? 'Editing' : 'Draft'} · {isDocument ? 'Policy acknowledgment' : 'Interactive course'}</span>
            </div>
          </div>

          <nav className="cc-tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
                className={`cc-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                {tabDone(t.id) && t.id !== 'review' ? <Check size={13} className="cc-tab-ok" /> : t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="cc-bar-actions">
            <div className="cc-meter" title="Publish readiness">
              <div className="cc-meter-track"><div style={{ width: `${readiness.percent}%` }} className={readiness.percent === 100 ? 'full' : ''} /></div>
              <span>{readiness.percent}%</span>
            </div>
            <button type="button" className="cc-btn ghost" onClick={onOpenInventoryModal} title="Course inventory">
              <BookOpen size={14} /> {courses.length}
            </button>
            {editingCourseId && <button type="button" className="cc-btn" onClick={resetCourseFormState}>Cancel</button>}
            <button type="submit" disabled={isUploading} className="cc-btn primary">
              {isUploading ? <RefreshCw size={14} className="cc-spin" /> : editingCourseId ? <Check size={14} /> : <Zap size={14} />}
              {isUploading ? 'Uploading' : editingCourseId ? 'Save' : 'Publish'}
            </button>
          </div>
        </header>

        {/* ===== DETAILS ===== */}
        {tab === 'details' && (
          <div className="cc-grid-main">
            <section className="cc-card">
              <div className="cc-seg" role="radiogroup" aria-label="Content format">
                <button type="button" className={!isDocument ? 'on' : ''} onClick={() => patch({ contentType: 'course' })}>
                  <BookOpen size={14} /> Interactive course
                </button>
                <button type="button" className={isDocument ? 'on' : ''} onClick={() => patch({ contentType: 'document' })}>
                  <FileText size={14} /> Policy & document
                </button>
              </div>

              <div className="cc-fields">
                <label className="cc-f span2">
                  <span>{isDocument ? 'Document title' : 'Course title'} *</span>
                  <input className="cc-in" required value={courseForm.title} onChange={(e) => patch({ title: e.target.value })}
                    placeholder={isDocument ? '2026 Employee Remote Work Policy' : 'Mortgage Origination Fundamentals'} />
                </label>
                <label className="cc-f">
                  <span>{isDocument ? 'Document code' : 'Course code'} *</span>
                  <input className="cc-in" required value={courseForm.code} onChange={(e) => patch({ code: e.target.value })}
                    placeholder={isDocument ? 'DOC-POL-2026' : 'MORT-101'} />
                </label>
                <label className="cc-f">
                  <span>Category</span>
                  <select className="cc-in" value={courseForm.category} onChange={(e) => patch({ category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'AI' ? 'AI / Technology' : c}</option>)}
                  </select>
                </label>
                <label className="cc-f">
                  <span>Level</span>
                  <select className="cc-in" value={courseForm.level} onChange={(e) => patch({ level: e.target.value as any })}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </label>
                <label className="cc-f">
                  <span>Trainer</span>
                  <input className="cc-in" value={courseForm.trainer ?? userSession?.name ?? ''} onChange={(e) => patch({ trainer: e.target.value })}
                    placeholder={userSession?.name || 'Trainer name'} />
                </label>
                <label className="cc-f span2">
                  <span>Description & learning objectives</span>
                  <textarea className="cc-in" rows={3} value={courseForm.description} onChange={(e) => patch({ description: e.target.value })}
                    placeholder={isDocument ? 'Brief overview of what this policy covers...' : 'What learners will be able to do after this course...'} />
                </label>
              </div>

              <label className="cc-switch">
                <input type="checkbox" checked={courseForm.requiresCertification !== false}
                  onChange={(e) => patch({ requiresCertification: e.target.checked })} />
                <Award size={15} />
                <span>Issue certificate on completion</span>
              </label>
            </section>

            <aside className="cc-card cc-side">
              <div className="cc-card-h"><ImageIcon size={14} /> Card cover</div>
              <input ref={cardImageRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCardImageUpload(f); e.target.value = ''; }} />

              {courseForm.imageUrl ? (
                <div className="cc-cover">
                  <img src={courseForm.imageUrl} alt="Course cover" />
                  <div className="cc-cover-actions">
                    <button type="button" className="cc-btn sm" onClick={() => cardImageRef.current?.click()}><CloudUpload size={13} /> Change</button>
                    <button type="button" className="cc-btn sm danger" onClick={() => patch({ imageUrl: '' })}><Trash2 size={13} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`cc-drop ${isDragging ? 'drag' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleCardImageUpload(f); }}
                    onClick={() => cardImageRef.current?.click()}>
                    <CloudUpload size={18} />
                    <div>
                      <strong>{isCardImageUploading ? 'Processing...' : 'Drop an image or click to upload'}</strong>
                      <span>16:9 recommended · PNG, JPG, WebP</span>
                    </div>
                  </div>
                  <div className="cc-chips">
                    {BG_PRESETS.map((p) => (
                      <button key={p.value} type="button" title={p.label} style={{ background: p.gradient }}
                        className={`cc-chip ${courseForm.imgBg === p.value ? 'on' : ''}`} onClick={() => patch({ imgBg: p.value })}>
                        {courseForm.imgBg === p.value && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                  <CourseBannerHeader
                    course={{
                      title: courseForm.title || (isDocument ? 'Document title' : 'Course title'), category: courseForm.category || 'Mortgage',
                      code: courseForm.code || 'CRS-101', imgBg: courseForm.imgBg, contentType: courseForm.contentType
                    }}
                    height="96px" borderRadius="10px" />
                </>
              )}
              <label className="cc-f">
                <span>Or paste image URL</span>
                <input type="url" className="cc-in" placeholder="https://example.com/banner.jpg"
                  value={courseForm.imageUrl || ''} onChange={(e) => patch({ imageUrl: e.target.value })} />
              </label>
            </aside>
          </div>
        )}

        {/* ===== CONTENT ===== */}
        {tab === 'content' && (isDocument ? (
          <section className="cc-card">
            <div className="cc-card-h between">
              <span><FileText size={14} /> Document body *</span>
              <button type="button" className="cc-btn sm" onClick={() => setDocPreview(!docPreview)}>
                <Eye size={13} /> {docPreview ? 'Edit' : 'Reader preview'}
              </button>
            </div>
            {docPreview ? (
              <div className="cc-reader">{courseForm.documentContent || <span className="cc-muted">No document body entered yet.</span>}</div>
            ) : (
              <textarea className="cc-in" rows={14} value={courseForm.documentContent || ''}
                onChange={(e) => patch({ documentContent: e.target.value })}
                placeholder="Type or paste the complete policy text, guidelines, or procedure..." />
            )}
            <label className="cc-f">
              <span>Acknowledgment statement *</span>
              <input className="cc-in" value={courseForm.acknowledgmentText || ''} onChange={(e) => patch({ acknowledgmentText: e.target.value })}
                placeholder="I have read, understood, and agree to the policies outlined in this document." />
              <em>Employees tick this box to confirm.</em>
            </label>
          </section>
        ) : (
          <div className="cc-stack">
            <div className="cc-card-h between cc-plain">
              <span><Layers size={14} /> {courseModules.length} {courseModules.length === 1 ? 'module' : 'modules'} · {courseLessons.length} lessons</span>
              <button type="button" className="cc-btn primary sm" onClick={addModule}><Plus size={13} /> Add module</button>
            </div>

            {courseModules.map((m, mIdx) => {
              const modLessons = courseLessons.filter((l) => l.moduleId === m.id || (!l.moduleId && mIdx === 0));
              return (
                <section key={m.id} className="cc-card cc-module">
                  <div className="cc-module-h">
                    <span className="cc-badge">M{mIdx + 1}</span>
                    <input className="cc-in cc-title-in" value={m.title} placeholder="Module title"
                      onChange={(e) => {
                        const t = e.target.value;
                        setCourseModules((p) => p.map((i) => (i.id === m.id ? { ...i, title: t } : i)));
                        setCourseLessons((p) => p.map((l) => (l.moduleId === m.id ? { ...l, moduleTitle: t } : l)));
                      }} />
                    <span className="cc-count">{modLessons.length}</span>
                    <button type="button" className="cc-btn sm" onClick={() => addLesson(m, modLessons.length)}><Plus size={13} /> Lesson</button>
                    {courseModules.length > 1 && (
                      <button type="button" className="cc-ico danger" title="Delete module"
                        onClick={() => {
                          const rest = courseModules.filter((i) => i.id !== m.id);
                          setCourseLessons((p) => p.map((l) => (l.moduleId === m.id ? { ...l, moduleId: rest[0].id, moduleTitle: rest[0].title } : l)));
                          setCourseModules(rest);
                          showToast(`Deleted Module ${mIdx + 1}`);
                        }}><Trash2 size={14} /></button>
                    )}
                  </div>

                  {modLessons.length === 0 ? (
                    <button type="button" className="cc-empty" onClick={() => addLesson(m, 0)}>
                      <Plus size={14} /> Add the first lesson
                    </button>
                  ) : (
                    <div className="cc-lessons">
                      {modLessons.map((lesson, li) => {
                        const gi = courseLessons.indexOf(lesson);
                        const open = expanded[gi] ?? false;
                        return (
                          <div key={gi} className={`cc-lesson ${open ? 'open' : ''}`}>
                            <div className="cc-lesson-h" onClick={() => setExpanded((p) => ({ ...p, [gi]: !p[gi] }))}>
                              <span className="cc-badge soft">L{li + 1}</span>
                              <span className="cc-lesson-t">{lesson.title || 'Untitled lesson'}</span>
                              {lesson.videoUrl && <span className="cc-vid"><Play size={11} /> Video</span>}
                              <div className="cc-lesson-a" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="cc-ico" disabled={gi === 0} onClick={() => moveLesson(gi, 'up')} title="Move up"><ArrowUp size={13} /></button>
                                <button type="button" className="cc-ico" disabled={gi === courseLessons.length - 1} onClick={() => moveLesson(gi, 'down')} title="Move down"><ArrowDown size={13} /></button>
                                <button type="button" className="cc-ico danger" disabled={courseLessons.length === 1}
                                  onClick={() => setCourseLessons((p) => p.filter((_, x) => x !== gi))} title="Delete lesson"><Trash2 size={13} /></button>
                              </div>
                              {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </div>
                            {open && (
                              <div className="cc-lesson-b">
                                <div className="cc-fields">
                                  <label className="cc-f"><span>Lesson title</span>
                                    <input className="cc-in" value={lesson.title} onChange={(e) => updateLesson(gi, 'title', e.target.value)} />
                                  </label>
                                  <label className="cc-f"><span>Module</span>
                                    <select className="cc-in" value={lesson.moduleId || m.id}
                                      onChange={(e) => {
                                        const t = courseModules.find((i) => i.id === e.target.value);
                                        setCourseLessons((p) => {
                                          const c = [...p];
                                          c[gi] = { ...c[gi], moduleId: e.target.value, moduleTitle: t ? t.title : m.title };
                                          return c;
                                        });
                                      }}>
                                      {courseModules.map((mi, x) => <option key={mi.id} value={mi.id}>M{x + 1}: {mi.title}</option>)}
                                    </select>
                                  </label>
                                  <label className="cc-f span2">
                                    <span className="cc-between">Video URL (YouTube, Vimeo, MP4)
                                      {lesson.videoUrl && <button type="button" className="cc-link" onClick={() => setVideoModal(lesson.videoUrl || null)}><Play size={11} /> Test player</button>}
                                    </span>
                                    <input type="url" className="cc-in" value={lesson.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..."
                                      onChange={(e) => updateLesson(gi, 'videoUrl', e.target.value)} />
                                  </label>
                                  <label className="cc-f span2"><span>Reading content</span>
                                    <textarea className="cc-in" rows={4} value={lesson.content} placeholder="Reading material for this lesson..."
                                      onChange={(e) => updateLesson(gi, 'content', e.target.value)} />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Quiz */}
            <section className="cc-card">
              <div className="cc-card-h between">
                <span><Award size={14} /> Knowledge check <em className="cc-tag">Optional</em> <em className="cc-tag warn">{courseQuiz.length} questions</em></span>
                <div className="cc-row">
                  {courseQuiz.length > 0 && (
                    <>
                      <button type="button" className="cc-btn sm" onClick={() => setQuizTest(!quizTest)}><HelpCircle size={13} /> {quizTest ? 'Edit' : 'Test'}</button>
                      <button type="button" className="cc-btn sm danger" onClick={() => setCourseQuiz([])}><Trash2 size={13} /> Clear</button>
                    </>
                  )}
                  <button type="button" className="cc-btn sm primary" onClick={addQuizQuestionField}><Plus size={13} /> Question</button>
                </div>
              </div>

              {courseQuiz.length === 0 ? (
                <p className="cc-muted cc-note">No quiz yet. Learners will complete the course by reviewing all lessons.</p>
              ) : quizTest ? (
                <div className="cc-stack tight">
                  {courseQuiz.map((q, qi) => {
                    const t = getQType(q);
                    const opts = t === 'true_false' ? ['True', 'False'] : q.options || [];
                    return (
                      <div key={qi} className="cc-q">
                        <div className="cc-q-t">Q{qi + 1}. {q.question || 'Untitled question'}</div>
                        {t === 'short_answer' ? (
                          <>
                            <input className="cc-in" placeholder="Type answer..." onChange={(e) => setQuizAnswers((p) => ({ ...p, [qi]: e.target.value }))} />
                            <em className="cc-muted">Expected: <strong>{q.answerText || 'None'}</strong></em>
                          </>
                        ) : (
                          <div className="cc-row wrap">
                            {opts.map((opt, oi) => {
                              const sel = quizAnswers[qi] === oi;
                              const ok = q.correctAnswer === oi;
                              return (
                                <button key={oi} type="button" className={`cc-opt ${sel ? (ok ? 'ok' : 'bad') : ''}`}
                                  onClick={() => setQuizAnswers((p) => ({ ...p, [qi]: oi }))}>
                                  <b>{String.fromCharCode(65 + oi)}</b> {opt}{sel && (ok ? ' ✓' : ' ✕')}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="cc-stack tight">
                  {courseQuiz.map((q, qi) => {
                    const t = getQType(q);
                    return (
                      <div key={qi} className="cc-q">
                        <div className="cc-row">
                          <span className="cc-badge warn">Q{qi + 1}</span>
                          <select className="cc-in cc-w-type" value={t} onChange={(e) => updateQuizType(qi, e.target.value as any)}>
                            <option value="multiple_choice">Multiple choice</option>
                            <option value="true_false">True / False</option>
                            <option value="short_answer">Short answer</option>
                          </select>
                          <input className="cc-in grow" value={q.question} placeholder="Question text..." onChange={(e) => updateQuiz(qi, { question: e.target.value })} />
                          <button type="button" className="cc-ico danger" onClick={() => removeQuizQuestionField(qi)} title="Remove question"><Trash2 size={14} /></button>
                        </div>
                        {t === 'short_answer' ? (
                          <input className="cc-in" value={q.answerText || ''} placeholder="Expected answer (e.g. Underwriting)"
                            onChange={(e) => updateQuiz(qi, { answerText: e.target.value } as any)} />
                        ) : t === 'true_false' ? (
                          <div className="cc-row">
                            <span className="cc-muted">Correct answer:</span>
                            {['True', 'False'].map((l, oi) => (
                              <button key={l} type="button" className={`cc-opt ${q.correctAnswer === oi ? 'ok' : ''}`} onClick={() => updateQuiz(qi, { correctAnswer: oi })}>{l}</button>
                            ))}
                          </div>
                        ) : (
                          <div className="cc-opts">
                            {(q.options || ['', '', '', '']).map((opt, oi) => (
                              <div key={oi} className={`cc-optrow ${q.correctAnswer === oi ? 'ok' : ''}`}>
                                <button type="button" title="Mark as correct" onClick={() => updateQuiz(qi, { correctAnswer: oi })}>{String.fromCharCode(65 + oi)}</button>
                                <input className="cc-in" value={opt} placeholder={`Option ${String.fromCharCode(65 + oi)}`} onChange={(e) => updateQuizOption(qi, oi, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ))}

        {/* ===== ACCESS ===== */}
        {tab === 'access' && (
          <div className="cc-grid-access">
            <section className="cc-card">
              <div className="cc-card-h between">
                <span><Paperclip size={14} /> Attachments</span>
                <em className="cc-tag">{attachments.length} file{attachments.length === 1 ? '' : 's'}</em>
              </div>
              <div className="cc-drop file">
                <input type="file" multiple disabled={isUploading} onChange={(e) => handleFileUpload(e.target.files)} />
                {isUploading ? <RefreshCw size={18} className="cc-spin" /> : <CloudUpload size={18} />}
                <div>
                  <strong>{isUploading ? 'Uploading...' : 'Drop files or browse'}</strong>
                  <span>PDF, MP4, DOCX, XLSX, ZIP</span>
                </div>
              </div>
              {attachments.length === 0 ? (
                <p className="cc-muted cc-note">No reference files yet. Handbooks and guides are optional.</p>
              ) : (
                <ul className="cc-files">
                  {attachments.map((f, i) => {
                    const b = getFileBadge(f.name);
                    return (
                      <li key={i}>
                        <span className="cc-ft" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                        <div><strong title={f.name}>{f.name}</strong><span>{(f.size / 1024).toFixed(1)} KB</span></div>
                        {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="cc-ico" title="Open"><Eye size={13} /></a>}
                        <button type="button" className="cc-ico danger" onClick={() => removeAttachment(i)} title="Remove"><Trash2 size={13} /></button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="cc-card">
              <div className="cc-card-h between">
                <span><Users size={14} /> Assign employees</span>
                <em className="cc-tag ok">{assignedUserEmails.length} enrolled · {employees.length ? Math.round((assignedCount / employees.length) * 100) : 0}%</em>
              </div>

              <div className="cc-row wrap between">
                <div className="cc-pills">
                  {([['all', `All ${employees.length}`], ['assigned', `Enrolled ${assignedCount}`], ['unassigned', `Open ${employees.length - assignedCount}`]] as const).map(([k, l]) => (
                    <button key={k} type="button" className={assignTab === k ? 'on' : ''} onClick={() => setAssignTab(k)}>{l}</button>
                  ))}
                </div>
                <div className="cc-row">
                  <button type="button" className="cc-btn sm" onClick={selectFiltered}>Select {filtered.length}</button>
                  <button type="button" className="cc-btn sm danger" onClick={clearFiltered}>Clear</button>
                </div>
              </div>

              <div className="cc-row">
                <div className="cc-search grow">
                  <Search size={14} />
                  <input className="cc-in" placeholder="Search name, email, department..." value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
                  {employeeSearch && <button type="button" onClick={() => setEmployeeSearch('')}><X size={13} /></button>}
                </div>
                <select className="cc-in cc-w-dept" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="All">All departments</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="cc-people">
                {filtered.map((emp) => {
                  const on = assignedUserEmails.includes(emp.email);
                  return (
                    <label key={emp.email} className={`cc-person ${on ? 'on' : ''}`}>
                      <input type="checkbox" checked={on}
                        onChange={(e) => setAssignedUserEmails((p) => (e.target.checked ? [...p, emp.email] : p.filter((x) => x !== emp.email)))} />
                      <span className="cc-av" style={{ background: avatarColor(emp.name) }}>{getInitials(emp.name)}</span>
                      <div><strong>{emp.name}</strong><span>{emp.department ? `${emp.department} · ` : ''}{emp.email}</span></div>
                    </label>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="cc-empty-box">
                    <Users size={20} />
                    <span>No employees match these filters.</span>
                    <button type="button" className="cc-btn sm" onClick={() => { setEmployeeSearch(''); setDeptFilter('All'); setAssignTab('all'); }}>Reset filters</button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ===== REVIEW ===== */}
        {tab === 'review' && (
          <div className="cc-grid-review">
            <section className="cc-card">
              <div className="cc-card-h">
                <CheckCircle2 size={14} /> Publish checklist ({readiness.completed}/{readiness.total})
              </div>
              <ul className="cc-check">
                {readiness.items.map((it) => (
                  <li key={it.id} className={it.ok ? 'ok' : ''}>
                    {it.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{it.label}</span>
                    {!it.ok && <button type="button" className="cc-link" onClick={() => setTab(it.tab)}>Fix</button>}
                  </li>
                ))}
              </ul>
              <div className="cc-row">
                {editingCourseId && <button type="button" className="cc-btn grow" onClick={resetCourseFormState}>Cancel edit</button>}
                <button type="submit" disabled={isUploading} className="cc-btn primary grow">
                  {editingCourseId ? <Check size={14} /> : <Zap size={14} />} {editingCourseId ? 'Save changes' : 'Publish'}
                </button>
              </div>
            </section>
            <div>
              <div className="cc-card-h cc-plain"><Eye size={14} /> Catalog card preview</div>
              <CourseCard course={previewCourse} variant="trainer" />
            </div>
          </div>
        )}

        <div className="as-sticky-save">
          <button type="submit" disabled={isUploading} className="as-btn as-btn--primary as-btn--full" style={{ borderRadius: 0, height: 46 }}>
            <Zap size={16} /> {isUploading ? 'Uploading...' : editingCourseId ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </form>

      {videoModal && (
        <div className="cc-modal" onClick={() => setVideoModal(null)}>
          <div className="cc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-h">
              <span><Play size={13} /> Video preview</span>
              <button type="button" onClick={() => setVideoModal(null)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="cc-ratio">
              <iframe src={getEmbedUrl(videoModal)} title="Lesson video" allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CSS = `
.cc{--p:var(--as-primary,#a31555);--ps:var(--as-primary-soft,#fdf2f8);--ln:var(--as-line,#e5e9f0);--ink:var(--as-ink,#0f172a);--mu:#64748b;--good:var(--as-good,#16a34a);--warn:var(--as-warn,#d97706);
  font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;color:var(--ink);padding-bottom:3rem}
.cc *{box-sizing:border-box}
.cc button{font-family:inherit;cursor:pointer}
.cc button:disabled{opacity:.4;cursor:not-allowed}
.cc :focus-visible{outline:2px solid var(--p);outline-offset:1px}

/* toolbar */
.cc-bar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:.9rem;padding:.5rem .75rem;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border:1px solid var(--ln);border-radius:12px;margin-bottom:.9rem;flex-wrap:wrap}
.cc-bar-title{display:flex;align-items:center;gap:.6rem;min-width:0;flex:1 1 200px}
.cc-bar-icon{width:30px;height:30px;border-radius:8px;background:var(--ps);color:var(--p);display:grid;place-items:center;flex-shrink:0}
.cc-bar-text{display:flex;flex-direction:column;min-width:0}
.cc-bar-text strong{font-size:13.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-bar-text span{font-size:11px;color:var(--mu)}
.cc-tabs{display:flex;gap:2px;background:#f1f5f9;padding:3px;border-radius:9px}
.cc-tab{display:inline-flex;align-items:center;gap:.35rem;border:0;background:transparent;color:var(--mu);font-size:12px;font-weight:550;padding:.38rem .7rem;border-radius:7px;white-space:nowrap}
.cc-tab:hover{color:var(--ink)}
.cc-tab.on{background:#fff;color:var(--p);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.cc-tab-ok{color:var(--good)}
.cc-bar-actions{display:flex;align-items:center;gap:.4rem;margin-left:auto}
.cc-meter{display:flex;align-items:center;gap:.4rem;font-size:11px;font-weight:650;color:var(--mu);margin-right:.2rem}
.cc-meter-track{width:56px;height:5px;background:#e8edf3;border-radius:9px;overflow:hidden}
.cc-meter-track div{height:100%;background:var(--p);border-radius:9px;transition:width .25s}
.cc-meter-track div.full{background:var(--good)}
@media(max-width:900px){.cc-tabs{order:3;width:100%;overflow-x:auto}.cc-tab span{display:inline}.cc-bar-actions{margin-left:0}}

/* buttons */
.cc-btn{display:inline-flex;align-items:center;gap:.35rem;height:30px;padding:0 .7rem;border-radius:8px;border:1px solid var(--ln);background:#fff;color:var(--ink);font-size:12px;font-weight:600;white-space:nowrap}
.cc-btn:hover:not(:disabled){background:#f8fafc;border-color:#cbd5e1}
.cc-btn.sm{height:26px;padding:0 .55rem;font-size:11.5px}
.cc-btn.ghost{border-color:transparent;background:transparent;color:var(--mu)}
.cc-btn.primary{background:var(--p);border-color:var(--p);color:#fff}
.cc-btn.primary:hover:not(:disabled){filter:brightness(1.08);background:var(--p)}
.cc-btn.danger{color:#dc2626}
.cc-btn.grow{flex:1;justify-content:center}
.cc-ico{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:7px;border:0;background:transparent;color:var(--mu)}
.cc-ico:hover:not(:disabled){background:#f1f5f9;color:var(--ink)}
.cc-ico.danger:hover:not(:disabled){background:#fef2f2;color:#dc2626}
.cc-link{border:0;background:none;color:var(--p);font-size:11.5px;font-weight:600;padding:0;display:inline-flex;align-items:center;gap:.2rem}
.cc-spin{animation:cc-spin 1.1s linear infinite}
@keyframes cc-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.cc-spin{animation:none}}

/* layout */
.cc-grid-main{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:.9rem;align-items:start}
.cc-grid-access{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:.9rem;align-items:start}
.cc-grid-review{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:.9rem;align-items:start}
@media(max-width:900px){.cc-grid-main,.cc-grid-access,.cc-grid-review{grid-template-columns:1fr}}
.cc-side{position:sticky;top:64px}
@media(max-width:900px){.cc-side{position:static}}
.cc-stack{display:flex;flex-direction:column;gap:.7rem}
.cc-stack.tight{gap:.5rem}
.cc-card{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:.85rem;display:flex;flex-direction:column;gap:.7rem;min-width:0}
.cc-card-h{display:flex;align-items:center;gap:.4rem;font-size:12.5px;font-weight:650}
.cc-card-h>span{display:inline-flex;align-items:center;gap:.4rem;flex-wrap:wrap}
.cc-card-h.between{justify-content:space-between}
.cc-card-h svg{color:var(--p)}
.cc-plain{background:none;border:0;padding:0}
.cc-row{display:flex;align-items:center;gap:.4rem}
.cc-row.wrap{flex-wrap:wrap}.cc-row.between{justify-content:space-between}
.grow{flex:1;min-width:0}
.cc-between{display:flex;justify-content:space-between;align-items:center}
.cc-muted{color:var(--mu)}
.cc-note{font-size:12px;margin:0;padding:.7rem;background:#f8fafc;border-radius:8px;text-align:center}
.cc-tag{font-style:normal;font-size:10.5px;font-weight:650;padding:.1rem .45rem;border-radius:99px;background:#f1f5f9;color:var(--mu)}
.cc-tag.warn{background:#fff7ed;color:var(--warn)}.cc-tag.ok{background:#f0fdf4;color:var(--good)}
.cc-badge{font-size:10.5px;font-weight:750;padding:.15rem .4rem;border-radius:6px;background:var(--p);color:#fff;white-space:nowrap}
.cc-badge.soft{background:var(--ps);color:var(--p)}.cc-badge.warn{background:#fff7ed;color:var(--warn)}

/* form */
.cc-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.6rem}
.cc-f{display:flex;flex-direction:column;gap:.25rem;min-width:0}
.cc-f.span2,.cc-fields .span2{grid-column:1/-1}
.cc-f>span{font-size:11.5px;font-weight:600;color:#475569}
.cc-f em{font-size:11px;color:var(--mu);font-style:normal}
.cc-in{width:100%;height:32px;padding:0 .6rem;border:1px solid var(--ln);border-radius:8px;background:#fff;color:var(--ink);font:inherit;font-size:12.5px}
textarea.cc-in{height:auto;padding:.5rem .6rem;line-height:1.5;resize:vertical}
.cc-in:hover{border-color:#cbd5e1}.cc-in:focus{border-color:var(--p);outline:0;box-shadow:0 0 0 3px var(--ps)}
.cc-title-in{font-weight:650;height:30px}
.cc-w-type{width:150px;flex-shrink:0}.cc-w-dept{width:160px;flex-shrink:0}
.cc-seg{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#f1f5f9;padding:3px;border-radius:9px}
.cc-seg button{display:flex;align-items:center;justify-content:center;gap:.4rem;border:0;background:transparent;border-radius:7px;padding:.45rem;font-size:12px;font-weight:600;color:var(--mu)}
.cc-seg button.on{background:#fff;color:var(--p);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.cc-switch{display:flex;align-items:center;gap:.5rem;padding:.55rem .7rem;border:1px solid var(--ln);border-radius:9px;background:#f8fafc;font-size:12.5px;font-weight:600;cursor:pointer}
.cc-switch input{accent-color:var(--p);width:15px;height:15px}.cc-switch svg{color:var(--p)}

/* cover */
.cc-cover{position:relative;height:120px;border-radius:9px;overflow:hidden;background:#0f172a}
.cc-cover img{width:100%;height:100%;object-fit:cover}
.cc-cover-actions{position:absolute;right:6px;bottom:6px;display:flex;gap:4px}
.cc-drop{position:relative;display:flex;align-items:center;gap:.65rem;padding:.7rem .8rem;border:1.5px dashed #cbd5e1;border-radius:10px;background:#f8fafc;color:var(--mu);cursor:pointer}
.cc-drop:hover,.cc-drop.drag{border-color:var(--p);background:var(--ps);color:var(--p)}
.cc-drop div{display:flex;flex-direction:column;line-height:1.35}
.cc-drop strong{font-size:12px;color:var(--ink)}.cc-drop span{font-size:11px;color:var(--mu)}
.cc-drop.file input{position:absolute;inset:0;opacity:0;cursor:pointer}
.cc-chips{display:flex;gap:.35rem}
.cc-chip{width:24px;height:24px;border-radius:7px;border:2px solid transparent;display:grid;place-items:center;color:#fff}
.cc-chip.on{border-color:var(--ink)}

/* modules */
.cc-module{border-left:3px solid var(--p)}
.cc-module-h{display:flex;align-items:center;gap:.45rem}
.cc-count{font-size:11px;font-weight:650;color:var(--mu);background:#f1f5f9;border-radius:99px;padding:.1rem .45rem}
.cc-lessons{display:flex;flex-direction:column;gap:.35rem}
.cc-lesson{border:1px solid var(--ln);border-radius:9px;overflow:hidden}
.cc-lesson.open{border-color:#cbd5e1}
.cc-lesson-h{display:flex;align-items:center;gap:.5rem;padding:.35rem .55rem;cursor:pointer;background:#f8fafc;color:var(--mu)}
.cc-lesson-h:hover{background:#f1f5f9}
.cc-lesson-t{flex:1;min-width:0;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-vid{display:inline-flex;align-items:center;gap:.2rem;font-size:11px;color:#059669}
.cc-lesson-a{display:flex;gap:0}
.cc-lesson-b{padding:.7rem;border-top:1px solid var(--ln)}
.cc-empty{display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.7rem;border:1.5px dashed #cbd5e1;border-radius:9px;background:#f8fafc;color:var(--mu);font-size:12px;font-weight:600}
.cc-empty:hover{border-color:var(--p);color:var(--p)}
.cc-reader{padding:.9rem;border:1px solid var(--ln);border-radius:9px;min-height:200px;white-space:pre-wrap;line-height:1.6;font-size:13px}

/* quiz */
.cc-q{border:1px solid var(--ln);border-radius:9px;padding:.6rem;display:flex;flex-direction:column;gap:.5rem;background:#fcfdfe}
.cc-q-t{font-weight:650;font-size:12.5px}
.cc-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.4rem}
.cc-optrow{display:flex;align-items:center;gap:.4rem;padding:.25rem;border:1px solid var(--ln);border-radius:9px;background:#fff}
.cc-optrow.ok{border-color:var(--good);background:#f0fdf4}
.cc-optrow button{width:22px;height:22px;border-radius:50%;border:0;background:#cbd5e1;color:#fff;font-size:11px;font-weight:750;flex-shrink:0}
.cc-optrow.ok button{background:var(--good)}
.cc-optrow .cc-in{height:28px;border-color:transparent;background:transparent}
.cc-opt{display:inline-flex;align-items:center;gap:.35rem;padding:.35rem .7rem;border:1px solid var(--ln);border-radius:8px;background:#fff;font-size:12px;font-weight:550}
.cc-opt.ok{border-color:var(--good);background:#f0fdf4;color:#166534}
.cc-opt.bad{border-color:#dc2626;background:#fef2f2;color:#991b1b}

/* people & files */
.cc-pills{display:flex;background:#f1f5f9;padding:2px;border-radius:8px}
.cc-pills button{border:0;background:transparent;padding:.2rem .55rem;border-radius:6px;font-size:11.5px;font-weight:600;color:var(--mu)}
.cc-pills button.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.cc-search{position:relative;display:flex;align-items:center}
.cc-search>svg{position:absolute;left:9px;color:var(--mu)}
.cc-search .cc-in{padding-left:28px;padding-right:26px}
.cc-search button{position:absolute;right:6px;border:0;background:none;color:var(--mu);display:grid}
.cc-people{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.4rem;max-height:340px;overflow-y:auto;padding:2px}
.cc-person{display:flex;align-items:center;gap:.5rem;padding:.4rem .5rem;border:1px solid var(--ln);border-radius:9px;cursor:pointer;background:#fff;min-width:0}
.cc-person:hover{border-color:#cbd5e1}.cc-person.on{border-color:var(--p);background:var(--ps)}
.cc-person input{accent-color:var(--p);width:14px;height:14px;flex-shrink:0}
.cc-av{width:26px;height:26px;border-radius:50%;color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center;flex-shrink:0}
.cc-person div,.cc-files div{display:flex;flex-direction:column;min-width:0;flex:1;line-height:1.3}
.cc-person strong,.cc-files strong{font-size:12px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-person span,.cc-files span{font-size:10.5px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cc-empty-box{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:1.2rem;color:var(--mu);background:#f8fafc;border:1px dashed #cbd5e1;border-radius:9px}
.cc-files{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.35rem}
.cc-files li{display:flex;align-items:center;gap:.5rem;padding:.4rem .5rem;border:1px solid var(--ln);border-radius:9px}
.cc-ft{font-size:10px;font-weight:800;padding:.2rem .35rem;border-radius:5px;flex-shrink:0}

/* review */
.cc-check{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.3rem}
.cc-check li{display:flex;align-items:center;gap:.5rem;padding:.45rem .6rem;border:1px solid var(--ln);border-radius:8px;color:var(--warn);font-weight:550}
.cc-check li span{flex:1}
.cc-check li.ok{color:var(--ink)}.cc-check li.ok svg{color:var(--good)}

/* modal */
.cc-modal{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.7);display:grid;place-items:center;padding:1rem}
.cc-modal-box{width:100%;max-width:760px;background:#000;border-radius:12px;overflow:hidden}
.cc-modal-h{display:flex;justify-content:space-between;align-items:center;padding:.5rem .8rem;background:#1e293b;color:#fff;font-size:12.5px;font-weight:650}
.cc-modal-h span{display:inline-flex;align-items:center;gap:.4rem}
.cc-modal-h button{border:0;background:none;color:#fff;display:grid}
.cc-ratio{position:relative;padding-bottom:56.25%;height:0}
.cc-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
`;
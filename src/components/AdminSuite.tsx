import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import type { UserSessionData, UserRole } from '../services/auth';
import type { Course, Lesson, QuizQuestion, UserProgress, Department, SystemSettings, RolePermissions, DatabaseUser } from '../services/db';
import { CourseCard } from './courses/CourseCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminSuiteProps {
  userSession: UserSessionData;
  userPerms: RolePermissions['permissions'] | undefined;
  activeInnerTab: string;
  setActiveInnerTab: (tab: string) => void;
  courses: Course[];
  users: DatabaseUser[];
  departments: Department[];
  permissions: RolePermissions[];
  settings: SystemSettings;
  teamProgress: Record<string, UserProgress[]>;
  editingCourseId: string | null;
  assignedUserEmails: string[];
  setAssignedUserEmails: React.Dispatch<React.SetStateAction<string[]>>;
  courseForm: {
    title: string;
    category: string;
    code: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    imgBg: string;
    attachments?: { name: string; url: string; size: number }[];
  };
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  courseLessons: Omit<Lesson, 'id'>[];
  setCourseLessons: React.Dispatch<React.SetStateAction<any[]>>;
  courseQuiz: QuizQuestion[];
  setCourseQuiz: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  courseModules: { id: string; title: string }[];
  setCourseModules: React.Dispatch<React.SetStateAction<{ id: string; title: string }[]>>;
  adminUserForm: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
  };
  setAdminUserForm: React.Dispatch<React.SetStateAction<any>>;
  newDeptName: string;
  setNewDeptName: (name: string) => void;
  handleSaveCourse: (e: React.FormEvent) => Promise<void>;
  handleStartEditCourse: (course: Course) => void;
  handleDeleteCourse: (id: string) => Promise<void>;
  handleAssignCourse: (courseId: string, email: string) => Promise<void>;
  handleCreateUser: (e: React.FormEvent) => Promise<void>;
  handleAddDept: (e: React.FormEvent) => void;
  handleUpdateUserDept: (email: string, dept: string) => Promise<void>;
  handleUpdateUserRole: (email: string, role: UserRole) => Promise<void>;
  handleDeleteUser: (email: string) => Promise<void>;
  handlePermissionToggle: (role: UserRole, permissionKey: keyof RolePermissions['permissions']) => void;
  handleSaveSettings: (updatedSettings: Partial<SystemSettings>) => void;
  addQuizQuestionField: () => void;
  removeQuizQuestionField: (idx: number) => void;
  setEditingCourseId: (id: string | null) => void;
  showToast: (msg: string) => void;
  loadPlatformData: () => Promise<void>;
}

export const AdminSuite: React.FC<AdminSuiteProps> = ({
  userSession,
  userPerms,
  activeInnerTab,
  setActiveInnerTab,
  courses,
  users,
  departments,
  permissions,
  settings,
  teamProgress,
  editingCourseId,
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
  adminUserForm,
  setAdminUserForm,
  newDeptName,
  setNewDeptName,
  handleSaveCourse,
  handleStartEditCourse,
  handleDeleteCourse,
  handleAssignCourse,
  handleCreateUser,
  handleAddDept,
  handleUpdateUserDept,
  handleUpdateUserRole,
  handleDeleteUser,
  handlePermissionToggle,
  handleSaveSettings,
  addQuizQuestionField,
  removeQuizQuestionField,
  setEditingCourseId,
  showToast,
  loadPlatformData
}) => {
  const [isUploading, setIsUploading] = React.useState(false);
  return (
    <div className="koruna-subview-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="koruna-section-title" style={{ marginBottom: '0.5rem' }}>
          {userSession.role === 'trainer' ? 'Trainer Control Suite' : 'Trainer & Administrator Control Suite'}
        </h2>
        <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.95rem' }}>
          {userSession.role === 'trainer'
            ? 'Create and manage courses, lessons, quizzes, and certificate templates.'
            : 'Configure database settings, audit enterprise modules, verify user roles, and structure certificates templates.'}
        </p>
      </div>

      {/* Sub tabs for Admin Suite */}
      <div className="koruna-inner-tab-bar">
        {userPerms?.editCourses && (
          <>
            <button className={`koruna-inner-tab ${activeInnerTab === 'creator' ? 'active' : ''}`} onClick={() => setActiveInnerTab('creator')}>
              Course Creator
            </button>
            <button className={`koruna-inner-tab ${activeInnerTab === 'certificate_templates' ? 'active' : ''}`} onClick={() => setActiveInnerTab('certificate_templates')}>
              Certificate templates
            </button>
          </>
        )}
        {userPerms?.assignCourses && (
          <button className={`koruna-inner-tab ${activeInnerTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveInnerTab('assignments')}>
            Course Assignments
          </button>
        )}
        {userPerms?.manageUsers && (
          <>
            <button className={`koruna-inner-tab ${activeInnerTab === 'users' ? 'active' : ''}`} onClick={() => setActiveInnerTab('users')}>
              User Directory
            </button>
            <button className={`koruna-inner-tab ${activeInnerTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveInnerTab('permissions')}>
              Permissions Matrix
            </button>
          </>
        )}
        {userPerms?.systemSettings && (
          <button className={`koruna-inner-tab ${activeInnerTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveInnerTab('settings')}>
            Platform Settings
          </button>
        )}
      </div>

      {/* SECTION 10.1: COURSE CREATOR (TRAINER/ADMIN) */}
      {activeInnerTab === 'creator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Add/Edit Course Form */}
          <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingCourseId ? 'Edit Selected Course' : 'Create New Course'}
            </h3>

            <form onSubmit={handleSaveCourse}>
              <div className="koruna-form-grid">
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Course Title</label>
                  <input
                    type="text"
                    className="koruna-input-text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g. Income Underwriting Basics"
                  />
                </div>
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Course Code</label>
                  <input
                    type="text"
                    className="koruna-input-text"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    placeholder="e.g. MORT-105"
                  />
                </div>
              </div>

              <div className="koruna-form-grid">
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Category</label>
                  <select
                    className="koruna-input-text"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  >
                    <option value="Mortgage">Mortgage</option>
                    <option value="Lending">Lending</option>
                    <option value="Operations">Operations</option>
                    <option value="AI">AI / Technology</option>
                  </select>
                </div>
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Level</label>
                  <select
                    className="koruna-input-text"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="koruna-form-control" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Description</label>
                <textarea
                  className="koruna-textarea"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Enter summary of skills taught..."
                />
              </div>

              {/* ATTACHMENT UPLOADER FOR MULTIPLE FILES */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Supplementary Material / Course Resources (Multiple Files)
                </label>
                <div style={{
                  border: '2px dashed var(--koruna-border-color)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                   <input
                    type="file"
                    multiple
                    disabled={isUploading}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files) return;
                      
                      setIsUploading(true);
                      try {
                        const uploadPromises = Array.from(files).map(async (file) => {
                          if (isSupabaseConfigured()) {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                            const filePath = `course-attachments/${fileName}`;
                            
                            const { error } = await supabase.storage
                              .from('course-documents')
                              .upload(filePath, file, {
                                cacheControl: '3600',
                                upsert: false
                              });
                              
                            if (error) {
                              console.error('Supabase storage upload failed:', error.message);
                              throw new Error(`Upload failed for ${file.name}: ${error.message}`);
                            }
                            
                            const { data: urlData } = supabase.storage
                              .from('course-documents')
                              .getPublicUrl(filePath);
                              
                            return {
                              name: file.name,
                              url: urlData.publicUrl,
                              size: file.size
                            };
                          } else {
                            // Fallback to local Base64 URL (demo mode)
                            return new Promise<{ name: string; url: string; size: number }>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                resolve({
                                  name: file.name,
                                  url: reader.result as string,
                                  size: file.size
                                });
                              };
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
                        showToast(`Successfully uploaded ${uploadedFiles.length} file(s).`);
                      } catch (err: any) {
                        alert(err.message || 'An error occurred during file upload.');
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: isUploading ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--koruna-text-muted)', fontWeight: 600 }}>
                    {isUploading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={16} style={{ animation: 'spin 1.2s linear infinite' }} /> Uploading resources... Please wait.
                      </span>
                    ) : (
                      <>📁 Drag & drop resources, or <span style={{ color: 'var(--koruna-primary)', textDecoration: 'underline' }}>browse files</span></>
                    )}
                  </span>
                </div>

                {/* Uploaded attachments list */}
                {courseForm.attachments && courseForm.attachments.length > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {courseForm.attachments.map((file, fileIdx) => (
                      <div
                        key={fileIdx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          background: '#ffffff',
                          border: '1px solid var(--koruna-border-color)',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: '80%',
                          fontWeight: 500
                        }}>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseForm((prev: any) => ({
                              ...prev,
                              attachments: prev.attachments.filter((_: any, idx: number) => idx !== fileIdx)
                            }));
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SELECT EMPLOYEES TO ASSIGN COURSE TO */}
              <div style={{ borderTop: '1px solid var(--koruna-border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Assign to Employee Accounts:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--koruna-border-color)', padding: '0.75rem', borderRadius: '8px' }}>
                  {users.filter(u => u.role === 'employee').map(emp => {
                    const isChecked = assignedUserEmails.includes(emp.email);
                    return (
                      <label key={emp.email} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedUserEmails(prev => [...prev, emp.email]);
                            } else {
                              setAssignedUserEmails(prev => prev.filter(email => email !== emp.email));
                            }
                          }}
                        />
                        <span>{emp.name} ({emp.email})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* COURSE MODULES EDITOR */}
              <div style={{ borderTop: '1px solid var(--koruna-border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Course Modules ({courseModules.length})</label>
                  <button
                    type="button"
                    className="btn-koruna-outline"
                    style={{ height: '28px', padding: '0 0.5rem', fontSize: '0.7rem' }}
                    onClick={() => {
                      const nextId = `m${courseModules.length + 1}`;
                      setCourseModules(prev => [...prev, { id: nextId, title: `Module ${prev.length + 1}` }]);
                    }}
                  >
                    + Add Module
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '0.5rem' }}>
                  {courseModules.map((m) => (
                    <div key={m.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--koruna-text-muted)', width: '30px' }}>
                        {m.id.toUpperCase()}
                      </span>
                      <input
                        type="text"
                        className="koruna-input-text"
                        style={{ height: '32px', fontSize: '0.8rem', flex: 1 }}
                        value={m.title}
                        placeholder="Module Title"
                        onChange={(e) => {
                          const updatedTitle = e.target.value;
                          // 1. Update module in courseModules list
                          setCourseModules(prev => prev.map(item => item.id === m.id ? { ...item, title: updatedTitle } : item));
                          // 2. Update moduleTitle in courseLessons for any lessons matching this moduleId
                          setCourseLessons(prev => prev.map(l => l.moduleId === m.id ? { ...l, moduleTitle: updatedTitle } : l));
                        }}
                      />
                      <button
                        type="button"
                        disabled={courseModules.length === 1}
                        style={{
                          color: courseModules.length === 1 ? '#cbd5e1' : '#ef4444',
                          background: 'transparent',
                          border: 'none',
                          cursor: courseModules.length === 1 ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => {
                          if (courseModules.length === 1) return;
                          
                          // Find first remaining module to reassign lessons to
                          const remainingModules = courseModules.filter(item => item.id !== m.id);
                          const fallbackModule = remainingModules[0];
                          
                          // Reassign lessons
                          setCourseLessons(prev => prev.map(l => {
                            if (l.moduleId === m.id || !l.moduleId) {
                              return {
                                ...l,
                                moduleId: fallbackModule.id,
                                moduleTitle: fallbackModule.title
                              };
                            }
                            return l;
                          }));

                          // Remove module from list
                          setCourseModules(remainingModules);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* LESSON EDITOR */}
              <div style={{ borderTop: '1px solid var(--koruna-border-color)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Course Lessons ({courseLessons.length})</label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {courseModules.map((mod) => {
                    // Filter lessons belonging to this module while retaining their original index
                    const lessonsWithAbsoluteIndices = courseLessons
                      .map((lesson, originalIndex) => ({ lesson, originalIndex }))
                      .filter(item => (item.lesson.moduleId || 'm1') === mod.id);

                    return (
                      <div key={mod.id} style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '10px', padding: '1rem', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--koruna-border-color)', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--koruna-primary)', textTransform: 'uppercase' }}>
                            {mod.id.toUpperCase()} - {mod.title}
                          </span>
                          <button
                            type="button"
                            className="btn-koruna-outline"
                            style={{ height: '24px', padding: '0 0.5rem', fontSize: '0.65rem' }}
                            onClick={() => {
                              setCourseLessons(prev => [
                                ...prev,
                                {
                                  title: `Lesson ${prev.length + 1}: Title`,
                                  content: '',
                                  moduleId: mod.id,
                                  moduleTitle: mod.title
                                }
                              ]);
                            }}
                          >
                            + Add Lesson
                          </button>
                        </div>

                        {lessonsWithAbsoluteIndices.length === 0 ? (
                          <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--koruna-text-muted)', fontStyle: 'italic' }}>
                            No lessons in this module. Click "+ Add Lesson" to create one.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {lessonsWithAbsoluteIndices.map(({ lesson, originalIndex }) => (
                              <div key={originalIndex} style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--koruna-border-color)' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input
                                    type="text"
                                    className="koruna-input-text"
                                    style={{ height: '32px', fontSize: '0.8rem' }}
                                    value={lesson.title}
                                    placeholder="Lesson Title"
                                    onChange={(e) => {
                                      const copy = [...courseLessons];
                                      copy[originalIndex].title = e.target.value;
                                      setCourseLessons(copy);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    onClick={() => {
                                      setCourseLessons(prev => prev.filter((_, i) => i !== originalIndex));
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input
                                    type="text"
                                    className="koruna-input-text"
                                    style={{ height: '32px', fontSize: '0.8rem', width: '100%', margin: 0 }}
                                    value={lesson.videoUrl || ''}
                                    placeholder="Video URL (Optional)"
                                    onChange={(e) => {
                                      const copy = [...courseLessons];
                                      copy[originalIndex].videoUrl = e.target.value;
                                      setCourseLessons(copy);
                                    }}
                                  />
                                  <select
                                    className="koruna-input-text"
                                    style={{ height: '32px', fontSize: '0.8rem', padding: '0 0.5rem', width: '100%', margin: 0, border: '1px solid var(--koruna-border-color)', borderRadius: '6px' }}
                                    value={lesson.moduleId || 'm1'}
                                    onChange={(e) => {
                                      const selectedMid = e.target.value;
                                      const matchedModule = courseModules.find(m => m.id === selectedMid);
                                      const copy = [...courseLessons];
                                      copy[originalIndex].moduleId = selectedMid;
                                      copy[originalIndex].moduleTitle = matchedModule ? matchedModule.title : 'Introduction';
                                      setCourseLessons(copy);
                                    }}
                                  >
                                    {courseModules.map(m => (
                                      <option key={m.id} value={m.id}>
                                        {m.id.toUpperCase()}: {m.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <textarea
                                  className="koruna-textarea"
                                  style={{ minHeight: '60px', fontSize: '0.8rem' }}
                                  value={lesson.content}
                                  placeholder="Enter lesson readings..."
                                  onChange={(e) => {
                                    const copy = [...courseLessons];
                                    copy[originalIndex].content = e.target.value;
                                    setCourseLessons(copy);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QUIZ QUESTION EDITOR */}
              <div style={{ borderTop: '1px solid var(--koruna-border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Quiz Questions ({courseQuiz.length})</label>
                  <button type="button" className="btn-koruna-outline" style={{ height: '28px', padding: '0 0.5rem', fontSize: '0.7rem' }} onClick={addQuizQuestionField}>
                    + Add Question
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {courseQuiz.map((q, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--koruna-border-color)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className="koruna-input-text"
                          style={{ height: '32px', fontSize: '0.8rem' }}
                          value={q.question}
                          placeholder="Question Text"
                          onChange={(e) => {
                            const copy = [...courseQuiz];
                            copy[idx].question = e.target.value;
                            setCourseQuiz(copy);
                          }}
                        />
                        <button type="button" style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => removeQuizQuestionField(idx)}>
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            className="koruna-input-text"
                            style={{ height: '28px', fontSize: '0.75rem' }}
                            value={opt}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            onChange={(e) => {
                              const copy = [...courseQuiz];
                              copy[idx].options[oIdx] = e.target.value;
                              setCourseQuiz(copy);
                            }}
                          />
                        ))}
                      </div>

                      <div className="koruna-form-control">
                        <label style={{ fontSize: '0.7rem', fontWeight: 700 }}>Correct Option Index (0-3)</label>
                        <select
                          className="koruna-input-text"
                          style={{ height: '28px', fontSize: '0.75rem', padding: '0 0.5rem' }}
                          value={q.correctAnswer}
                          onChange={(e) => {
                            const copy = [...courseQuiz];
                            copy[idx].correctAnswer = parseInt(e.target.value);
                            setCourseQuiz(copy);
                          }}
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-koruna-solid" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : (editingCourseId ? 'Save Edits' : 'Create Course')}
                </button>
                {editingCourseId && (
                  <button
                    type="button"
                    className="btn-koruna-outline"
                    onClick={() => {
                      setEditingCourseId(null);
                      setCourseForm({ title: '', category: 'Mortgage', code: '', level: 'Beginner', description: '', imgBg: '#e0f2fe', attachments: [] });
                      setCourseLessons([{ title: 'Lesson 1: Introduction', content: 'Enter lesson text here.' }]);
                      setCourseQuiz([{ question: 'What is the correct answer?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 }]);
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Course Inventory List */}
          <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Active Course Inventory ({courses.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {courses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant="admin"
                  onEditClick={() => handleStartEditCourse(course)}
                  onDeleteClick={() => handleDeleteCourse(course.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 10.2: CERTIFICATE TEMPLATES DESIGNER */}
      {activeInnerTab === 'certificate_templates' && (
        <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Certificate Designer</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--koruna-text-muted)', marginBottom: '1.25rem' }}>
                Modify text, logos, and signatures printed on official Koruna Academy diplomas.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Issuing Body / Header</label>
                  <input type="text" className="koruna-input-text" defaultValue="Koruna Financial Academy" />
                </div>

                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Trainer Signature Title</label>
                  <input type="text" className="koruna-input-text" defaultValue="Jefrey Tatoy, Lead Underwriting Trainer" />
                </div>

                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Verification Authority Signature Title</label>
                  <input type="text" className="koruna-input-text" defaultValue="Global Admin, Compliance Operations Director" />
                </div>

                <button className="btn-koruna-solid" style={{ width: 'fit-content' }} onClick={() => showToast('Certificate template changes saved!')}>
                  Save Template Design
                </button>
              </div>
            </div>

            {/* Mockup Preview */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Visual Layout Preview:</div>
              <div className="koruna-certificate-frame">
                <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>KORUNA FINANCIAL ACADEMY</span>
                <div style={{ fontSize: '0.65rem', margin: '0.5rem 0' }}>This acknowledges that</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, textDecoration: 'underline' }}>Jessica Taylor</div>
                <div style={{ fontSize: '0.65rem', margin: '0.5rem 0' }}>has met all compliance curriculum terms for</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Regulatory Compliance for Loan Officers</div>
                <div className="koruna-cert-seal" style={{ width: '60px', height: '60px', fontSize: '0.55rem' }}>SEAL</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 10.2_b: COURSE ASSIGNMENTS (TRAINER/ADMIN SHARING FUNCTIONALITY) */}
      {activeInnerTab === 'assignments' && (
        <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Assign Training Plan</h3>
          <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Quickly assign compliance tracks and custom training plans directly to enrolled enterprise employees.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {users.filter(u => u.role === 'employee').map((emp) => (
              <div key={emp.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--koruna-border-color)', borderRadius: '8px', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{emp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>{emp.email} • Dept: {emp.department}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)' }}>Quick Assign:</span>
                  {courses.map(course => {
                    const empProg = teamProgress[emp.email.toLowerCase()] || [];
                    const alreadyHas = empProg.some(p => p.courseId === course.id && (p.progressPercent > 0 || p.dueDate));
                    return (
                      <button
                        key={course.id}
                        className={alreadyHas ? 'btn-koruna-outline' : 'btn-koruna-solid'}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: '28px' }}
                        onClick={() => handleAssignCourse(course.id, emp.email)}
                      >
                        {course.code} {alreadyHas ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 10.3: USER DIRECTORY (ADMIN) */}
      {activeInnerTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Add User Form */}
          <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Create / Add User Account</h3>
            <form onSubmit={handleCreateUser}>
              <div className="koruna-form-grid">
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Full Name</label>
                  <input
                    type="text"
                    className="koruna-input-text"
                    value={adminUserForm.name}
                    onChange={(e) => setAdminUserForm({ ...adminUserForm, name: e.target.value })}
                    placeholder="e.g. Jessica Taylor"
                    required
                  />
                </div>
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Email Address</label>
                  <input
                    type="email"
                    className="koruna-input-text"
                    value={adminUserForm.email}
                    onChange={(e) => setAdminUserForm({ ...adminUserForm, email: e.target.value })}
                    placeholder="e.g. jessica.taylor@koruna.com"
                    required
                  />
                </div>
              </div>

              <div className="koruna-form-grid">
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>System User Role</label>
                  <select
                    className="koruna-input-text"
                    value={adminUserForm.role}
                    onChange={(e) => setAdminUserForm({ ...adminUserForm, role: e.target.value as any })}
                  >
                    <option value="employee">Employee</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="koruna-form-control">
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Department</label>
                  <select
                    className="koruna-input-text"
                    value={adminUserForm.department}
                    onChange={(e) => setAdminUserForm({ ...adminUserForm, department: e.target.value })}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-koruna-solid">Add New Employee Account</button>
            </form>
          </div>

          {/* Department Builder Form */}
          <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Create Company Departments</h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className="koruna-input-text"
                style={{ maxWidth: '300px' }}
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g. Risk Operations"
                required
              />
              <button type="submit" className="btn-koruna-solid">Create Department</button>
            </form>
          </div>

          {/* Users Directory Table */}
          <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Enterprise Directory Table</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--koruna-border-color)', paddingBottom: '0.5rem' }}>
                  <th style={{ padding: '0.5rem 1rem' }}>Employee Name</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Department</th>
                  <th style={{ padding: '0.5rem 1rem' }}>System Role</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email} style={{ borderBottom: '1px solid var(--koruna-border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--koruna-text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <select
                        value={u.department}
                        onChange={(e) => handleUpdateUserDept(u.email, e.target.value)}
                        style={{ padding: '0.2rem', border: '1px solid var(--koruna-border-color)', borderRadius: '4px' }}
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.email, e.target.value as UserRole)}
                        style={{ padding: '0.2rem', border: '1px solid var(--koruna-border-color)', borderRadius: '4px', fontWeight: 600, color: 'var(--koruna-primary)' }}
                      >
                        <option value="employee">Employee</option>
                        <option value="team_leader">Team Leader</option>
                        <option value="trainer">Trainer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button className="btn-koruna-outline" style={{ color: '#ef4444', borderColor: '#ef4444', height: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteUser(u.email)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 10.4: PERMISSIONS MATRIX (ADMIN) */}
      {activeInnerTab === 'permissions' && (
        <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Role Capability Permissions Grid</h3>
          <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Configure feature-level toggles to customize permissions on the portal navigation menu sidebar.
          </p>

          <table className="koruna-matrix-table">
            <thead>
              <tr>
                <th>Sidebar Menu Item / Feature</th>
                <th>Employee</th>
                <th>Team Leader</th>
                <th>Trainer</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'viewDashboard', label: 'Access Portal Dashboard' },
                { key: 'studyCourses', label: 'Study & Enroll Courses' },
                { key: 'viewTeamReports', label: 'View Team Reports Sidebar tab' },
                { key: 'assignCourses', label: 'Assign Courses to Users' },
                { key: 'approveAssessments', label: 'Sign-off Practical Tasks' },
                { key: 'editCourses', label: 'Manage & Edit Catalogue Courses' },
                { key: 'manageUsers', label: 'View & Edit User Profiles' },
                { key: 'systemSettings', label: 'Modify Platform Core Settings' }
              ].map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  {(['employee', 'team_leader', 'trainer', 'admin'] as UserRole[]).map((r) => {
                    const rolePerm = permissions.find(p => p.role === r)?.permissions[item.key as keyof RolePermissions['permissions']];
                    return (
                      <td key={r}>
                        <input
                          type="checkbox"
                          className="koruna-matrix-checkbox"
                          checked={!!rolePerm}
                          onChange={() => handlePermissionToggle(r, item.key as any)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 10.5: PLATFORM SETTINGS (ADMIN) */}
      {activeInnerTab === 'settings' && (
        <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Universal Configurations</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="koruna-form-control">
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Quiz Passing Score Threshold (% required)</label>
              <input
                type="number"
                className="koruna-input-text"
                min={50}
                max={100}
                value={settings.quizPassingThreshold}
                onChange={(e) => handleSaveSettings({ quizPassingThreshold: parseInt(e.target.value) || 75 })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--koruna-border-color)', paddingTop: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>Policy Toggles</label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={settings.autoEnrollNewUsers}
                  onChange={(e) => handleSaveSettings({ autoEnrollNewUsers: e.target.checked })}
                />
                <span>Automatically enroll new employees in Compliance modules</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={settings.emailReminders}
                  onChange={(e) => handleSaveSettings({ emailReminders: e.target.checked })}
                />
                <span>Send automated email nudges for overdue compliance training</span>
              </label>
            </div>

            <div style={{ borderTop: '1px solid var(--koruna-border-color)', paddingTop: '1.25rem' }}>
              <button className="btn-koruna-solid" onClick={() => {
                loadPlatformData();
                showToast('Fetched fresh platform database parameters.');
              }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} /> Refresh Storage Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

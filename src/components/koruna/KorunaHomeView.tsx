import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  PartyPopper,
  MessageSquare,
  Bookmark,
  X,
  CheckCircle2,
  Trash2,
  Paperclip,
  RotateCw,
  Maximize2,
  Minimize2,
  Sliders,
  Edit3,
  UploadCloud
} from 'lucide-react';
import type { UserSessionData } from '../../services/auth';
import { dbService, type PostItem } from '../../services/db';

export interface KorunaHomeViewProps {
  userSession: UserSessionData;
  onTabChange: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export type { PostItem };

type PostType = 'General' | 'Recognition' | 'Announcement' | 'Learning';

const POST_TYPE_META: Record<PostType, { color: string; tint: string; label: string }> = {
  General: { color: '#64748b', tint: '#f1f5f9', label: 'Update' },
  Recognition: { color: '#db2777', tint: '#fdf2f8', label: 'Recognition' },
  Announcement: { color: '#ea580c', tint: '#fff7ed', label: 'Announcement' },
  Learning: { color: '#2563eb', tint: '#eff6ff', label: 'Learning' }
};

const CONTENT_MAX_LENGTH = 3000;

const TEAM_MEMBERS = [
  'Alexcis Estinor',
  'Airsea Estinor',
  'Jefrey Tatoy',
  'Jessica Timon',
  'Francis Spiritu',
  'Sarah Jenkins',
  'David Miller'
];



// Shared style tokens so every card, pill and button pulls from one place
const tokens = {
  radius: { sm: '8px', md: '10px', lg: '16px' },
  border: '1px solid #e2e8f0',
  cardShadow: '0 2px 8px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
  text: { primary: '#0f172a', secondary: '#64748b', muted: '#94a3b8' },
  brand: '#a31555',
  brandDark: '#7a0f40'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: tokens.radius.lg,
  border: tokens.border,
  boxShadow: tokens.cardShadow
};

const canDeletePost = (post: PostItem, userSession: UserSessionData): boolean => {
  if (!userSession) return false;
  // Admin role can delete any post
  if (userSession.role === 'admin') return true;
  // Post author can delete their own post (match by email or name)
  if (post.authorEmail && userSession.email && post.authorEmail.toLowerCase() === userSession.email.toLowerCase()) {
    return true;
  }
  if (post.authorName && userSession.name && post.authorName.toLowerCase() === userSession.name.toLowerCase()) {
    return true;
  }
  return false;
};

const formatTimeAgo = (createdAt?: string, fallbackTimeAgo?: string): string => {
  let date: Date | null = null;

  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) date = d;
  }

  if (!date && fallbackTimeAgo) {
    const d = new Date(fallbackTimeAgo);
    if (!isNaN(d.getTime())) date = d;
  }

  if (!date) {
    return fallbackTimeAgo || 'Just now';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 15) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const KorunaHomeView: React.FC<KorunaHomeViewProps> = ({
  userSession,
  onTabChange,
  searchQuery: externalSearchQuery = '',
  setSearchQuery: _externalSetSearchQuery
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [posts, setPosts] = useState<PostItem[]>([]);

  // Live ticker to dynamically refresh relative time strings (every 15 seconds)
  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Load posts from dbService (Supabase table 'posts' with local storage fallback)
  useEffect(() => {
    const fetchPosts = async () => {
      const loaded = await dbService.getPosts();
      setPosts(loaded);
    };
    fetchPosts();
  }, []);

  // Composer state
  const [postContent, setPostContent] = useState<string>('');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('General');
  const [recognitionRecipient, setRecognitionRecipient] = useState<string>('');
  const [recognitionPoints, setRecognitionPoints] = useState<number>(200);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);
  const [composerFocused, setComposerFocused] = useState<boolean>(false);

  // Image Editing & Adaptability State
  const [imageRotation, setImageRotation] = useState<0 | 90 | 180 | 270>(0);
  const [imageFilter, setImageFilter] = useState<'normal' | 'vibrant' | 'warm' | 'monochrome' | 'vintage'>('normal');
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('contain');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);

  const searchVal = externalSearchQuery;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2600);
  };

  // Canvas helper to bake rotation & filters into image data URL and compress payload when publishing
  const getProcessedImageDataUrl = async (
    dataUrl: string,
    rotation: number,
    filter: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        const isRotated90or270 = rotation === 90 || rotation === 270;
        canvas.width = isRotated90or270 ? height : width;
        canvas.height = isRotated90or270 ? width : height;

        let filterStr = 'none';
        if (filter === 'vibrant') filterStr = 'saturate(1.45) contrast(1.1)';
        else if (filter === 'warm') filterStr = 'sepia(0.3) saturate(1.2) brightness(1.05)';
        else if (filter === 'monochrome') filterStr = 'grayscale(1) contrast(1.1)';
        else if (filter === 'vintage') filterStr = 'sepia(0.5) contrast(0.9) brightness(1.1)';

        ctx.filter = filterStr;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Auto-grow the composer textarea as the person types.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [postContent]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
        setImageRotation(0);
        setImageFilter('normal');
        setImageFit('cover');
        setShowFilterMenu(false);
        showToast('Image attached successfully');
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setAttachedDocName(file.name);
      showToast(`Document "${file.name}" attached`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedDocName(file.name);
      showToast(`Document "${file.name}" attached`);
    }
  };

  const getUserKey = (): string => {
    return (userSession?.email || userSession?.name || userSession?.id || 'anonymous').toLowerCase();
  };

  const handleLike = async (id: string) => {
    const userKey = getUserKey();
    const targetId = String(id);
    const target = posts.find(p => String(p.id) === targetId);
    if (!target) return;

    const { isAdded } = await dbService.toggleReaction(targetId, userKey, 'like');

    const currentLikes = Array.isArray(target.likedBy) ? target.likedBy : [];
    const updatedLikedBy = isAdded
      ? Array.from(new Set([...currentLikes, userKey]))
      : currentLikes.filter(k => k !== userKey);

    const updatedLikesCount = isAdded
      ? target.likesCount + 1
      : Math.max(0, target.likesCount - 1);

    const updated: PostItem = {
      ...target,
      id: targetId,
      likedBy: updatedLikedBy,
      likesCount: updatedLikesCount,
      isLiked: isAdded
    };

    setPosts(prev => prev.map(p => String(p.id) === targetId ? updated : p));
    await dbService.savePost(updated);
  };

  const handleCelebrate = async (id: string) => {
    const userKey = getUserKey();
    const targetId = String(id);
    const target = posts.find(p => String(p.id) === targetId);
    if (!target) return;

    const { isAdded } = await dbService.toggleReaction(targetId, userKey, 'celebrate');

    const currentCelebrates = Array.isArray(target.celebratedBy) ? target.celebratedBy : [];
    const updatedCelebratedBy = isAdded
      ? Array.from(new Set([...currentCelebrates, userKey]))
      : currentCelebrates.filter(k => k !== userKey);

    const updatedCelebratesCount = isAdded
      ? target.celebratesCount + 1
      : Math.max(0, target.celebratesCount - 1);

    const updated: PostItem = {
      ...target,
      id: targetId,
      celebratedBy: updatedCelebratedBy,
      celebratesCount: updatedCelebratesCount,
      isCelebrated: isAdded
    };

    setPosts(prev => prev.map(p => String(p.id) === targetId ? updated : p));
    if (isAdded) {
      setBurstId(targetId);
      window.setTimeout(() => setBurstId(null), 500);
    }
    await dbService.savePost(updated);
  };

  const handleBookmark = async (id: string) => {
    const userKey = getUserKey();
    const targetId = String(id);
    const target = posts.find(p => String(p.id) === targetId);
    if (!target) return;

    const { isAdded } = await dbService.toggleReaction(targetId, userKey, 'bookmark');

    const currentBookmarks = Array.isArray(target.bookmarkedBy) ? target.bookmarkedBy : [];
    const updatedBookmarkedBy = isAdded
      ? Array.from(new Set([...currentBookmarks, userKey]))
      : currentBookmarks.filter(k => k !== userKey);

    const updated: PostItem = {
      ...target,
      id: targetId,
      bookmarkedBy: updatedBookmarkedBy,
      isBookmarked: isAdded
    };

    setPosts(prev => prev.map(p => String(p.id) === targetId ? updated : p));
    showToast(isAdded ? 'Saved to your bookmarks' : 'Removed from bookmarks');
    await dbService.savePost(updated);
  };

  const handleDeletePost = async (post: PostItem) => {
    if (!canDeletePost(post, userSession)) {
      showToast('Only the post author or an Admin can delete this post');
      return;
    }
    setPosts(prev => prev.filter(p => p.id !== post.id));
    showToast('Post removed');
    await dbService.deletePost(post.id);
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    const target = posts.find(p => p.id === postId);
    if (!target) return;
    const nowIso = new Date().toISOString();
    const newComment = {
      id: `c-${Date.now()}`,
      author: userSession.name || 'Jessica Timon',
      text: commentInput.trim(),
      timeAgo: 'Just now',
      createdAt: nowIso
    };
    const updated: PostItem = {
      ...target,
      comments: [...target.comments, newComment]
    };
    setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    setCommentInput('');
    showToast('Comment added');
    await dbService.savePost(updated);
  };

  const resetComposer = () => {
    setPostContent('');
    setRecognitionRecipient('');
    setRecognitionPoints(200);
    setAttachedImage(null);
    setImageRotation(0);
    setImageFilter('normal');
    setImageFit('cover');
    setShowFilterMenu(false);
    setIsDraggingOver(false);
    setAttachedDocName(null);
    setSelectedPostType('General');
    setComposerFocused(false);
  };

  const handleCreatePost = async () => {
    const trimmed = postContent.trim();
    if (!trimmed && !attachedImage && !attachedDocName) return;
    if (trimmed.length > CONTENT_MAX_LENGTH) return;

    let finalImageUrl: string | undefined = undefined;
    if (attachedImage) {
      finalImageUrl = await getProcessedImageDataUrl(attachedImage, imageRotation, imageFilter);
    }

    let badgeText: string | undefined;
    let cat: PostItem['category'] = 'Team Updates';

    if (selectedPostType === 'Recognition') {
      const recipient = recognitionRecipient.trim() || 'Teammate';
      badgeText = `🎉 Recognised ${recipient} · +${recognitionPoints} Koruna Points`;
      cat = 'Recognition';
    } else if (selectedPostType === 'Announcement') {
      cat = 'Announcements';
    } else if (selectedPostType === 'Learning') {
      cat = 'Learning';
    }

    const initials = userSession.name
      ? userSession.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'JT';

    const nowIso = new Date().toISOString();
    const newPost: PostItem = {
      id: `hpost-${Date.now()}`,
      authorId: userSession.id,
      authorName: userSession.name || 'Jessica Timon',
      authorEmail: userSession.email,
      authorRole: userSession.department || 'General Manager',
      authorAvatar: initials,
      authorBgColor: tokens.brand,
      timeAgo: 'Just now',
      createdAt: nowIso,
      category: cat,
      badgeText,
      content: trimmed,
      imageUrl: finalImageUrl,
      docTitle: attachedDocName || undefined,
      attachedDocPreview: !!attachedDocName,
      likesCount: 0,
      celebratesCount: 0,
      comments: [],
      isNew: true
    };

    setPosts(prev => [newPost, ...prev]);
    resetComposer();
    showToast('Posted to Koruna Life');
    await dbService.savePost(newPost);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      !searchVal ||
      post.content.toLowerCase().includes(searchVal.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchVal.toLowerCase()) ||
      post.authorRole.toLowerCase().includes(searchVal.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Announcements', 'Recognition', 'Team Updates', 'Learning', 'Events'];

  const remainingChars = CONTENT_MAX_LENGTH - postContent.length;
  const overLimit = remainingChars < 0;

  return (
    <div className="kh-root" style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 2rem 3rem 2rem' }}>

      {toastMessage && (
        <div className="kh-toast">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Hidden file inputs for attachments */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageFileSelect}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx"
        onChange={handleDocFileSelect}
        style={{ display: 'none' }}
      />

      {/* HERO */}
      <div className="kh-hero">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          Welcome to Koruna Life
        </h1>
        <p style={{ fontSize: '0.925rem', color: 'rgba(255,255,255,0.88)', margin: '0.4rem 0 0 0' }}>
          Stay connected. Celebrate. Share.
        </p>
      </div>

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`kh-pill ${isActive ? 'kh-pill-active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="kh-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* COMPOSER */}
          <div
            className="kh-composer-card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '1.25rem 1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {/* Inner Gray Input Container with Drag & Drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              style={{
                backgroundColor: isDraggingOver ? '#fcf0f5' : '#f4f4f5',
                borderRadius: '14px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                border: isDraggingOver
                  ? '2px dashed #b61f60'
                  : composerFocused
                  ? '1px solid #cbd5e1'
                  : '1px solid transparent'
              }}
            >
              {selectedPostType !== 'General' && (
                <div
                  className="kh-composer-label"
                  style={{
                    color: POST_TYPE_META[selectedPostType].color,
                    backgroundColor: POST_TYPE_META[selectedPostType].tint,
                    marginBottom: '0.2rem',
                    width: 'fit-content'
                  }}
                >
                  Posting as {POST_TYPE_META[selectedPostType].label}
                  <button
                    type="button"
                    onClick={() => setSelectedPostType('General')}
                    className="kh-label-close"
                    aria-label="Clear post type"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="What's happening at Koruna?"
                value={postContent}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                onChange={(e) => setPostContent(e.target.value)}
                onPaste={handlePaste}
                className="kh-composer-textarea"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.975rem',
                  lineHeight: '1.5',
                  color: '#1e293b',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit'
                }}
              />

              {/* Drag over overlay hint */}
              {isDraggingOver && !attachedImage && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', color: '#b61f60', fontWeight: 600, fontSize: '0.88rem' }}>
                  <UploadCloud size={20} />
                  Drop image here to attach
                </div>
              )}

              {/* EDITABLE & ADAPTABLE ATTACHED IMAGE PREVIEW */}
              {attachedImage && (
                <div
                  style={{
                    position: 'relative',
                    marginTop: '0.65rem',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #cbd5e1',
                    backgroundColor: imageFit === 'contain' ? '#0f172a' : '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Edit Controls Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      right: '8px',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(15, 23, 42, 0.78)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '8px',
                      padding: '0.35rem 0.6rem',
                      color: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Rotate button */}
                      <button
                        type="button"
                        onClick={() => setImageRotation(prev => ((prev + 90) % 360) as any)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px'
                        }}
                        title="Rotate 90°"
                      >
                        <RotateCw size={13} /> {imageRotation > 0 ? `${imageRotation}°` : 'Rotate'}
                      </button>

                      {/* Aspect Fit toggle button */}
                      <button
                        type="button"
                        onClick={() => setImageFit(prev => prev === 'cover' ? 'contain' : 'cover')}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px'
                        }}
                        title={imageFit === 'cover' ? 'Fit full image frame (Contain)' : 'Fill frame (Cover)'}
                      >
                        {imageFit === 'cover' ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                        {imageFit === 'cover' ? 'Fill' : 'Fit'}
                      </button>

                      {/* Filter menu toggle */}
                      <button
                        type="button"
                        onClick={() => setShowFilterMenu(prev => !prev)}
                        style={{
                          background: showFilterMenu ? '#b61f60' : 'rgba(255, 255, 255, 0.15)',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px'
                        }}
                        title="Apply color filters"
                      >
                        <Sliders size={13} /> Filter {imageFilter !== 'normal' ? `(${imageFilter})` : ''}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Replace Image */}
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.74rem',
                          fontWeight: 500,
                          padding: '0.2rem 0.4rem'
                        }}
                        title="Replace image file"
                      >
                        <Edit3 size={13} /> Change
                      </button>

                      {/* Remove Image */}
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedImage(null);
                          setImageRotation(0);
                          setImageFilter('normal');
                          setShowFilterMenu(false);
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.85)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Filter Options Bar */}
                  {showFilterMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '48px',
                        left: '8px',
                        right: '8px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: 'rgba(15, 23, 42, 0.88)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '8px',
                        overflowX: 'auto'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Filter:</span>
                      {[
                        { id: 'normal', name: 'Normal' },
                        { id: 'vibrant', name: 'Vibrant' },
                        { id: 'warm', name: 'Warm' },
                        { id: 'monochrome', name: 'B&W' },
                        { id: 'vintage', name: 'Vintage' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setImageFilter(f.id as any)}
                          style={{
                            border: imageFilter === f.id ? '1px solid #b61f60' : '1px solid transparent',
                            background: imageFilter === f.id ? '#b61f60' : 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.73rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Adaptable Image Display */}
                  <div
                    style={{
                      width: '100%',
                      maxHeight: imageFit === 'contain' ? '360px' : '260px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: imageFit === 'contain' ? '1rem 0' : 0,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={attachedImage}
                      alt="Attached preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: imageFit === 'contain' ? '340px' : '260px',
                        width: imageFit === 'cover' ? '100%' : 'auto',
                        objectFit: imageFit,
                        display: 'block',
                        transform: `rotate(${imageRotation}deg)`,
                        filter:
                          imageFilter === 'vibrant'
                            ? 'saturate(1.45) contrast(1.1)'
                            : imageFilter === 'warm'
                            ? 'sepia(0.3) saturate(1.2) brightness(1.05)'
                            : imageFilter === 'monochrome'
                            ? 'grayscale(1) contrast(1.1)'
                            : imageFilter === 'vintage'
                            ? 'sepia(0.5) contrast(0.9) brightness(1.1)'
                            : 'none',
                        transition: 'transform 0.3s ease, filter 0.3s ease, object-fit 0.2s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ATTACHED DOC PREVIEW */}
              {attachedDocName && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Paperclip size={15} style={{ color: tokens.brand }} />
                    <span style={{ fontWeight: 600 }}>{attachedDocName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedDocName(null)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* RECOGNITION OPTIONS */}
            {selectedPostType === 'Recognition' && (
              <div className="kh-recognition-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#fdf2f8', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#be185d', whiteSpace: 'nowrap' }}>Recognise:</span>
                  <input
                    type="text"
                    placeholder="Teammate's name"
                    value={recognitionRecipient}
                    onChange={(e) => setRecognitionRecipient(e.target.value)}
                    className="kh-recognition-input"
                    style={{ flex: 1, minWidth: '180px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {[100, 200, 500].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setRecognitionPoints(pts)}
                        style={{
                          border: recognitionPoints === pts ? '1px solid #be185d' : '1px solid #cbd5e1',
                          background: recognitionPoints === pts ? '#fce7f3' : '#ffffff',
                          color: recognitionPoints === pts ? '#be185d' : '#475569',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        +{pts} Pts
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team member suggestions */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: tokens.text.muted }}>Quick pick:</span>
                  {TEAM_MEMBERS.slice(0, 5).map(member => (
                    <button
                      key={member}
                      type="button"
                      onClick={() => setRecognitionRecipient(member)}
                      style={{
                        border: 'none',
                        background: '#ffffff',
                        color: '#334155',
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      {member.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION ROW matching screenshot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.15rem'
              }}
            >
              {/* Icon actions on the left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="kh-action-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Attach Media"
                >
                  <img
                    src="/sidebaricons/homeicons/media.png"
                    alt="Media"
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Media</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPostType(prev => prev === 'Recognition' ? 'General' : 'Recognition')}
                  className={`kh-action-item ${selectedPostType === 'Recognition' ? 'kh-action-item-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: selectedPostType === 'Recognition' ? '#fdf2f8' : 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Give Recognition"
                >
                  <img
                    src="/sidebaricons/homeicons/recognition.png"
                    alt="Give Recognition"
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Give Recognition</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPostType(prev => prev === 'Learning' ? 'General' : 'Learning')}
                  className={`kh-action-item ${selectedPostType === 'Learning' ? 'kh-action-item-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: selectedPostType === 'Learning' ? '#eff6ff' : 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Share Learning"
                >
                  <img
                    src="/sidebaricons/homeicons/learnings.png"
                    alt="Share Learning"
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Share Learning</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPostType(prev => prev === 'Announcement' ? 'General' : 'Announcement')}
                  className={`kh-action-item ${selectedPostType === 'Announcement' ? 'kh-action-item-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: selectedPostType === 'Announcement' ? '#fff7ed' : 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Announcement"
                >
                  <img
                    src="/sidebaricons/homeicons/announcement.png"
                    alt="Announcement"
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Announcement</span>
                </button>
              </div>

              {/* Right side Post button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                {postContent.length > 0 && (
                  <span style={{ fontSize: '0.78rem', color: overLimit ? '#dc2626' : tokens.text.muted, fontWeight: 500 }}>
                    {remainingChars}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={(!postContent.trim() && !attachedImage && !attachedDocName) || overLimit}
                  style={{
                    background: 'linear-gradient(90deg, #b61f60 0%, #80084e 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.55rem 1.8rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: (!postContent.trim() && !attachedImage && !attachedDocName) || overLimit ? 'not-allowed' : 'pointer',
                    opacity: (!postContent.trim() && !attachedImage && !attachedDocName) || overLimit ? 0.6 : 1,
                    boxShadow: '0 4px 14px rgba(182, 31, 96, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                  className="kh-post-pill-btn"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* FEED */}
          {filteredPosts.map((post) => {
            const currentUserKey = getUserKey();
            const isLikedByMe = Array.isArray(post.likedBy) && post.likedBy.includes(currentUserKey);
            const isCelebratedByMe = Array.isArray(post.celebratedBy) && post.celebratedBy.includes(currentUserKey);
            const isBookmarkedByMe = Array.isArray(post.bookmarkedBy) && post.bookmarkedBy.includes(currentUserKey);

            return (
              <div key={post.id} className={`kh-card ${post.isNew ? 'kh-card-enter' : ''}`} style={{ ...cardStyle, padding: '1.15rem 1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div className="kh-avatar" style={{ backgroundColor: post.authorBgColor, width: '40px', height: '40px' }}>
                      {post.authorAvatar}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem', color: tokens.text.primary }}>{post.authorName}</span>
                      <span style={{ fontSize: '0.76rem', color: tokens.text.secondary }}>{post.authorRole} · {formatTimeAgo(post.createdAt, post.timeAgo)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className="kh-icon-btn kh-bookmark-btn"
                      style={{ color: isBookmarkedByMe ? tokens.brand : tokens.text.muted }}
                      aria-label={isBookmarkedByMe ? 'Remove bookmark' : 'Save post'}
                      title={isBookmarkedByMe ? 'Remove bookmark' : 'Save post'}
                    >
                      <Bookmark size={17} fill={isBookmarkedByMe ? tokens.brand : 'none'} />
                    </button>
                    {canDeletePost(post, userSession) && (
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="kh-icon-btn kh-bookmark-btn"
                        style={{ color: tokens.text.muted }}
                        title="Delete post"
                        aria-label="Delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {post.badgeText && <div className="kh-badge">{post.badgeText}</div>}

                <p style={{ margin: '0.9rem 0 0 0', fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {post.content}
                </p>

                {post.imageUrl && (
                  <div style={{ marginTop: '0.85rem', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <img
                      src={post.imageUrl}
                      alt="Attached media"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 'none',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </div>
                )}

                {post.attachedDocPreview && (
                  <div className="kh-doc-preview" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
                    <Paperclip size={15} style={{ color: tokens.brand }} />
                    <span>{post.docTitle || 'Attached document.pdf'}</span>
                  </div>
                )}

                <div className="kh-action-row">
                  <button onClick={() => handleLike(post.id)} className={`kh-reaction ${isLikedByMe ? 'kh-reaction-liked' : ''}`}>
                    <ThumbsUp size={15} fill={isLikedByMe ? '#2563eb' : 'none'} />
                    Like{post.likesCount > 0 ? ` · ${post.likesCount}` : ''}
                  </button>

                  <button
                    onClick={() => handleCelebrate(post.id)}
                    className={`kh-reaction ${isCelebratedByMe ? 'kh-reaction-celebrated' : ''} ${burstId === post.id ? 'kh-burst' : ''}`}
                  >
                    <PartyPopper size={15} fill={isCelebratedByMe ? '#db2777' : 'none'} />
                    Celebrate{post.celebratesCount > 0 ? ` · ${post.celebratesCount}` : ''}
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className={`kh-reaction ${activeCommentPostId === post.id ? 'kh-reaction-active' : ''}`}
                  >
                    <MessageSquare size={15} />
                    Comment{post.comments.length > 0 ? ` · ${post.comments.length}` : ''}
                  </button>
                </div>

              {activeCommentPostId === post.id && (
                <div className="kh-comments">
                  {post.comments.length === 0 && (
                    <div style={{ fontSize: '0.82rem', color: tokens.text.muted }}>No comments yet — start the conversation.</div>
                  )}
                  {post.comments.map(c => (
                    <div key={c.id} style={{ fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: tokens.text.primary }}>{c.author}</span>{' '}
                        <span style={{ color: '#334155' }}>{c.text}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: tokens.text.muted }}>{formatTimeAgo((c as any).createdAt, c.timeAgo)}</span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                      className="kh-comment-input"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="kh-send-btn">Send</button>
                  </div>
                </div>
              )}
            </div>
          )})}

          {filteredPosts.length === 0 && (
            <div style={{ ...cardStyle, padding: '2.5rem', textAlign: 'center', color: tokens.text.secondary }}>
              Nothing here yet. Try a different category, or be the first to post.
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ ...cardStyle, padding: '1.15rem' }}>
            <h3 className="kh-widget-title">Pinned Announcements</h3>
            <div className="kh-widget-row" onClick={() => { onTabChange('knowledge_base'); showToast('Opening Knowledge Hub'); }}>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: tokens.text.primary, lineHeight: 1.3 }}>October Public Holiday Schedule</div>
              <div style={{ fontSize: '0.74rem', color: tokens.text.muted, marginTop: '0.2rem' }}>Posted 5h ago</div>
            </div>
            <div className="kh-widget-row kh-widget-row-last" onClick={() => { onTabChange('catalog'); showToast('Opening Course Catalog'); }}>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: tokens.text.primary, lineHeight: 1.3 }}>New AI Training Available</div>
              <div style={{ fontSize: '0.74rem', color: tokens.text.muted, marginTop: '0.2rem' }}>Posted 1d ago</div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '1.15rem' }}>
            <h3 className="kh-widget-title">Trending Topics</h3>
            <div className="kh-widget-row" onClick={() => setActiveCategory('Learning')}>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: tokens.text.primary, lineHeight: 1.3 }}>AI Productivity Training</div>
              <div style={{ fontSize: '0.74rem', color: tokens.text.secondary, marginTop: '0.2rem' }}>24 posts this week</div>
            </div>
            <div className="kh-widget-row kh-widget-row-last" onClick={() => setActiveCategory('Events')}>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: tokens.text.primary, lineHeight: 1.3 }}>Creative Club Challenge</div>
              <div style={{ fontSize: '0.74rem', color: tokens.text.secondary, marginTop: '0.2rem' }}>15 posts this week</div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '1.15rem' }}>
            <h3 className="kh-widget-title">Upcoming Events</h3>
            <div className="kh-widget-row kh-widget-row-last" onClick={() => onTabChange('engage')}>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: tokens.text.primary, lineHeight: 1.3 }}>September Creative Challenge</div>
              <div style={{ fontSize: '0.74rem', color: tokens.text.secondary, marginTop: '0.2rem' }}>18 September · Virtual</div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '1.15rem' }}>
            <h3 className="kh-widget-title">Recent Recognition</h3>
            <div style={{ fontSize: '0.87rem', fontWeight: 600, color: tokens.text.primary, lineHeight: 1.3 }}>
              Airsea recognised <span style={{ color: tokens.brand }}>Alexcis</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: tokens.brand, fontWeight: 700, marginTop: '0.25rem' }}>+200 Koruna Points</div>
          </div>
        </div>
      </div>

      <style>{`
        .kh-search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.6rem;
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          font-size: 0.88rem;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .kh-search-input:focus {
          border-color: ${tokens.brand};
          box-shadow: 0 0 0 3px rgba(163, 21, 85, 0.1);
        }

        .kh-icon-btn {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background-color: #f1f5f9;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: background-color 0.15s ease;
        }
        .kh-icon-btn:hover { background-color: #e2e8f0; }
        .kh-bookmark-btn { background-color: transparent; width: 32px; height: 32px; }
        .kh-bookmark-btn:hover { background-color: #f8fafc; }

        .kh-dot {
          position: absolute; top: 8px; right: 8px;
          width: 8px; height: 8px; border-radius: 50%;
          background-color: ${tokens.brand};
        }

        .kh-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          color: #ffffff; display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 0.85rem; flex-shrink: 0;
        }

        .kh-hero {
          background: linear-gradient(135deg, #aa1555 0%, #7a0f40 100%);
          border-radius: 16px;
          padding: 1.85rem 2rem;
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(170, 21, 85, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .kh-pill {
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #334155;
          font-size: 0.83rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .kh-pill:hover { border-color: #94a3b8; }
        .kh-pill-active {
          border-color: transparent;
          background-color: ${tokens.brand};
          color: #ffffff;
          font-weight: 600;
        }

        .kh-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.25rem;
        }

        .kh-composer-textarea {
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          font-size: 0.95rem;
          line-height: 1.5;
          color: ${tokens.text.primary};
          background: transparent;
          font-family: inherit;
        }
        .kh-composer-textarea::placeholder { color: ${tokens.text.muted}; }

        .kh-composer-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          margin-bottom: 0.6rem;
        }
        .kh-label-close {
          border: none; background: transparent; color: inherit;
          cursor: pointer; padding: 0; display: flex; align-items: center;
        }

        .kh-recognition-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.65rem;
          padding: 0.6rem 0.75rem;
          background-color: #fdf2f8;
          border-radius: 8px;
          border: 1px solid #fbcfe8;
        }
        .kh-recognition-input {
          border: 1px solid #f472b6;
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          font-size: 0.82rem;
          outline: none;
          background-color: #ffffff;
          color: #0f172a;
        }

        .kh-action-item:hover {
          background-color: #f1f5f9 !important;
          transform: translateY(-1px);
        }
        .kh-action-item-active {
          box-shadow: 0 0 0 1px currentColor;
        }
        .kh-post-pill-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(182, 31, 96, 0.4) !important;
        }
        .kh-post-pill-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .kh-composer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .kh-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          padding: 0.3rem 0.7rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .kh-chip:hover { background-color: #f8fafc; border-color: #94a3b8; }
        .kh-chip-active {
          border-color: transparent !important;
          background-color: #f1f5f9 !important;
          box-shadow: 0 0 0 2px currentColor;
        }

        .kh-char-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

        .kh-post-btn {
          background-color: ${tokens.brand};
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 0.45rem 1.25rem;
          font-weight: 600;
          font-size: 0.84rem;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.10s ease;
        }
        .kh-post-btn:hover:not(:disabled) { background-color: ${tokens.brandDark}; }
        .kh-post-btn:active:not(:disabled) { transform: scale(0.97); }
        .kh-post-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .kh-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; border: 1px solid #cbd5e1; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04); }
        .kh-card:hover { box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12); transform: translateY(-3px); border-color: #94a3b8; }

        @keyframes kh-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kh-card-enter { animation: kh-enter 0.35s ease; }

        .kh-badge {
          display: inline-flex;
          margin-top: 0.9rem;
          background-color: #fce7f3;
          color: #be185d;
          padding: 0.3rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .kh-doc-preview {
          margin-top: 0.9rem;
          padding: 0.65rem 0.85rem;
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.83rem;
          font-weight: 600;
          color: #334155;
        }

        .kh-action-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .kh-reaction {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: ${tokens.text.secondary};
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .kh-reaction:hover { background-color: #f8fafc; color: ${tokens.text.primary}; }
        .kh-reaction-liked { color: #2563eb !important; background-color: #eff6ff !important; }
        .kh-reaction-celebrated { color: #db2777 !important; background-color: #fdf2f8 !important; }
        .kh-reaction-active { background-color: #f1f5f9 !important; color: ${tokens.text.primary} !important; }

        @keyframes kh-burst-anim {
          0% { transform: scale(1); }
          50% { transform: scale(1.25) rotate(-6deg); }
          100% { transform: scale(1); }
        }
        .kh-burst { animation: kh-burst-anim 0.35s ease; }

        .kh-comments {
          margin-top: 0.85rem;
          padding: 0.85rem;
          background-color: #f8fafc;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .kh-comment-input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.4rem 0.75rem;
          font-size: 0.83rem;
          outline: none;
          background-color: #ffffff;
          color: #0f172a;
        }
        .kh-comment-input:focus { border-color: ${tokens.brand}; }

        .kh-send-btn {
          border: none;
          background-color: ${tokens.brand};
          color: #ffffff;
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
        .kh-send-btn:hover { background-color: ${tokens.brandDark}; }

        .kh-widget-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #AF1F60;
          margin: 0 0 0.85rem 0;
        }

        .kh-widget-row {
          padding: 0.6rem 0;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .kh-widget-row:hover { opacity: 0.8; }
        .kh-widget-row-last { border-bottom: none; padding-bottom: 0; }

        .kh-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #0f172a;
          color: #ffffff;
          padding: 0.7rem 1.1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
          z-index: 1000;
          animation: kh-enter 0.25s ease;
        }

        @media (max-width: 900px) {
          .kh-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
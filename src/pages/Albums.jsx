import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import {
  getAlbumsByUser, createAlbum, deleteAlbum, updateAlbum,
  getPhotosByAlbum, createPhoto, updatePhoto, deletePhoto
} from '../services/api';
import '../styles/Albums.css';

function AlbumList() {
  const { user } = useAuth();
  const userId = user?.id; 
  const navigate = useNavigate();
  const toast = useToast();

  const [albums, setAlbums] = useState([]);
  const [covers, setCovers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editAlbumId, setEditAlbumId] = useState(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');

  useEffect(() => { if (userId) fetchAlbums(); }, [userId]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const data = await getAlbumsByUser(userId);
      const fetchedAlbums = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setAlbums(fetchedAlbums);

      fetchedAlbums.forEach(async (album) => {
        try {
          const res = await getPhotosByAlbum(album.id, 1, 1);
          const coverPhotos = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          if (coverPhotos.length > 0) {
            setCovers(prev => ({ ...prev, [album.id]: coverPhotos[0].url }));
          }
        } catch {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAlbumTitle.trim()) return;
    try {
      const added = await createAlbum({ userId: userId, title: newAlbumTitle.trim() });
      setAlbums((prev) => [added, ...prev]);
      setNewAlbumTitle('');
      setShowAddForm(false);
      toast('Destination added!');
    } catch {
      toast('Error adding destination', 'error');
    }
  };

  const handleEditAlbumSave = async (album) => {
    if (!editAlbumTitle.trim()) return;
    try {
      const updated = await updateAlbum(album.id, { ...album, title: editAlbumTitle.trim() });
      setAlbums(prev => prev.map(a => a.id === album.id ? updated : a));
      setEditAlbumId(null);
      toast('Album updated!');
    } catch {
      toast('Update failed', 'error');
    }
  };

  const filtered = albums.filter((a) => {
    if (searchId && !String(a.id).includes(searchId)) return false;
    if (searchTitle && !a.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="albums-page">
      <div className="page-header">
        <div className="header-left">
          <button className="btn-home" onClick={() => navigate('/Home')}>🏠 Home</button>
          <h2>📷 My Destinations</h2>
        </div>
        <button className="btn-add-main" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Close' : '➕ Add Destination'}
        </button>
      </div>

      {showAddForm && (
        <div className="top-add-section">
          <div className="modern-form">
            <input 
              value={newAlbumTitle} 
              onChange={(e) => setNewAlbumTitle(e.target.value)}
              placeholder="Where to? (e.g. Paris 2026)" 
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button className="btn-primary" onClick={handleAdd}>Save</button>
          </div>
        </div>
      )}

      <div className="albums-toolbar">
        <input placeholder="Search ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
        <input placeholder="Search Name" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
      </div>

      {loading ? <Spinner text="Loading..." /> : (
        <div className="albums-grid">
          {filtered.map((album) => (
            <div key={album.id} className="album-card">
              {/* ניווט מדויק המכיל את שני המזהים בכתובת */}
              <div className="album-click-area" onClick={() => navigate(`/users/${userId}/albums/${album.id}/photos`)}>
                {covers[album.id] ? <img className="album-cover-img" src={covers[album.id]} alt="" /> : <div className="album-cover-placeholder">🗺️</div>}
              </div>
              <div className="album-info">
                {editAlbumId === album.id ? (
                  <div className="album-edit-inline">
                    <input 
                      value={editAlbumTitle} 
                      onChange={(e) => setEditAlbumTitle(e.target.value)} 
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleEditAlbumSave(album)}
                    />
                    <button className="btn-mini-save" onClick={() => handleEditAlbumSave(album)}>💾</button>
                    <button className="btn-mini-cancel" onClick={() => setEditAlbumId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <span className="album-title" onClick={() => navigate(`/users/${userId}/albums/${album.id}/photos`)}>{album.title}</span>
                    <div className="album-meta-row">
                      <span className="album-id">#{String(album.id)}</span>
                      <div className="album-actions">
                        <button className="btn-mini-action" onClick={() => { setEditAlbumId(album.id); setEditAlbumTitle(album.title); }}>✏️</button>
                        <button className="btn-mini-action" onClick={() => setConfirmDelete(album.id)}>🗑️</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this destination and all its photos?"
          onConfirm={async () => {
            await deleteAlbum(confirmDelete, userId);
            setAlbums(prev => prev.filter(a => a.id !== confirmDelete));
            setConfirmDelete(null);
            toast('Album deleted');
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function AlbumPhotos() {
  const { userId, albumId } = useParams(); // קריאת שני המזהים מהכתובת
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editPhotoId, setEditPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 6; 

  useEffect(() => { 
    if (userId && albumId) {
      loadPhotos(1, true); 
      loadAlbumTitle(); 
    }
  }, [albumId, userId]);

  const loadAlbumTitle = async () => {
    try {
      const data = await getAlbumsByUser(userId);
      const fetched = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const found = fetched.find(a => String(a.id) === String(albumId));
      if (found) {
        setAlbumTitle(found.title);
      }
    } catch {}
  };

  const loadPhotos = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const res = await getPhotosByAlbum(albumId, pageNum, LIMIT);
      const fetchedData = Array.isArray(res) ? res : (res?.data || []);
      
      setPhotos((prev) => reset ? fetchedData : [...prev, ...fetchedData]);
      
      if (res.next !== undefined) {
        setHasMore(res.next !== null);
      } else {
        setHasMore(fetchedData.length === LIMIT);
      }
      
      setPage(pageNum);
    } catch (err) {
      toast('Failed to load photos', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX = 600;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setNewPhotoUrl(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl) { toast('Please choose an image', 'error'); return; }
    try {
      const added = await createPhoto({ 
        albumId: Number(albumId) || albumId, 
        title: newPhotoTitle.trim() || 'Untitled Memory', 
        url: newPhotoUrl, 
        thumbnailUrl: newPhotoUrl 
      });
      setPhotos((prev) => [added, ...prev]);
      setNewPhotoUrl(''); setNewPhotoTitle(''); setShowAddForm(false);
      toast('Memory saved!');
    } catch { toast('Error saving photo', 'error'); }
  };

  const handleEditSave = async (photo) => {
    try {
      const updated = await updatePhoto(photo.id, { ...photo, title: editPhotoTitle.trim() });
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
      setEditPhotoId(null);
      toast('Updated!');
    } catch { toast('Update failed', 'error'); }
  };

  return (
    <div className="photos-page">
      <div className="photos-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(`/users/${userId}/albums`)}>← Back</button>
          <h2>{albumTitle ? `Album ${albumTitle}` : `Album #${String(albumId)}`}</h2>
        </div>
        <button className="btn-add-main" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Close' : '📸 Add Memory'}
        </button>
      </div>

      {showAddForm && (
        <div className="top-add-section">
          <div className="modern-photo-form">
            <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
              {newPhotoUrl ? <img src={newPhotoUrl} className="preview-img" alt="preview" /> : <span>📁 Choose Image</span>}
              <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
            </div>
            <div className="form-inputs">
              <input value={newPhotoTitle} onChange={(e) => setNewPhotoTitle(e.target.value)} placeholder="Caption..." autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddPhoto()} />
              <button className="btn-primary" onClick={handleAddPhoto}>Add to Album</button>
            </div>
          </div>
        </div>
      )}

      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card-polaroid">
            <div className="polaroid-img-wrap" onClick={() => setLightbox(photo)}>
              <img src={photo.url} alt="" />
            </div>
            {editPhotoId === photo.id ? (
              <div className="polaroid-edit-box">
                <input value={editPhotoTitle} onChange={(e) => setEditPhotoTitle(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleEditSave(photo)} />
                <button className="btn-mini-save" onClick={() => handleEditSave(photo)}>💾</button>
                <button className="btn-mini-cancel" onClick={() => setEditPhotoId(null)}>✕</button>
              </div>
            ) : (
              <div className="polaroid-caption">
                <span className="caption-text">{photo.title}</span>
                <div className="caption-actions">
                  <button className="btn-mini-action" onClick={() => { setEditPhotoId(photo.id); setEditPhotoTitle(photo.title); }}>✏️</button>
                  <button className="btn-mini-action" onClick={() => setConfirmDelete(photo.id)}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="load-more" style={{ textAlign: 'center', margin: '35px 0' }}>
          <button className="btn-secondary" onClick={() => loadPhotos(page + 1)}>
            ⬇️ View More Memories
          </button>
        </div>
      )}
      {loading && photos.length > 0 && <Spinner text="Fetching more memories..." />}

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.url} alt="" />
            <p className="lightbox-title">{lightbox.title}</p>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete memory?"
          onConfirm={async () => {
            await deletePhoto(confirmDelete);
            setPhotos(prev => prev.filter(p => p.id !== confirmDelete));
            setConfirmDelete(null);
            toast('Deleted', 'error');
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default function Albums() {
  return (
    <Routes>
      <Route index element={<AlbumList />} />
      <Route path=":albumId/photos" element={<AlbumPhotos />} />
    </Routes>
  );
}
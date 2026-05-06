import { useState, useEffect } from 'react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import {
  getAlbumsByUser, createAlbum, deleteAlbum,
  getPhotosByAlbum, createPhoto, updatePhoto, deletePhoto
} from '../services/api';
import '../styles/Albums.css';
 
function AlbumList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
 
  const [albums, setAlbums] = useState([]);
  const [covers, setCovers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
 
  useEffect(() => { fetchAlbums(); }, []);
 
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const data = await getAlbumsByUser(user.id);
      setAlbums(data);
      // fetch cover photo for each album
      data.forEach(async (album) => {
        try {
          const photos = await getPhotosByAlbum(album.id, 1, 1);
          if (photos.length > 0) {
            setCovers((prev) => ({ ...prev, [album.id]: photos[0].thumbnailUrl }));
          }
        } catch {}
      });
    } finally {
      setLoading(false);
    }
  };
 
  const handleAdd = async () => {
    if (!newAlbumTitle.trim()) return;
    const added = await createAlbum({ userId: user.id, title: newAlbumTitle.trim() });
    setAlbums((prev) => [...prev, added]);
    setNewAlbumTitle('');
    setShowAdd(false);
    toast('Album created!');
  };
 
  const handleDelete = async (id) => {
    await deleteAlbum(id);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setConfirmDelete(null);
    toast('Album deleted', 'error');
  };
 
  const filtered = albums.filter((a) => {
    if (searchId && String(a.id) !== searchId) return false;
    if (searchTitle && !a.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    return true;
  });
 
  return (
    <div className="albums-page">
      <div className="page-header">
        <button className="btn-home" onClick={() => navigate('/home')}>🏠 Home</button>
        <h2>📷 My Travel Albums</h2>
      </div>
 
      <div className="albums-toolbar">
        <input type="number" placeholder="Search by ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
        <input placeholder="Search by title" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ New Album'}
        </button>
      </div>
 
      {showAdd && (
        <div className="album-add-form">
          <input
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Album title (e.g. Paris 2025)"
            autoFocus
          />
          <button className="btn-primary" onClick={handleAdd}>Create Album</button>
        </div>
      )}
 
      {loading ? <Spinner text="Loading albums..." /> : filtered.length === 0 ? (
        <div className="empty-state">
          <span>📷</span>
          <p>{albums.length === 0 ? 'No albums yet. Create your first travel album!' : 'No albums match your search.'}</p>
        </div>
      ) : (
        <div className="albums-grid">
          {filtered.map((album) => (
            <div key={album.id} className="album-card">
              {covers[album.id] ? (
                <img
                  className="album-cover"
                  src={covers[album.id]}
                  alt={album.title}
                  onClick={() => navigate(`/home/albums/${album.id}`)}
                />
              ) : (
                <div
                  className="album-cover-placeholder"
                  onClick={() => navigate(`/home/albums/${album.id}`)}
                >
                  🏔️
                </div>
              )}
              <div className="album-info" onClick={() => navigate(`/home/albums/${album.id}`)}>
                <span className="album-id">#{album.id}</span>
                <span className="album-title">{album.title}</span>
              </div>
              <div className="album-footer">
                <button className="album-delete" onClick={(e) => { e.stopPropagation(); setConfirmDelete(album.id); }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this album?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
 
function AlbumPhotos() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
 
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const LIMIT = 6;
 
  const [showAdd, setShowAdd] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [editPhotoId, setEditPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
 
  useEffect(() => { loadPhotos(1, true); }, [albumId]);
 
  const loadPhotos = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const data = await getPhotosByAlbum(albumId, pageNum, LIMIT);
      setPhotos((prev) => reset ? data : [...prev, ...data]);
      setHasMore(data.length === LIMIT);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  };
 
  const handleAddPhoto = async () => {
    if (!newPhotoTitle.trim()) return;
    const seed = Math.random().toString(36).substring(7);
    const url = newPhotoUrl || `https://picsum.photos/seed/${seed}/600/400`;
    const thumb = newPhotoUrl || `https://picsum.photos/seed/${seed}/150/150`;
    const added = await createPhoto({ albumId: parseInt(albumId), title: newPhotoTitle.trim(), url, thumbnailUrl: thumb });
    setPhotos((prev) => [...prev, added]);
    setNewPhotoTitle(''); setNewPhotoUrl(''); setShowAdd(false);
    toast('Photo added!');
  };
 
  const handleDeletePhoto = async (id) => {
    await deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
    toast('Photo deleted', 'error');
  };
 
  const handleEditSave = async (photo) => {
    const updated = await updatePhoto(photo.id, { ...photo, title: editPhotoTitle });
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
    setEditPhotoId(null);
    toast('Photo updated');
  };
 
  return (
    <div className="photos-page">
      <div className="photos-header">
        <button className="btn-back" onClick={() => navigate('/home/albums')}>← Back to Albums</button>
        <h2>Album #{albumId} Photos</h2>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Photo'}
        </button>
      </div>
 
      {showAdd && (
        <div className="photo-add-form">
          <input value={newPhotoTitle} onChange={(e) => setNewPhotoTitle(e.target.value)} placeholder="Photo title" />
          <input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="Image URL (optional)" />
          <button className="btn-primary" onClick={handleAddPhoto}>Add</button>
        </div>
      )}
 
      {loading && photos.length === 0 ? <Spinner text="Loading photos..." /> : photos.length === 0 ? (
        <div className="empty-state">
          <span>🖼️</span>
          <p>No photos yet. Add your first photo!</p>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.thumbnailUrl} alt={photo.title} onClick={() => setLightbox(photo)} />
              {editPhotoId === photo.id ? (
                <div className="photo-edit">
                  <input value={editPhotoTitle} onChange={(e) => setEditPhotoTitle(e.target.value)} />
                  <button onClick={() => handleEditSave(photo)}>Save</button>
                  <button onClick={() => setEditPhotoId(null)}>✕</button>
                </div>
              ) : (
                <p className="photo-title">{photo.title}</p>
              )}
              <div className="photo-actions">
                <button onClick={() => { setEditPhotoId(photo.id); setEditPhotoTitle(photo.title); }}>✏️</button>
                <button onClick={() => setConfirmDelete(photo.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {hasMore && !loading && (
        <div className="load-more">
          <button className="btn-secondary" onClick={() => loadPhotos(page + 1)}>Load More Photos</button>
        </div>
      )}
      {loading && photos.length > 0 && <Spinner text="Loading more..." />}
 
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.url} alt={lightbox.title} />
            <p>{lightbox.title}</p>
          </div>
        </div>
      )}
 
      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this photo?"
          onConfirm={() => handleDeletePhoto(confirmDelete)}
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
      <Route path=":albumId" element={<AlbumPhotos />} />
    </Routes>
  );
}
 
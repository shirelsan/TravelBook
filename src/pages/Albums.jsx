import { useState, useEffect } from 'react';
import { useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAlbumsByUser, createAlbum, deleteAlbum,
  getPhotosByAlbum, createPhoto, updatePhoto, deletePhoto
} from '../services/api';
import '../styles/Albums.css';
 
function AlbumList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
 
  useEffect(() => {
    fetchAlbums();
  }, [user]);
 
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const data = await getAlbumsByUser(user.id);
      setAlbums(data);
    } finally {
      setLoading(false);
    }
  };
 
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;
    const added = await createAlbum({ userId: user.id, title: newAlbumTitle.trim() });
    setAlbums([...albums, added]);
    setNewAlbumTitle('');
    setShowAdd(false);
  };
 
  const handleDelete = async (id) => {
    await deleteAlbum(id);
    setAlbums(albums.filter((a) => a.id !== id));
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
        <input
          type="number"
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <input
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ New Album'}
        </button>
      </div>
 
      {showAdd && (
        <form className="album-add-form" onSubmit={handleAdd}>
          <input
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            placeholder="Album title (e.g. Paris 2025)"
            required
          />
          <button type="submit" className="btn-primary">Create Album</button>
        </form>
      )}
 
      {loading ? <p>Loading...</p> : (
        <div className="albums-grid">
          {filtered.map((album) => (
            <div key={album.id} className="album-card">
              <div className="album-thumb">📷</div>
              <div className="album-info">
                <span className="album-id">#{album.id}</span>
                <span
                  className="album-title"
                  onClick={() => navigate(`/home/albums/${album.id}`)}
                >
                  {album.title}
                </span>
              </div>
              <button className="album-delete" onClick={() => handleDelete(album.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
function AlbumPhotos() {
  const { albumId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const LIMIT = 6;
 
  // Add photo
  const [showAdd, setShowAdd] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
 
  // Edit photo
  const [editPhotoId, setEditPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
 
  useEffect(() => {
    loadPhotos(1, true);
  }, [albumId]);
 
  const loadPhotos = async (pageNum, reset = false) => {
    setLoading(true);
    try {
      const data = await getPhotosByAlbum(albumId, pageNum, LIMIT);
      if (reset) {
        setPhotos(data);
      } else {
        setPhotos((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === LIMIT);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  };
 
  const handleLoadMore = () => loadPhotos(page + 1);
 
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    const seed = Math.random().toString(36).substring(7);
    const url = newPhotoUrl || `https://picsum.photos/seed/${seed}/600/400`;
    const thumb = newPhotoUrl || `https://picsum.photos/seed/${seed}/150/150`;
    const added = await createPhoto({
      albumId: parseInt(albumId),
      title: newPhotoTitle.trim(),
      url,
      thumbnailUrl: thumb
    });
    setPhotos([...photos, added]);
    setNewPhotoTitle('');
    setNewPhotoUrl('');
    setShowAdd(false);
  };
 
  const handleDeletePhoto = async (id) => {
    await deletePhoto(id);
    setPhotos(photos.filter((p) => p.id !== id));
  };
 
  const handleEditSave = async (photo) => {
    const updated = await updatePhoto(photo.id, { ...photo, title: editPhotoTitle });
    setPhotos(photos.map((p) => (p.id === photo.id ? updated : p)));
    setEditPhotoId(null);
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
        <form className="photo-add-form" onSubmit={handleAddPhoto}>
          <input
            value={newPhotoTitle}
            onChange={(e) => setNewPhotoTitle(e.target.value)}
            placeholder="Photo title"
            required
          />
          <input
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
          <button type="submit" className="btn-primary">Add Photo</button>
        </form>
      )}
 
      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card">
            <img
              src={photo.thumbnailUrl}
              alt={photo.title}
              onClick={() => setLightbox(photo)}
            />
            {editPhotoId === photo.id ? (
              <div className="photo-edit">
                <input
                  value={editPhotoTitle}
                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                />
                <button onClick={() => handleEditSave(photo)}>Save</button>
                <button onClick={() => setEditPhotoId(null)}>Cancel</button>
              </div>
            ) : (
              <p className="photo-title">{photo.title}</p>
            )}
            <div className="photo-actions">
              <button onClick={() => { setEditPhotoId(photo.id); setEditPhotoTitle(photo.title); }}>✏️</button>
              <button onClick={() => handleDeletePhoto(photo.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
 
      {hasMore && (
        <div className="load-more">
          <button className="btn-secondary" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More Photos'}
          </button>
        </div>
      )}
 
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.url} alt={lightbox.title} />
            <p>{lightbox.title}</p>
          </div>
        </div>
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
 
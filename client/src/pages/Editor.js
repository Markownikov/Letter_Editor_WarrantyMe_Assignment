import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import { saveLetterToGoogleDrive, fetchLetter } from '../utils/api';

const Editor = () => {
  const { id } = useParams();
  const { googleAccessToken } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('Untitled Letter');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id && googleAccessToken) {
      setLoading(true);
      fetchLetter(id, googleAccessToken)
        .then(response => {
          if (response.success) {
            setContent(response.content);
            // Try to extract a title from the first few characters if possible
            const contentText = response.content;
            if (contentText.length > 0) {
              // Extract title from first line if it exists
              const firstLine = contentText.split('\n')[0].trim();
              if (firstLine) {
                setTitle(firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine);
              }
            }
          }
        })
        .catch(err => {
          console.error('Error fetching letter:', err);
          setError('Failed to load the letter. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, googleAccessToken]);

  const handleSave = async () => {
    if (!googleAccessToken) {
      setError('Google Drive access token is missing. Please log out and log in again.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      console.log('Attempting to save letter with access token');
      const response = await saveLetterToGoogleDrive(content, title, id, googleAccessToken);
      
      if (response.success) {
        setSuccess('Letter saved successfully to Google Drive!');
        // If this was a new letter, redirect to the edit page with the new ID
        if (!id && response.fileId) {
          navigate(`/editor/${response.fileId}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error saving letter:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save the letter. Please try again.');
      }
      
      // If it's an authentication error, prompt user to log out and log back in
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log out and log in again to refresh your access token.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  if (loading) {
    return <div className="container flex flex-center" style={{ height: '70vh' }}>Loading letter...</div>;
  }

  return (
    <div className="editor-page">
      <div className="flex flex-between mb-2" style={{ marginTop: '1rem' }}>
        <button className="btn-secondary" onClick={handleBack}>
          Back to Dashboard
        </button>
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter letter title"
            style={{
              padding: '0.5rem',
              marginRight: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save to Google Drive'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

      <div className="editor-container">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="Start writing your letter here..."
        />
      </div>
    </div>
  );
};

export default Editor;

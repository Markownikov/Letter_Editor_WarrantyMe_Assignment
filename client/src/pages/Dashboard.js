import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLetters } from '../utils/api';

const Dashboard = () => {
  const { currentUser, googleAccessToken } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getLetters = async () => {
      if (!googleAccessToken) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetchLetters(googleAccessToken);
        // Ensure we have a valid array of letters from the response
        if (response && response.letters) {
          setLetters(response.letters);
        } else {
          // If the response does not contain letters property, set to empty array
          console.error('Invalid response format:', response);
          setLetters([]);
          setError('Received an invalid response format from the server.');
        }
      } catch (err) {
        console.error('Error fetching letters:', err);
        setError('Failed to load your letters. Please try again later.');
        setLetters([]); // Ensure letters is always an array even on error
      } finally {
        setLoading(false);
      }
    };

    getLetters();
  }, [googleAccessToken]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCreateNew = () => {
    navigate('/editor');
  };

  return (
    <div className="dashboard">
      <div className="flex flex-between mb-2" style={{ marginTop: '1rem' }}>
        <h2>My Letters</h2>
        <button className="btn-primary" onClick={handleCreateNew}>Create New Letter</button>
      </div>

      {error && <div style={{ color: 'red', margin: '1rem 0' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your letters...</div>
      ) : (
        <>
          {letters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '4px', marginTop: '1rem' }}>
              <p>You don't have any letters yet.</p>
              <button 
                className="btn-primary" 
                onClick={handleCreateNew}
                style={{ marginTop: '1rem' }}
              >
                Create Your First Letter
              </button>
            </div>
          ) : (
            <ul className="letter-list">
              {letters.map((letter) => (
                <li 
                  key={letter.id} 
                  className="letter-item"
                  onClick={() => navigate(`/editor/${letter.id}`)}
                >
                  <div className="flex flex-between">
                    <div>
                      <h3>{letter.name}</h3>
                      <p>Last modified: {formatDate(letter.modifiedTime)}</p>
                    </div>
                    <div>
                      <button 
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/${letter.id}`);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from 'react';
import axios from 'axios';

export function useIndianLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    axios.get('/auth/locations')
      .then((response) => {
        if (active) setLocations(response.data.locations || []);
      })
      .catch(() => {
        if (active) setError('Unable to load states and districts. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { locations, loading, error };
}

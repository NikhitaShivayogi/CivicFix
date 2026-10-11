import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { AlertCircle, Camera, CheckCircle2, FileImage, LocateFixed, MapPin, X } from 'lucide-react';

const categories = [
  'Road/Pothole',
  'Streetlight',
  'Garbage/Waste',
  'Water Leakage',
  'Drainage',
  'Public Property',
  'Traffic/Safety',
  'Fallen Tree',
  'Other',
];

const indiaCenter = [20.5937, 78.9629];

async function reverseGeocode([latitude, longitude]) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'en-IN',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
  if (!response.ok) throw new Error('Address lookup failed');

  const result = await response.json();
  const address = result.address || {};
  const parts = [
    address.road,
    address.pedestrian,
    address.residential,
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.town,
    address.city,
    address.village,
    address.county,
    address.state,
  ].filter(Boolean);

  return parts.filter((part, index) =>
    parts.findIndex((candidate) => candidate.toLocaleLowerCase('en-IN') === part.toLocaleLowerCase('en-IN')) === index
  ).slice(0, 4).join(', ') || result.display_name || '';
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -32],
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition([event.latlng.lat, event.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1 });
  }, [map, position]);

  return null;
}

export default function ReportIssuePage() {
  const [form, setForm] = useState({
    title: '',
    category: 'Road/Pothole',
    description: '',
    location: { latitude: null, longitude: null, address: '' },
  });
  const [evidence, setEvidence] = useState(null);
  const [evidenceError, setEvidenceError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationMode, setLocationMode] = useState('MANUAL');
  const [gpsPosition, setGpsPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [addressStatus, setAddressStatus] = useState('');

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !cameraStreamRef.current) return;

    videoRef.current.srcObject = cameraStreamRef.current;
    videoRef.current.play().catch(() => setCameraError('Unable to start the camera preview.'));
  }, [cameraOpen]);

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.location.latitude === null || form.location.longitude === null) {
      setLocationError('Pin the issue location on the map or use your current location before submitting.');
      return;
    }
    setLocationError('');
    setLoading(true);

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('category', form.category);
    payload.append('description', form.description);
    payload.append('location[latitude]', String(form.location.latitude));
    payload.append('location[longitude]', String(form.location.longitude));
    payload.append('location[address]', form.location.address);
    if (evidence) payload.append('image', evidence);

    try {
      const response = await axios.post('/reports', payload);
      setSubmitted(response.data.report);
      window.dispatchEvent(new Event('civicfix:notifications-updated'));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.errors?.[0]?.msg ||
          'Unable to submit your report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = ([latitude, longitude]) => {
    setForm((current) => ({
      ...current,
      location: {
        ...current.location,
        latitude,
        longitude,
      },
    }));
  };

  const useCurrentLocation = () => {
    setLocationMode('GPS');
    setLocationError('');
    setAddressStatus('');

    if (!navigator.geolocation) {
      setLocationMode('MANUAL');
      setLocationError('Location is not available in this browser. Pin the issue on the map instead.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        updatePosition(position);
        setGpsPosition(position);
        setResolvingAddress(true);
        setAddressStatus('Finding the nearby street and area...');
        try {
          const address = await reverseGeocode(position);
          if (address) {
            setForm((current) => ({
              ...current,
              location: { ...current.location, address },
            }));
            setAddressStatus('Nearby address filled from OpenStreetMap. You can edit it if needed.');
          } else {
            setAddressStatus('Location pinned. Add a street or landmark if you know it.');
          }
        } catch {
          setAddressStatus('Location pinned, but the street lookup failed. You can enter it manually.');
        } finally {
          setResolvingAddress(false);
          setLocating(false);
        }
      },
      (geoError) => {
        setLocationMode('MANUAL');
        setLocationError(geoError.code === 1
          ? 'Location permission was denied. You can still pin the issue on the map.'
          : 'Could not get your location. Check your device settings or pin the issue on the map.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const chooseManualLocation = () => {
    setLocationMode('MANUAL');
    setGpsPosition(null);
    setLocationError('');
    setAddressStatus('');
    setForm((current) => ({
      ...current,
      location: { ...current.location, latitude: null, longitude: null },
    }));
  };

  const selectEvidence = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setEvidenceError('');

    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setEvidenceError('Choose a JPG, PNG, or WEBP photo.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEvidenceError('Photo must be 5 MB or smaller.');
      return;
    }

    setEvidence(file);
  };

  const openCamera = async () => {
    setEvidenceError('');
    setCameraError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera access is unavailable. Open CivicFix over HTTPS or choose a photo from your device.');
      return;
    }

    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      setCameraOpen(true);
    } catch (cameraRequestError) {
      setCameraError(cameraRequestError.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access in your browser settings.'
        : cameraRequestError.name === 'NotFoundError'
          ? 'No camera was found on this device.'
          : 'Unable to open the camera. Check that it is not being used by another app.');
    }
  };

  const closeCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraOpen(false);
    setCameraError('');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      setCameraError('The camera is still starting. Try again in a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Unable to capture the photo. Please try again.');
        return;
      }

      const photo = new File([blob], `civicfix-${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (photo.size > 5 * 1024 * 1024) {
        setEvidenceError('Captured photo is larger than 5 MB. Try again or choose a smaller photo.');
        closeCamera();
        return;
      }

      setEvidence(photo);
      setEvidenceError('');
      closeCamera();
    }, 'image/jpeg', 0.85);
  };

  const clearEvidence = () => {
    setEvidence(null);
    setEvidenceError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-civic-100 text-civic-700">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Issue reported successfully</h1>
        <p className="mt-4 text-slate-600">Your report ID is <span className="font-semibold text-civic-700">{submitted.reportId}</span>.</p>
        <p className="mt-2 text-sm text-slate-500">Authority review has begun and notifications will be sent as the status changes.</p>
        <Link to="/citizen/reports" className="mt-6 inline-flex items-center justify-center rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white hover:bg-civic-700">
          View my reports
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-3xl font-bold text-slate-900">Report a civic issue</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Issue title</label>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" placeholder="Broken streetlight near the park" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Issue category</label>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" required>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Detailed description</label>
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="5" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" placeholder="Describe the issue in detail, including severity, timing, and impact." required />
        </div>

        <section aria-labelledby="report-location-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="report-location-heading" className="text-base font-semibold text-slate-900">Where is the issue?</h2>
              <p className="mt-1 text-sm text-slate-600">When requested, GPS coordinates are used to pin the report and look up a nearby address with OpenStreetMap.</p>
            </div>
            <div role="group" aria-label="Location method" className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button type="button" aria-pressed={locationMode === 'MANUAL'} onClick={chooseManualLocation} className={`rounded-md px-3 py-2 text-sm font-medium ${locationMode === 'MANUAL' ? 'bg-white text-civic-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <MapPin size={16} className="mr-1.5 inline" />Pin on map
              </button>
              <button type="button" aria-pressed={locationMode === 'GPS'} onClick={useCurrentLocation} disabled={locating} className={`rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60 ${locationMode === 'GPS' ? 'bg-white text-civic-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <LocateFixed size={16} className="mr-1.5 inline" />{resolvingAddress ? 'Finding nearby street...' : locating ? 'Finding you...' : 'Use current location'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <MapContainer center={indiaCenter} zoom={5} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker
                  position={form.location.latitude === null ? null : [form.location.latitude, form.location.longitude]}
                  setPosition={(position) => {
                    updatePosition(position);
                    setLocationMode('MANUAL');
                    setGpsPosition(null);
                    setLocationError('');
                  }}
                />
                <RecenterMap position={gpsPosition} />
              </MapContainer>
            </div>
            <p className="mt-2 text-xs text-slate-500">{locationMode === 'GPS' ? 'Current device location selected.' : 'Tap the map to place a pin at the issue.'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Street, area, or landmark <span className="font-normal text-slate-500">(optional)</span></label>
              <input autoComplete="street-address" value={form.location.address} onChange={(event) => setForm({ ...form, location: { ...form.location, address: event.target.value } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-civic-500" placeholder="Street, area, or nearby landmark" />
              {addressStatus && <p role="status" className="mt-2 text-xs text-slate-500">{addressStatus}</p>}
            </div>
            {form.location.latitude !== null && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                Pin: {form.location.latitude.toFixed(5)}, {form.location.longitude.toFixed(5)}
              </p>
            )}
            {locationError && <p role="alert" className="text-sm text-red-700">{locationError}</p>}
          </div>
        </div>
        </section>

        <div>
          <p className="text-sm font-medium text-slate-700">Photo evidence <span className="font-normal text-slate-500">(optional)</span></p>
          <p className="mt-1 text-xs text-slate-500">Take a new photo or choose one from your device. JPG, PNG, or WEBP, up to 5 MB.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={openCamera} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-civic-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-civic-700">
              <Camera size={17} /> Take a photo
            </button>
            <input ref={fileInputRef} id="file-evidence" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectEvidence} className="sr-only" />
            <label htmlFor="file-evidence" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <FileImage size={17} /> Choose from device
            </label>
          </div>
          {evidence && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="min-w-0 truncate text-sm text-slate-700">{evidence.name}</p>
              <button type="button" onClick={clearEvidence} className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900" aria-label="Remove selected photo" title="Remove photo">
                <X size={16} />
              </button>
            </div>
          )}
          {evidenceError && <p role="alert" className="mt-2 text-sm text-red-700">{evidenceError}</p>}
          {cameraError && !cameraOpen && <p role="alert" className="mt-2 text-sm text-red-700">{cameraError}</p>}
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-xl bg-civic-600 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit report'}
        </button>
      </form>

      {cameraOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget) closeCamera();
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="camera-dialog-title" className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="camera-dialog-title" className="text-lg font-semibold text-slate-900">Take a photo</h2>
              <button type="button" onClick={closeCamera} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close camera">
                <X size={20} />
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="max-h-[65vh] w-full rounded-lg bg-black object-contain" aria-label="Live camera preview" />
            {cameraError && <p role="alert" className="mt-3 text-sm text-red-700">{cameraError}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={closeCamera} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={capturePhoto} className="inline-flex items-center gap-2 rounded-lg bg-civic-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-civic-700">
                <Camera size={17} /> Capture photo
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

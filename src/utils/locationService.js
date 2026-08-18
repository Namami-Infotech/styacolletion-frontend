/**
 * Shared Location & Geocoding Services
 * Supports:
 * 1. Google Places Autocomplete (if VITE_GOOGLE_MAPS_API_KEY is provided)
 * 2. High accuracy India-biased Photon & Nominatim Geocoding (Free fallback)
 * 3. Direct Google Maps Query action
 * 4. Reverse Geocoding
 */

const GOOGLE_API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsScriptLoading = false;
let googleMapsScriptLoaded = false;

export function loadGoogleMapsSDK() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.maps?.places) {
    googleMapsScriptLoaded = true;
    return Promise.resolve(true);
  }
  if (!GOOGLE_API_KEY) {
    return Promise.resolve(false);
  }
  if (googleMapsScriptLoading) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  }

  googleMapsScriptLoading = true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsScriptLoaded = true;
      googleMapsScriptLoading = false;
      resolve(true);
    };
    script.onerror = () => {
      googleMapsScriptLoading = false;
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

// Reverse Geocode helper
export async function reverseGeocodeCoords(lat, lng) {
  // If Google Maps is available, use Google Geocoder
  if (window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const res = await geocoder.geocode({ location: { lat, lng } });
      if (res.results && res.results[0]) {
        return res.results[0].formatted_address;
      }
    } catch (e) {
      console.warn('Google reverse geocode error:', e);
    }
  }

  // 1. Try Nominatim reverse
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.display_name) {
        return data.display_name;
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse error:', e);
  }

  // 2. Fallback: BigDataCloud Reverse Geocode
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const parts = [
        data.locality || data.localityInfo?.administrative?.[3]?.name,
        data.city || data.localityInfo?.administrative?.[2]?.name,
        data.principalSubdivision || data.state,
        data.postcode,
        data.countryName,
      ].filter(Boolean);
      if (parts.length > 0) {
        return Array.from(new Set(parts)).join(', ');
      }
    }
  } catch (e) {
    console.warn('BigDataCloud reverse error:', e);
  }

  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// Fetch suggestions from Google Places Autocomplete if available
async function fetchGooglePlaceSuggestions(query) {
  if (!window.google?.maps?.places?.AutocompleteService) return [];

  return new Promise((resolve) => {
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' }, // Restricted to India
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            Array.isArray(predictions)
          ) {
            const list = predictions.map((p) => ({
              isGooglePlace: true,
              placeId: p.place_id,
              shortName: p.structured_formatting?.main_text || p.description,
              displayName: p.description,
              lat: null,
              lng: null,
            }));
            resolve(list);
          } else {
            resolve([]);
          }
        }
      );
    } catch {
      resolve([]);
    }
  });
}

export async function getGooglePlaceDetails(placeId) {
  if (!window.google?.maps?.places?.PlacesService) return null;

  return new Promise((resolve) => {
    try {
      const dummyDiv = document.createElement('div');
      const service = new window.google.maps.places.PlacesService(dummyDiv);
      service.getDetails(
        {
          placeId,
          fields: ['name', 'geometry', 'formatted_address'],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            resolve({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              displayName: place.formatted_address || place.name,
              shortName: place.name || place.formatted_address,
            });
          } else {
            resolve(null);
          }
        }
      );
    } catch {
      resolve(null);
    }
  });
}

// Unified Place Search
export async function fetchPlaceSuggestions(query, userLocationBias = null) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Check if raw coordinates
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const revAddr = await reverseGeocodeCoords(lat, lng);
      return [
        {
          displayName: revAddr || `${lat}, ${lng}`,
          shortName: `Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          lat,
          lng,
        },
      ];
    }
  }

  // 1. Try Google Places if SDK loaded
  if (window.google?.maps?.places) {
    const googleResults = await fetchGooglePlaceSuggestions(trimmed);
    if (googleResults.length > 0) {
      return googleResults;
    }
  }

  const results = [];
  const seenKeys = new Set();

  // Always offer a "Direct search on Google Maps" suggestion item
  results.push({
    isDirectQuery: true,
    shortName: `Search "${trimmed}" on Google Maps`,
    displayName: trimmed,
    lat: null,
    lng: null,
  });

  // Bias coordinates (default Delhi/NCR or user's position)
  const biasLat = userLocationBias?.lat || 28.6139;
  const biasLng = userLocationBias?.lng || 77.2090;

  // 2. Query Komoot Photon (with India bias)
  try {
    const photonRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        trimmed
      )}&lat=${biasLat}&lon=${biasLng}&limit=10&lang=en`
    );
    if (photonRes.ok) {
      const photonData = await photonRes.json();
      if (photonData?.features && photonData.features.length > 0) {
        for (const feat of photonData.features) {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates || [];
          const lng = coords[0];
          const lat = coords[1];

          if (typeof lat !== 'number' || typeof lng !== 'number') continue;

          // Filter out foreign results if searching Indian places
          const isIndia =
            props.countrycode === 'IN' ||
            (props.country && props.country.toLowerCase().includes('india')) ||
            (props.state && /delhi|uttar pradesh|maharashtra|haryana|karnataka|punjab|rajasthan|bihar|gujarat|telangana|tamil nadu|madhya pradesh|west bengal|kerala/i.test(props.state));

          // If result is foreign and country not explicitly typed, skip it
          if (!isIndia && !/usa|america|uk|england|canada/i.test(trimmed)) {
            continue;
          }

          const streetPart = props.housenumber ? `${props.housenumber} ${props.street || ''}`.trim() : props.street;
          const nameParts = [
            props.name,
            streetPart,
            props.district || props.suburb || props.locality,
            props.city,
            props.state,
            props.postcode,
            props.country || 'India',
          ].filter(Boolean);

          const uniqueParts = Array.from(new Set(nameParts));
          const fullName = uniqueParts.join(', ');
          const shortName = props.name || props.street || props.district || props.city || trimmed;

          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              displayName: fullName || trimmed,
              shortName: shortName,
              lat,
              lng,
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Photon API fetch error:', e);
  }

  // 3. Query Nominatim with India countrycode
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&limit=10&countrycodes=in&addressdetails=1&accept-language=en`
    );
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (Array.isArray(nomData) && nomData.length > 0) {
        for (const item of nomData) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lng)) continue;

          const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            const shortName =
              item.name ||
              item.address?.road ||
              item.address?.suburb ||
              item.address?.neighbourhood ||
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.display_name.split(',')[0];

            results.push({
              displayName: item.display_name,
              shortName: shortName || trimmed,
              lat,
              lng,
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Nominatim API fetch error:', e);
  }

  return results;
}

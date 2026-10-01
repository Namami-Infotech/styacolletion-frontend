/**
 * Shared Location & Geocoding Services
 * Supports:
 * 1. Google Maps SDK loader (with Places & Geometry libraries)
 * 2. Interactive Google Map & Draggable Marker initialization
 * 3. Google Places Autocomplete binding
 * 4. Google Places Autocomplete Service (suggestions & details)
 * 5. High-accuracy Reverse Geocoding with structured address parsing
 * 6. Forward Geocoding
 * 7. India-biased Photon & Nominatim Geocoding fallback
 * 8. Comprehensive Indian Address Parser
 */

export const GOOGLE_API_KEY =
  import.meta.env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyB3WYl5SI0IEo4QvpssbCfNiFz9NlbjhBc';

let googleMapsScriptLoading = false;
let googleMapsScriptLoaded = false;

/**
 * Dynamically load Google Maps JavaScript API SDK if not already loaded.
 */
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
    // Check if script tag already exists in DOM
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      existing.addEventListener('load', () => {
        googleMapsScriptLoaded = true;
        googleMapsScriptLoading = false;
        resolve(true);
      });
      existing.addEventListener('error', () => {
        googleMapsScriptLoading = false;
        resolve(false);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry`;
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

/**
 * Parse Google Maps address_components into structured fields
 */
export function parseAddressComponents(components = []) {
  let city = '';
  let state = '';
  let stateCode = '';
  let pincode = '';
  let street = '';
  let country = 'India';
  let countryCode = 'IN';
  let sublocality = '';
  let route = '';
  let streetNumber = '';

  if (Array.isArray(components)) {
    for (const comp of components) {
      const types = comp.types || [];
      if (types.includes('street_number')) {
        streetNumber = comp.long_name;
      }
      if (types.includes('route')) {
        route = comp.long_name;
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        sublocality = comp.long_name;
      }
      if (types.includes('locality')) {
        city = comp.long_name;
      } else if (!city && types.includes('administrative_area_level_2')) {
        city = comp.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = comp.long_name;
        stateCode = comp.short_name || comp.long_name;
      }
      if (types.includes('postal_code')) {
        pincode = comp.long_name;
      }
      if (types.includes('country')) {
        country = comp.long_name;
        countryCode = comp.short_name;
      }
    }
  }

  const streetParts = [streetNumber, route, sublocality].filter(Boolean);
  street = streetParts.join(', ');

  const shortName = (components[0]?.short_name || components[0]?.long_name || '').trim();

  return {
    street,
    city,
    state,
    stateCode,
    pincode,
    postcode: pincode,
    country,
    countryCode,
    shortName,
  };
}

/**
 * Reverse Geocode coordinates to formatted address string
 */
export async function reverseGeocodeCoords(lat, lng) {
  const details = await reverseGeocodeDetails(lat, lng);
  return details?.formatted_address || `${lat}, ${lng}`;
}

/**
 * Reverse Geocode coordinates with detailed structured address components
 */
export async function reverseGeocodeDetails(lat, lng) {
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    return null;
  }

  // 1. Try Google Maps Geocoder if SDK loaded
  if (window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const res = await geocoder.geocode({
        location: { lat: numLat, lng: numLng },
      });

      if (res.results && res.results[0]) {
        const top = res.results[0];
        const parsed = parseAddressComponents(top.address_components);

        return {
          formatted_address: top.formatted_address || '',
          address: top.formatted_address || '',
          displayName: top.formatted_address || '',
          name: parsed.shortName || top.formatted_address || '',
          shortName: parsed.shortName || '',
          street: parsed.street || '',
          city: parsed.city || '',
          state: parsed.state || '',
          stateCode: parsed.stateCode || '',
          pincode: parsed.pincode || '',
          postcode: parsed.pincode || '',
          country: parsed.country || 'India',
          countryCode: parsed.countryCode || 'IN',
          lat: numLat,
          lng: numLng,
          latitude: numLat.toFixed(6),
          longitude: numLng.toFixed(6),
          address_components: top.address_components || [],
        };
      }
    } catch (e) {
      console.warn('Google reverse geocode error:', e);
    }
  }

  // 2. Fallback: Nominatim reverse geocode
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLng}&zoom=18&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.display_name) {
        const addr = data.address || {};
        const parsedIndian = parseIndianAddress(data.display_name);

        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          parsedIndian.city ||
          '';
        const state = addr.state || parsedIndian.state || '';
        const pincode = addr.postcode || parsedIndian.pincode || '';
        const street =
          [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ') ||
          parsedIndian.street ||
          '';

        return {
          formatted_address: data.display_name,
          address: data.display_name,
          displayName: data.display_name,
          name: addr.road || data.name || parsedIndian.street || '',
          shortName: addr.road || data.name || parsedIndian.street || '',
          street,
          city,
          state,
          pincode,
          postcode: pincode,
          lat: numLat,
          lng: numLng,
          latitude: numLat.toFixed(6),
          longitude: numLng.toFixed(6),
        };
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse error:', e);
  }

  // 3. Fallback: BigDataCloud Reverse Geocode
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${numLat}&longitude=${numLng}&localityLanguage=en`
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

      const fullName = parts.length > 0 ? Array.from(new Set(parts)).join(', ') : `${numLat}, ${numLng}`;
      const parsedIndian = parseIndianAddress(fullName);

      return {
        formatted_address: fullName,
        address: fullName,
        displayName: fullName,
        name: data.locality || data.city || '',
        shortName: data.locality || data.city || '',
        street: parsedIndian.street || '',
        city: data.city || parsedIndian.city || '',
        state: data.principalSubdivision || parsedIndian.state || '',
        pincode: data.postcode || parsedIndian.pincode || '',
        postcode: data.postcode || parsedIndian.pincode || '',
        lat: numLat,
        lng: numLng,
        latitude: numLat.toFixed(6),
        longitude: numLng.toFixed(6),
      };
    }
  } catch (e) {
    console.warn('BigDataCloud reverse error:', e);
  }

  const fallbackStr = `${numLat.toFixed(6)}, ${numLng.toFixed(6)}`;
  return {
    formatted_address: fallbackStr,
    address: fallbackStr,
    displayName: fallbackStr,
    name: fallbackStr,
    shortName: fallbackStr,
    street: '',
    city: '',
    state: '',
    pincode: '',
    postcode: '',
    lat: numLat,
    lng: numLng,
    latitude: numLat.toFixed(6),
    longitude: numLng.toFixed(6),
  };
}

/**
 * Fetch suggestions from Google Places AutocompleteService
 */
async function fetchGooglePlaceSuggestions(query) {
  if (!window.google?.maps?.places?.AutocompleteService) return [];

  return new Promise((resolve) => {
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' },
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

/**
 * Retrieve Place Details by Google Place ID
 */
export async function getGooglePlaceDetails(placeId) {
  if (!window.google?.maps?.places?.PlacesService) return null;

  return new Promise((resolve) => {
    try {
      const dummyDiv = document.createElement('div');
      const service = new window.google.maps.places.PlacesService(dummyDiv);
      service.getDetails(
        {
          placeId,
          fields: ['name', 'geometry', 'formatted_address', 'address_components'],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            const parsed = parseAddressComponents(place.address_components);
            const lat = Number(place.geometry.location.lat().toFixed(6));
            const lng = Number(place.geometry.location.lng().toFixed(6));

            resolve({
              lat,
              lng,
              latitude: lat,
              longitude: lng,
              displayName: place.formatted_address || place.name,
              formatted_address: place.formatted_address || '',
              name: place.name || parsed.shortName || '',
              shortName: parsed.shortName || place.name || '',
              city: parsed.city,
              state: parsed.state,
              stateCode: parsed.stateCode,
              postcode: parsed.pincode,
              pincode: parsed.pincode,
              street: parsed.street || place.name || '',
              address_components: place.address_components || [],
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

/**
 * Attach native Google Places Autocomplete to an HTML input element
 * Calls onPlaceSelected with extracted place, coordinates, and address details.
 */
export function attachGooglePlacesAutocomplete(inputElement, onPlaceSelected, options = {}) {
  if (!inputElement || typeof window === 'undefined' || !window.google?.maps?.places?.Autocomplete) {
    return null;
  }

  try {
    const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
      fields: ['geometry', 'formatted_address', 'name', 'address_components'],
      componentRestrictions: { country: 'in' },
      ...options,
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry?.location) return;

      const lat = Number(place.geometry.location.lat().toFixed(6));
      const lng = Number(place.geometry.location.lng().toFixed(6));
      const fullName = place.formatted_address || place.name || '';
      const parsed = parseAddressComponents(place.address_components);

      const placeData = {
        name: place.name || fullName,
        shortName: parsed.shortName || place.name || '',
        formatted_address: fullName,
        address: fullName,
        displayName: fullName,
        latitude: lat,
        longitude: lng,
        lat,
        lng,
        city: parsed.city,
        state: parsed.state,
        pincode: parsed.pincode,
        postcode: parsed.pincode,
        street: parsed.street || place.name || '',
        address_components: place.address_components || [],
      };

      if (typeof onPlaceSelected === 'function') {
        onPlaceSelected(placeData);
      }
    });

    return {
      autocomplete,
      unbind: () => {
        if (window.google?.maps?.event?.removeListener) {
          window.google.maps.event.removeListener(listener);
        }
      },
    };
  } catch (err) {
    console.warn('attachGooglePlacesAutocomplete error:', err);
    return null;
  }
}

/**
 * Initialize an Interactive Google Map with a draggable Marker.
 * Handles dragend reverse geocode and map click location setting.
 */
export function initInteractiveGoogleMap({
  container,
  initialLat = 28.6139,
  initialLng = 77.2090,
  zoom = 14,
  draggableMarker = true,
  onLocationChange,
}) {
  if (!container || typeof window === 'undefined' || !window.google?.maps?.Map) {
    return null;
  }

  const lat = parseFloat(initialLat) || 28.6139;
  const lng = parseFloat(initialLng) || 77.2090;
  const center = { lat, lng };

  const map = new window.google.maps.Map(container, {
    zoom,
    center,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  });

  const marker = new window.google.maps.Marker({
    position: center,
    map,
    draggable: draggableMarker,
    animation: window.google.maps.Animation.DROP,
  });

  // Handle Marker Drag End
  const dragListener = marker.addListener('dragend', async () => {
    const pos = marker.getPosition();
    const curLat = Number(pos.lat().toFixed(6));
    const curLng = Number(pos.lng().toFixed(6));

    const details = await reverseGeocodeDetails(curLat, curLng);
    if (typeof onLocationChange === 'function') {
      onLocationChange(details || {
        latitude: curLat,
        longitude: curLng,
        lat: curLat,
        lng: curLng,
        formatted_address: `${curLat}, ${curLng}`,
        address: `${curLat}, ${curLng}`,
      });
    }
  });

  // Handle Map Click (click to drop/move pin)
  const clickListener = map.addListener('click', async (e) => {
    if (!e.latLng) return;
    const curLat = Number(e.latLng.lat().toFixed(6));
    const curLng = Number(e.latLng.lng().toFixed(6));

    marker.setPosition(e.latLng);
    map.panTo(e.latLng);

    const details = await reverseGeocodeDetails(curLat, curLng);
    if (typeof onLocationChange === 'function') {
      onLocationChange(details || {
        latitude: curLat,
        longitude: curLng,
        lat: curLat,
        lng: curLng,
        formatted_address: `${curLat}, ${curLng}`,
        address: `${curLat}, ${curLng}`,
      });
    }
  });

  return {
    map,
    marker,
    setPosition: (newLat, newLng, pan = true) => {
      const pLat = parseFloat(newLat);
      const pLng = parseFloat(newLng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        const newPos = new window.google.maps.LatLng(pLat, pLng);
        marker.setPosition(newPos);
        if (pan) {
          map.panTo(newPos);
        }
      }
    },
    destroy: () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.removeListener(dragListener);
        window.google.maps.event.removeListener(clickListener);
      }
      marker.setMap(null);
    },
  };
}

/**
 * Unified Place Search:
 * Google Places Autocomplete API -> Photon (India biased) -> Nominatim
 */
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

          const isIndia =
            props.countrycode === 'IN' ||
            (props.country && props.country.toLowerCase().includes('india')) ||
            (props.state &&
              /delhi|uttar pradesh|maharashtra|haryana|karnataka|punjab|rajasthan|bihar|gujarat|telangana|tamil nadu|madhya pradesh|west bengal|kerala/i.test(
                props.state
              ));

          if (!isIndia && !/usa|america|uk|england|canada/i.test(trimmed)) {
            continue;
          }

          const streetPart = props.housenumber
            ? `${props.housenumber} ${props.street || ''}`.trim()
            : props.street;
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
              city: props.city || props.district || props.suburb || '',
              state: props.state || '',
              postcode: props.postcode || '',
              pincode: props.postcode || '',
              street: [props.name, streetPart, props.locality].filter(Boolean).join(', ') || shortName,
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
              city:
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.county ||
                '',
              state: item.address?.state || '',
              postcode: item.address?.postcode || '',
              pincode: item.address?.postcode || '',
              street:
                [item.address?.road, item.address?.suburb, item.address?.neighbourhood]
                  .filter(Boolean)
                  .join(', ') || shortName,
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

/**
 * Robust Indian Address Parser:
 * Splits raw address string or Google Maps formatted address into:
 * - street / locality
 * - city
 * - state
 * - pincode
 */
export function parseIndianAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { street: '', city: '', state: '', pincode: '' };
  }

  const str = rawAddress.trim();

  // 1. Extract 6-digit Pincode (Indian PIN is 6 digits starting with 1-9)
  let pincode = '';
  const pinMatch = str.match(/\b([1-9]\d{5})\b/);
  if (pinMatch) {
    pincode = pinMatch[1];
  }

  // 2. Indian States & UTs (ordered by length descending to match full names first)
  const indianStates = [
    'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Jammu and Kashmir',
    'Himachal Pradesh',
    'Arunachal Pradesh',
    'Madhya Pradesh',
    'Uttar Pradesh',
    'Andhra Pradesh',
    'West Bengal',
    'Tamil Nadu',
    'Uttarakhand',
    'Maharashtra',
    'Chhattisgarh',
    'Lakshadweep',
    'Puducherry',
    'Chandigarh',
    'Telangana',
    'Rajasthan',
    'Meghalaya',
    'Jharkhand',
    'Karnataka',
    'Nagaland',
    'Gujarat',
    'Haryana',
    'Manipur',
    'Mizoram',
    'Tripura',
    'Punjab',
    'Sikkim',
    'Odisha',
    'Kerala',
    'Assam',
    'Bihar',
    'Delhi',
    'Goa',
    'Ladakh',
  ];

  let state = '';
  for (const s of indianStates) {
    const regex = new RegExp(`\\b${s}\\b`, 'i');
    if (regex.test(str)) {
      state = s;
      break;
    }
  }

  // 3. Comma-separated parts
  const tokens = str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Filter out country ("India"), the isolated pincode token, and state token
  const cleanTokens = tokens.filter((t) => {
    if (/^india$/i.test(t)) return false;
    if (pincode && t.replace(/\D/g, '') === pincode) return false;
    if (state && t.toLowerCase() === state.toLowerCase()) return false;
    return true;
  });

  let city = '';
  let streetParts = [];

  if (cleanTokens.length > 0) {
    city = cleanTokens[cleanTokens.length - 1];
    streetParts = cleanTokens.slice(0, cleanTokens.length - 1);
  }

  let street = streetParts.length > 0 ? streetParts.join(', ') : cleanTokens[0] || str;

  // Fallback: If state is empty but city is "New Delhi" or contains "Delhi"
  if (!state && /delhi/i.test(city)) {
    state = 'Delhi';
  }

  return {
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
  };
}

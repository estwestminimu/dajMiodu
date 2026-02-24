const BASE = '/api';

function getToken() {
  return localStorage.getItem('dm_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Nie ustawiaj Content-Type dla FormData (multer sam to ogarnie)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Błąd serwera');
  return data;
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Samochody
  getCars: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/cars${q ? '?' + q : ''}`);
  },
  getCar: (id) => request(`/cars/${id}`),
  createCar: (formData) => request('/cars', { method: 'POST', body: formData }),
  updateCar: (id, formData) => request(`/cars/${id}`, { method: 'PUT', body: formData }),
  deleteCar: (id) => request(`/cars/${id}`, { method: 'DELETE' }),

  // Marki
  getBrands: () => request('/brands'),
  getBrand: (id) => request(`/brands/${id}`),
  createBrand: (data) => request('/brands', { method: 'POST', body: JSON.stringify(data) }),
  updateBrand: (id, data) => request(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrand: (id) => request(`/brands/${id}`, { method: 'DELETE' }),
};

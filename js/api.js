const API_BASE = 'http://127.0.0.1:8000/api'; // عدلها حسب مسار السيرفر

export async function getAirports() {
  const res = await fetch(`${API_BASE}/airports`);
  return await res.json();
}

export async function getFlights() {
  const res = await fetch(`${API_BASE}/flights`);
  return await res.json();
}

export async function createCustomer(customerData) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  return await res.json();
}

export async function bookFlight(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return await res.json();
}

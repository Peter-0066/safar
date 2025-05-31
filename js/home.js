const baseUrl = 'http://127.0.0.1:8000/api';

async function loadAirports() {
    try {
        const response = await fetch(`${baseUrl}/airports`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`فشل في جلب المطارات: ${response.status}`);
        const airports = await response.json();
        
        const fromAirportSelect = document.getElementById('from-airport');
        const toAirportSelect = document.getElementById('to-airport');

        fromAirportSelect.innerHTML = '<option value="">اختر مطار المغادرة</option>';
        toAirportSelect.innerHTML = '<option value="">اختر مطار الوصول</option>';

        airports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.id;
            option.textContent = `${airport.name} (${airport.city})`;
            fromAirportSelect.appendChild(option.cloneNode(true));
            toAirportSelect.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل المطارات:', error.message);
        alert('فشل في تحميل المطارات. الرجاء التحقق من الخادم وإعادة المحاولة.');
    }
}

async function searchFlights() {
    const fromAirportId = document.getElementById('from-airport').value;
    const toAirportId = document.getElementById('to-airport').value;
    const flightDate = document.getElementById('go-date').value;
    const numTravellers = document.getElementById('num-tr').value;

    if (!fromAirportId || !toAirportId || !flightDate) {
        alert('يرجى ملء جميع الحقول المطلوبة (مطار المغادرة، الوجهة، والتاريخ).');
        return;
    }

    // تحقق اختياري: التأكد من أن التاريخ ليس قديمًا جدًا
    const selectedDate = new Date(flightDate);
    const minDate = new Date('2025-01-01');
    if (selectedDate < minDate) {
        alert('يرجى اختيار تاريخ بعد 2025-01-01.');
        return;
    }

    const params = new URLSearchParams({
        from_airport_id: fromAirportId,
        to_airport_id: toAirportId,
        flight_date: flightDate
    });

    try {
        console.log('جلب الرحلات باستخدام:', `${baseUrl}/flights?${params}`);
        const response = await fetch(`${baseUrl}/flights?${params}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`فشل في جلب الرحلات: ${response.status} ${response.statusText}`);
        const flights = await response.json();
        
        const resultsDiv = document.getElementById('flight-results');
        resultsDiv.innerHTML = '';

        if (flights.length === 0) {
            resultsDiv.innerHTML = '<p class="text-muted">لم يتم العثور على رحلات.</p>';
            return;
        }
        

        flights.forEach(flight => {
            const fromAirportName = flight.fromAirport?.name ;
            const toAirportName = flight.toAirport?.name ;
            const flightDiv = document.createElement('div');
            flightDiv.className = 'card mb-2';
            flightDiv.innerHTML = `
               <div class="card-body selbar mt-1 ">
                    <h5 class="card-title">رحلة ${flight.flight_number}</h5>
                    <p class="card-text">
                        the date : ${flight.flight_date}<br>
                        the time : ${flight.launching_time} - ${flight.destination_time}<br>
                         Single ticket price :  $${flight.flight_price}<br>
                        Number of passengers : ${numTravellers}
                    </p>
                    <button class="btn btn-primary" onclick="selectFlight(${flight.id}, ${flight.flight_price})">Make a reservation</button>
                </div>
            
            
            
            `;
            resultsDiv.appendChild(flightDiv);
        });
        
    } catch (error) {
        console.error('خطأ في البحث عن الرحلات:', error.message);
        document.getElementById('flight-results').innerHTML = '<p class="text-danger">خطأ في البحث عن الرحلات. يرجى التحقق من الخادم وإعادة المحاولة.</p>';
    }
}


let selectedFlightId = null;
let selectedFlightPrice = null;

function selectFlight(flightId, flightPrice) {
    selectedFlightId = flightId;
    selectedFlightPrice = flightPrice;
    alert('تم اختيار الرحلة! يرجى إدخال المعلومات الشخصية والتأكيد.');
}

async function bookFlight(event) {
    event.preventDefault();

    if (!selectedFlightId) {
        alert('يرجى اختيار رحلة قبل الحجز.');
        return;
    }

    const customerData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        phone_number: document.getElementById('phone_number').value,
        passport_number: document.getElementById('passport_number').value
    };

    if (!customerData.first_name || !customerData.last_name || !customerData.email || !customerData.phone_number || !customerData.passport_number) {
        alert('يرجى ملء جميع حقول المعلومات الشخصية المطلوبة.');
        return;
    }

    try {
        const customerResponse = await fetch(`${baseUrl}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(customerData)
        });
        if (!customerResponse.ok) throw new Error(`فشل في إنشاء العميل: ${customerResponse.status}`);
        const customer = await customerResponse.json();

        const numTravellers = document.getElementById('num-tr').value;
        const bookingData = {
            customer_id: customer.id,
            flight_id: selectedFlightId,
            payment_status: 'pending',
            type: 'offers',
            travellers: parseInt(numTravellers),
            price: selectedFlightPrice * parseInt(numTravellers),
            weight: null
        };

        const bookingResponse = await fetch(`${baseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        if (!bookingResponse.ok) throw new Error(`فشل في إنشاء: ${bookingResponse.status}`);
        const booking = await bookingResponse.json();

        alert(`تم إنشاء بنجاح! رقم الحجز: ${booking.id}`);
        document.getElementById('personal-info-form').reset();
        selectedFlightId = null;
        selectedFlightPrice = null;
    } catch (error) {
        console.error('خطأ في حجز الرحلة:', error.message);
        alert('خطأ في حجز الرحلة. يرجى المحاولة مرة أخرى.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAirports();
    document.getElementById('search-flight-btn').addEventListener('click', searchFlights);
    document.getElementById('book-flight-btn').addEventListener('click', bookFlight);
    document.getElementById('personal-info-form').addEventListener('submit', bookFlight);
});
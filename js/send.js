const baseUrl = 'http://127.0.0.1:8000/api';

function calculatePrice(weight) {
    if (weight <= 50) return weight * 1; // $1/kg
    if (weight <= 200) return weight * 3; // $3/kg
    return weight * 5; // $5/kg
}

function updatePrice() {
    const weightInput = document.getElementById('weight');
    const priceSpan = document.getElementById('price');
    if (!weightInput || !priceSpan) {
        console.error('حقل الوزن أو السعر غير موجود.');
        return;
    }

    const weight = parseFloat(weightInput.value) || 0;
    const price = calculatePrice(weight);
    priceSpan.textContent = price.toFixed(2);
}

async function loadAirports() {
    const airportSelect = document.getElementById('from_airport');
    if (!airportSelect) {
        console.error('عنصر اختيار المطارات غير موجود.');
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/airports`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`فشل في جلب المطارات: ${response.status}`);
        const airports = await response.json();

        airportSelect.innerHTML = '<option value="">اختر مطار المغادرة</option>';
        airports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.id;
            option.textContent = `${airport.name} (${airport.city})`;
            airportSelect.appendChild(option);
        });
        // إضافة خيار "Random"
        const randomOption = document.createElement('option');
        randomOption.value = 'random';
        randomOption.textContent = 'Random';
        airportSelect.appendChild(randomOption);
    } catch (error) {
        console.error('خطأ في تحميل المطارات:', error.message);
        alert('فشل في تحميل المطارات. يمكنك اختيار "Random" أو إعادة المحاولة لاحقًا.');
    }
}

async function sendParcel(event) {
    event.preventDefault();

    const customerData = {
        first_name: document.getElementById('first_name').value.trim(),
        middle_name: document.getElementById('middle_name').value.trim(),
        last_name: document.getElementById('last_name').value.trim(),
        email: `user_${Date.now()}@example.com`,
        phone_number: document.getElementById('phone_number').value.trim(),
        passport_number: document.getElementById('passport_number').value.trim()
    };

    const parcelData = {
        from_airport_id: document.getElementById('from_airport').value,
        weight: parseFloat(document.getElementById('weight').value) || 0,
        price: parseFloat(document.getElementById('price').textContent) || 0
    };

    if (!customerData.first_name || !customerData.last_name || !customerData.phone_number || !customerData.passport_number) {
        alert('يرجى ملء جميع الحقول المطلوبة (الاسم الأول، الاسم الأخير، رقم الهاتف، رقم جواز السفر).');
        return;
    }

    if (!parcelData.from_airport_id) {
        alert('يرجى اختيار مطار المغادرة أو "Random".');
        return;
    }

    if (!parcelData.weight || parcelData.weight <= 0) {
        alert('يرجى إدخال وزن صالح للطرد (أكبر من 0).');
        return;
    }

    try {
        console.log('إرسال بيانات العميل:', customerData);
        const customerResponse = await fetch(`${baseUrl}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(customerData)
        });

        if (!customerResponse.ok) {
            const errorData = await customerResponse.json();
            if (customerResponse.status === 422 && errorData.errors?.passport_number) {
                document.getElementById('passport_number').focus();
                throw new Error('رقم جواز السفر مستعمل. يرجى إدخال رقم جديد.');
            }
            throw new Error(`فشل في إنشاء العميل: ${customerResponse.status}\n${JSON.stringify(errorData, null, 2)}`);
        }

        const customer = await customerResponse.json();
        console.log('تم إنشاء العميل:', customer);

        let selectedFlightId;
        if (parcelData.from_airport_id === 'random') {
            const flightResponse = await fetch(`${baseUrl}/flights`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!flightResponse.ok) throw new Error(`فشل في جلب الرحلات: ${flightResponse.status}`);
            const flights = await flightResponse.json();
            if (flights.length === 0) throw new Error('لا توجد رحلات متاحة.');
            selectedFlightId = flights[Math.floor(Math.random() * flights.length)].id;
            console.log('الرحلة العشوائية المختارة:', flights.find(f => f.id === selectedFlightId));
        } else {
            const flightResponse = await fetch(`${baseUrl}/flights?from_airport_id=${parcelData.from_airport_id}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!flightResponse.ok) throw new Error(`فشل في جلب الرحلات: ${flightResponse.status}`);
            const flights = await flightResponse.json();
            if (flights.length === 0) throw new Error('لا توجد رحلات متاحة لهذا المطار.');
            selectedFlightId = flights[0].id;
            console.log('الرحلة المختارة:', flights[0]);
        }

        const bookingPayload = {
            customer_id: customer.id,
            flight_id: selectedFlightId,
            payment_status: 'pending',
            type: 'parcel',
            travellers: 0, // لا مسافرين للطرود
            price: parcelData.price,
            weight: parcelData.weight // استخدام حقل weight
        };

        console.log('إرسال بيانات الحجز:', bookingPayload);
        const bookingResponse = await fetch(`${baseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingPayload)
        });

        if (!bookingResponse.ok) {
            let errorMessage = `فشل في إنشاء الحجز: ${bookingResponse.status}`;
            try {
                const errorData = await bookingResponse.json();
                errorMessage += `\n${JSON.stringify(errorData, null, 2)}`;
            } catch (e) {
                errorMessage += '\nلا يمكن تحليل استجابة الخطأ.';
            }
            throw new Error(errorMessage);
        }

        const booking = await bookingResponse.json();
        console.log('تم إنشاء الحجز:', booking);

        alert(`تم إنشاء حجز الطرد بنجاح! رقم الحجز: ${booking.id}\nوزن الطرد: ${parcelData.weight} كجم`);
        document.getElementById('parcel-form').reset();
        document.getElementById('price').textContent = '0.00';

    } catch (error) {
        console.error('خطأ في إرسال الطرد:', error.message);
        alert(`خطأ في الحجز: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadAirports();

    const form = document.getElementById('parcel-form');
    if (form) {
        form.addEventListener('submit', sendParcel);
    } else {
        console.error('النموذج غير موجود.');
    }

    const weightInput = document.getElementById('weight');
    if (weightInput) {
        weightInput.addEventListener('input', updatePrice);
    } else {
        console.error('حقل الوزن غير موجود.');
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (form) form.reset();
            document.getElementById('price').textContent = '0.00';
        });
    } else {
        console.error('زر الإلغاء غير موجود.');
    }
});
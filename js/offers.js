const baseUrl = 'http://127.0.0.1:8000/api';
let selectedOfferId = null;
let selectedFlightId = null;

const offers = [
    { id: 1, country: "Türkiye", discount_percentage: 40, description: "Book your trip to Türkiye and take advantage of the opportunity to get a discount on the trip price. Numbers are limited", image1: "https://images.pexels.com/photos/30884834/pexels-photo-30884834/free-photo-of-maiden-s-tower-in-istanbul-skyline-under-overcast-skies.jpeg?auto=compress&cs=tinysrgb&w=400" , image2:"https://images.pexels.com/photos/30875711/pexels-photo-30875711/free-photo-of-couple-waiting-at-istanbul-train-station-at-night.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", image3:"https://images.pexels.com/photos/30854905/pexels-photo-30854905/free-photo-of-bosphorus-bridge-view-from-a-boat-in-istanbul.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 2, country: "Lebanon", discount_percentage: 30, description: "Book your trip to Lebanon and take advantage of the opportunity to get a discount on the trip price. Numbers are limited", image1: "https://images.pexels.com/photos/10091339/pexels-photo-10091339.jpeg?auto=compress&cs=tinysrgb&w=400",image2:"https://images.pexels.com/photos/5054989/pexels-photo-5054989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",image3:"https://images.pexels.com/photos/6459300/pexels-photo-6459300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" },
    { id: 3, country: "UAE", discount_percentage: 40, description: "Book your trip to UAE and take advantage of the opportunity to get a discount on the trip price. Numbers are limited", image1: "https://images.pexels.com/photos/2403251/pexels-photo-2403251.jpeg?auto=compress&cs=tinysrgb&w=400",image2:"https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=400",image3:"https://images.pexels.com/photos/3243025/pexels-photo-3243025.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 4, country: "Iraq", discount_percentage: 25, description: "Book your trip to Iraq and take advantage of the opportunity to get a discount on the trip price. Numbers are limited", image1: "https://images.pexels.com/photos/370041/pexels-photo-370041.jpeg?auto=compress&cs=tinysrgb&w=400",image2:"https://images.pexels.com/photos/6025489/pexels-photo-6025489.jpeg?auto=compress&cs=tinysrgb&w=400",image3:"https://images.pexels.com/photos/2784992/pexels-photo-2784992.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: 5, country: "Jordan", discount_percentage: 20, description: "Book your trip to Jordan and take advantage of the opportunity to get a discount on the trip price. Numbers are limited", image1: "https://images.pexels.com/photos/11042719/pexels-photo-11042719.jpeg?auto=compress&cs=tinysrgb&w=300",image2:"https://images.pexels.com/photos/3293854/pexels-photo-3293854.jpeg?auto=compress&cs=tinysrgb&w=600",image3:"https://images.pexels.com/photos/11042722/pexels-photo-11042722.jpeg?auto=compress&cs=tinysrgb&w=300" },
    { id: 6, country: "Palestine", discount_percentage: 10, description: "Book your trip to Palestine and take advantage of the opportunity to get a discount on the trip price. Numbers are limited", image1: "https://images.pexels.com/photos/6862610/pexels-photo-6862610.jpeg?auto=compress&cs=tinysrgb&w=400",image2:"https://images.pexels.com/photos/27695995/pexels-photo-27695995/free-photo-of-art-mosaic-panels.jpeg?auto=compress&cs=tinysrgb&w=400",image3:"https://images.pexels.com/photos/16733045/pexels-photo-16733045/free-photo-of-the-dome-of-the-rock-in-jerusalem.jpeg?auto=compress&cs=tinysrgb&w=400" }
];

function loadOffers() {
    try {
        const offersContainer = document.getElementById('offers-container');
        if (!offersContainer) throw new Error('حاوية العروض غير موجودة.');

        offersContainer.innerHTML = '';

        offers.forEach(offer => {
            const offerDiv = document.createElement('div');
            offerDiv.className = 'col-md-6';
            offerDiv.innerHTML = `
                <div class="card selbar mb-4 " >
                    <div id="carousel-${offer.id}" class="carousel slide " data-bs-ride="carousel">
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <img style=" width:auto; height:400px;" src="${offer.image1}" class="d-block w-100 " alt="${offer.country}">
                            </div>
                            <div class="carousel-item">
                                <img style=" width:auto; height:400px;" src="${offer.image2}" class="d-block w-100" alt="${offer.country}">
                            </div>
                            <div class="carousel-item">
                                <img style=" width:auto; height:400px;" src="${offer.image3}" class="d-block w-100" alt="${offer.country}">
                            </div>
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${offer.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${offer.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                    <div class="card-body ">
                        <h5 class="card-title">${offer.country} Discount ${offer.discount_percentage}%</h5>
                        <p class="card-text">${offer.description}</p><button class="btn btn-primary" onclick="selectOffer(${offer.id})">Book a ticket </button>
                    </div>
                </div>
            `;
            offersContainer.appendChild(offerDiv);
        });
    } catch (error) {
        console.error('خطأ في تحميل العروض:', error.message);
        alert('فشل في تحميل العروض. يرجى التحقق من الكود وإعادة المحاولة.');
    }
}


 

async function loadAirports() {
    try {
        const airportSelect = document.getElementById('departure-airport');
        if (!airportSelect) throw new Error('عنصر اختيار المطارات غير موجود.');

        const response = await fetch(`${baseUrl}/airports`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
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
    } catch (error) {
        console.error('خطأ في تحميل المطارات:', error.message);
        alert('فشل في تحميل المطارات. الرجاء التحقق من الخادم وإعادة المحاولة.');
    }
}

function loadDestinations() {
    try {
        const destinationSelect = document.getElementById('destination');
        if (!destinationSelect) throw new Error('عنصر اختيار الوجهات غير موجود.');

        destinationSelect.innerHTML = '<option value="">اختر الوجهة</option>';

        offers.forEach(offer => {
            const option = document.createElement('option');
            option.value = offer.id;
            option.textContent = offer.country;
            destinationSelect.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل الوجهات:', error.message);
        alert('فشل في تحميل الوجهات. يرجى التحقق من الكود وإعادة المحاولة.');
    }
}

function selectOffer(offerId) {
    selectedOfferId = offerId;
    const selectedOffer = offers.find(offer => offer.id === offerId);
    const destinationSelect = document.getElementById('destination');
    if (destinationSelect) {
        destinationSelect.value = offerId;
    }

    if (selectedOffer) {
        alert(`تم اختيار عرض ${selectedOffer.country}! يرجى ملء المعلومات الشخصية وتأكيد الحجز.`);
    } else {
        alert("لم يتم العثور على العرض المحدد.");
    }
}

function validateDates(departureDate, returnDate) {
    if (departureDate && returnDate) {
        const depDate = new Date(departureDate);
        const retDate = new Date(returnDate);
        if (retDate < depDate) {
            alert('تاريخ الوصول لا يمكن أن يكون قبل تاريخ المغادرة.');
            return false;
        }
    }
    return true;
}

async function bookOffer(event) {
    event.preventDefault();

    if (!selectedOfferId) {
        alert('يرجى اختيار عرض قبل الحجز.');
        return;
    }

    const customerData = {
        first_name: document.getElementById('first_name').value.trim(),
        middle_name: document.getElementById('middle_name').value.trim(),
        last_name: document.getElementById('last_name').value.trim(),
        email: `user_${Date.now()}@example.com`,
        phone_number: document.getElementById('phone_number').value.trim(),
        passport_number: document.getElementById('nation_number').value.trim()
    };

    const bookingData = {
        from_airport_id: parseInt(document.getElementById('departure-airport').value) || 0,
        destination_id: parseInt(document.getElementById('destination').value) || 0,
        travellers: parseInt(document.getElementById('number_of_cards').value) || 1
    };

    if (!customerData.first_name || !customerData.last_name || !customerData.phone_number || !customerData.passport_number) {
        alert('يرجى ملء جميع الحقول المطلوبة (الاسم الأول، الاسم الأخير، رقم الهاتف، رقم جواز السفر).');
        return;
    }

    if (!bookingData.from_airport_id || !bookingData.destination_id) {
        alert('يرجى اختيار مطار المغادرة والوجهة.');
        return;
    }

    if (bookingData.travellers < 1 || isNaN(bookingData.travellers)) {
        alert('يرجى إدخال عدد صحيح إيجابي لعدد المسافرين.');
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
                document.getElementById('nation_number').focus();
                throw new Error('رقم جواز السفر مستخدم بالفعل. يرجى إدخال رقم جديد.');
            }
            throw new Error(`فشل في إنشاء العميل: ${customerResponse.status}\n${JSON.stringify(errorData, null, 2)}`);
        }

        const customer = await customerResponse.json();
        console.log('تم إنشاء العميل:', customer);

        const flightResponse = await fetch(`${baseUrl}/flights?from_airport_id=${bookingData.from_airport_id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!flightResponse.ok) {
            throw new Error(`فشل في جلب الرحلات: ${flightResponse.status}`);
        }

        const flights = await flightResponse.json();
        if (flights.length === 0) {
            throw new Error('لا توجد رحلات متاحة لهذه الوجهة.');
        }

        selectedFlightId = flights[0].id;
        console.log('الرحلة المختارة:', flights[0]);

        // إرسال الحقول المطلوبة فقط لتتوافق مع جدول books
        const bookingPayload = {
            customer_id: customer.id,
            flight_id: selectedFlightId,
            payment_status: 'pending',
            type: 'offers',
            travellers: bookingData.travellers
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

        alert(`تم إنشاء الحجز بنجاح! رقم الحجز: ${booking.id}`);
        document.getElementById('personal-info-form').reset();
        selectedOfferId = null;
        selectedFlightId = null;

    } catch (error) {
        console.error('خطأ في الحجز:', error.message);
        alert(`خطأ في الحجز: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadOffers();
    loadAirports();
    loadDestinations();

    const form = document.getElementById('personal-info-form');
    if (form) {
        form.addEventListener('submit', bookOffer);
    } else {
        console.error('النموذج غير موجود.');
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (form) form.reset();
            selectedOfferId = null;
            selectedFlightId = null;
        });
    } else {
        console.error('زر الإلغاء غير موجود.');
    }
});
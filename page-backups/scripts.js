    <script>
        // Sample Data
        let jamaahData = [
            // Group 1 - Grup Ramadhan A (45 jamaah)
            {
                id: 1,
                name: "Ahmad Fauzi",
                nik: "1234567890123456",
                phone: "081234567890",
                email: "ahmad@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_paid: 15000000,
                total_amount: 15000000,
                amount_paid: 15000000,
                birth_date: "15051985",
                birth_place: "Jakarta",
                gender: "male",
                address: "Jl. Merdeka No. 123, Jakarta",
                passport_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzM0MTU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Y4ZmFmYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFobWFkIEZhdXppPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNzAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiNjYmQ1ZTEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXNwb3IgSW5kb25lc2lhPC90ZXh0Pjwvc3ZnPg==",
                passport_number: "A1234567",
                passport_name: "Ahmad Fauzi",
                passport_city: "Jakarta",
                passport_issue_date: "01012020",
                passport_expire_date: "01012030",
                provinsi: "DKI Jakarta",
                marital_status: "married",
                education: "s1",
                occupation: "Pegawai Swasta",
                emergency_contact_name: "Siti Fauzi",
                emergency_contact_phone: "081234567891",
                emergency_contact_relation: "Istri",
                mahram_name: "Sendiri",
                medical_conditions: "",
                medications: "",
                allergies: "",
                mobility_assistance: false,
                main_family_id: 1,
                family_role: "kepala_keluarga",
                room_preference: "quad",
                family_room_request: true,
                registration_number: "UMR202400001"
            },
            // Family 1 - Ahmad Fauzi's family (4 people - quad room)
            {
                id: 2,
                name: "Siti Fauzi",
                nik: "1234567890123457",
                phone: "081234567891",
                email: "siti.fauzi@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 15000000,
                amount_paid: 15000000,
                birth_date: "10081987",
                birth_place: "Jakarta",
                gender: "female",
                address: "Jl. Merdeka No. 123, Jakarta",
                passport_number: "B2345678",
                passport_name: "Siti Fauzi",
                passport_city: "Jakarta",
                passport_issue_date: "15022020",
                passport_expire_date: "15022030",
                provinsi: "DKI Jakarta",
                marital_status: "married",
                education: "sma",
                occupation: "Ibu Rumah Tangga",
                emergency_contact_name: "Ahmad Fauzi",
                emergency_contact_phone: "081234567890",
                emergency_contact_relation: "Suami",
                mahram_name: "Ahmad Fauzi",
                main_family_id: 1,
                family_role: "istri",
                room_preference: "quad",
                family_room_request: true,
                registration_number: "UMR202400002"
            },
            {
                id: 3,
                name: "Fatimah Fauzi",
                nik: "1234567890123458",
                phone: "081234567892",
                email: "fatimah.fauzi@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 13000000,
                amount_paid: 13000000,
                birth_date: "05122010",
                birth_place: "Jakarta",
                gender: "female",
                address: "Jl. Merdeka No. 123, Jakarta",
                passport_number: "C3456789",
                passport_name: "Fatimah Fauzi",
                passport_city: "Jakarta",
                passport_issue_date: "20032022",
                passport_expire_date: "20032032",
                provinsi: "DKI Jakarta",
                marital_status: "single",
                education: "smp",
                occupation: "Pelajar",
                emergency_contact_name: "Ahmad Fauzi",
                emergency_contact_phone: "081234567890",
                emergency_contact_relation: "Ayah",
                mahram_name: "Ahmad Fauzi",
                main_family_id: 1,
                family_role: "anak",
                room_preference: "quad",
                family_room_request: true,
                registration_number: "UMR202400003"
            },
            {
                id: 4,
                name: "Muhammad Fauzi",
                nik: "1234567890123459",
                phone: "081234567893",
                email: "muhammad.fauzi@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 13000000,
                amount_paid: 13000000,
                birth_date: "15062012",
                birth_place: "Jakarta",
                gender: "male",
                address: "Jl. Merdeka No. 123, Jakarta",
                passport_number: "D4567890",
                passport_name: "Muhammad Fauzi",
                passport_city: "Jakarta",
                passport_issue_date: "10042022",
                passport_expire_date: "10042032",
                provinsi: "DKI Jakarta",
                marital_status: "single",
                education: "sd",
                occupation: "Pelajar",
                emergency_contact_name: "Ahmad Fauzi",
                emergency_contact_phone: "081234567890",
                emergency_contact_relation: "Ayah",
                mahram_name: "Ahmad Fauzi",
                main_family_id: 1,
                family_role: "anak",
                room_preference: "quad",
                family_room_request: true,
                registration_number: "UMR202400004"
            },
            // Family 2 - Budi's family (3 people - triple room)
            {
                id: 5,
                name: "Budi Santoso",
                nik: "1234567890123460",
                phone: "081234567894",
                email: "budi.santoso@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 15000000,
                amount_paid: 15000000,
                birth_date: "20031982",
                birth_place: "Bandung",
                gender: "male",
                address: "Jl. Sudirman No. 456, Bandung",
                passport_number: "E5678901",
                passport_name: "Budi Santoso",
                passport_city: "Bandung",
                passport_issue_date: "05052021",
                passport_expire_date: "05052031",
                provinsi: "Jawa Barat",
                marital_status: "married",
                education: "s1",
                occupation: "Guru",
                emergency_contact_name: "Rina Santoso",
                emergency_contact_phone: "081234567895",
                emergency_contact_relation: "Istri",
                mahram_name: "Sendiri",
                main_family_id: 2,
                family_role: "kepala_keluarga",
                room_preference: "triple",
                family_room_request: true,
                registration_number: "UMR202400005"
            },
            {
                id: 6,
                name: "Rina Santoso",
                nik: "1234567890123461",
                phone: "081234567895",
                email: "rina.santoso@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 15000000,
                amount_paid: 15000000,
                birth_date: "12111985",
                birth_place: "Bandung",
                gender: "female",
                address: "Jl. Sudirman No. 456, Bandung",
                passport_number: "F6789012",
                passport_name: "Rina Santoso",
                passport_city: "Bandung",
                passport_issue_date: "10062021",
                passport_expire_date: "10062031",
                provinsi: "Jawa Barat",
                marital_status: "married",
                education: "d3",
                occupation: "Perawat",
                emergency_contact_name: "Budi Santoso",
                emergency_contact_phone: "081234567894",
                emergency_contact_relation: "Suami",
                mahram_name: "Budi Santoso",
                main_family_id: 2,
                family_role: "istri",
                room_preference: "triple",
                family_room_request: true,
                registration_number: "UMR202400006"
            },
            {
                id: 7,
                name: "Aditya Santoso",
                nik: "1234567890123462",
                phone: "081234567896",
                email: "aditya.santoso@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 13000000,
                amount_paid: 13000000,
                birth_date: "08092008",
                birth_place: "Bandung",
                gender: "male",
                address: "Jl. Sudirman No. 456, Bandung",
                passport_number: "G7890123",
                passport_name: "Aditya Santoso",
                passport_city: "Bandung",
                passport_issue_date: "15072021",
                passport_expire_date: "15072031",
                provinsi: "Jawa Barat",
                marital_status: "single",
                education: "sma",
                occupation: "Pelajar",
                emergency_contact_name: "Budi Santoso",
                emergency_contact_phone: "081234567894",
                emergency_contact_relation: "Ayah",
                mahram_name: "Budi Santoso",
                main_family_id: 2,
                family_role: "anak",
                room_preference: "triple",
                family_room_request: true,
                registration_number: "UMR202400007"
            },
            // Individual jamaah (double rooms)
            {
                id: 8,
                name: "Hasan Ibrahim",
                nik: "1234567890123463",
                phone: "081234567897",
                email: "hasan.ibrahim@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 15000000,
                amount_paid: 15000000,
                birth_date: "25071975",
                birth_place: "Surabaya",
                gender: "male",
                address: "Jl. Pahlawan No. 789, Surabaya",
                passport_number: "H8901234",
                passport_name: "Hasan Ibrahim",
                passport_city: "Surabaya",
                passport_issue_date: "01012020",
                passport_expire_date: "01012030",
                provinsi: "Jawa Timur",
                marital_status: "widowed",
                education: "s1",
                occupation: "Wiraswasta",
                emergency_contact_name: "Ali Ibrahim",
                emergency_contact_phone: "081234567898",
                emergency_contact_relation: "Anak",
                mahram_name: "Sendiri",
                main_family_id: 3,
                family_role: "kepala_keluarga",
                room_preference: "double",
                family_room_request: false,
                registration_number: "UMR202400008"
            },
            {
                id: 9,
                name: "Abdullah Rahman",
                nik: "1234567890123464",
                phone: "081234567899",
                email: "abdullah.rahman@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "partial",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 15000000,
                amount_paid: 10000000,
                birth_date: "18041980",
                birth_place: "Medan",
                gender: "male",
                address: "Jl. Gatot Subroto No. 321, Medan",
                passport_number: "I9012345",
                passport_name: "Abdullah Rahman",
                passport_city: "Medan",
                passport_issue_date: "12122019",
                passport_expire_date: "12122029",
                provinsi: "Sumatera Utara",
                marital_status: "single",
                education: "s2",
                occupation: "Dosen",
                emergency_contact_name: "Fatimah Rahman",
                emergency_contact_phone: "081234567900",
                emergency_contact_relation: "Ibu",
                mahram_name: "Sendiri",
                main_family_id: 4,
                family_role: "kepala_keluarga",
                room_preference: "double",
                family_room_request: false,
                registration_number: "UMR202400009"
            },
            {
                id: 10,
                name: "Yusuf Hakim",
                nik: "1234567890123465",
                phone: "081234567901",
                email: "yusuf.hakim@email.com",
                package: "Umroh Ramadhan 2024",
                package_id: 1,
                group_id: 1,
                status: "verified",
                payment_status: "paid",
                document_status: "approved",
                visa_status: "approved",
                total_amount: 15000000,
                amount_paid: 15000000,
                birth_date: "03021990",
                birth_place: "Yogyakarta",
                gender: "male",
                address: "Jl. Malioboro No. 111, Yogyakarta",
                passport_number: "J0123456",
                passport_name: "Yusuf Hakim",
                passport_city: "Yogyakarta",
                passport_issue_date: "20032021",
                passport_expire_date: "20032031",
                provinsi: "DI Yogyakarta",
                marital_status: "married",
                education: "s1",
                occupation: "Pegawai Negeri",
                emergency_contact_name: "Zainab Hakim",
                emergency_contact_phone: "081234567902",
                emergency_contact_relation: "Istri",
                mahram_name: "Sendiri",
                main_family_id: 5,
                family_role: "kepala_keluarga",
                room_preference: "double",
                family_room_request: false,
                registration_number: "UMR202400010"
            }
            // Total so far: 10 jamaah for Group 1
            // Add more jamaah to reach 42 members for Group 1...
        ];

        let packageData = [
            {
                id: 1,
                name: "Umroh Ramadhan 2024",
                code: "PKG001",
                price: 25000000,
                departure_date: "2024-03-15",
                duration: 14,
                quota: 45,
                booked: 10,
                makkah_hotel: "Hilton Makkah Convention",
                madinah_hotel: "Pullman Zamzam Madinah",
                makkah_nights: 7,
                madinah_nights: 7,
                airline: "Emirates",
                airline_code: "EK",
                description: "Paket umroh spesial bulan Ramadhan dengan fasilitas premium"
            },
            {
                id: 2,
                name: "Umroh Plus Turki",
                code: "PKG002",
                price: 35000000,
                departure_date: "2024-04-20",
                duration: 21,
                quota: 30,
                booked: 18,
                makkah_hotel: "Swissotel Makkah",
                madinah_hotel: "Anwar Al Madinah Movenpick",
                makkah_nights: 10,
                madinah_nights: 8,
                airline: "Turkish Airlines",
                airline_code: "TK",
                description: "Paket umroh dengan ekstensi wisata Istanbul, Turki"
            },
            {
                id: 3,
                name: "Umroh Keluarga",
                code: "PKG003",
                price: 22000000,
                departure_date: "2024-05-10",
                duration: 12,
                quota: 50,
                booked: 25,
                makkah_hotel: "Fairmont Makkah",
                madinah_hotel: "Dar Al Iman InterContinental",
                makkah_nights: 6,
                madinah_nights: 6,
                airline: "Saudi Airlines",
                airline_code: "SV",
                description: "Paket umroh khusus keluarga dengan fasilitas ramah anak"
            }
        ];

        let paymentData = [
            {
                id: 1,
                jamaah_id: 1,
                jamaah_name: "Ahmad Fauzi",
                package: "Umroh Ramadhan 2024",
                amount: 15000000,
                date: "2024-01-15",
                method: "Transfer Bank",
                bank: "BCA",
                reference: "TRF20240115001",
                status: "verified"
            },
            {
                id: 2,
                jamaah_id: 2,
                jamaah_name: "Siti Aisyah",
                package: "Umroh Plus Turki",
                amount: 20000000,
                date: "2024-01-20",
                method: "Transfer Bank",
                bank: "Mandiri",
                reference: "TRF20240120001",
                status: "pending"
            }
        ];

        let documentData = [
            {
                id: 1,
                jamaah_name: "Ahmad Fauzi",
                type: "Paspor",
                filename: "paspor_ahmad.pdf",
                upload_date: "2024-01-10",
                status: "verified"
            },
            {
                id: 2,
                jamaah_name: "Siti Aisyah",
                type: "KTP",
                filename: "ktp_siti.jpg",
                upload_date: "2024-01-12",
                status: "pending"
            }
        ];

        let groupData = [
            {
                id: 1,
                name: "Grup Ramadhan A",
                package: "Umroh Ramadhan 2024",
                departure_date: "2024-03-15",
                max_members: 45,
                current_members: 10,
                bus_number: "BUS001",
                meeting_time: "04:00",
                meeting_point: "Masjid Al-Ikhlas, Jakarta Pusat",
                tour_leader: "Ustadz Ahmad Fauzi",
                status: "active",
                sub_groups: [
                    {
                        id: 1,
                        name: "Sub Grup Hotel Hilton",
                        hotel_makkah: "Hilton Makkah Convention",
                        hotel_madinah: "Hilton Madinah",
                        members: 7,
                        max_members: 23
                    },
                    {
                        id: 2,
                        name: "Sub Grup Hotel Marriott", 
                        hotel_makkah: "Marriott Makkah",
                        hotel_madinah: "Marriott Madinah",
                        members: 3,
                        max_members: 22
                    }
                ]
            },
            {
                id: 2,
                name: "Grup Turki Premium",
                package: "Umroh Plus Turki",
                departure_date: "2024-04-20",
                max_members: 40,
                current_members: 25,
                bus_number: "BUS002",
                meeting_time: "03:30",
                meeting_point: "Masjid Istiqlal, Jakarta",
                tour_leader: "Ustadz Abdul Rahman",
                status: "planning",
                sub_groups: [
                    {
                        id: 3,
                        name: "Sub Grup Hotel Swissotel",
                        hotel_makkah: "Swissotel Makkah",
                        hotel_madinah: "Swissotel Al Madinah",
                        members: 15,
                        max_members: 20
                    },
                    {
                        id: 4,
                        name: "Sub Grup Hotel Hyatt",
                        hotel_makkah: "Hyatt Regency Makkah",
                        hotel_madinah: "Hyatt Regency Madinah",
                        members: 10,
                        max_members: 20
                    }
                ]
            },
            {
                id: 3,
                name: "Grup Keluarga Bahagia",
                package: "Umroh Keluarga",
                departure_date: "2024-02-10",
                max_members: 30,
                current_members: 30,
                bus_number: "BUS003",
                meeting_time: "05:00",
                meeting_point: "Terminal Kampung Rambutan",
                tour_leader: "Ustadz Muhammad Ismail",
                status: "departed",
                sub_groups: [
                    {
                        id: 5,
                        name: "Sub Grup Hotel Sheraton",
                        hotel_makkah: "Sheraton Makkah",
                        hotel_madinah: "Sheraton Madinah",
                        members: 30,
                        max_members: 30
                    }
                ]
            },
            {
                id: 4,
                name: "Grup Ekonomi Smart",
                package: "Umroh Ekonomi",
                departure_date: "2024-06-15",
                max_members: 50,
                current_members: 12,
                bus_number: "BUS004",
                meeting_time: "02:30",
                meeting_point: "Masjid Agung Sunda Kelapa",
                tour_leader: "Ustadz Yusuf Mansur",
                status: "planning",
                sub_groups: [
                    {
                        id: 6,
                        name: "Sub Grup Hotel Ibis",
                        hotel_makkah: "Ibis Styles Makkah",
                        hotel_madinah: "Ibis Styles Madinah",
                        members: 8,
                        max_members: 25
                    },
                    {
                        id: 7,
                        name: "Sub Grup Hotel Novotel",
                        hotel_makkah: "Novotel Makkah",
                        hotel_madinah: "Novotel Madinah",
                        members: 4,
                        max_members: 25
                    }
                ]
            },
            {
                id: 5,
                name: "Grup VIP Executive",
                package: "Umroh VIP",
                departure_date: "2024-05-25",
                max_members: 25,
                current_members: 25,
                bus_number: "BUS005",
                meeting_time: "06:00",
                meeting_point: "Hotel Grand Sahid Jaya",
                tour_leader: "Ustadz Hasan Abdullah",
                status: "completed",
                sub_groups: [
                    {
                        id: 8,
                        name: "Sub Grup Hotel Conrad",
                        hotel_makkah: "Conrad Makkah",
                        hotel_madinah: "Conrad Madinah",
                        members: 25,
                        max_members: 25
                    }
                ]
            },
            {
                id: 6,
                name: "Grup Haji Furoda",
                package: "Umroh Plus Haji",
                departure_date: "2024-07-12",
                max_members: 35,
                current_members: 18,
                bus_number: "BUS006",
                meeting_time: "04:30",
                meeting_point: "Masjid Al-Azhar, Kebayoran",
                tour_leader: "Ustadz Salim Bahreisy",
                status: "active",
                sub_groups: [
                    {
                        id: 9,
                        name: "Sub Grup Hotel Fairmont",
                        hotel_makkah: "Fairmont Makkah",
                        hotel_madinah: "Fairmont Madinah",
                        members: 10,
                        max_members: 18
                    },
                    {
                        id: 10,
                        name: "Sub Grup Hotel Intercontinental",
                        hotel_makkah: "InterContinental Makkah",
                        hotel_madinah: "InterContinental Madinah",
                        members: 8,
                        max_members: 17
                    }
                ]
            }
        ];

        // Room Management Data
        let roomData = [];
        let currentGroupRooms = [];
        let selectedAllocationStrategy = 'auto';

        // Navigation
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Add active class to clicked nav item
            event.target.closest('.nav-item').classList.add('active');
            
            // Load page specific data
            loadPageData(pageId);
        }

        function loadPageData(pageId) {
            switch(pageId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'jamaah':
                    loadJamaahTable();
                    break;
                case 'packages':
                    loadPackageCards();
                    break;
                case 'payments':
                    loadPaymentTable();
                    break;
                case 'documents':
                    loadDocumentTable();
                    break;
                case 'groups':
                    loadGroupCards();
                    break;
                case 'reports':
                    loadReportCharts();
                    break;
            }
        }

        // Dashboard
        function loadDashboard() {
            // Update stats
            document.getElementById('totalJamaah').textContent = jamaahData.length.toLocaleString();
            document.getElementById('verifiedJamaah').textContent = jamaahData.filter(j => j.status === 'verified').length.toLocaleString();
            document.getElementById('activePackages').textContent = packageData.length;
            
            const totalRevenue = paymentData.reduce((sum, payment) => sum + payment.amount, 0);
            document.getElementById('totalRevenue').textContent = (totalRevenue / 1000000000).toFixed(1) + 'B';
            
            document.getElementById('totalDepartures').textContent = groupData.filter(g => g.status === 'departed').length;
            document.getElementById('pendingPayments').textContent = paymentData.filter(p => p.status === 'pending').length;

            // Load charts
            loadDashboardCharts();
        }

        function loadDashboardCharts() {
            // Jamaah registration chart
            const jamaahCtx = document.getElementById('jamaahChart').getContext('2d');
            new Chart(jamaahCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Registrasi Jamaah',
                        data: [120, 190, 300, 250, 180, 220],
                        borderColor: '#4facfe',
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { 
                                color: 'white',
                                font: { size: 12 }
                            }
                        }
                    },
                    scales: {
                        x: { 
                            ticks: { 
                                color: 'white',
                                font: { size: 11 }
                            }
                        },
                        y: { 
                            ticks: { 
                                color: 'white',
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });

            // Revenue chart
            const revenueCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revenueCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Umroh Ramadhan', 'Umroh Plus Turki', 'Umroh Keluarga'],
                    datasets: [{
                        data: [800, 540, 350],
                        backgroundColor: ['#4facfe', '#00f2fe', '#a8edea']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { 
                                color: 'white',
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        }

        // Jamaah Management
        function loadJamaahTable() {
            const tbody = document.getElementById('jamaahTableBody');
            tbody.innerHTML = '';
            
            jamaahData.forEach((jamaah, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${jamaah.name}</td>
                    <td>${jamaah.nik}</td>
                    <td>${jamaah.phone}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${jamaah.passport_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzY0NzQ4YiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iI2Y4ZmFmYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}" 
                                 style="width: 40px; height: 24px; border-radius: 4px; object-fit: cover; cursor: pointer;" 
                                 onclick="viewPassportImage('${jamaah.passport_image}', '${jamaah.name}')"
                                 title="Klik untuk melihat paspor">
                            <span style="font-size: 12px; color: #cbd5e1;">${jamaah.passport_number || 'Belum ada'}</span>
                        </div>
                    </td>
                    <td>${jamaah.package}</td>
                    <td><span class="status-badge status-${jamaah.status}">${getStatusText(jamaah.status)}</span></td>
                    <td>Rp ${(jamaah.total_paid || 0).toLocaleString()}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-primary btn-sm" onclick="editJamaah(${jamaah.id})">
                                <span class="material-icons">edit</span>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteJamaah(${jamaah.id})">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function getStatusText(status) {
            const statusMap = {
                'verified': 'Terverifikasi',
                'pending': 'Pending',
                'rejected': 'Ditolak'
            };
            return statusMap[status] || status;
        }

        function filterJamaah() {
            const search = document.getElementById('searchJamaah').value.toLowerCase();
            const packageFilter = document.getElementById('filterPackage').value;
            const statusFilter = document.getElementById('filterStatus').value;
            
            // In a real app, this would filter the data
            showNotification('Filter diterapkan!');
            loadJamaahTable();
        }

        function editJamaah(id) {
            const jamaah = jamaahData.find(j => j.id === id);
            if (jamaah) {
                // Populate form with jamaah data
                document.getElementById('jamaahName').value = jamaah.name;
                document.getElementById('jamaahNik').value = jamaah.nik;
                document.getElementById('jamaahBirthDate').value = jamaah.birth_date;
                document.getElementById('jamaahBirthPlace').value = jamaah.birth_place;
                document.getElementById('jamaahGender').value = jamaah.gender;
                document.getElementById('jamaahPhone').value = jamaah.phone;
                document.getElementById('jamaahEmail').value = jamaah.email;
                document.getElementById('jamaahPackage').value = jamaah.package_id;
                document.getElementById('jamaahAddress').value = jamaah.address;
                
                // Regional data
                document.getElementById('jamaahProvinsi').value = jamaah.provinsi || '';
                document.getElementById('jamaahKabupaten').value = jamaah.kabupaten || '';
                document.getElementById('jamaahKecamatan').value = jamaah.kecamatan || '';
                document.getElementById('jamaahKelurahan').value = jamaah.kelurahan || '';
                
                // Personal data
                document.getElementById('jamaahMaritalStatus').value = jamaah.marital_status || '';
                document.getElementById('jamaahEducation').value = jamaah.education || '';
                document.getElementById('jamaahOccupation').value = jamaah.occupation || '';
                
                // Passport data
                document.getElementById('jamaahPassportName').value = jamaah.passport_name || '';
                document.getElementById('jamaahPassportNumber').value = jamaah.passport_number || '';
                document.getElementById('jamaahPassportCity').value = jamaah.passport_city || '';
                document.getElementById('jamaahPassportIssueDate').value = jamaah.passport_issue_date || '';
                document.getElementById('jamaahPassportExpireDate').value = jamaah.passport_expire_date || '';
                
                // Check if passport name is same as KTP name
                if (jamaah.passport_name === jamaah.name && jamaah.passport_name) {
                    document.getElementById('sameAsKtpName').checked = true;
                    togglePassportName(document.getElementById('sameAsKtpName'));
                }
                
                // Family data
                document.getElementById('jamaahFamilyRole').value = jamaah.family_role || '';
                document.getElementById('jamaahRoomPreference').value = jamaah.room_preference || '';
                document.getElementById('jamaahFamilyRoomRequest').checked = jamaah.family_room_request || false;
                
                // Trigger family field toggle
                if (jamaah.family_role) {
                    toggleFamilyFields(document.getElementById('jamaahFamilyRole'));
                    if (jamaah.main_family_id && (jamaah.family_role === 'istri' || jamaah.family_role === 'anak')) {
                        setTimeout(() => {
                            document.getElementById('jamaahMainFamily').value = jamaah.main_family_id;
                        }, 100);
                    }
                }
                
                // Show passport preview if exists
                if (jamaah.passport_image) {
                    document.getElementById('passportPreview').style.display = 'block';
                    document.getElementById('passportImg').src = jamaah.passport_image;
                }
                
                openModal('jamaahModal');
            }
        }

        function deleteJamaah(id) {
            if (confirm('Yakin ingin menghapus data jamaah ini?')) {
                jamaahData = jamaahData.filter(j => j.id !== id);
                loadJamaahTable();
                showNotification('Data jamaah berhasil dihapus!');
            }
        }

        function saveJamaah(event) {
            event.preventDefault();
            
            // Validate birth date first
            const birthDate = document.getElementById('jamaahBirthDate').value;
            if (!validateBirthDate(birthDate)) {
                showNotification('Format tanggal lahir tidak valid. Gunakan format ddmmyyyy (contoh: 15051985)', 'error');
                document.getElementById('jamaahBirthDate').focus();
                return;
            }
            
            // Validate passport dates if provided
            const passportIssueDate = document.getElementById('jamaahPassportIssueDate').value;
            const passportExpireDate = document.getElementById('jamaahPassportExpireDate').value;
            
            if (passportIssueDate && !validatePassportDate(passportIssueDate)) {
                showNotification('Format tanggal penerbitan paspor tidak valid. Gunakan format ddmmyyyy', 'error');
                document.getElementById('jamaahPassportIssueDate').focus();
                return;
            }
            
            if (passportExpireDate && !validatePassportDate(passportExpireDate)) {
                showNotification('Format tanggal kadaluarsa paspor tidak valid. Gunakan format ddmmyyyy', 'error');
                document.getElementById('jamaahPassportExpireDate').focus();
                return;
            }

            const formData = {
                name: document.getElementById('jamaahName').value,
                nik: document.getElementById('jamaahNik').value,
                birth_date: birthDate,
                birth_place: document.getElementById('jamaahBirthPlace').value,
                gender: document.getElementById('jamaahGender').value,
                phone: document.getElementById('jamaahPhone').value,
                email: document.getElementById('jamaahEmail').value,
                package_id: parseInt(document.getElementById('jamaahPackage').value),
                address: document.getElementById('jamaahAddress').value,
                
                // Regional data (optional)
                provinsi: document.getElementById('jamaahProvinsi').value,
                kabupaten: document.getElementById('jamaahKabupaten').value,
                kecamatan: document.getElementById('jamaahKecamatan').value,
                kelurahan: document.getElementById('jamaahKelurahan').value,
                
                // Personal data (optional)
                marital_status: document.getElementById('jamaahMaritalStatus').value,
                education: document.getElementById('jamaahEducation').value,
                occupation: document.getElementById('jamaahOccupation').value,
                
                // Passport data
                passport_name: document.getElementById('jamaahPassportName').value,
                passport_number: document.getElementById('jamaahPassportNumber').value,
                passport_city: document.getElementById('jamaahPassportCity').value,
                passport_issue_date: passportIssueDate,
                passport_expire_date: passportExpireDate,
                passport_image: document.getElementById('passportImg').src || null,
                
                // Family data
                family_role: document.getElementById('jamaahFamilyRole').value,
                room_preference: document.getElementById('jamaahRoomPreference').value || 'quad', // Default to quad
                family_room_request: document.getElementById('jamaahFamilyRoomRequest').checked
            };

            // Handle family ID assignment
            const familyRole = formData.family_role;
            let mainFamilyId;
            
            if (familyRole === 'kepala_keluarga') {
                mainFamilyId = generateNewFamilyId();
            } else if (familyRole === 'istri' || familyRole === 'anak') {
                const selectedFamily = document.getElementById('jamaahMainFamily').value;
                if (selectedFamily === 'new_family') {
                    mainFamilyId = generateNewFamilyId();
                } else if (selectedFamily) {
                    mainFamilyId = parseInt(selectedFamily);
                } else {
                    showNotification('Silakan pilih kepala keluarga atau buat family baru', 'error');
                    return;
                }
            } else if (familyRole === 'individu') {
                mainFamilyId = generateNewFamilyId(); // Each individual gets their own family ID
            }
            
            formData.main_family_id = mainFamilyId;

            // Get package name
            const packageSelect = document.getElementById('jamaahPackage');
            const packageName = packageSelect.options[packageSelect.selectedIndex].text.split(' - ')[0];
            
            // Add to jamaahData (in real app, this would be an API call)
            const newId = Math.max(...jamaahData.map(j => j.id)) + 1;
            jamaahData.push({
                id: newId,
                ...formData,
                package: packageName,
                status: 'pending',
                total_paid: 0
            });
            
            closeModal('jamaahModal');
            loadJamaahTable();
            showNotification('Data jamaah berhasil disimpan!');
            
            // Reset form
            event.target.reset();
            document.getElementById('passportPreview').style.display = 'none';
        }

        // Package Management
        function loadPackageCards() {
            const container = document.getElementById('packageGrid');
            container.innerHTML = '';
            
            packageData.forEach(package => {
                const remainingSeats = package.quota - package.booked;
                const card = document.createElement('div');
                card.className = 'glass-card';
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <h3 style="color: white; margin: 0;">${package.name}</h3>
                        <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${package.code}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Harga</p>
                            <p style="color: #4facfe; font-weight: 600;">Rp ${(package.price || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Keberangkatan</p>
                            <p style="color: white;">${formatDate(package.departure_date)}</p>
                        </div>
                        <div>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Durasi</p>
                            <p style="color: white;">${package.duration} hari</p>
                        </div>
                        <div>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Sisa Seat</p>
                            <p style="color: ${remainingSeats > 10 ? '#22c55e' : remainingSeats > 0 ? '#f59e0b' : '#ef4444'}; font-weight: 600;">${remainingSeats}/${package.quota}</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <h4 style="color: white; font-size: 14px; margin-bottom: 8px;">Detail Hotel & Penerbangan</h4>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">
                            <p>🏨 Makkah: ${package.makkah_hotel} (${package.makkah_nights} malam)</p>
                            <p>🏨 Madinah: ${package.madinah_hotel} (${package.madinah_nights} malam)</p>
                            <p>✈️ Maskapai: ${package.airline}</p>
                        </div>
                    </div>
                    
                    <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin-bottom: 15px;">${package.description}</p>
                    
                    <div class="btn-group">
                        <button class="btn btn-primary btn-flex" onclick="editPackage(${package.id})">
                            <span class="material-icons">edit</span>
                            Edit
                        </button>
                        <button class="btn btn-danger btn-flex" onclick="deletePackage(${package.id})">
                            <span class="material-icons">delete</span>
                            Hapus
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function editPackage(id) {
            const package = packageData.find(p => p.id === id);
            if (package) {
                document.getElementById('packageName').value = package.name;
                document.getElementById('packageCode').value = package.code || '';
                document.getElementById('packagePrice').value = package.price;
                document.getElementById('packageDeparture').value = package.departure_date;
                document.getElementById('packageDuration').value = package.duration;
                document.getElementById('packageQuota').value = package.quota;
                document.getElementById('packageMakkahHotel').value = package.makkah_hotel;
                document.getElementById('packageMadinahHotel').value = package.madinah_hotel;
                document.getElementById('packageMakkahNights').value = package.makkah_nights;
                document.getElementById('packageMadinahNights').value = package.madinah_nights;
                document.getElementById('packageAirline').value = package.airline;
                document.getElementById('packageDescription').value = package.description;
                
                openModal('packageModal');
            }
        }

        function deletePackage(id) {
            if (confirm('Yakin ingin menghapus paket ini?')) {
                packageData = packageData.filter(p => p.id !== id);
                loadPackageCards();
                showNotification('Paket berhasil dihapus!');
            }
        }

        function savePackage(event) {
            event.preventDefault();
            
            const formData = {
                name: document.getElementById('packageName').value,
                code: document.getElementById('packageCode').value,
                price: parseInt(document.getElementById('packagePrice').value),
                departure_date: document.getElementById('packageDeparture').value,
                duration: parseInt(document.getElementById('packageDuration').value),
                quota: parseInt(document.getElementById('packageQuota').value),
                makkah_hotel: document.getElementById('packageMakkahHotel').value,
                madinah_hotel: document.getElementById('packageMadinahHotel').value,
                makkah_nights: parseInt(document.getElementById('packageMakkahNights').value),
                madinah_nights: parseInt(document.getElementById('packageMadinahNights').value),
                airline: document.getElementById('packageAirline').value,
                description: document.getElementById('packageDescription').value
            };
            
            const newId = Math.max(...packageData.map(p => p.id)) + 1;
            packageData.push({
                id: newId,
                ...formData,
                booked: 0
            });
            
            closeModal('packageModal');
            loadPackageCards();
            showNotification('Paket berhasil disimpan!');
            event.target.reset();
        }

        // Payment Management
        function loadPaymentTable() {
            const tbody = document.getElementById('paymentTableBody');
            tbody.innerHTML = '';
            
            paymentData.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(payment.date)}</td>
                    <td>${payment.jamaah_name}</td>
                    <td>${payment.package}</td>
                    <td>Rp ${(payment.amount || 0).toLocaleString()}</td>
                    <td>${payment.method}</td>
                    <td><span class="status-badge status-${payment.status}">${getStatusText(payment.status)}</span></td>
                    <td>
                        <div class="table-actions">
                        ${payment.status === 'pending' ? 
                            `<button class="btn btn-success btn-sm" onclick="verifyPayment(${payment.id})">
                                <span class="material-icons">check</span>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rejectPayment(${payment.id})">
                                <span class="material-icons">close</span>
                            </button>` :
                            `<button class="btn btn-primary btn-sm" onclick="viewPayment(${payment.id})">
                                <span class="material-icons">visibility</span>
                            </button>`
                        }
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function verifyPayment(id) {
            const payment = paymentData.find(p => p.id === id);
            if (payment && confirm('Verifikasi pembayaran ini?')) {
                payment.status = 'verified';
                loadPaymentTable();
                showNotification('Pembayaran berhasil diverifikasi!');
            }
        }

        function rejectPayment(id) {
            const payment = paymentData.find(p => p.id === id);
            if (payment && confirm('Tolak pembayaran ini?')) {
                payment.status = 'rejected';
                loadPaymentTable();
                showNotification('Pembayaran ditolak!', 'error');
            }
        }

        function savePayment(event) {
            event.preventDefault();
            
            const jamaahSelect = document.getElementById('paymentJamaah');
            const jamaahName = jamaahSelect.options[jamaahSelect.selectedIndex].text.split(' - ')[0];
            
            const newPayment = {
                id: Math.max(...paymentData.map(p => p.id)) + 1,
                jamaah_id: parseInt(document.getElementById('paymentJamaah').value),
                jamaah_name: jamaahName,
                package: "Umroh Ramadhan 2024", // Would be dynamically determined
                amount: parseInt(document.getElementById('paymentAmount').value),
                date: document.getElementById('paymentDate').value,
                method: document.getElementById('paymentMethod').value,
                bank: document.getElementById('paymentBank').value,
                reference: document.getElementById('paymentReference').value,
                status: 'pending'
            };
            
            paymentData.push(newPayment);
            closeModal('paymentModal');
            loadPaymentTable();
            showNotification('Pembayaran berhasil dicatat!');
            event.target.reset();
        }

        // Document Management
        function loadDocumentTable() {
            const tbody = document.getElementById('documentTableBody');
            tbody.innerHTML = '';
            
            documentData.forEach(doc => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doc.jamaah_name}</td>
                    <td>${doc.type}</td>
                    <td><a href="#" style="color: #4facfe;">${doc.filename}</a></td>
                    <td>${formatDate(doc.upload_date)}</td>
                    <td><span class="status-badge status-${doc.status}">${getStatusText(doc.status)}</span></td>
                    <td>
                        <div class="table-actions">
                        ${doc.status === 'pending' ? 
                            `<button class="btn btn-success btn-sm" onclick="verifyDocument(${doc.id})">
                                <span class="material-icons">check</span>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rejectDocument(${doc.id})">
                                <span class="material-icons">close</span>
                            </button>` :
                            `<button class="btn btn-primary btn-sm" onclick="viewDocument(${doc.id})">
                                <span class="material-icons">visibility</span>
                            </button>`
                        }
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function handleFileUpload(event) {
            const files = event.target.files;
            if (files.length > 0) {
                showNotification(`${files.length} file berhasil diupload!`);
                // In real app, files would be uploaded to server
                for (let file of files) {
                    documentData.push({
                        id: Math.max(...documentData.map(d => d.id)) + 1,
                        jamaah_name: "Jamaah Baru",
                        type: "Dokumen",
                        filename: file.name,
                        upload_date: new Date().toISOString().split('T')[0],
                        status: 'pending'
                    });
                }
                loadDocumentTable();
            }
        }

        function handleDrop(event) {
            event.preventDefault();
            event.target.classList.remove('dragover');
            handleFileUpload(event);
        }

        function handleDragOver(event) {
            event.preventDefault();
            event.target.classList.add('dragover');
        }

        function handleDragLeave(event) {
            event.target.classList.remove('dragover');
        }

        function verifyDocument(id) {
            const doc = documentData.find(d => d.id === id);
            if (doc && confirm('Verifikasi dokumen ini?')) {
                doc.status = 'verified';
                loadDocumentTable();
                showNotification('Dokumen berhasil diverifikasi!');
            }
        }

        function rejectDocument(id) {
            const doc = documentData.find(d => d.id === id);
            if (doc && confirm('Tolak dokumen ini?')) {
                doc.status = 'rejected';
                loadDocumentTable();
                showNotification('Dokumen ditolak!', 'error');
            }
        }

        // Group Management
        function loadGroupCards() {
            const container = document.getElementById('groupGrid');
            container.innerHTML = '';
            
            groupData.forEach(group => {
                const card = document.createElement('div');
                card.className = 'group-card';
                
                // Calculate progress percentage
                const progressPercentage = (group.current_members / group.max_members) * 100;
                
                card.innerHTML = `
                    <!-- Group Header -->
                    <div class="group-header">
                        <div class="group-title">
                            <h3>${group.name}</h3>
                            <div class="group-package">${group.package}</div>
                        </div>
                        <div class="group-status-badge">
                            <span class="status-badge status-${group.status}">${getGroupStatusText(group.status)}</span>
                        </div>
                    </div>

                    <!-- Group Progress -->
                    <div class="group-progress">
                        <div class="group-progress-bar">
                            <div class="group-progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="group-progress-text">
                            ${group.current_members} dari ${group.max_members} anggota (${Math.round(progressPercentage)}%)
                        </div>
                    </div>

                    <!-- Group Information Grid -->
                    <div class="group-info-grid">
                        <div class="group-info-item">
                            <div class="group-info-label">Keberangkatan</div>
                            <div class="group-info-value">${formatDate(group.departure_date)}</div>
                        </div>
                        <div class="group-info-item">
                            <div class="group-info-label">Anggota</div>
                            <div class="group-info-value highlight">${group.current_members}/${group.max_members}</div>
                        </div>
                        <div class="group-info-item">
                            <div class="group-info-label">Bus</div>
                            <div class="group-info-value">${group.bus_number}</div>
                        </div>
                        <div class="group-info-item">
                            <div class="group-info-label">Kumpul</div>
                            <div class="group-info-value">${group.meeting_time}</div>
                        </div>
                    </div>

                    <!-- Group Logistics -->
                    <div class="group-logistics">
                        <div class="group-logistics-title">
                            <span class="material-icons" style="font-size: 16px;">location_on</span>
                            Detail Logistik
                        </div>
                        <div class="group-logistics-item">
                            <div class="group-logistics-icon">🚌</div>
                            <div>Bus: ${group.bus_number}</div>
                        </div>
                        <div class="group-logistics-item">
                            <div class="group-logistics-icon">⏰</div>
                            <div>Waktu Kumpul: ${group.meeting_time}</div>
                        </div>
                        <div class="group-logistics-item">
                            <div class="group-logistics-icon">📍</div>
                            <div>Lokasi: ${group.meeting_point}</div>
                        </div>
                        <div class="group-logistics-item">
                            <div class="group-logistics-icon">👤</div>
                            <div>Tour Leader: ${group.tour_leader || 'Ustadz Ahmad Fauzi'}</div>
                        </div>
                    </div>

                    <!-- Sub Groups Section -->
                    ${group.sub_groups && group.sub_groups.length > 0 ? `
                    <div class="group-sub-groups" style="margin: 12px 0; padding: 12px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; border: 1px solid rgba(71, 85, 105, 0.3);">
                        <div class="group-logistics-title" style="margin-bottom: 8px; font-size: 12px;">
                            <span class="material-icons" style="font-size: 14px;">hotel</span>
                            Sub Groups (${group.sub_groups.length} Hotel)
                        </div>
                        <div class="sub-groups-list">
                            ${group.sub_groups.map(subGroup => `
                                <div class="sub-group-item" style="margin-bottom: 8px; padding: 8px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; border-left: 2px solid #10b981;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="color: #f8fafc; font-weight: 500; font-size: 11px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subGroup.name}</div>
                                            <div style="color: #cbd5e1; font-size: 9px; margin-top: 1px; line-height: 1.1;">
                                                🏨 ${subGroup.hotel_makkah.length > 15 ? subGroup.hotel_makkah.substring(0, 15) + '...' : subGroup.hotel_makkah}
                                            </div>
                                            <div style="color: #cbd5e1; font-size: 9px; line-height: 1.1;">
                                                🏨 ${subGroup.hotel_madinah.length > 15 ? subGroup.hotel_madinah.substring(0, 15) + '...' : subGroup.hotel_madinah}
                                            </div>
                                        </div>
                                        <div style="text-align: right; flex-shrink: 0; margin-left: 8px;">
                                            <div style="color: #10b981; font-weight: 600; font-size: 11px;">${subGroup.members}/${subGroup.max_members}</div>
                                            <div style="color: #64748b; font-size: 8px;">jamaah</div>
                                        </div>
                                    </div>
                                    <div style="margin-top: 6px;">
                                        <button class="btn btn-sm" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 9px; padding: 3px 6px; width: 100%;" onclick="manageSubGroup(${group.id}, ${subGroup.id})">
                                            <span class="material-icons" style="font-size: 12px; margin-right: 2px;">manage_accounts</span>
                                            Kelola
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 8px; text-align: center;">
                            <button class="btn btn-sm btn-primary" onclick="addSubGroup(${group.id})" style="font-size: 9px; padding: 4px 8px;">
                                <span class="material-icons" style="font-size: 12px; margin-right: 2px;">add_circle</span>
                                Tambah Sub Grup
                            </button>
                        </div>
                    </div>
                    ` : `
                    <div style="margin: 15px 0; text-align: center;">
                        <button class="btn btn-sm btn-primary" onclick="addSubGroup(${group.id})" style="font-size: 11px; padding: 6px 12px;">
                            <span class="material-icons" style="font-size: 14px;">add_circle</span>
                            Buat Sub Grup Hotel
                        </button>
                    </div>
                    `}

                    <!-- Group Actions -->
                    <div class="group-actions">
                        <button class="btn btn-primary btn-sm" onclick="manageGroupMembers(${group.id})" title="Kelola Anggota">
                            <span class="material-icons">people</span>
                            Anggota
                        </button>
                        <button class="btn btn-success btn-sm" onclick="generateRoomList(${group.id})" title="Generate Room List">
                            <span class="material-icons">auto_awesome</span>
                            Auto
                        </button>
                        <button class="btn btn-info btn-sm" onclick="openRoomManagement(${group.id})" title="Lihat Room List">
                            <span class="material-icons">hotel</span>
                            Kamar
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="exportManifest(${group.id})" title="Export Manifest Grup">
                            <span class="material-icons">description</span>
                            Manifest
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editGroup(${group.id})" title="Edit Grup">
                            <span class="material-icons">edit</span>
                            Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="viewGroupDetails(${group.id})" title="Lihat Detail">
                            <span class="material-icons">visibility</span>
                            Detail
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function getGroupStatusText(status) {
            const statusMap = {
                'planning': 'Perencanaan',
                'active': 'Aktif',
                'departed': 'Berangkat',
                'completed': 'Selesai'
            };
            return statusMap[status] || status;
        }

        function saveGroup(event) {
            event.preventDefault();
            
            const packageSelect = document.getElementById('groupPackage');
            const packageName = packageSelect.options[packageSelect.selectedIndex].text;
            
            const newGroup = {
                id: Math.max(...groupData.map(g => g.id)) + 1,
                name: document.getElementById('groupName').value,
                package: packageName,
                departure_date: document.getElementById('groupDeparture').value,
                max_members: parseInt(document.getElementById('groupMaxMembers').value),
                current_members: 0,
                bus_number: document.getElementById('groupBusNumber').value,
                meeting_time: document.getElementById('groupMeetingTime').value,
                meeting_point: document.getElementById('groupMeetingPoint').value,
                tour_leader: document.getElementById('groupTourLeader').value || 'Belum ditentukan',
                status: 'planning'
            };
            
            groupData.push(newGroup);
            closeModal('groupModal');
            loadGroupCards();
            showNotification('Grup berhasil dibuat!');
            event.target.reset();
        }

        function manageGroupMembers(id) {
            showNotification('Fitur kelola anggota grup akan segera tersedia!');
        }

        function editGroup(id) {
            showNotification('Fitur edit grup akan segera tersedia!');
        }

        function viewGroupDetails(id) {
            const group = groupData.find(g => g.id === id);
            if (!group) return;
            
            // Create modal for group details
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3>Detail Grup - ${group.name}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h4 style="color: #4facfe; margin-bottom: 10px;">Informasi Grup</h4>
                            <p><strong>Nama:</strong> ${group.name}</p>
                            <p><strong>Paket:</strong> ${group.package}</p>
                            <p><strong>Status:</strong> <span class="status-badge status-${group.status}">${getGroupStatusText(group.status)}</span></p>
                            <p><strong>Anggota:</strong> ${group.current_members}/${group.max_members}</p>
                        </div>
                        <div>
                            <h4 style="color: #4facfe; margin-bottom: 10px;">Keberangkatan</h4>
                            <p><strong>Tanggal:</strong> ${formatDate(group.departure_date)}</p>
                            <p><strong>Bus:</strong> ${group.bus_number}</p>
                            <p><strong>Waktu Kumpul:</strong> ${group.meeting_time}</p>
                            <p><strong>Lokasi Kumpul:</strong> ${group.meeting_point}</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <h4 style="color: #4facfe; margin-bottom: 15px;">Daftar Anggota Grup</h4>
                        <div style="background: rgba(30, 41, 59, 0.3); border-radius: 8px; padding: 15px;">
                            <p style="color: rgba(255, 255, 255, 0.7); text-align: center;">
                                ${group.current_members > 0 ? 
                                    `Grup ini memiliki ${group.current_members} anggota terdaftar.` : 
                                    'Belum ada anggota terdaftar dalam grup ini.'
                                }
                            </p>
                            <p style="color: rgba(255, 255, 255, 0.5); text-align: center; font-size: 12px; margin-top: 10px;">
                                Fitur detail anggota akan segera tersedia.
                            </p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for close buttons
            const closeButtons = modal.querySelectorAll('.close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.remove();
                });
            });
            
            // Close on click outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        // Sub-Group Management Functions
        function addSubGroup(groupId) {
            const group = groupData.find(g => g.id === groupId);
            if (!group) return;

            // Create modal for adding sub-group
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Tambah Sub Grup - ${group.name}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    
                    <form onsubmit="saveSubGroup(event, ${groupId})" style="padding: 20px;">
                        <div class="form-group">
                            <label for="subGroupName">Nama Sub Grup</label>
                            <input type="text" id="subGroupName" placeholder="Contoh: Sub Grup Hotel Hilton" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="subGroupHotelMakkah">Hotel Makkah</label>
                            <input type="text" id="subGroupHotelMakkah" placeholder="Nama hotel di Makkah" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="subGroupHotelMadinah">Hotel Madinah</label>
                            <input type="text" id="subGroupHotelMadinah" placeholder="Nama hotel di Madinah" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="subGroupMaxMembers">Maksimal Anggota</label>
                            <input type="number" id="subGroupMaxMembers" min="1" max="${group.max_members}" placeholder="Jumlah maksimal jamaah" required>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-btn">Batal</button>
                            <button type="submit" class="btn btn-primary">Simpan Sub Grup</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for close buttons
            const closeButtons = modal.querySelectorAll('.close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.remove();
                });
            });
            
            // Close on click outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        function saveSubGroup(event, groupId) {
            event.preventDefault();
            
            const group = groupData.find(g => g.id === groupId);
            if (!group) return;
            
            // Initialize sub_groups array if it doesn't exist
            if (!group.sub_groups) {
                group.sub_groups = [];
            }
            
            const newSubGroup = {
                id: Date.now(), // Simple ID generation
                name: document.getElementById('subGroupName').value,
                hotel_makkah: document.getElementById('subGroupHotelMakkah').value,
                hotel_madinah: document.getElementById('subGroupHotelMadinah').value,
                members: 0,
                max_members: parseInt(document.getElementById('subGroupMaxMembers').value)
            };
            
            group.sub_groups.push(newSubGroup);
            
            // Close modal
            event.target.closest('.modal').remove();
            
            // Refresh group cards
            loadGroupCards();
            showNotification('Sub grup berhasil ditambahkan!');
        }

        function manageSubGroup(groupId, subGroupId) {
            const group = groupData.find(g => g.id === groupId);
            const subGroup = group?.sub_groups?.find(sg => sg.id === subGroupId);
            
            if (!group || !subGroup) return;

            // Create modal for managing sub-group
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3>Kelola ${subGroup.name}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    
                    <div style="padding: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: rgba(30, 41, 59, 0.4); padding: 15px; border-radius: 12px;">
                                <h4 style="color: #3b82f6; margin-bottom: 10px;">Informasi Sub Grup</h4>
                                <p><strong>Nama:</strong> ${subGroup.name}</p>
                                <p><strong>Hotel Makkah:</strong> ${subGroup.hotel_makkah}</p>
                                <p><strong>Hotel Madinah:</strong> ${subGroup.hotel_madinah}</p>
                                <p><strong>Anggota:</strong> ${subGroup.members}/${subGroup.max_members}</p>
                            </div>
                            <div style="background: rgba(30, 41, 59, 0.4); padding: 15px; border-radius: 12px;">
                                <h4 style="color: #10b981; margin-bottom: 10px;">Statistik</h4>
                                <p><strong>Kapasitas:</strong> ${Math.round((subGroup.members / subGroup.max_members) * 100)}%</p>
                                <p><strong>Sisa Slot:</strong> ${subGroup.max_members - subGroup.members} orang</p>
                                <p><strong>Status:</strong> ${subGroup.members === subGroup.max_members ? 'Penuh' : 'Tersedia'}</p>
                            </div>
                        </div>
                        
                        <div style="background: rgba(30, 41, 59, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <h4 style="color: #4facfe; margin-bottom: 15px;">Daftar Anggota Sub Grup</h4>
                            <div style="color: rgba(255, 255, 255, 0.7); text-align: center; padding: 20px;">
                                ${subGroup.members > 0 ? 
                                    `Sub grup ini memiliki ${subGroup.members} anggota terdaftar.` : 
                                    'Belum ada anggota terdaftar dalam sub grup ini.'
                                }
                                <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-top: 10px;">
                                    Fitur pengelolaan anggota sub grup akan segera tersedia.
                                </p>
                            </div>
                        </div>
                        
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button class="btn btn-warning" onclick="editSubGroup(${groupId}, ${subGroupId})">
                                <span class="material-icons">edit</span>
                                Edit Sub Grup
                            </button>
                            <button class="btn btn-danger" onclick="deleteSubGroup(${groupId}, ${subGroupId})">
                                <span class="material-icons">delete</span>
                                Hapus Sub Grup
                            </button>
                            <button class="btn btn-secondary close-btn">Tutup</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for close buttons
            const closeButtons = modal.querySelectorAll('.close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.remove();
                });
            });
            
            // Close on click outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        function editSubGroup(groupId, subGroupId) {
            const group = groupData.find(g => g.id === groupId);
            const subGroup = group?.sub_groups?.find(sg => sg.id === subGroupId);
            
            if (!group || !subGroup) return;

            // Close current modal
            document.querySelector('.modal').remove();

            // Create edit modal
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Edit Sub Grup</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    
                    <form onsubmit="updateSubGroup(event, ${groupId}, ${subGroupId})" style="padding: 20px;">
                        <div class="form-group">
                            <label for="editSubGroupName">Nama Sub Grup</label>
                            <input type="text" id="editSubGroupName" value="${subGroup.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSubGroupHotelMakkah">Hotel Makkah</label>
                            <input type="text" id="editSubGroupHotelMakkah" value="${subGroup.hotel_makkah}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSubGroupHotelMadinah">Hotel Madinah</label>
                            <input type="text" id="editSubGroupHotelMadinah" value="${subGroup.hotel_madinah}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSubGroupMaxMembers">Maksimal Anggota</label>
                            <input type="number" id="editSubGroupMaxMembers" min="${subGroup.members}" max="${group.max_members}" value="${subGroup.max_members}" required>
                            <small style="color: rgba(255, 255, 255, 0.6);">Minimal ${subGroup.members} (anggota saat ini)</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-btn">Batal</button>
                            <button type="submit" class="btn btn-primary">Update Sub Grup</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for close buttons
            const closeButtons = modal.querySelectorAll('.close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.remove();
                });
            });
            
            // Close on click outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        function updateSubGroup(event, groupId, subGroupId) {
            event.preventDefault();
            
            const group = groupData.find(g => g.id === groupId);
            const subGroup = group?.sub_groups?.find(sg => sg.id === subGroupId);
            
            if (!group || !subGroup) return;
            
            // Update sub-group data
            subGroup.name = document.getElementById('editSubGroupName').value;
            subGroup.hotel_makkah = document.getElementById('editSubGroupHotelMakkah').value;
            subGroup.hotel_madinah = document.getElementById('editSubGroupHotelMadinah').value;
            subGroup.max_members = parseInt(document.getElementById('editSubGroupMaxMembers').value);
            
            // Close modal
            event.target.closest('.modal').remove();
            
            // Refresh group cards
            loadGroupCards();
            showNotification('Sub grup berhasil diupdate!');
        }

        function deleteSubGroup(groupId, subGroupId) {
            if (!confirm('Yakin ingin menghapus sub grup ini? Tindakan ini tidak dapat dibatalkan.')) return;
            
            const group = groupData.find(g => g.id === groupId);
            if (!group || !group.sub_groups) return;
            
            // Check if sub-group has members
            const subGroup = group.sub_groups.find(sg => sg.id === subGroupId);
            if (subGroup && subGroup.members > 0) {
                if (!confirm(`Sub grup ini memiliki ${subGroup.members} anggota. Yakin ingin menghapus?`)) {
                    return;
                }
            }
            
            // Remove sub-group
            group.sub_groups = group.sub_groups.filter(sg => sg.id !== subGroupId);
            
            // Close modal
            document.querySelector('.modal').remove();
            
            // Refresh group cards
            loadGroupCards();
            showNotification('Sub grup berhasil dihapus!');
        }

        // Generate Room List Function - The Main Feature
        function generateRoomList(groupId) {
            const group = groupData.find(g => g.id === groupId);
            if (!group) return;

            // Get all jamaah in this group
            const groupJamaah = jamaahData.filter(j => j.group_id === groupId);
            
            if (groupJamaah.length === 0) {
                showNotification('Tidak ada jamaah dalam grup ini', 'error');
                return;
            }

            // Process room allocation
            const roomAllocation = processRoomAllocation(groupJamaah, group);
            
            // Show result in modal
            showRoomListResult(group, roomAllocation);
        }

        function processRoomAllocation(jamaahList, group) {
            const allocation = {
                hotels: {},
                summary: {
                    total_jamaah: jamaahList.length,
                    total_families: 0,
                    total_rooms: 0,
                    room_types: { quad: 0, triple: 0, double: 0 }
                }
            };

            // Group jamaah by sub-group (hotel)
            const jamaahBySubGroup = {};
            
            jamaahList.forEach(jamaah => {
                // Determine which sub-group/hotel this jamaah belongs to
                let subGroupKey = 'default';
                
                if (group.sub_groups && group.sub_groups.length > 0) {
                    // For now, distribute evenly. In real implementation, 
                    // this would be based on user selection
                    const subGroupIndex = jamaah.id % group.sub_groups.length;
                    subGroupKey = group.sub_groups[subGroupIndex].name;
                }
                
                if (!jamaahBySubGroup[subGroupKey]) {
                    jamaahBySubGroup[subGroupKey] = [];
                }
                jamaahBySubGroup[subGroupKey].push(jamaah);
            });

            // Process each sub-group/hotel
            Object.keys(jamaahBySubGroup).forEach(hotelName => {
                const hotelJamaah = jamaahBySubGroup[hotelName];
                allocation.hotels[hotelName] = processHotelRoomAllocation(hotelJamaah);
            });

            // Calculate summary
            Object.values(allocation.hotels).forEach(hotel => {
                allocation.summary.total_families += hotel.families.length;
                allocation.summary.total_rooms += hotel.rooms.length;
                
                hotel.rooms.forEach(room => {
                    allocation.summary.room_types[room.type]++;
                });
            });

            return allocation;
        }

        function processHotelRoomAllocation(jamaahList) {
            const hotelAllocation = {
                families: [],
                rooms: [],
                unassigned: []
            };

            // Group by family
            const familyGroups = {};
            
            jamaahList.forEach(jamaah => {
                const familyId = jamaah.main_family_id;
                if (!familyGroups[familyId]) {
                    familyGroups[familyId] = [];
                }
                familyGroups[familyId].push(jamaah);
            });

            // Process each family
            Object.keys(familyGroups).forEach(familyId => {
                const family = familyGroups[familyId];
                const familyInfo = processFamilyRoomAssignment(family);
                hotelAllocation.families.push(familyInfo);
            });

            // Allocate rooms
            hotelAllocation.families.forEach(family => {
                const rooms = allocateRoomsForFamily(family);
                hotelAllocation.rooms.push(...rooms);
            });

            return hotelAllocation;
        }

        function processFamilyRoomAssignment(familyMembers) {
            const mainFamily = familyMembers.find(j => j.family_role === 'kepala_keluarga') || familyMembers[0];
            
            return {
                main_family_id: mainFamily.main_family_id,
                main_family_name: mainFamily.name,
                family_role: mainFamily.family_role,
                members: familyMembers,
                family_room_request: familyMembers.some(j => j.family_room_request),
                preferred_room_type: mainFamily.room_preference || 'double',
                member_count: familyMembers.length,
                male_count: familyMembers.filter(j => j.gender === 'L').length,
                female_count: familyMembers.filter(j => j.gender === 'P').length
            };
        }

        function allocateRoomsForFamily(family) {
            const rooms = [];
            
            if (family.family_room_request && family.member_count <= 4) {
                // Family wants to stay together in one room
                const roomType = getRoomTypeByCapacity(family.member_count);
                rooms.push({
                    type: roomType,
                    capacity: getRoomCapacity(roomType),
                    occupants: family.members,
                    main_family: family.main_family_name,
                    special_request: 'Family Room',
                    gender_mixed: family.male_count > 0 && family.female_count > 0
                });
            } else {
                // Separate by gender
                const maleMembers = family.members.filter(j => j.gender === 'L');
                const femaleMembers = family.members.filter(j => j.gender === 'P');
                
                if (maleMembers.length > 0) {
                    const maleRooms = allocateRoomsByGender(maleMembers, family, 'L');
                    rooms.push(...maleRooms);
                }
                
                if (femaleMembers.length > 0) {
                    const femaleRooms = allocateRoomsByGender(femaleMembers, family, 'P');
                    rooms.push(...femaleRooms);
                }
            }
            
            return rooms;
        }

        function allocateRoomsByGender(members, family, gender) {
            const rooms = [];
            const preferredRoomType = family.preferred_room_type;
            const capacity = getRoomCapacity(preferredRoomType);
            
            for (let i = 0; i < members.length; i += capacity) {
                const roomMembers = members.slice(i, i + capacity);
                const actualCapacity = roomMembers.length;
                const roomType = getRoomTypeByCapacity(actualCapacity);
                
                rooms.push({
                    type: roomType,
                    capacity: actualCapacity,
                    occupants: roomMembers,
                    main_family: family.main_family_name,
                    gender: gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    special_request: null,
                    gender_mixed: false
                });
            }
            
            return rooms;
        }

        function getRoomCapacity(roomType) {
            const capacities = {
                'quad': 4,
                'triple': 3,
                'double': 2
            };
            return capacities[roomType] || 2;
        }

        function getRoomTypeByCapacity(memberCount) {
            if (memberCount >= 4) return 'quad';
            if (memberCount === 3) return 'triple';
            return 'double';
        }

        function showRoomListResult(group, allocation) {
            // Create modal for room list result
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 1200px; width: 95%;">
                    <div class="modal-header">
                        <h3>📋 Room List Generated - ${group.name}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    
                    <div style="padding: 20px;">
                        ${generateRoomListHTML(allocation, group)}
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin: 20px; padding-top: 20px; border-top: 1px solid rgba(71, 85, 105, 0.3);">
                        <button class="btn btn-success" onclick="exportRoomListToExcel(${JSON.stringify(allocation).replace(/"/g, '&quot;')}, '${group.name}')">
                            <span class="material-icons">download</span>
                            Export to Excel
                        </button>
                        <button class="btn btn-primary" onclick="applyRoomList(${group.id}, ${JSON.stringify(allocation).replace(/"/g, '&quot;')})">
                            <span class="material-icons">check_circle</span>
                            Apply Room List
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            <span class="material-icons">close</span>
                            Tutup
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for close buttons
            const closeButtons = modal.querySelectorAll('.close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.remove();
                });
            });
            
            // Close on click outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        function generateRoomListHTML(allocation, group) {
            let html = `
                <!-- Summary Section -->
                <div style="background: rgba(30, 41, 59, 0.4); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="color: #3b82f6; margin-bottom: 15px;">📊 Summary</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Total Jamaah</div>
                            <div style="color: #f8fafc; font-size: 18px; font-weight: 600;">${allocation.summary.total_jamaah} orang</div>
                        </div>
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Total Keluarga</div>
                            <div style="color: #f8fafc; font-size: 18px; font-weight: 600;">${allocation.summary.total_families} family</div>
                        </div>
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Total Kamar</div>
                            <div style="color: #f8fafc; font-size: 18px; font-weight: 600;">${allocation.summary.total_rooms} kamar</div>
                        </div>
                        <div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Room Types</div>
                            <div style="color: #f8fafc; font-size: 14px;">
                                Quad: ${allocation.summary.room_types.quad} | 
                                Triple: ${allocation.summary.room_types.triple} | 
                                Double: ${allocation.summary.room_types.double}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Hotel sections
            Object.keys(allocation.hotels).forEach(hotelName => {
                const hotel = allocation.hotels[hotelName];
                html += generateHotelRoomListHTML(hotelName, hotel);
            });

            return html;
        }

        function generateHotelRoomListHTML(hotelName, hotel) {
            let html = `
                <div style="background: rgba(15, 23, 42, 0.6); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                    <h4 style="color: #10b981; margin-bottom: 15px; display: flex; align-items: center;">
                        <span class="material-icons" style="margin-right: 8px;">hotel</span>
                        ${hotelName}
                    </h4>
                    
                    <div style="display: grid; gap: 15px;">
            `;

            // Room cards
            hotel.rooms.forEach((room, index) => {
                const roomNumber = index + 1;
                html += `
                    <div style="background: rgba(30, 41, 59, 0.8); padding: 15px; border-radius: 8px; border: 1px solid rgba(71, 85, 105, 0.3);">
                        <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 10px;">
                            <div>
                                <div style="color: #f8fafc; font-weight: 600; font-size: 16px;">Room ${roomNumber} (${room.type.toUpperCase()})</div>
                                <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin-top: 2px;">
                                    Main Family: ${room.main_family} | ${room.gender || 'Mixed Gender'}
                                    ${room.special_request ? ` | ${room.special_request}` : ''}
                                    ${room.gender_mixed ? ' | ⚠️ Mixed Gender (Family Request)' : ''}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #10b981; font-weight: 600;">${room.occupants.length}/${room.capacity}</div>
                                <div style="color: rgba(255, 255, 255, 0.6); font-size: 10px;">orang</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                            ${room.occupants.map(occupant => `
                                <div style="background: rgba(71, 85, 105, 0.3); padding: 8px; border-radius: 6px;">
                                    <div style="color: #f8fafc; font-weight: 500; font-size: 13px;">${occupant.name}</div>
                                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 11px;">
                                        ${occupant.gender === 'male' ? '👨' : '👩'} 
                                        <strong>${occupant.gender === 'male' ? 'L' : 'P'}</strong> | 
                                        <span style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 1px 4px; border-radius: 3px; font-size: 9px; font-weight: 600;">
                                            ${(occupant.room_preference || 'quad').toUpperCase()}
                                        </span>
                                    </div>
                                    <div style="color: rgba(255, 255, 255, 0.5); font-size: 10px; margin-top: 2px;">
                                        ${occupant.family_role || 'Individual'} | Born: ${formatBirthDate(occupant.birth_date)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            return html;
        }

        // Room Management Functions
        function openRoomManagement(groupId) {
            const group = groupData.find(g => g.id === groupId);
            if (!group) return;
            
            // Set modal title with sub-group information
            let titleText = `Room List - ${group.name}`;
            if (group.sub_groups && group.sub_groups.length > 0) {
                titleText += ` (${group.sub_groups.length} Sub Grup Hotel)`;
            }
            document.getElementById('roomModalTitle').textContent = titleText;
            
            // Generate room data for this group
            generateRoomsForGroup(groupId);
            
            // Load room interface
            loadRoomManagement(groupId);
            
            // Open modal
            openModal('roomModal');
        }

        function generateRoomsForGroup(groupId) {
            const group = groupData.find(g => g.id === groupId);
            if (!group) return;
            
            // Get jamaah in this group (simulate from jamaahData)
            const groupJamaah = jamaahData.filter(j => j.id <= group.current_members).map((j, index) => ({
                ...j,
                id: index + 1,
                group_id: groupId,
                room_preference: ['double', 'triple', 'quad'][Math.floor(Math.random() * 3)],
                gender: index % 2 === 0 ? 'male' : 'female',
                family_group: index < 4 ? 'FAM001' : index < 8 ? 'FAM002' : null,
                room_number: null,
                bed_assignment: null
            }));
            
            // Store current group jamaah
            window.currentGroupJamaah = groupJamaah;
            
            // Generate initial room structure
            currentGroupRooms = [];
            
            // Calculate needed rooms based on preferences
            const maleJamaah = groupJamaah.filter(j => j.gender === 'male');
            const femaleJamaah = groupJamaah.filter(j => j.gender === 'female');
            
            let roomNumber = 1;
            
            // Generate rooms for males
            roomNumber = generateRoomsForGender(maleJamaah, 'male', roomNumber);
            
            // Generate rooms for females  
            generateRoomsForGender(femaleJamaah, 'female', roomNumber);
        }

        function generateRoomsForGender(jamaahList, gender, startRoomNumber) {
            let roomNumber = startRoomNumber;
            const preferences = {};
            
            // Count preferences
            jamaahList.forEach(j => {
                preferences[j.room_preference] = (preferences[j.room_preference] || 0) + 1;
            });
            
            // Generate quad rooms first
            const quadNeeded = Math.ceil(preferences.quad / 4) || 0;
            for (let i = 0; i < quadNeeded; i++) {
                currentGroupRooms.push(createRoom(roomNumber++, 'quad', gender));
            }
            
            // Generate triple rooms
            const tripleNeeded = Math.ceil(preferences.triple / 3) || 0;
            for (let i = 0; i < tripleNeeded; i++) {
                currentGroupRooms.push(createRoom(roomNumber++, 'triple', gender));
            }
            
            // Generate double rooms
            const doubleNeeded = Math.ceil(preferences.double / 2) || 0;
            for (let i = 0; i < doubleNeeded; i++) {
                currentGroupRooms.push(createRoom(roomNumber++, 'double', gender));
            }
            
            // Add extra rooms if needed
            const totalCapacity = (quadNeeded * 4) + (tripleNeeded * 3) + (doubleNeeded * 2);
            if (totalCapacity < jamaahList.length) {
                const extraNeeded = Math.ceil((jamaahList.length - totalCapacity) / 2);
                for (let i = 0; i < extraNeeded; i++) {
                    currentGroupRooms.push(createRoom(roomNumber++, 'double', gender));
                }
            }
            
            return roomNumber;
        }

        function createRoom(number, type, gender) {
            const capacity = {
                'single': 1,
                'double': 2, 
                'triple': 3,
                'quad': 4
            };
            
            return {
                id: `room_${number}`,
                number: `${number.toString().padStart(3, '0')}`,
                type: type,
                gender: gender,
                capacity: capacity[type],
                occupants: [],
                isEmpty: true
            };
        }

        function loadRoomManagement(groupId) {
            // Update statistics
            updateRoomStatistics();
            
            // Load unassigned jamaah
            loadUnassignedJamaah();
            
            // Load room grid
            loadRoomGrid();
        }

        function updateRoomStatistics() {
            const totalRooms = currentGroupRooms.length;
            const occupiedRooms = currentGroupRooms.filter(r => r.occupants.length > 0).length;
            const assignedJamaah = currentGroupRooms.reduce((sum, r) => sum + r.occupants.length, 0);
            const unassignedJamaah = window.currentGroupJamaah ? window.currentGroupJamaah.filter(j => !j.room_number).length : 0;
            
            document.getElementById('totalRooms').textContent = totalRooms;
            document.getElementById('occupiedRooms').textContent = occupiedRooms;
            document.getElementById('assignedJamaah').textContent = assignedJamaah;
            document.getElementById('unassignedJamaah').textContent = unassignedJamaah;
            document.getElementById('unassignedCount').textContent = unassignedJamaah;
        }

        function loadUnassignedJamaah() {
            const container = document.getElementById('unassignedList');
            container.innerHTML = '';
            
            if (!window.currentGroupJamaah) return;
            
            const unassigned = window.currentGroupJamaah.filter(j => !j.room_number);
            
            unassigned.forEach(jamaah => {
                const item = document.createElement('div');
                item.className = 'unassigned-item';
                item.innerHTML = `
                    <div>
                        <div style="font-weight: 500; color: #f8fafc; font-size: 13px;">${jamaah.name}</div>
                        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6);">
                            ${jamaah.gender === 'male' ? '👨' : '👩'} 
                            <strong>${jamaah.gender === 'male' ? 'L' : 'P'}</strong> | 
                            Beli: <span style="color: #60a5fa; font-weight: 600;">${(jamaah.room_preference || 'quad').toUpperCase()}</span>
                            ${jamaah.family_group ? ` | Family: ${jamaah.family_group}` : ''}
                        </div>
                    </div>
                    <div class="room-type ${jamaah.room_preference || 'quad'}">${(jamaah.room_preference || 'quad').toUpperCase()}</div>
                `;
                
                item.addEventListener('click', () => {
                    item.classList.toggle('selected');
                });
                
                container.appendChild(item);
            });
        }

        function loadRoomGrid() {
            const container = document.getElementById('roomGrid');
            container.innerHTML = '';
            
            currentGroupRooms.forEach(room => {
                const card = document.createElement('div');
                card.className = 'room-card';
                card.innerHTML = `
                    <div class="room-header">
                        <div class="room-number">Room ${room.number}</div>
                        <div class="room-type ${room.type}">${room.type}</div>
                    </div>
                    
                    <div class="room-occupants">
                        ${generateOccupantsHTML(room)}
                        ${generateEmptyBedsHTML(room)}
                    </div>
                    
                    <div class="room-actions">
                        <button class="btn btn-primary" onclick="assignToRoom('${room.id}')">
                            <span class="material-icons">person_add</span>
                            Assign
                        </button>
                        <button class="btn btn-warning" onclick="editRoom('${room.id}')">
                            <span class="material-icons">edit</span>
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="clearRoom('${room.id}')">
                            <span class="material-icons">clear</span>
                            Clear
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function generateOccupantsHTML(room) {
            return room.occupants.map((occupant, index) => `
                <div class="occupant-item">
                    <div class="occupant-info">
                        <div class="occupant-name">${occupant.name}</div>
                        <div class="occupant-details">
                            ${occupant.gender === 'male' ? '👨' : '👩'} 
                            <strong>${occupant.gender === 'male' ? 'L' : 'P'}</strong> | 
                            <span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">
                                ${(occupant.room_preference || 'quad').toUpperCase()}
                            </span> | 
                            ${occupant.phone}
                        </div>
                    </div>
                    <div class="bed-assignment">Bed ${index + 1}</div>
                </div>
            `).join('');
        }

        function generateEmptyBedsHTML(room) {
            const emptyBeds = room.capacity - room.occupants.length;
            let html = '';
            
            for (let i = 0; i < emptyBeds; i++) {
                html += `<div class="empty-bed">Empty Bed ${room.occupants.length + i + 1}</div>`;
            }
            
            return html;
        }

        function selectAllocationStrategy(strategy) {
            selectedAllocationStrategy = strategy;
            
            // Update UI
            document.querySelectorAll('.allocation-option').forEach(option => {
                option.classList.remove('active');
            });
            document.querySelector(`[data-strategy="${strategy}"]`).classList.add('active');
        }

        function autoAllocateRooms() {
            if (!window.currentGroupJamaah) return;
            
            // Clear existing assignments
            clearAllRooms();
            
            const unassigned = [...window.currentGroupJamaah];
            
            // Sort by strategy
            switch (selectedAllocationStrategy) {
                case 'family':
                    allocateByFamily(unassigned);
                    break;
                case 'preference':
                    allocateByPreference(unassigned);
                    break;
                case 'auto':
                default:
                    allocateSmartly(unassigned);
                    break;
            }
            
            // Refresh display
            loadRoomManagement();
            showNotification('Rooms allocated successfully!');
        }

        function allocateSmartly(jamaahList) {
            // First try to allocate by preference, then fallback to simple allocation
            allocateByPreference(jamaahList);
            
            // Check for any unassigned jamaah and allocate them to available rooms
            const unassigned = jamaahList.filter(j => !j.room_number);
            if (unassigned.length > 0) {
                console.log(`Found ${unassigned.length} unassigned jamaah, allocating to available rooms`);
                
                // Separate by gender
                const males = unassigned.filter(j => j.gender === 'male');
                const females = unassigned.filter(j => j.gender === 'female');
                
                // Allocate males
                allocateGenderGroupFallback(males, 'male');
                
                // Allocate females
                allocateGenderGroupFallback(females, 'female');
            }
        }

        function allocateGenderGroupFallback(jamaahList, gender) {
            // Find rooms with available capacity for this gender
            const availableRooms = currentGroupRooms.filter(r => 
                r.gender === gender && r.occupants.length < r.capacity
            ).sort((a, b) => {
                // Prioritize rooms that match jamaah preferences
                const aHasMatchingPreference = jamaahList.some(j => j.room_preference === a.type);
                const bHasMatchingPreference = jamaahList.some(j => j.room_preference === b.type);
                if (aHasMatchingPreference && !bHasMatchingPreference) return -1;
                if (!aHasMatchingPreference && bHasMatchingPreference) return 1;
                // Then by available space (fill partially occupied rooms first)
                return b.occupants.length - a.occupants.length;
            });
            
            let jamaahIndex = 0;
            
            // Fill rooms based on capacity
            availableRooms.forEach(room => {
                while (room.occupants.length < room.capacity && jamaahIndex < jamaahList.length) {
                    const jamaah = jamaahList[jamaahIndex];
                    room.occupants.push(jamaah);
                    jamaah.room_number = room.number;
                    jamaah.bed_assignment = `Bed ${room.occupants.length}`;
                    jamaahIndex++;
                }
            });
        }

        function allocateByFamily(jamaahList) {
            // Group by family first, then by gender
            const families = {};
            const singles = [];
            
            jamaahList.forEach(jamaah => {
                if (jamaah.family_group) {
                    if (!families[jamaah.family_group]) {
                        families[jamaah.family_group] = [];
                    }
                    families[jamaah.family_group].push(jamaah);
                } else {
                    singles.push(jamaah);
                }
            });
            
            // Allocate families first
            Object.values(families).forEach(family => {
                allocateGenderGroup(family.filter(j => j.gender === 'male'), 'male');
                allocateGenderGroup(family.filter(j => j.gender === 'female'), 'female');
            });
            
            // Then allocate singles
            allocateSmartly(singles);
        }

        function allocateByPreference(jamaahList) {
            // Group by gender and preference
            const groups = {
                'male': { 'quad': [], 'triple': [], 'double': [] },
                'female': { 'quad': [], 'triple': [], 'double': [] }
            };
            
            jamaahList.forEach(jamaah => {
                // Default to quad if no preference is set
                const preference = jamaah.room_preference || 'quad';
                if (groups[jamaah.gender] && groups[jamaah.gender][preference]) {
                    groups[jamaah.gender][preference].push(jamaah);
                }
            });
            
            // Allocate by preference
            ['male', 'female'].forEach(gender => {
                ['quad', 'triple', 'double'].forEach(preference => {
                    const preferenceGroup = groups[gender][preference];
                    const preferredRooms = currentGroupRooms.filter(r => r.gender === gender && r.type === preference);
                    
                    let jamaahIndex = 0;
                    preferredRooms.forEach(room => {
                        while (room.occupants.length < room.capacity && jamaahIndex < preferenceGroup.length) {
                            const jamaah = preferenceGroup[jamaahIndex];
                            room.occupants.push(jamaah);
                            jamaah.room_number = room.number;
                            jamaah.bed_assignment = `Bed ${room.occupants.length}`;
                            jamaahIndex++;
                        }
                    });
                });
            });
        }

        function clearAllRooms() {
            currentGroupRooms.forEach(room => {
                room.occupants.forEach(occupant => {
                    occupant.room_number = null;
                    occupant.bed_assignment = null;
                });
                room.occupants = [];
            });
            
            loadRoomManagement();
        }

        function clearRoom(roomId) {
            const room = currentGroupRooms.find(r => r.id === roomId);
            if (room) {
                room.occupants.forEach(occupant => {
                    occupant.room_number = null;
                    occupant.bed_assignment = null;
                });
                room.occupants = [];
                loadRoomManagement();
            }
        }

        function assignToRoom(roomId) {
            const selectedJamaah = document.querySelectorAll('.unassigned-item.selected');
            if (selectedJamaah.length === 0) {
                showNotification('Pilih jamaah yang akan ditempatkan', 'error');
                return;
            }
            
            const room = currentGroupRooms.find(r => r.id === roomId);
            if (!room) return;
            
            if (room.occupants.length >= room.capacity) {
                showNotification('Kamar sudah penuh', 'error');
                return;
            }
            
            // Process selected jamaah
            selectedJamaah.forEach(item => {
                if (room.occupants.length < room.capacity) {
                    const jamaahName = item.querySelector('.occupant-name, div[style*="font-weight: 500"]')?.textContent;
                    const jamaah = window.currentGroupJamaah.find(j => j.name === jamaahName);
                    
                    if (jamaah && !jamaah.room_number) {
                        room.occupants.push(jamaah);
                        jamaah.room_number = room.number;
                        jamaah.bed_assignment = `Bed ${room.occupants.length}`;
                    }
                }
            });
            
            loadRoomManagement();
            showNotification('Jamaah berhasil ditempatkan ke kamar');
        }

        function editRoom(roomId) {
            showNotification('Fitur edit room akan segera tersedia');
        }

        function saveRoomAssignments() {
            showNotification('Room assignments saved successfully!');
            closeModal('roomModal');
        }

        function exportRoomList() {
            // Create Excel-like data structure
            const data = [
                ['Room Number', 'Room Type', 'Gender', 'Occupant 1', 'Occupant 2', 'Occupant 3', 'Occupant 4']
            ];
            
            currentGroupRooms.forEach(room => {
                const row = [
                    room.number,
                    room.type.toUpperCase(),
                    room.gender.toUpperCase()
                ];
                
                // Add occupants
                for (let i = 0; i < 4; i++) {
                    row.push(room.occupants[i] ? room.occupants[i].name : '');
                }
                
                data.push(row);
            });
            
            // Create and download Excel file
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Room List');
            XLSX.writeFile(wb, 'room_list.xlsx');
            
            showNotification('Room list exported successfully!');
        }

        // Reports
        function loadReportCharts() {
            // Trend chart
            const trendCtx = document.getElementById('trendChart').getContext('2d');
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Registrasi',
                        data: [120, 190, 300, 250, 180, 220],
                        borderColor: '#4facfe',
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            labels: { 
                                color: 'white',
                                font: { size: 12 }
                            } 
                        }
                    },
                    scales: {
                        x: { 
                            ticks: { 
                                color: 'white',
                                font: { size: 11 }
                            } 
                        },
                        y: { 
                            ticks: { 
                                color: 'white',
                                font: { size: 11 }
                            } 
                        }
                    }
                }
            });

            // Status chart
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'pie',
                data: {
                    labels: ['Terverifikasi', 'Pending', 'Ditolak'],
                    datasets: [{
                        data: [1089, 158, 23],
                        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            labels: { 
                                color: 'white',
                                font: { size: 11 }
                            } 
                        }
                    }
                }
            });
        }

        function generateReport(type) {
            showNotification(`Generating laporan ${type}...`);
            
            // Simulate report generation
            setTimeout(() => {
                showNotification(`Laporan ${type} berhasil dibuat!`);
            }, 2000);
        }

        // Excel Functions
        function downloadTemplate(type) {
            let templateData = [];
            let filename = '';

            switch(type) {
                case 'jamaah':
                    templateData = [
                        ['Nama Lengkap', 'NIK', 'Tanggal Lahir', 'Tempat Lahir', 'Jenis Kelamin', 'No. Telepon', 'Email', 'Alamat', 'No. Paspor', 'Paket ID'],
                        ['Ahmad Fauzi', '1234567890123456', '1985-05-15', 'Jakarta', 'L', '081234567890', 'ahmad@email.com', 'Jl. Merdeka No. 123', 'A1234567', '1']
                    ];
                    filename = 'template_jamaah.xlsx';
                    break;
                case 'package':
                    templateData = [
                        ['Nama Paket', 'Harga', 'Tanggal Keberangkatan', 'Durasi', 'Kuota', 'Hotel Makkah', 'Hotel Madinah', 'Malam Makkah', 'Malam Madinah', 'Maskapai'],
                        ['Umroh Ramadhan 2024', '25000000', '2024-03-15', '14', '45', 'Hilton Makkah', 'Pullman Madinah', '7', '7', 'Emirates']
                    ];
                    filename = 'template_paket.xlsx';
                    break;
                case 'payment':
                    templateData = [
                        ['Jamaah ID', 'Jumlah', 'Tanggal', 'Metode', 'Bank', 'No. Referensi'],
                        ['1', '15000000', '2024-01-15', 'Transfer Bank', 'BCA', 'TRF20240115001']
                    ];
                    filename = 'template_pembayaran.xlsx';
                    break;
            }

            const ws = XLSX.utils.aoa_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Template');
            XLSX.writeFile(wb, filename);
            
            showNotification(`Template ${type} berhasil didownload!`);
        }

        function handleExcelImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, {type: 'binary'});
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                    
                    // Process imported data
                    const headers = jsonData[0];
                    const rows = jsonData.slice(1);
                    
                    let successCount = 0;
                    let errorCount = 0;
                    let errors = [];

                    rows.forEach((row, index) => {
                        try {
                            // Validate and process each row
                            if (row.length >= headers.length - 1) {
                                successCount++;
                            } else {
                                errorCount++;
                                errors.push(`Baris ${index + 2}: Data tidak lengkap`);
                            }
                        } catch (error) {
                            errorCount++;
                            errors.push(`Baris ${index + 2}: ${error.message}`);
                        }
                    });

                    // Show import results
                    const resultsDiv = document.getElementById('importResults');
                    const contentDiv = document.getElementById('importResultsContent');
                    
                    contentDiv.innerHTML = `
                        <div class="glass-card">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                                <div class="stat-card">
                                    <div class="stat-number" style="color: #22c55e;">${successCount}</div>
                                    <div class="stat-label">Berhasil</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number" style="color: #ef4444;">${errorCount}</div>
                                    <div class="stat-label">Error</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${rows.length}</div>
                                    <div class="stat-label">Total</div>
                                </div>
                            </div>
                            ${errors.length > 0 ? `
                                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px;">
                                    <h4 style="color: #ef4444; margin-bottom: 10px;">Error Details:</h4>
                                    <ul style="color: rgba(255, 255, 255, 0.8); margin-left: 20px;">
                                        ${errors.map(error => `<li>${error}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    
                    resultsDiv.style.display = 'block';
                    showNotification('Import Excel selesai!');
                    
                } catch (error) {
                    showNotification('Error membaca file Excel!', 'error');
                }
            };
            reader.readAsBinaryString(file);
        }

        function exportToExcel(type) {
            let data = [];
            let filename = '';

            switch(type) {
                case 'jamaah':
                    data = jamaahData.map(j => [
                        j.name, j.nik, j.phone, j.email, j.passport_number || 'Belum ada', j.package, 
                        getStatusText(j.status), j.total_paid
                    ]);
                    data.unshift(['Nama', 'NIK', 'Telepon', 'Email', 'No. Paspor', 'Paket', 'Status', 'Total Bayar']);
                    filename = 'data_jamaah.xlsx';
                    break;
                case 'package':
                    data = packageData.map(p => [
                        p.name, p.price, p.departure_date, p.duration, p.quota, p.booked,
                        p.makkah_hotel, p.madinah_hotel, p.airline
                    ]);
                    data.unshift(['Nama', 'Harga', 'Keberangkatan', 'Durasi', 'Kuota', 'Terdaftar', 'Hotel Makkah', 'Hotel Madinah', 'Maskapai']);
                    filename = 'data_paket.xlsx';
                    break;
                case 'payment':
                    data = paymentData.map(p => [
                        p.id, p.reference, p.jamaah_name, p.package, p.amount, p.date, p.method, p.bank, getStatusText(p.status)
                    ]);
                    data.unshift(['ID', 'No. Referensi', 'Jamaah', 'Paket', 'Jumlah', 'Tanggal', 'Metode', 'Bank', 'Status']);
                    filename = 'data_pembayaran.xlsx';
                    break;
                case 'manifest':
                    exportManifest();
                    return;
                case 'all':
                    // Create workbook with multiple sheets
                    const wb = XLSX.utils.book_new();
                    
                    // Jamaah sheet
                    const jamaahData2D = jamaahData.map(j => [j.name, j.nik, j.phone, j.email, j.passport_number || 'Belum ada', j.package, getStatusText(j.status), j.total_paid]);
                    jamaahData2D.unshift(['Nama', 'NIK', 'Telepon', 'Email', 'No. Paspor', 'Paket', 'Status', 'Total Bayar']);
                    const wsJamaah = XLSX.utils.aoa_to_sheet(jamaahData2D);
                    XLSX.utils.book_append_sheet(wb, wsJamaah, 'Jamaah');
                    
                    // Package sheet
                    const packageData2D = packageData.map(p => [p.code, p.name, p.price, p.departure_date, p.duration, p.quota, p.booked]);
                    packageData2D.unshift(['Kode', 'Nama', 'Harga', 'Keberangkatan', 'Durasi', 'Kuota', 'Terdaftar']);
                    const wsPackage = XLSX.utils.aoa_to_sheet(packageData2D);
                    XLSX.utils.book_append_sheet(wb, wsPackage, 'Paket');
                    
                    // Payment sheet
                    const paymentData2D = paymentData.map(p => [p.id, p.reference, p.jamaah_name, p.package, p.amount, p.date, p.method, p.bank, getStatusText(p.status)]);
                    paymentData2D.unshift(['ID', 'No. Referensi', 'Jamaah', 'Paket', 'Jumlah', 'Tanggal', 'Metode', 'Bank', 'Status']);
                    const wsPayment = XLSX.utils.aoa_to_sheet(paymentData2D);
                    XLSX.utils.book_append_sheet(wb, wsPayment, 'Pembayaran');
                    
                    XLSX.writeFile(wb, 'data_umroh_lengkap.xlsx');
                    showNotification('Semua data berhasil diekspor!');
                    return;
            }

            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            XLSX.writeFile(wb, filename);
            
            showNotification(`Data ${type} berhasil diekspor!`);
        }

        // Manifest Export Function
        function exportManifest(groupId = null) {
            // Get all jamaah for the specified group or all if no group specified
            let jamaahList = jamaahData;
            let groupInfo = null;
            
            if (groupId) {
                groupInfo = groupData.find(g => g.id === groupId);
                jamaahList = jamaahData.filter(j => j.group_id === groupId);
            }
            
            if (jamaahList.length === 0) {
                showNotification('Tidak ada data jamaah untuk diekspor!', 'error');
                return;
            }
            
            // Create manifest data structure
            const manifestData = [];
            
            // Get package and airline information
            let packageInfo = null;
            let airlineCode = '';
            let packageCode = '';
            
            if (groupInfo) {
                // Find package info from group
                packageInfo = packageData.find(p => p.name === groupInfo.package);
            } else if (jamaahList.length > 0) {
                // Get package info from first jamaah if no specific group
                packageInfo = packageData.find(p => p.name === jamaahList[0].package);
            }
            
            if (packageInfo) {
                // Extract airline code (first 2-3 characters of airline name or use airline field)
                airlineCode = packageInfo.airline_code || packageInfo.airline?.substring(0, 3).toUpperCase() || 'XXX';
                packageCode = packageInfo.code || `PKG${packageInfo.id.toString().padStart(3, '0')}`;
            }
            
            // Header Information with Airline and Package Codes
            manifestData.push(['MANIFEST JAMAAH UMROH']);
            manifestData.push(['']);
            manifestData.push(['KODE MASKAPAI:', airlineCode]);
            manifestData.push(['KODE PAKET:', packageCode]);
            manifestData.push(['']);
            
            if (groupInfo) {
                manifestData.push(['INFORMASI GRUP']);
                manifestData.push(['Nama Grup:', groupInfo.name]);
                manifestData.push(['Paket:', groupInfo.package]);
                manifestData.push(['Tanggal Keberangkatan:', formatDate(groupInfo.departure_date)]);
                manifestData.push(['Bus:', groupInfo.bus_number]);
                manifestData.push(['Waktu Kumpul:', groupInfo.meeting_time]);
                manifestData.push(['Tempat Kumpul:', groupInfo.meeting_point]);
                manifestData.push(['Total Jamaah:', jamaahList.length]);
                manifestData.push(['']);
            }
            
            manifestData.push(['DAFTAR JAMAAH']);
            manifestData.push(['']);
            
            // Table headers - Format sesuai manifest standar
            manifestData.push([
                'NO',
                'NAME PASSPORT',
                'SEX',
                'PLACE OF BIRTH',
                'DATE OF BIRTH',
                'AGE',
                'NO PASSPORT',
                'DATE OF ISSUED',
                'DATE OF EXPIRED',
                'PLACE OF ISSUED',
                'FIRST NAME'
            ]);
            
            // Jamaah data rows - Format sesuai manifest standar
            jamaahList.forEach((jamaah, index) => {
                const age = jamaah.birth_date ? calculateAge(jamaah.birth_date) : 0;
                
                // Format tanggal untuk passport issued dan expired
                const passportIssued = jamaah.passport_issue_date ? formatDateForManifest(jamaah.passport_issue_date) : '';
                const passportExpired = jamaah.passport_expire_date ? formatDateForManifest(jamaah.passport_expire_date) : '';
                const birthDate = jamaah.birth_date ? formatDateForManifest(jamaah.birth_date) : '';
                
                manifestData.push([
                    index + 1,                                          // NO
                    jamaah.passport_name || jamaah.name || '',         // NAME PASSPORT
                    jamaah.gender === 'male' ? 'M' : 'F',              // SEX
                    jamaah.birth_place || '',                          // PLACE OF BIRTH
                    birthDate,                                         // DATE OF BIRTH
                    age,                                               // AGE
                    jamaah.passport_number || '',                      // NO PASSPORT
                    passportIssued,                                    // DATE OF ISSUED
                    passportExpired,                                   // DATE OF EXPIRED
                    jamaah.passport_city || '',                        // PLACE OF ISSUED
                    jamaah.name ? jamaah.name.split(' ')[0] : ''       // FIRST NAME
                ]);
            });
            
            // Summary section
            manifestData.push(['']);
            manifestData.push(['RINGKASAN']);
            manifestData.push(['Total Jamaah:', jamaahList.length]);
            manifestData.push(['Laki-laki:', jamaahList.filter(j => j.gender === 'male').length]);
            manifestData.push(['Perempuan:', jamaahList.filter(j => j.gender === 'female').length]);
            manifestData.push(['Sudah Lunas:', jamaahList.filter(j => j.payment_status === 'paid').length]);
            manifestData.push(['Belum Lunas:', jamaahList.filter(j => j.payment_status !== 'paid').length]);
            manifestData.push(['Dokumen Lengkap:', jamaahList.filter(j => j.document_status === 'approved').length]);
            manifestData.push(['Visa Approved:', jamaahList.filter(j => j.visa_status === 'approved').length]);
            
            // Room allocation summary
            manifestData.push(['']);
            manifestData.push(['ALOKASI KAMAR']);
            const roomPreferences = jamaahList.reduce((acc, j) => {
                const pref = j.room_preference || 'quad';
                acc[pref] = (acc[pref] || 0) + 1;
                return acc;
            }, {});
            
            Object.entries(roomPreferences).forEach(([type, count]) => {
                manifestData.push([`Kamar ${type.charAt(0).toUpperCase() + type.slice(1)}:`, count]);
            });
            
            // Export to Excel
            const filename = groupInfo ? 
                `manifest-${groupInfo.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.xlsx` :
                `manifest-all-jamaah-${new Date().toISOString().slice(0,10)}.xlsx`;
                
            const ws = XLSX.utils.aoa_to_sheet(manifestData);
            
            // Set column widths for better formatting - Format manifest standar
            const wscols = [
                {wch: 5},   // NO
                {wch: 30},  // NAME PASSPORT
                {wch: 5},   // SEX
                {wch: 20},  // PLACE OF BIRTH
                {wch: 15},  // DATE OF BIRTH
                {wch: 5},   // AGE
                {wch: 15},  // NO PASSPORT
                {wch: 15},  // DATE OF ISSUED
                {wch: 15},  // DATE OF EXPIRED
                {wch: 20},  // PLACE OF ISSUED
                {wch: 20}   // FIRST NAME
            ];
            ws['!cols'] = wscols;
            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Manifest');
            XLSX.writeFile(wb, filename);
            
            showNotification(`Manifest berhasil diekspor! (${jamaahList.length} jamaah)`, 'success');
        }
        
        function calculateAge(birthDate) {
            if (!birthDate) return 0;
            
            // Handle ddmmyyyy format
            let dateObj;
            if (birthDate.length === 8 && !birthDate.includes('-')) {
                const day = birthDate.substring(0, 2);
                const month = birthDate.substring(2, 4);
                const year = birthDate.substring(4, 8);
                dateObj = new Date(`${year}-${month}-${day}`);
            } else {
                dateObj = new Date(birthDate);
            }
            
            const today = new Date();
            let age = today.getFullYear() - dateObj.getFullYear();
            const monthDiff = today.getMonth() - dateObj.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
                age--;
            }
            return age;
        }
        
        function formatDateForManifest(dateString) {
            if (!dateString) return '';
            
            let dateObj;
            // Handle ddmmyyyy format
            if (dateString.length === 8 && !dateString.includes('-')) {
                const day = dateString.substring(0, 2);
                const month = dateString.substring(2, 4);
                const year = dateString.substring(4, 8);
                dateObj = new Date(`${year}-${month}-${day}`);
            } else {
                dateObj = new Date(dateString);
            }
            
            if (isNaN(dateObj.getTime())) return dateString;
            
            // Format as DD-MM-YYYY for manifest
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            
            return `${day}-${month}-${year}`;
        }

        // Modal Functions
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                
                // Focus trap - focus on the modal
                modal.focus();
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto'; // Restore background scrolling
                
                // Clear any form data if it's a form modal
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        }

        // Function to close any active modal
        function closeActiveModal() {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }

        // Utility Functions
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        // Date utility functions for ddmmyyyy format
        function formatBirthDate(ddmmyyyy) {
            if (!ddmmyyyy || ddmmyyyy.length !== 8) return ddmmyyyy;
            
            const day = ddmmyyyy.substring(0, 2);
            const month = ddmmyyyy.substring(2, 4);
            const year = ddmmyyyy.substring(4, 8);
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                              'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            const monthIndex = parseInt(month) - 1;
            const monthName = monthNames[monthIndex] || month;
            
            return `${day} ${monthName} ${year}`;
        }

        function validateBirthDate(ddmmyyyy) {
            if (!ddmmyyyy || ddmmyyyy.length !== 8) return false;
            
            const day = parseInt(ddmmyyyy.substring(0, 2));
            const month = parseInt(ddmmyyyy.substring(2, 4));
            const year = parseInt(ddmmyyyy.substring(4, 8));
            
            // Basic validation
            if (day < 1 || day > 31) return false;
            if (month < 1 || month > 12) return false;
            if (year < 1900 || year > new Date().getFullYear()) return false;
            
            // Check if date is valid
            const testDate = new Date(year, month - 1, day);
            return testDate.getFullYear() === year && 
                   testDate.getMonth() === month - 1 && 
                   testDate.getDate() === day;
        }

        function convertToISODate(ddmmyyyy) {
            if (!ddmmyyyy || ddmmyyyy.length !== 8) return '';
            
            const day = ddmmyyyy.substring(0, 2);
            const month = ddmmyyyy.substring(2, 4);
            const year = ddmmyyyy.substring(4, 8);
            
            return `${year}-${month}-${day}`;
        }

        // Passport form functions
        function togglePassportName(checkbox) {
            const passportNameInput = document.getElementById('jamaahPassportName');
            const ktpNameInput = document.getElementById('jamaahName');
            
            if (checkbox.checked) {
                passportNameInput.value = ktpNameInput.value;
                passportNameInput.readOnly = true;
                passportNameInput.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
            } else {
                passportNameInput.readOnly = false;
                passportNameInput.style.backgroundColor = '';
            }
        }

        function validatePassportDate(ddmmyyyy) {
            if (!ddmmyyyy || ddmmyyyy.length !== 8) return false;
            
            const day = parseInt(ddmmyyyy.substring(0, 2));
            const month = parseInt(ddmmyyyy.substring(2, 4));
            const year = parseInt(ddmmyyyy.substring(4, 8));
            
            // Basic validation
            if (day < 1 || day > 31) return false;
            if (month < 1 || month > 12) return false;
            if (year < 1900 || year > 2100) return false; // Allow future dates for passport expiry
            
            // Check if date is valid
            const testDate = new Date(year, month - 1, day);
            return testDate.getFullYear() === year && 
                   testDate.getMonth() === month - 1 && 
                   testDate.getDate() === day;
        }

        function formatDateInput(inputElement) {
            inputElement.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                
                if (value.length > 8) {
                    value = value.slice(0, 8);
                }
                
                e.target.value = value;
                
                // Real-time validation feedback
                if (value.length === 8) {
                    if (validatePassportDate(value)) {
                        e.target.style.borderColor = '#10b981';
                        e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    } else {
                        e.target.style.borderColor = '#ef4444';
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }
                } else {
                    e.target.style.borderColor = '';
                    e.target.style.backgroundColor = '';
                }
            });
            
            inputElement.addEventListener('blur', function(e) {
                const value = e.target.value;
                if (value.length === 8 && validatePassportDate(value)) {
                    const formatted = formatBirthDate(value);
                    e.target.title = `Tanggal: ${formatted}`;
                }
            });
        }

        // Family management functions
        function toggleFamilyFields(selectElement) {
            const mainFamilySection = document.getElementById('mainFamilySection');
            const value = selectElement.value;
            
            if (value === 'istri' || value === 'anak') {
                mainFamilySection.style.display = 'block';
                populateMainFamilyOptions();
            } else {
                mainFamilySection.style.display = 'none';
            }
        }

        function populateMainFamilyOptions() {
            const mainFamilySelect = document.getElementById('jamaahMainFamily');
            
            // Clear existing options except the first one
            mainFamilySelect.innerHTML = '<option value="">Pilih Kepala Keluarga</option>';
            
            // Find all kepala keluarga from jamaahData
            const kepalaKeluarga = jamaahData.filter(j => j.family_role === 'kepala_keluarga');
            
            kepalaKeluarga.forEach(kk => {
                const option = document.createElement('option');
                option.value = kk.main_family_id;
                option.textContent = `${kk.name} (Family ID: ${kk.main_family_id})`;
                mainFamilySelect.appendChild(option);
            });
            
            // Add option to create new family
            const newFamilyOption = document.createElement('option');
            newFamilyOption.value = 'new_family';
            newFamilyOption.textContent = '+ Buat Family Baru';
            mainFamilySelect.appendChild(newFamilyOption);
        }

        function generateNewFamilyId() {
            const existingFamilyIds = jamaahData
                .map(j => j.main_family_id)
                .filter(id => id !== undefined && id !== null);
            
            if (existingFamilyIds.length === 0) return 1;
            
            return Math.max(...existingFamilyIds) + 1;
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Passport Functions
        function previewPassportImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('passportPreview').style.display = 'block';
                    document.getElementById('passportImg').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function viewPassportImage(imageSrc, jamaahName) {
            if (!imageSrc) {
                showNotification('Belum ada foto paspor untuk jamaah ini', 'error');
                return;
            }
            
            // Create modal for passport view
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>Foto Paspor - ${jamaahName}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div style="text-align: center;">
                        <img src="${imageSrc}" style="max-width: 100%; max-height: 400px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners for close buttons
            const closeButtons = modal.querySelectorAll('.close-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.remove();
                });
            });
            
            // Close on click outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }


        // Marketing Functions
        function openWhatsApp(phoneNumber) {
            const waNumber = phoneNumber.replace(/[^0-9]/g, '');
            const waLink = `https://wa.me/${waNumber}`;
            window.open(waLink, '_blank');
        }

        function filterByStage(stage) {
            // Reset all buttons
            document.querySelectorAll('[id^="filter"]').forEach(btn => {
                if (btn.id === 'filterAll') {
                    btn.style.background = stage === 'all' ? 'linear-gradient(135deg, #EC4899, #F472B6)' : '';
                    btn.style.border = stage === 'all' ? 'none' : '1px solid rgba(236, 72, 153, 0.5)';
                    btn.style.color = stage === 'all' ? 'white' : '#EC4899';
                } else if (btn.id === 'filterLeads') {
                    btn.style.background = stage === 'leads' ? 'linear-gradient(135deg, #3B82F6, #60A5FA)' : '';
                    btn.style.border = stage === 'leads' ? 'none' : '1px solid rgba(59, 130, 246, 0.5)';
                    btn.style.color = stage === 'leads' ? 'white' : '#3B82F6';
                } else if (btn.id === 'filterInterest') {
                    btn.style.background = stage === 'interest' ? 'linear-gradient(135deg, #F59E0B, #FCD34D)' : '';
                    btn.style.border = stage === 'interest' ? 'none' : '1px solid rgba(245, 158, 11, 0.5)';
                    btn.style.color = stage === 'interest' ? 'white' : '#F59E0B';
                } else if (btn.id === 'filterBooked') {
                    btn.style.background = stage === 'booked' ? 'linear-gradient(135deg, #10B981, #34D399)' : '';
                    btn.style.border = stage === 'booked' ? 'none' : '1px solid rgba(16, 185, 129, 0.5)';
                    btn.style.color = stage === 'booked' ? 'white' : '#10B981';
                }
            });

            // Filter table rows
            const rows = document.querySelectorAll('#marketingCustomerList tr');
            rows.forEach(row => {
                if (stage === 'all') {
                    row.style.display = '';
                } else {
                    const stageCell = row.querySelector('td:nth-child(3) .badge');
                    if (stageCell) {
                        const rowStage = stageCell.textContent.toLowerCase();
                        row.style.display = rowStage === stage ? '' : 'none';
                    }
                }
            });

            showNotification(`Showing ${stage === 'all' ? 'all' : stage} customers`);
        }

        function searchMarketingCustomers() {
            const searchTerm = document.getElementById('marketingSearch').value.toLowerCase();
            const rows = document.querySelectorAll('#marketingCustomerList tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
                const phone = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
                
                if (name.includes(searchTerm) || phone.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function changeCustomerStage(customerId) {
            const stages = ['leads', 'interest', 'booked'];
            const stageLabels = {
                'leads': 'Leads',
                'interest': 'Interest',
                'booked': 'Booked'
            };

            // Create modal for stage change
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>Change Customer Stage</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div style="padding: 20px;">
                        <p style="margin-bottom: 20px;">Select new stage for this customer:</p>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${stages.map(stage => `
                                <button class="btn btn-outline" style="width: 100%; padding: 15px; justify-content: flex-start; border-color: ${getStageColor(stage)}; color: ${getStageColor(stage)};" onclick="updateCustomerStage(${customerId}, '${stage}')">
                                    <span class="material-icons" style="margin-right: 10px;">${getStageIcon(stage)}</span>
                                    ${stageLabels[stage]}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        }

        function getStageColor(stage) {
            switch(stage) {
                case 'leads': return '#3B82F6';
                case 'interest': return '#F59E0B';
                case 'booked': return '#10B981';
                default: return '#6B7280';
            }
        }

        function getStageIcon(stage) {
            switch(stage) {
                case 'leads': return 'person_add';
                case 'interest': return 'star';
                case 'booked': return 'check_circle';
                default: return 'circle';
            }
        }

        function updateCustomerStage(customerId, newStage) {
            // Close modal
            document.querySelector('.modal.active').remove();
            
            // Show success notification
            showNotification(`Customer stage updated to ${newStage}`);
            
            // In real app, this would update the backend
            // For demo, just refresh the display
            filterByStage('all');
        }

        function viewCustomerDetails(customerId) {
            // Sample customer data
            const customers = {
                1: {
                    name: 'Ahmad Hidayat',
                    phone: '+62 812-3456-7890',
                    stage: 'leads',
                    package: 'UMR2025',
                    value: 'Rp 35M',
                    firstContact: '2025-01-20',
                    conversations: [
                        { sender: 'customer', message: 'Assalamualaikum, saya mau tanya paket umroh', time: '2 jam yang lalu' },
                        { sender: 'agent', message: 'Waalaikumsalam, silakan. Ada yang bisa saya bantu?', time: '2 jam yang lalu' },
                        { sender: 'customer', message: 'Untuk bulan April ada?', time: '1 jam yang lalu' }
                    ]
                },
                2: { 
                    name: 'Siti Rahmawati',
                    phone: '+62 819-8765-4321',
                    stage: 'interest',
                    package: 'UMR2025P',
                    value: 'Rp 55M',
                    firstContact: '2025-01-18',
                    conversations: []
                },
                3: {
                    name: 'Muhammad Fadli',
                    phone: '+62 856-7890-1234',
                    stage: 'booked',
                    package: 'UMR2025',
                    value: 'Rp 35M',
                    firstContact: '2025-01-10',
                    conversations: []
                }
            };

            const customer = customers[customerId];
            if (!customer) return;

            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>Customer Details - ${customer.name}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px;">
                        <div>
                            <h4 style="color: #EC4899; margin-bottom: 15px;">Customer Information</h4>
                            <p><strong>Name:</strong> ${customer.name}</p>
                            <p><strong>Phone:</strong> ${customer.phone}</p>
                            <p><strong>Stage:</strong> <span class="badge" style="background: rgba(${getStageColorRgba(customer.stage)}, 0.2); color: ${getStageColor(customer.stage)}; border: 1px solid rgba(${getStageColorRgba(customer.stage)}, 0.3);">${customer.stage}</span></p>
                            <p><strong>Package:</strong> ${customer.package}</p>
                            <p><strong>Value:</strong> ${customer.value}</p>
                            <p><strong>First Contact:</strong> ${formatDate(customer.firstContact)}</p>
                        </div>
                        <div>
                            <h4 style="color: #EC4899; margin-bottom: 15px;">Actions</h4>
                            <button class="btn btn-success btn-sm" onclick="openWhatsApp('${customer.phone}')" style="width: 100%; margin-bottom: 10px;">
                                <span class="material-icons">chat</span>
                                Open WhatsApp
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="changeCustomerStage(${customerId})" style="width: 100%; margin-bottom: 10px;">
                                <span class="material-icons">swap_horiz</span>
                                Change Stage
                            </button>
                            <button class="btn btn-warning btn-sm" style="width: 100%;">
                                <span class="material-icons">edit</span>
                                Edit Details
                            </button>
                        </div>
                    </div>
                    <div style="padding: 20px; border-top: 1px solid rgba(71, 85, 105, 0.3);">
                        <h4 style="color: #EC4899; margin-bottom: 15px;">Conversation History</h4>
                        <div style="max-height: 300px; overflow-y: auto; background: rgba(30, 41, 59, 0.3); border-radius: 8px; padding: 15px;">
                            ${customer.conversations.length > 0 ? customer.conversations.map(conv => `
                                <div style="margin-bottom: 15px; ${conv.sender === 'customer' ? 'text-align: left;' : 'text-align: right;'}">
                                    <div style="display: inline-block; max-width: 70%; padding: 10px 15px; border-radius: 15px; background: ${conv.sender === 'customer' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; border: 1px solid ${conv.sender === 'customer' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'};">
                                        <div style="font-size: 10px; color: rgba(255, 255, 255, 0.5); margin-bottom: 5px;">${conv.sender === 'customer' ? 'Customer' : 'Agent'} - ${conv.time}</div>
                                        <div>${conv.message}</div>
                                    </div>
                                </div>
                            `).join('') : '<p style="text-align: center; color: rgba(255, 255, 255, 0.5);">No conversation history yet</p>'}
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        }

        function getStageColorRgba(stage) {
            switch(stage) {
                case 'leads': return '59, 130, 246';
                case 'interest': return '245, 158, 11';
                case 'booked': return '16, 185, 129';
                default: return '107, 114, 128';
            }
        }

        function showMarketingStageFilter() {
            showNotification('Advanced filter options coming soon!');
        }

        function refreshMarketingData() {
            showNotification('Data refreshed successfully!');
            // In real app, this would fetch fresh data from server
        }

        function addAutoReplyRule() {
            showNotification('Auto reply rule editor coming soon!');
        }

        function editAutoReply(ruleId) {
            showNotification('Edit auto reply feature coming soon!');
        }

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboard();
            loadJamaahTable();
            
            // Add input formatting for birth date
            const birthDateInput = document.getElementById('jamaahBirthDate');
            if (birthDateInput) {
                formatDateInput(birthDateInput);
            }

            // Add input formatting for passport dates
            const passportIssueInput = document.getElementById('jamaahPassportIssueDate');
            const passportExpireInput = document.getElementById('jamaahPassportExpireDate');
            
            if (passportIssueInput) {
                formatDateInput(passportIssueInput);
            }
            
            if (passportExpireInput) {
                formatDateInput(passportExpireInput);
            }

            // Sync passport name with KTP name
            const ktpNameInput = document.getElementById('jamaahName');
            const sameAsKtpCheckbox = document.getElementById('sameAsKtpName');
            
            if (ktpNameInput && sameAsKtpCheckbox) {
                ktpNameInput.addEventListener('input', function() {
                    if (sameAsKtpCheckbox.checked) {
                        document.getElementById('jamaahPassportName').value = this.value;
                    }
                });
            }

            // Modal event listeners
            // 1. ESC key to close modals
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    closeActiveModal();
                }
            });

            // 2. Click outside modal to close
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    // Only close if clicked on the modal backdrop (not the modal content)
                    if (e.target === modal) {
                        closeModal(modal.id);
                    }
                });
            });

            // 3. Close button functionality for all modals
            document.querySelectorAll('.modal .close-btn').forEach(closeBtn => {
                closeBtn.addEventListener('click', function() {
                    const modal = this.closest('.modal');
                    if (modal) {
                        closeModal(modal.id);
                    }
                });
            });
        });
    </script>
    <script>
        // Special Requests Data
        const specialRequests = {
            'GA-897': [
                { type: 'wheelchair', name: 'Hj. Fatimah (65th)', notes: 'Kursi roda dari check-in hingga boarding' },
                { type: 'wheelchair', name: 'H. Ahmad (70th)', notes: 'Bantuan kursi roda untuk transit' },
                { type: 'special_seat', name: 'Ibu Siti', notes: 'Seat dekat toilet (kondisi hamil)' },
                { type: 'special_meal', name: 'Bpk. Yusuf', notes: 'Diabetic meal' },
                { type: 'medical', name: 'Hj. Aisyah', notes: 'Membawa oxygen concentrator' }
            ],
            'SV-815': [],
            'QR-955': []
        };
        
        function showSpecialRequests(flightCode) {
            const modal = document.getElementById('specialRequestsModal');
            const requestsList = document.getElementById('requestsList');
            const requests = specialRequests[flightCode] || [];
            
            requestsList.innerHTML = '';
            
            if (requests.length === 0) {
                requestsList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.6);">No special requests for this flight</p>';
            } else {
                requests.forEach(request => {
                    const requestItem = `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid #F59E0B;">
                            <div style="display: flex; align-items: start; gap: 12px;">
                                <span class="material-icons" style="color: #F59E0B; font-size: 24px;">
                                    ${request.type === 'wheelchair' ? 'accessible' : 
                                      request.type === 'special_seat' ? 'event_seat' :
                                      request.type === 'special_meal' ? 'restaurant' : 'medical_services'}
                                </span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${request.name}</div>
                                    <div style="font-size: 13px; color: rgba(255, 255, 255, 0.7);">${request.notes}</div>
                                </div>
                            </div>
                        </div>
                    `;
                    requestsList.innerHTML += requestItem;
                });
            }
            
            modal.style.display = 'block';
        }
        
        function showFlightDetails(flightCode) {
            // Implement flight details modal
            alert('Flight details for ' + flightCode + ' - To be implemented');
        }
        
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
        
        // Close modal when clicking outside
        document.getElementById('specialRequestsModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('specialRequestsModal');
            }
        });
    </script>

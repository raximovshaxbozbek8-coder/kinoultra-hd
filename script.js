// Мультиключевая система TMDB для гарантированной загрузки
const API_KEYS = [
    '8baba8ab6b8bbe247645bcae7df63d0d',
    '3fd2be6f0c70a2a598f084ddfb75487c'
];
let currentApiKeyIndex = 0;
let moviesList = [];
let currentSelectedRating = 5;

// Динамическая загрузка скрипта Kinobox
function loadKinoboxScript() {
    if (!document.getElementById('kinobox-script')) {
        const script = document.createElement('script');
        script.id = 'kinobox-script';
        script.src = 'https://kinobox.net/php/kinobox.js';
        script.async = true;
        document.head.appendChild(script);
    }
}
loadKinoboxScript();

// Запрос к TMDB с автопереключением ключей при сбое
async function fetchTMDB(endpoint) {
    for (let i = 0; i < API_KEYS.length; i++) {
        const apiKey = API_KEYS[(currentApiKeyIndex + i) % API_KEYS.length];
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `https://api.themoviedb.org/3${endpoint}${separator}api_key=${apiKey}&language=ru-RU`;
        
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                currentApiKeyIndex = (currentApiKeyIndex + i) % API_KEYS.length;
                return data;
            }
        } catch (e) {
            console.error("Ошибка сети:", e);
        }
    }
    return null;
}

// Загрузка каталога
async function loadMovies(endpoint, title = "Популярное кино") {
    document.getElementById('sectionTitle').innerText = title;
    document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;">Загрузка фильмов...</div>';
    
    const data = await fetchTMDB(endpoint);
    if (data && data.results && data.results.length > 0) {
        moviesList = data.results;
        render(moviesList);
    } else {
        document.getElementById('movieGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">
                <p style="font-size: 18px; font-weight: bold;">⚠️ Не удалось загрузить каталог фильмов</p>
                <p style="font-size: 14px; color: #9ca3af;">Проверьте подключение к интернету или отключите VPN.</p>
                <button onclick="loadCategory('popular')" style="background: #e50914; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 10px;">Повторить попытку</button>
            </div>
        `;
    }
}

// Категории
function loadCategory(type) {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    if (type === 'popular') {
        document.getElementById('btn-popular')?.classList.add('active');
        loadMovies('/movie/popular', "🔥 Популярные фильмы");
    } else if (type === 'russian') {
        document.getElementById('btn-russian')?.classList.add('active');
        loadMovies('/discover/movie?with_original_language=ru&sort_by=popularity.desc', "🇷🇺 Русское кино и сериалы");
    } else if (type === 'anime') {
        document.getElementById('btn-anime')?.classList.add('active');
        loadMovies('/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc', "⛩️ Популярное Аниме");
    }
}

// Поиск
async function searchMovie(q) {
    if(!q) return loadCategory('popular');
    document.getElementById('sectionTitle').innerText = `Результаты поиска: "${q}"`;
    document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;">Поиск...</div>';
    
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(q)}`);
    if (data && data.results) {
        moviesList = data.results;
        render(moviesList);
    } else {
        document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Ничего не найдено.</div>';
    }
}

// Отрисовка карточек
function render(list) {
    const grid = document.getElementById('movieGrid');
    if (!list || list.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Ничего не найдено.</div>';
        return;
    }
    grid.innerHTML = list.map(m => {
        const title = m.title || m.name || 'Без названия';
        const date = (m.release_date || m.first_air_date || '').split('-')[0];
        const rating = m.vote_average ? m.vote_average.toFixed(1) : '0';
        const poster = m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : 'https://via.placeholder.com/300x450?text=Нет+обложки';
        return `
            <div class="card" onclick="openInfo(${m.id})">
                <img src="${poster}" alt="${title}" loading="lazy">
                <div class="card-info">
                    <div class="card-title">${title}</div>
                    <div class="card-meta">${date ? date + ' • ' : ''}★ ${rating}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Открытие информации о фильме
function openInfo(id) {
    const m = moviesList.find(item => item.id === id);
    if (!m) return;

    const poster = m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : 'https://via.placeholder.com/300x450?text=Нет+обложки';
    const title = m.title || m.name;
    const desc = m.overview || "Описание временно отсутствует.";

    document.getElementById('modalBody').innerHTML = `
        <h2 style="margin-top:0;">${title}</h2>
        <div class="movie-info-box">
            <img class="modal-poster" src="${poster}" alt="${title}">
            <div class="modal-details">
                <p style="color:#9ca3af; line-height:1.5;">${desc}</p>
                <button class="play-btn" onclick="startMovie(${m.id}, '${title.replace(/'/g, "")}')">▶ Смотреть онлайн на русском</button>
            </div>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';
}

// 100% РАБОЧИЙ ПЛЕЕР С РУССКОЙ ОЗВУЧКОЙ (KINOBOX)
function startMovie(id, title) {
    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:15px; color:#fff;">${title}</h3>
        
        <!-- Контейнер для плеера Kinobox -->
        <div class="kinobox_player" style="width:100%; min-height:450px; background:#000; border-radius:8px; overflow:hidden;"></div>

        <!-- Нативный баннер в модальном окне -->
        <div class="native-ad-wrapper" style="margin-top:15px; margin-bottom:0;">
            <script async="async" data-cfasync="false" src="https://bancadeltempoidea.org/21/5e3bed81d838ac1ae8d3b4a0282ef918"></script>
            <div id="container-5e3bed81d838ac1ae8d3b4a0282ef918"></div>
        </div>

        <!-- Отзывы -->
        <div class="reviews-section">
            <h4>Оставить отзыв и оценку</h4>
            <div class="star-rating" id="starContainer">
                <span class="star active" onclick="setRating(1)">★</span>
                <span class="star active" onclick="setRating(2)">★</span>
                <span class="star active" onclick="setRating(3)">★</span>
                <span class="star active" onclick="setRating(4)">★</span>
                <span class="star active" onclick="setRating(5)">★</span>
            </div>
            <textarea class="review-input" id="reviewText" placeholder="Напишите ваше мнение о фильме..."></textarea>
            <button class="review-btn" onclick="submitReview(${id})">Отправить отзыв</button>
            
            <div class="reviews-list" id="reviewsListContainer"></div>
        </div>
    `;

    // Инициализация плеера Kinobox
    if (window.kbox) {
        kbox('.kinobox_player', {
            search: { tmdb: id },
            menu: { enable: true },
            players: ['kodik', 'collaps', 'alloha', 'voidboost']
        });
    } else {
        setTimeout(() => {
            if (window.kbox) {
                kbox('.kinobox_player', {
                    search: { tmdb: id },
                    menu: { enable: true },
                    players: ['kodik', 'collaps', 'alloha', 'voidboost']
                });
            }
        }, 500);
    }

    loadReviews(id);
}

// Оценка звездочками
function setRating(rating) {
    currentSelectedRating = rating;
    const stars = document.querySelectorAll('#starContainer .star');
    stars.forEach((star, index) => {
        if (index < rating) star.classList.add('active');
        else star.classList.remove('active');
    });
}

// Сохранение отзыва
function submitReview(movieId) {
    const text = document.getElementById('reviewText').value.trim();
    if (!text) return alert('Напишите текст отзыва!');

    const reviewsKey = 'reviews_' + movieId;
    const existingReviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');

    existingReviews.unshift({
        rating: currentSelectedRating,
        text: text,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem(reviewsKey, JSON.stringify(existingReviews));
    document.getElementById('reviewText').value = '';
    loadReviews(movieId);
}

// Загрузка отзывов
function loadReviews(movieId) {
    const reviewsKey = 'reviews_' + movieId;
    const reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
    const container = document.getElementById('reviewsListContainer');

    if (reviews.length === 0) {
        container.innerHTML = '<div style="color:var(--text-sub); font-size:12px;">Пока нет отзывов. Будьте первыми!</div>';
        return;
    }

    container.innerHTML = reviews.map(r => `
        <div class="review-item">
            <div class="review-item-header">
                <span>Оценка: ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                <span>${r.date}</span>
            </div>
            <div>${r.text}</div>
        </div>
    `).join('');
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
}

// Первичный запуск
loadCategory('popular');

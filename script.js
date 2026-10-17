const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
let moviesList = [];
let currentSelectedRating = 5;

// Загрузка каталога
async function loadMovies(url, title = "Популярное кино") {
    document.getElementById('sectionTitle').innerText = title;
    try {
        const res = await fetch(url);
        const data = await res.json();
        moviesList = data.results || [];
        render(moviesList);
    } catch (e) {
        document.getElementById('movieGrid').innerText = "Ошибка загрузки каталога.";
    }
}

// Категории
function loadCategory(type) {
    if (type === 'popular') {
        loadMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ru-RU`, "🔥 Популярные фильмы");
    } else if (type === 'russian') {
        loadMovies(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ru-RU&with_original_language=ru&sort_by=popularity.desc`, "🇷🇺 Русское кино и сериалы");
    } else if (type === 'anime') {
        loadMovies(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=ru-RU&with_genres=16&with_original_language=ja&sort_by=popularity.desc`, "⛩️ Популярное Аниме");
    }
}

// Поиск
async function searchMovie(q) {
    if(!q) return loadCategory('popular');
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(q)}`);
    const data = await res.json();
    moviesList = data.results || [];
    document.getElementById('sectionTitle').innerText = `Результаты поиска: "${q}"`;
    render(moviesList);
}

// Отображение карточек
function render(list) {
    const grid = document.getElementById('movieGrid');
    if (list.length === 0) {
        grid.innerHTML = '<div>Ничего не найдено.</div>';
        return;
    }
    grid.innerHTML = list.map(m => {
        const title = m.title || m.name || 'Без названия';
        const date = (m.release_date || m.first_air_date || '').split('-')[0];
        const rating = m.vote_average ? m.vote_average.toFixed(1) : '0';
        return `
            <div class="card" onclick="openInfo(${m.id})">
                <img src="${m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : 'https://via.placeholder.com/300x450'}" alt="${title}">
                <div class="card-info">
                    <div class="card-title">${title}</div>
                    <div class="card-meta">${date} • ★ ${rating}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Открытие модального окна информации
function openInfo(id) {
    const m = moviesList.find(item => item.id === id);
    if (!m) return;

    const poster = m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : '';
    const title = m.title || m.name;
    const desc = m.overview || "Описание отсутствует.";

    document.getElementById('modalBody').innerHTML = `
        <h2 style="margin-top:0;">${title}</h2>
        <div class="movie-info-box">
            <img class="modal-poster" src="${poster}" alt="${title}">
            <div class="modal-details">
                <p style="color:#9ca3af; line-height:1.4;">${desc}</p>
                <button class="play-btn" onclick="startMovie(${m.id}, '${title.replace(/'/g, "")}')">Смотреть онлайн на русском</button>
            </div>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';
}

// Запуск плеера с русскими серверами
function startMovie(id, title) {
    const servers = [
        { name: "Сервер 1 (Kodik Ru)", url: `https://kodik.info/find-by-tmdb/${id}` },
        { name: "Сервер 2 (Collaps Ru)", url: `https://collaps.org/embed/movie/${id}` },
        { name: "Сервер 3 (VoidBoost)", url: `https://voidboost.net/embed/${id}` }
    ];

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">${title}</h3>
        
        <!-- Переключение серверов -->
        <div class="servers-bar">
            ${servers.map((s, index) => `
                <button class="server-btn ${index === 0 ? 'active' : ''}" onclick="switchServer('${s.url}', this)">${s.name}</button>
            `).join('')}
        </div>
        
        <!-- Плеер -->
        <iframe id="playerFrame" src="${servers[0].url}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
        
        <!-- Блок рекламы #2 -->
        <div class="ad-banner" style="margin-top:15px; margin-bottom:0;">
            <span>📺 Спонсорский баннер / Реклама под плеером</span>
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
            <textarea class="review-input" id="reviewText" placeholder="Напишите ваше мнение о фильме или аниме..."></textarea>
            <button class="review-btn" onclick="submitReview(${id})">Отправить отзыв</button>
            
            <div class="reviews-list" id="reviewsListContainer"></div>
        </div>
    `;
    loadReviews(id);
}

// Переключение сервера в iframe
function switchServer(url, btnElement) {
    document.getElementById('playerFrame').src = url;
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
}

// Оценка звездочками
function setRating(rating) {
    currentSelectedRating = rating;
    const stars = document.querySelectorAll('#starContainer .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Сохранение отзыва
function submitReview(movieId) {
    const text = document.getElementById('reviewText').value.trim();
    if (!text) return alert('Напишите текст отзыва!');

    const reviewsKey = 'reviews_' + movieId;
    const existingReviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');

    const newReview = {
        rating: currentSelectedRating,
        text: text,
        date: new Date().toLocaleDateString()
    };

    existingReviews.unshift(newReview);
    localStorage.setItem(reviewsKey, JSON.stringify(existingReviews));

    document.getElementById('reviewText').value = '';
    loadReviews(movieId);
}

// Загрузка отзывов из LocalStorage
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

// Стартовая загрузка
loadCategory('popular');

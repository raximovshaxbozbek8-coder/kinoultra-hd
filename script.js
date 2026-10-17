const API_KEY = '8baba8ab6b8bbe247645bcae7df63d0d';
let moviesList = [];
let currentSelectedRating = 5;

async function fetchTMDB(endpoint) {
    try {
        const separator = endpoint.includes('?') ? '&' : '?';
        const res = await fetch(`https://api.themoviedb.org/3${endpoint}${separator}api_key=${API_KEY}&language=ru-RU`);
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Ошибка сети TMDB:", e);
    }
    return null;
}

async function loadMovies(endpoint, title = "Фильмы") {
    document.getElementById('sectionTitle').innerText = title;
    document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Загрузка каталога...</div>';
    
    const data = await fetchTMDB(endpoint);
    if (data && data.results && data.results.length > 0) {
        moviesList = data.results;
        render(moviesList);
    } else {
        document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #f55; padding: 40px;">Не удалось загрузить данные.</div>';
    }
}

function loadCategory(type) {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    if (type === 'popular') {
        document.getElementById('btn-popular')?.classList.add('active');
        loadMovies('/movie/popular', "🔥 Популярные фильмы");
    } else if (type === 'russian') {
        document.getElementById('btn-russian')?.classList.add('active');
        loadMovies('/discover/movie?with_original_language=ru&sort_by=popularity.desc', "🇷🇺 Русское кино");
    } else if (type === 'anime') {
        document.getElementById('btn-anime')?.classList.add('active');
        loadMovies('/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc', "⛩️ Популярное Аниме");
    }
}

async function searchMovie(q) {
    if (!q) return loadCategory('popular');
    document.getElementById('sectionTitle').innerText = `Поиск: "${q}"`;
    document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Поиск...</div>';
    
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(q)}`);
    if (data && data.results && data.results.length > 0) {
        moviesList = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        render(moviesList);
    } else {
        document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 40px;">По вашему запросу ничего не найдено.</div>';
    }
}

function render(list) {
    const grid = document.getElementById('movieGrid');
    if (!list || list.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Ничего не найдено</div>';
        return;
    }
    grid.innerHTML = list.map(m => {
        const title = m.title || m.name || 'Без названия';
        const date = (m.release_date || m.first_air_date || '').split('-')[0];
        const rating = m.vote_average ? m.vote_average.toFixed(1) : '0';
        const poster = m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : 'https://via.placeholder.com/300x450?text=Нет+обложки';
        const isTv = m.media_type === 'tv' || !m.title;
        return `
            <div class="card" onclick="openPlayer(${m.id}, '${title.replace(/'/g, "")}', ${isTv})">
                <img src="${poster}" alt="${title}" loading="lazy">
                <div class="card-info">
                    <div class="card-title">${title}</div>
                    <div class="card-meta"><span>${date}</span><span>★ ${rating}</span></div>
                </div>
            </div>
        `;
    }).join('');
}

function openPlayer(id, title, isTv = false) {
    // Используем надежный плеер без ограничений встраивания (поддерживает русские озвучки для фильмов и аниме)
    const playerUrl = isTv 
        ? `https://bazon.cc/api/json?tmdb=${id}` // для сериалов/аниме
        : `https://videocdn.tv/embed/movie?tmdb=${id}`; // для фильмов

    // Прямая стабильная альтернатива через универсальный плеер
    const embedUrl = `https://collaps.org/embed/tmdb/${id}`;

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:15px; color:#fff; font-size: 20px;">${title}</h3>
        
        <iframe class="player-frame" src="${embedUrl}" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>

        <!-- Нативная реклама Adsterra в модальном окне -->
        <div class="ad-box" style="margin-bottom:20px;">
            <script async="async" data-cfasync="false" src="https://bancadeltempoidea.org/21/5e3bed81d838ac1ae8d3b4a0282ef918"></script>
            <div id="container-5e3bed81d838ac1ae8d3b4a0282ef918"></div>
        </div>

        <!-- Секция комментариев и отзывов -->
        <div class="reviews-section">
            <h4 style="margin-top:0; margin-bottom:12px;">Оставить отзыв и оценку</h4>
            <div class="star-rating" id="starContainer">
                <span class="star active" onclick="setRating(1)">★</span>
                <span class="star active" onclick="setRating(2)">★</span>
                <span class="star active" onclick="setRating(3)">★</span>
                <span class="star active" onclick="setRating(4)">★</span>
                <span class="star active" onclick="setRating(5)">★</span>
            </div>
            <textarea class="review-input" id="reviewText" placeholder="Напишите ваш комментарий или мнение о фильме..."></textarea>
            <button class="review-btn" onclick="submitReview(${id})">Отправить комментарий</button>
            
            <div class="reviews-list" id="reviewsListContainer"></div>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';
    loadReviews(id);
}

function setRating(rating) {
    currentSelectedRating = rating;
    const stars = document.querySelectorAll('#starContainer .star');
    stars.forEach((star, index) => {
        if (index < rating) star.classList.add('active');
        else star.classList.remove('active');
    });
}

function submitReview(movieId) {
    const text = document.getElementById('reviewText').value.trim();
    if (!text) return alert('Пожалуйста, напишите текст отзыва!');

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

function loadReviews(movieId) {
    const reviewsKey = 'reviews_' + movieId;
    const reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
    const container = document.getElementById('reviewsListContainer');

    if (reviews.length === 0) {
        container.innerHTML = '<div style="color:var(--text-gray); font-size:13px;">Пока нет отзывов. Напишите первый комментарий!</div>';
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

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
}

loadCategory('popular');

const API_KEY = '8baba8ab6b8bbe247645bcae7df63d0d';
let moviesList = [];
let currentSelectedRating = 5;

// Динамическая подгрузка рекламы Adsterra для заработка
function injectAdScript() {
    if (!document.getElementById('adsterra-script')) {
        const script = document.createElement('script');
        script.id = 'adsterra-script';
        script.src = 'https://bancadeltempoidea.org/21/5e3bed81d838ac1ae8d3b4a0282ef918.js';
        script.async = true;
        document.head.appendChild(script);
    }
}
injectAdScript();

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
    // Надежные защищенные плееры с поддержкой полноценного отображения без черных экранов
    const mediaType = isTv ? 'tv' : 'movie';
    const p1 = `https://vidsrc.xyz/embed/${mediaType}?tmdb=${id}`;
    const p2 = `https://player.autoembed.cc/embed/${mediaType}/${id}`;

    document.getElementById('modalBody').innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <h3 style="margin:0; color:#fff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">🎬 ${title}</h3>
            
            <div style="display: flex; gap: 10px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                <button class="custom-server-btn active" onclick="setPlayerSource('${p1}', this)">
                    <span>⚡ Сервер 1 (Ultra HD)</span>
                </button>
                <button class="custom-server-btn" onclick="setPlayerSource('${p2}', this)">
                    <span>🛡️ Сервер 2 (Резервный)</span>
                </button>
            </div>
        </div>

        <style>
            .custom-server-btn {
                background: transparent;
                color: #9ca3af;
                border: none;
                padding: 10px 18px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 700;
                font-size: 13px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .custom-server-btn:hover {
                color: #fff;
                background: rgba(255,255,255,0.08);
            }
            .custom-server-btn.active {
                background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
                color: #ffffff;
                box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
            }
        </style>

        <!-- Плеер с поддержкой полного экрана и правильными фреймами -->
        <div style="position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); margin-bottom: 25px;">
            <iframe id="activePlayerFrame" class="player-frame" src="${p1}" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen *; picture-in-picture *" style="margin-bottom:0; width:100%; height:500px; border:none; background:#000;"></iframe>
        </div>

        <!-- Рекламный блок для заработка -->
        <div class="ad-box">
            <div id="container-modal-ad"></div>
        </div>

        <div class="reviews-section">
            <h4 style="margin-top:0; margin-bottom:12px; font-size: 18px;">💬 Оставить отзыв и оценку</h4>
            <div class="star-rating" id="starContainer">
                <span class="star active" onclick="setRating(1)">★</span>
                <span class="star active" onclick="setRating(2)">★</span>
                <span class="star active" onclick="setRating(3)">★</span>
                <span class="star active" onclick="setRating(4)">★</span>
                <span class="star active" onclick="setRating(5)">★</span>
            </div>
            <textarea class="review-input" id="reviewText" placeholder="Напишите ваш отзыв о фильме..."></textarea>
            <button class="review-btn" onclick="submitReview(${id})">Опубликовать отзыв</button>
            
            <div class="reviews-list" id="reviewsListContainer"></div>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';
    loadReviews(id);
}

function setPlayerSource(url, btn) {
    document.getElementById('activePlayerFrame').src = url;
    document.querySelectorAll('.custom-server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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

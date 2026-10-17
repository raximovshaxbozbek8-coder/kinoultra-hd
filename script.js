const API_KEY = '8baba8ab6b8bbe247645bcae7df63d0d';
let moviesList = [];

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
        document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #f55; padding: 40px;">Ошибка загрузки или сеть недоступна.</div>';
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

// Универсальный поиск: ищет фильмы, сериалы и аниме
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

// Открытие плеера с гарантированной русской озвучкой и настройками
function openPlayer(id, title, isTv = false) {
    // Надежные плееры с русской озвучкой (Kodik / Videocdn / Alloha)
    const typePath = isTv ? 'tv' : 'movie';
    
    // Плеер 1: Видеобалансировщик с русской озвучкой и сериалами/аниме
    const p1 = `https://kinobox.in/embed/${typePath}/${id}`;
    // Плеер 2: Стабильный русский балансировщик Kodik/Alloha
    const p2 = `https://2382028.allvideoblocks.bet/player?tmdb=${id}`;

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:15px; color:#fff; font-size: 20px;">${title} (Русская озвучка)</h3>
        <div class="servers">
            <button class="server-btn active" onclick="setServer('${p1}', this)">Сервер 1 (Русская дубляж)</button>
            <button class="server-btn" onclick="setServer('${p2}', this)">Сервер 2 (Запасной)</button>
        </div>
        <iframe id="iframePlayer" class="player-frame" src="${p1}" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>
    `;
    document.getElementById('modal').style.display = 'flex';
}

function setServer(url, btn) {
    document.getElementById('iframePlayer').src = url;
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
}

loadCategory('popular');

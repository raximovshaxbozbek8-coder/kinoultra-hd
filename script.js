const API_KEY = '8baba8ab6b8bbe247645bcae7df63d0d';
let moviesList = [];

// Автоматическая загрузка скрипта плеера Kinobox
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

async function fetchTMDB(endpoint) {
    try {
        const separator = endpoint.includes('?') ? '&' : '?';
        const res = await fetch(`https://api.themoviedb.org/3${endpoint}${separator}api_key=${API_KEY}&language=ru-RU`);
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Ошибка сети:", e);
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
        document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #f55; padding: 40px;">Ничего не найдено или ошибка соединения.</div>';
    }
}

function loadCategory(type) {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    if (type === 'popular') {
        document.getElementById('btn-popular').classList.add('active');
        loadMovies('/movie/popular', "Популярные фильмы");
    } else if (type === 'russian') {
        document.getElementById('btn-russian').classList.add('active');
        loadMovies('/discover/movie?region=RU&sort_by=popularity.desc', "Русское кино");
    } else if (type === 'anime') {
        document.getElementById('btn-anime').classList.add('active');
        loadMovies('/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc', "Популярное Аниме");
    }
}

// Исправленный универсальный поиск (теперь ищет и фильмы, и аниме/сериалы)
async function searchMovie(q) {
    if (!q) return loadCategory('popular');
    document.getElementById('sectionTitle').innerText = `Поиск: "${q}"`;
    document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Поиск...</div>';
    
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(q)}`);
    if (data && data.results && data.results.length > 0) {
        // Фильтруем только фильмы, сериалы и аниме, отбрасывая людей
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
        return `
            <div class="card" onclick="openPlayer(${m.id}, '${title.replace(/'/g, "")}')">
                <img src="${poster}" alt="${title}" loading="lazy">
                <div class="card-info">
                    <div class="card-title">${title}</div>
                    <div class="card-meta"><span>${date}</span><span>★ ${rating}</span></div>
                </div>
            </div>
        `;
    }).join('');
}

// Надежный плеер с переключением серверов (чтобы никогда не было черного экрана)
function openPlayer(id, title) {
    const s1 = `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
    const s2 = `https://vidsrc.me/embed/movie?tmdb=${id}`;

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:15px; color:#fff; font-size: 20px;">${title}</h3>
        <div class="servers">
            <button class="server-btn active" onclick="setServer('${s1}', this)">Сервер 1 (Основной)</button>
            <button class="server-btn" onclick="setServer('${s2}', this)">Сервер 2 (Запасной)</button>
        </div>
        <iframe id="iframePlayer" class="player-frame" src="${s1}" allowfullscreen></iframe>
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

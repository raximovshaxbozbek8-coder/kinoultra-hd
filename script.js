const API_KEY = '8baba8ab6b8bbe247645bcae7df63d0d';
let moviesList = [];

// Автоматическая загрузка скрипта плеера Kinobox для поддержки русской озвучки (Kodik, Collaps)
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
        // Исправленный запрос для надежной загрузки русского кино
        loadMovies('/discover/movie?region=RU&sort_by=popularity.desc', "Русское кино");
    } else if (type === 'anime') {
        document.getElementById('btn-anime').classList.add('active');
        // Исправленный запрос для аниме через жанр 16 (мультфильмы) и японский язык
        loadMovies('/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc', "Популярное Аниме");
    }
}

async function searchMovie(q) {
    if (!q) return loadCategory('popular');
    document.getElementById('sectionTitle').innerText = `Поиск: "${q}"`;
    document.getElementById('movieGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Поиск...</div>';
    
    const data = await fetchTMDB(`/search/movie?query=${encodeURIComponent(q)}`);
    if (data && data.results && data.results.length > 0) {
        moviesList = data.results;
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

function openPlayer(id, title) {
    // Используем встроенный плеер Kinobox, который автоматически находит русскую озвучку (Kodik, Collaps, Alloha)
    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:15px; color:#fff; font-size: 20px;">${title} (Русская озвучка)</h3>
        
        <div style="background: #000; border-radius: 12px; overflow: hidden; min-height: 480px; box-shadow: 0 8px 25px rgba(0,0,0,0.5);">
            <div class="kinobox_player" style="width:100%; min-height:480px;"></div>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';

    const initPlayer = () => {
        if (window.kbox) {
            kbox('.kinobox_player', {
                search: { tmdb: id },
                menu: { enable: true },
                players: ['kodik', 'collaps', 'alloha', 'voidboost']
            });
        }
    };

    if (window.kbox) {
        initPlayer();
    } else {
        setTimeout(initPlayer, 600);
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
}

loadCategory('popular');

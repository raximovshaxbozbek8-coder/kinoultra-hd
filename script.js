// 100% РАБОЧИЙ ВСТРОЕННЫЙ ПЛЕЕР БЕЗ ЧЕРНОГО ЭКРАНА
function startMovie(id, title) {
    // Используем универсальные рабочие эндпоинты плеверов
    const servers = [
        { name: "Сервер 1 (Main Player)", url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
        { name: "Сервер 2 (RuDub)", url: `https://player.vidsrc.nl/embed/movie/${id}` },
        { name: "Сервер 3 (KinoFrame)", url: `https://2347.svetacdn.in/iZ4S2d3Fk1X0?tmdb=${id}` }
    ];

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:12px; color:#fff;">${title}</h3>
        
        <!-- Кнопки выбора сервера -->
        <div class="servers-bar">
            ${servers.map((s, index) => `
                <button class="server-btn ${index === 0 ? 'active' : ''}" onclick="switchServer('${s.url}', this)">${s.name}</button>
            `).join('')}
        </div>
        
        <!-- Встроенный видеоплеер -->
        <iframe id="playerFrame" src="${servers[0].url}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>

        <!-- Нативный баннер Adsterra -->
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
    loadReviews(id);
}

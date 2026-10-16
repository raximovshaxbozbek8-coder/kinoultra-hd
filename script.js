// Мульти-плеер с кнопками переключения серверов
function startMovie(id, title) {
    // Список независимых серверов (балансеров)
    const servers = [
        { name: "Сервер 1 (VidSrc)", url: `https://vidsrc.cc/v2/embed/movie/${id}` },
        { name: "Сервер 2 (VidLink)", url: `https://vidlink.pro/movie/${id}` },
        { name: "Сервер 3 (Embed)", url: `https://vidsrc.xyz/embed/movie?tmdb=${id}` }
    ];

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">${title}</h3>
        
        <!-- Кнопки переключения серверов -->
        <div class="servers-bar" id="serversBar">
            ${servers.map((s, index) => `
                <button class="server-btn ${index === 0 ? 'active' : ''}" onclick="switchServer('${s.url}', this)">${s.name}</button>
            `).join('')}
        </div>
        
        <!-- ПЛЕЕР -->
        <iframe id="playerFrame" src="${servers[0].url}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
        
        <!-- БЛОК РЕКЛАМЫ #2 -->
        <div class="ad-banner" style="margin-top:15px; margin-bottom:0;">
            <span>📺 Спонсорский баннер / Реклама под плеером</span>
        </div>

        <!-- БЛОК ОТЗЫВОВ -->
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

function switchServer(url, btnElement) {
    // Меняем ссылку в iframe
    document.getElementById('playerFrame').src = url;
    
    // Переключаем подсветку активной кнопки
    document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
}

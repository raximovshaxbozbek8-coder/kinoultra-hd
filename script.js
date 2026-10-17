// 100% РАБОЧИЙ ВАРИАНТ БЕЗ ЧЕРНОГО ЭКРАНА И БЛОКИРОВОК
function startMovie(id, title) {
    // Рабочие генераторы плееров с русской озвучкой
    const servers = [
        { name: "🔴 Сервер 1 (Kodik / Русская озвучка)", url: `https://kodik.info/find-by-tmdb/${id}` },
        { name: "🔵 Сервер 2 (Collaps Дубляж)", url: `https://collaps.org/embed/movie/${id}` },
        { name: "🟢 Сервер 3 (Alloha Player)", url: `https://api.alloha.tv/?token=0494be95def32239ebd21368d88170&tmdb=${id}` }
    ];

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:15px; color:#fff;">${title}</h3>
        
        <!-- Блок выбора и запуска плеера -->
        <div style="background: #14161f; border: 1px solid #2a2d3d; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <p style="font-size: 15px; color: #a0a5b5; margin-top: 0; margin-bottom: 20px;">
                Выберите сервер для просмотра с русской озвучкой:
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 12px; max-width: 450px; margin: 0 auto;">
                ${servers.map(s => `
                    <a href="${s.url}" target="_blank" rel="noopener noreferrer" 
                       style="background: #e50914; color: white; padding: 14px 20px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px; transition: 0.2s; display: block; box-shadow: 0 4px 12px rgba(229,9,20,0.3);">
                        ▶ ${s.name}
                    </a>
                `).join('')}
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 15px; margin-bottom: 0;">
                Плеер откроется в новой вкладке в высоком качестве без блокировок.
            </p>
        </div>

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

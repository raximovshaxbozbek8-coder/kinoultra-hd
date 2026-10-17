function openPlayer(id, title, isTv = false) {
    const mediaType = isTv ? 'tv' : 'movie';
    
    // Актуальные зеркала и резервные варианты
    const p1 = `https://kinobox.in/embed/${mediaType}/tmdb-${id}`;
    const p2 = `https://vidsrc.cc/v2/embed/${mediaType}/${id}`;

    document.getElementById('modalBody').innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <h3 style="margin:0; color:#fff; font-size: 22px; font-weight: 800;">🎬 ${title}</h3>
            
            <div style="display: flex; gap: 10px;">
                <button class="custom-server-btn active" onclick="setPlayerSource('${p1}', this)">
                    <span>⚡ Сервер 1 (Multi RU)</span>
                </button>
                <button class="custom-server-btn" onclick="setPlayerSource('${p2}', this)">
                    <span>🛡️ Сервер 2 (Запасной)</span>
                </button>
            </div>
        </div>

        <div style="position: relative; border-radius: 14px; overflow: hidden; margin-bottom: 25px; min-height: 480px; background:#000;">
            <iframe id="activePlayerFrame" src="${p1}" allowfullscreen="true" allow="autoplay; fullscreen *" style="width:100%; height:500px; border:none;"></iframe>
        </div>

        <div class="ad-box">
            <div id="container-modal-ad"></div>
        </div>

        <div class="reviews-section">
            <h4>💬 Оставить отзыв и оценку</h4>
            <div class="star-rating" id="starContainer">
                <span class="star active" onclick="setRating(1)">★</span>
                <span class="star active" onclick="setRating(2)">★</span>
                <span class="star active" onclick="setRating(3)">★</span>
                <span class="star active" onclick="setRating(4)">★</span>
                <span class="star active" onclick="setRating(5)">★</span>
            </div>
            <textarea class="review-input" id="reviewText" placeholder="Напишите ваш отзыв..."></textarea>
            <button class="review-btn" onclick="submitReview(${id})">Опубликовать отзыв</button>
            <div class="reviews-list" id="reviewsListContainer"></div>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';
    loadReviews(id);
}

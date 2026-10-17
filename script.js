function openPlayer(title) {
    // Используем прямой балансировщик Collaps/Alloha без меню и переключателей
    const cleanTitle = encodeURIComponent(title);
    const playerUrl = `https://api.str Krav.net/embed/movie?title=${cleanTitle}`; 
    // Если Collaps блокируется, то использует прямую выдачу HDRezka/Kodik:
    const fallbackUrl = `https://kinobox.in/embed/query/${cleanTitle}?menu=false`;

    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom: 15px;">
            <h3 style="margin:0; color:#fff; font-size: 22px; font-weight: 800;">🎬 ${title}</h3>
        </div>

        <div style="position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8); margin-bottom: 25px; height: 500px; background:#000;">
            <iframe src="${fallbackUrl}" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen *" style="width:100%; height:100%; border:none; background:#000;"></iframe>
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
            <textarea class="review-input" id="reviewText" placeholder="Напишите ваш отзыв..."></textarea>
            <button class="review-btn" onclick="submitReview('${title}')">Опубликовать отзыв</button>
            <div class="reviews-list" id="reviewsListContainer"></div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'flex';
    loadReviews(title);
}

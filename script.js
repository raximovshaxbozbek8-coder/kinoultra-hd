function startMovie(id, title) {
            // Используем рабочее зеркало kodik.info вместо заблокированного kodik.cc
            let playerUrl = `https://kodik.info/find-player?tmdb_id=${id}&title=${encodeURIComponent(title)}`;

            document.getElementById('modalBody').innerHTML = `
                <h3 style="margin-top:0; margin-bottom:12px;">${title}</h3>
                
                <!-- ПЛЕЕР С РУССКОЙ ОЗВУЧКОЙ -->
                <iframe src="${playerUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                
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

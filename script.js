function startMovie(id, title) {
            // Использование проверенного плеера с выбором русской озвучки
            document.getElementById('modalBody').innerHTML = `
                <h3 style="margin-top:0; margin-bottom:12px;">${title}</h3>
                <iframe src="https://vidsrc.me/embed/movie?tmdb=${id}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                
                <!-- БЛОК РЕКЛАМЫ #2: Баннер под видеоплеером -->
                <div class="ad-banner" style="margin-top:15px; margin-bottom:0;">
                    <span>📺 Рекламный баннер под плеером</span>
                </div>

                <!-- БЛОК ОТЗЫВОВ И ЗВЁЗД -->
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
                    
                    <div class="reviews-list" id="reviewsListContainer">
                        <!-- Сюда подгружаются отзывы -->
                    </div>
                </div>
            `;
            loadReviews(id);
        }

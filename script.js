function openPlayer(id, title, isTv = false) {
    const type = isTv ? 'tv' : 'movie';
    // Вот этот единственный плеер собирает в себе все русские базы (Kodik, Collaps, Alloha)
    const playerUrl = `https://kinobox.in/embed/${type}/tmdb-${id}`;

    document.getElementById('modalBody').innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#fff; font-size: 20px;">🎬 ${title}</h3>
        <div style="position: relative; border-radius: 12px; overflow: hidden; background:#000; height: 500px;">
            <iframe src="${playerUrl}" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen *" style="width:100%; height:100%; border:none;"></iframe>
        </div>
    `;
    document.getElementById('modal').style.display = 'flex';
}

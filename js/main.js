document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('input[name="category"]');
    const drawButton = document.getElementById("drawButton");

    checkboxes.forEach(cb => cb.addEventListener("change", () => {
        const anyChecked = [...checkboxes].some(cb => cb.checked);
        drawButton.disabled = !anyChecked;
    }));
});

function gacha(genres, num) {
    let result = [];
    // genreは出題形式の配列、numは出題数
    if (genres.length == 0) {
        return result;
    }
    // 可能なら全分野から出題
    if (genres.length >= num) {
        for (let g of genres) {
            // jsonからジャンルgのものをランダムに取得
            let randomIndex = Math.floor(Math.random() * json[g].length);
            let randomItem = json[g][randomIndex];
            // 取得したものをresultに追加
            result.push(randomItem);
        }

    }

    for i in Range(max(0, num - genres.length)) {
        // jsonからジャンルgのものをランダムに取得
        let randomIndex = Math.floor(Math.random() * json[randomGenre].length);
        let randomItem = json[randomGenre][randomIndex];
        // 取得したものをresultに追加
        result.push(randomItem);
    }

}

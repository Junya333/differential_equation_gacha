document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('input[name="category"]');
    const drawButton = document.getElementById("drawButton");
    const questionsContainer = document.getElementById("questionsContainer");
    const numInput = document.getElementById("numQuestions");

    let problemsData = null;

    // チェックボックス選択時にボタン活性
    checkboxes.forEach(cb => cb.addEventListener("change", () => {
        const anyChecked = [...checkboxes].some(cb => cb.checked);
        drawButton.disabled = !anyChecked;
    }));

    // JSONロード
    fetch('/data/problems.json')
        .then(response => response.json())
        .then(data => {
            problemsData = data;  // そのまま使う！
        })
        .catch(error => {
            console.error('問題データの取得に失敗しました:', error);
        });

    // 「出題する」ボタンクリック時
    drawButton.addEventListener("click", () => {
        if (!problemsData) {
            alert("問題データがまだ読み込まれていません。");
            return;
        }

        const selectedGenres = [...checkboxes]
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const num = parseInt(numInput.value, 10);

        const selectedProblems = gacha(problemsData, selectedGenres, num);

        // 表示クリア
        questionsContainer.innerHTML = "";


        // 問題を表示
        questionsContainer.innerHTML = "";

        const resultDiv = document.createElement("div");
        resultDiv.id = "result";

        // 説明文
        const descriptionP = document.createElement("p");
        descriptionP.textContent = "次の微分方程式を解け．";
        descriptionP.style.textAlign = "left";  // 左寄せ
        resultDiv.appendChild(descriptionP);

        // 問題リスト
        selectedProblems.forEach((problem, index) => {
            const p = document.createElement("p");
            p.style.fontSize = "1.5rem";
            p.style.textAlign = "left";  // 左寄せ
            p.innerHTML = `(${index + 1}) \\(${problem.question}\\)`;
            resultDiv.appendChild(p);
        });

        // 全体を画面に追加
        questionsContainer.appendChild(resultDiv);

        // MathJax再描画
        if (window.MathJax) {
            MathJax.typesetPromise();
        }



    });
});


// ガチャ関数
function gacha(json, genres, num) {
    const result = [];
    const usedIds = new Set();

    if (genres.length === 0 || num <= 0) {
        console.warn("ジャンルが選択されていないか、出題数が0以下です。");
        return result;
    }

    const candidates = [];

    // 各ジャンルから1問ずつ確保（重複チェックなし）
    for (let g of genres) {
        const problems = json[g];
        if (!problems || problems.length === 0) {
            console.warn(`ジャンル「${g}」に問題が存在しません。`);
            continue;
        }

        const randomIndex = Math.floor(Math.random() * problems.length);
        const problem = problems[randomIndex];

        candidates.push(problem);
        usedIds.add(problem.id);
    }

    // 候補シャッフル
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // 必要数だけ取り出し
    result.push(...candidates.slice(0, num));

    // 足りない場合、さらに追加
    while (result.length < num) {
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        const problems = json[randomGenre];
        if (!problems || problems.length === 0) continue;

        let selected = null;
        let attempts = 10;

        while (attempts-- > 0) {
            const randomIndex = Math.floor(Math.random() * problems.length);
            const problem = problems[randomIndex];
            if (!usedIds.has(problem.id)) {
                selected = problem;
                usedIds.add(problem.id);
                break;
            }
        }

        if (selected) {
            result.push(selected);
        } else {
            console.warn(`ジャンル「${randomGenre}」で未使用の問題が見つかりませんでした。`);
            break; // これ以上追加できない場合は終了
        }
    }

    // 最後にもう一度シャッフル
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    // 出題数が満たせなかった場合、警告
    if (result.length < num) {
        console.warn(`出題数不足: ${result.length}/${num}問しか出題できませんでした。`);
    }

    return result;
}
// ガチャ関数

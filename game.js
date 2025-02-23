const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    parent: 'game-container',
    scene: { preload, create, update },
    pixelArt: false, // 禁用像素藝術模式，啟用抗鋸齒
    antialias: true  // 啟用抗鋸齒
};

const game = new Phaser.Game(config);

const initialBoard = [
    [0, 2, 0, 0, 0],
    [0, 0, 5, 0, 0],
    [3, 0, 0, 0, 4],
    [0, 0, 3, 0, 0],
    [0, 0, 0, 2, 0]
];

const solution = [
    [5, 2, 4, 3, 1],
    [1, 3, 5, 4, 2],
    [3, 1, 2, 5, 4],
    [2, 4, 3, 1, 5],
    [4, 5, 1, 2, 3]
];

let board = JSON.parse(JSON.stringify(initialBoard)); // 複製初始棋盤
let teaImages = [];
let selectedTea = 1;

// 不同區塊的顏色
const blockColors = [
    [0xffccbc, 0xffccbc, 0xffccbc, 0x90caf9, 0xc8e6c9],
    [0xffccbc, 0xc8e6c9, 0xc8e6c9, 0x90caf9, 0xc8e6c9],
    [0xffccbc, 0xc8e6c9, 0x90caf9, 0x90caf9, 0xc8e6c9],
    [0xc8e6c9, 0xc8e6c9, 0xffe0b2, 0x90caf9, 0xc8e6c9],
    [0xffe0b2, 0xffe0b2, 0xffe0b2, 0xffe0b2, 0xc8e6c9]
];

function preload() {
    this.load.image('reset', 'assets/reset.png');
    this.load.image('undo', 'assets/undo.png');
    this.load.image('win', 'assets/win.png');
    this.load.image('rec', 'assets/rec.png');

    for (let i = 1; i <= 5; i++) {
        this.load.image(`tea${i}`, `images/tea${i}.png`);
    }
}

function create() {
    // 添加背景顏色為白色的矩形
    let background = this.add.graphics();
    background.fillStyle(0xFFFFFF, 1);
    background.fillRect(0, 0, this.scale.width, this.scale.height);
    background.setDepth(-1); // 將背景設置在所有元素之後

    // 添加圖片在頂層
    let recImage = this.add.image(250, 100, 'rec').setDisplaySize(460, 460).setOrigin(0, 0);
    recImage.setDepth(10); // 設置圖片在最上層

    let gridSize = 90;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            // 設置區塊顏色
            let tile = this.add.rectangle(300 + col * gridSize, 150 + row * gridSize, 90, 90, blockColors[row][col])
                .setStrokeStyle(2, 0x000000)
                .setInteractive();

            tile.row = row;
            tile.col = col;

            // 如果是預設數字，顯示對應茶圖片
            if (initialBoard[row][col] !== 0) {
                let teaSprite = this.add.image(tile.x, tile.y, `tea${initialBoard[row][col]}`).setDisplaySize(60, 60); // 保留圖像的原始比例
                board[row][col] = initialBoard[row][col];
            } else {
                tile.on('pointerdown', function () {
                    // 無論格子是否已有答案，皆可更新答案
                    if (board[row][col] !== 0) {
                        // 刪除舊的茶圖片
                        let existingTeaImage = teaImages.find(img => img.row === row && img.col === col);
                        if (existingTeaImage) {
                            existingTeaImage.sprite.destroy();
                            teaImages = teaImages.filter(img => img !== existingTeaImage);
                        }
                    }
                    board[row][col] = selectedTea;
                    let teaSprite = this.scene.add.image(tile.x, tile.y, `tea${selectedTea}`).setDisplaySize(60, 60); // 保留圖像的原始比例
                    teaImages.push({ row, col, sprite: teaSprite });
                    checkSolution.call(this.scene); // 每次移動後調用checkSolution
                });
            }
        }
    }

    // 茶類選擇按鈕
    for (let i = 1; i <= 5; i++) {
        let teaIcon = this.add.image(800, 100 + i * 80, `tea${i}`).setDisplaySize(70, 70).setInteractive(); // 保留圖像的原始比例
        teaIcon.on('pointerdown', function () {
            selectedTea = i;
        });
    }

    // 重來按鈕
    let resetButton = this.add.image(180, 200, 'reset').setDisplaySize(59, 85).setInteractive();
    resetButton.on('pointerdown', resetBoard);

    // 復原按鈕
    let undoButton = this.add.image(180, 480, 'undo').setDisplaySize(59, 85).setInteractive();
    undoButton.on('pointerdown', undoMove);
}


function checkSolution() {
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (board[row][col] === 0 || board[row][col] !== solution[row][col]) {
                return; // 如果有一個格子未填或不正確則退出
            }
        }
    }
    // 確保圖片顯示在中心位置並設置合適大小
    game.scene.scenes[0].add.image(game.scale.width / 2, game.scale.height / 2, 'win').setOrigin(0.5).setScale(0.5);
}

function resetBoard() {
    board = JSON.parse(JSON.stringify(initialBoard));
    teaImages.forEach(img => img.sprite.destroy());
    teaImages = [];
}

function undoMove() {
    let lastMove = teaImages.pop();
    if (lastMove) {
        board[lastMove.row][lastMove.col] = 0;
        lastMove.sprite.destroy();
    }
}

function update() { }



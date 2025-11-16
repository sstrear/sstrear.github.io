// ========================================
// Smooth Scrolling & Navigation
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth scroll for anchor links
    const navLinks = document.querySelectorAll('.nav-link, .nav-logo');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const navMenu = document.getElementById('navMenu');
                    const navToggle = document.getElementById('navToggle');
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });

    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });

    // Observe timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(item);
    });

    // Observe trait items
    const traitItems = document.querySelectorAll('.trait-item');
    traitItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(item);
    });

});

// ========================================
// Lego-Tetris Mini-Game
// ========================================

(function() {
    const canvas = document.getElementById('lego-tetris');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Game constants
    const COLS = 10;
    const ROWS = 20;
    let BLOCK_SIZE = 0;
    let BOARD_WIDTH = 0;
    let BOARD_HEIGHT = 0;
    let BOARD_OFFSET_X = 0;
    let BOARD_OFFSET_Y = 0;
    
    function updateBoardDimensions() {
        BLOCK_SIZE = Math.min(canvas.width / COLS, canvas.height / ROWS);
        BOARD_WIDTH = COLS * BLOCK_SIZE;
        BOARD_HEIGHT = ROWS * BLOCK_SIZE;
        BOARD_OFFSET_X = (canvas.width - BOARD_WIDTH) / 2;
        BOARD_OFFSET_Y = (canvas.height - BOARD_HEIGHT) / 2;
    }
    
    // Set canvas size based on container
    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        updateBoardDimensions();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const COLOR = '#2F5C4F';
    const STROKE_WIDTH = 2;
    const STUD_STROKE_WIDTH = 1.5;
    
    // Game state
    let board = [];
    let currentPiece = null;
    let gameMode = 'autoplay'; // 'autoplay' or 'play'
    let dropCounter = 0;
    let dropInterval = 800; // ms - constant descent
    let fastDropInterval = 150; // ms - when down arrow pressed
    let currentDropInterval = dropInterval;
    let lastTime = 0;
    let autoplayMoveCounter = 0;
    let autoplayRotateCounter = 0;
    let clearingLines = [];
    let animationFrame = null;
    
    // Tetris pieces (simplified shapes)
    const PIECES = [
        [[1,1,1,1]], // I
        [[1,1],[1,1]], // O
        [[0,1,0],[1,1,1]], // T
        [[0,1,1],[1,1,0]], // S
        [[1,1,0],[0,1,1]], // Z
        [[1,0,0],[1,1,1]], // L
        [[0,0,1],[1,1,1]]  // J
    ];
    
    // Place a piece shape on the board at a specific position
    function placePieceShape(shape, x, y) {
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    const boardX = x + px;
                    const boardY = y + py;
                    if (boardX >= 0 && boardX < COLS && boardY >= 0 && boardY < ROWS) {
                        board[boardY][boardX] = 1;
                    }
                }
            }
        }
    }
    
    // Check if a piece shape can be placed at a position
    function canPlacePiece(shape, x, y) {
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    const boardX = x + px;
                    const boardY = y + py;
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return false;
                    }
                    if (boardY >= 0 && board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    // Initialize board with some pre-placed blocks for visual context
    function initBoard() {
        board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
        
        // Place several complete piece shapes to look like a real game
        const startRow = Math.floor(ROWS * 0.5); // Start placing from middle
        const piecesToPlace = 4 + Math.floor(Math.random() * 4); // 4-7 pieces
        
        for (let i = 0; i < piecesToPlace; i++) {
            // Pick a random piece type
            const pieceType = Math.floor(Math.random() * PIECES.length);
            let shape = PIECES[pieceType].map(row => [...row]);
            
            // Randomly rotate the piece (0-3 times)
            const rotations = Math.floor(Math.random() * 4);
            for (let r = 0; r < rotations; r++) {
                shape = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
            }
            
            // Try to find a valid position to place it
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 20) {
                const x = Math.floor(Math.random() * (COLS - shape[0].length + 1));
                // Place pieces at different heights, stacking them
                const baseY = startRow + Math.floor(Math.random() * (ROWS - startRow - shape.length));
                
                // Check if we can place it here
                if (canPlacePiece(shape, x, baseY)) {
                    // Find the lowest valid position (simulate falling)
                    let finalY = baseY;
                    for (let testY = baseY + 1; testY <= ROWS - shape.length; testY++) {
                        if (canPlacePiece(shape, x, testY)) {
                            finalY = testY;
                        } else {
                            break;
                        }
                    }
                    
                    placePieceShape(shape, x, finalY);
                    placed = true;
                }
                attempts++;
            }
        }
        
        // Clear any full lines that might have been created
        clearLines();
    }
    
    // Create a new piece
    function createPiece() {
        const type = Math.floor(Math.random() * PIECES.length);
        return {
            shape: PIECES[type],
            x: Math.floor(COLS / 2) - 1,
            y: 0
        };
    }
    
    // Draw a side-view Lego brick with studs on top
    function drawLegoBlock(context, x, y, width, height, studs, isActive = false, isFalling = false) {
        let px = BOARD_OFFSET_X + x * BLOCK_SIZE;
        let py = BOARD_OFFSET_Y + y * BLOCK_SIZE;
        const blockWidth = width * BLOCK_SIZE;
        const blockHeight = height * BLOCK_SIZE;
        
        // Add 3D elevation effect for falling pieces (higher z-axis)
        const elevation = isFalling ? 3 : 0; // Offset for falling pieces
        const shadowOffset = isFalling ? 2 : 0; // Shadow offset for depth
        
        px += elevation;
        py -= elevation; // Move up and right for 3D effect
        
        ctx.strokeStyle = COLOR;
        ctx.globalAlpha = isActive ? 1 : 0.7;
        
        // Draw shadow for falling pieces (female component - recess)
        if (isFalling) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = COLOR;
            ctx.fillRect(
                px + shadowOffset + 1, 
                py + shadowOffset + blockHeight - 2, 
                blockWidth - 2, 
                2
            );
            ctx.globalAlpha = isActive ? 1 : 0.7;
        } else {
            // Draw recess (female component) on top of placed blocks
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            const recessSize = BLOCK_SIZE * 0.08;
            const recessGap = 1;
            const recessY = py + recessGap;
            
            if (studs === 1) {
                const recessX = px + blockWidth / 2 - recessSize / 2;
                ctx.strokeRect(recessX, recessY, recessSize, recessSize);
            } else if (studs === 2) {
                const spacing = blockWidth / 3;
                const recessX1 = px + spacing - recessSize / 2;
                const recessX2 = px + blockWidth - spacing - recessSize / 2;
                ctx.strokeRect(recessX1, recessY, recessSize, recessSize);
                ctx.strokeRect(recessX2, recessY, recessSize, recessSize);
            }
            ctx.globalAlpha = isActive ? 1 : 0.7;
        }
        
        // Draw block body (rectangle outline)
        ctx.lineWidth = STROKE_WIDTH;
        ctx.strokeRect(px + 1, py + 1, blockWidth - 2, blockHeight - 2);
        
        // Draw studs on top (squares instead of circles) - male component (only on falling pieces)
        if (isFalling) {
            ctx.lineWidth = STUD_STROKE_WIDTH;
            const studSize = BLOCK_SIZE * 0.14;
            const studGap = 2; // Gap between stud and block top
            const studY = py + studGap;
            
            if (studs === 1) {
                // Single centered square stud
                const studX = px + blockWidth / 2 - studSize / 2;
                ctx.strokeRect(studX, studY, studSize, studSize);
            } else if (studs === 2) {
                // Two square studs evenly spaced
                const spacing = blockWidth / 3;
                const studX1 = px + spacing - studSize / 2;
                const studX2 = px + blockWidth - spacing - studSize / 2;
                ctx.strokeRect(studX1, studY, studSize, studSize);
                ctx.strokeRect(studX2, studY, studSize, studSize);
            }
        }
        
        // Active block glow and 3D effect
        if (isActive) {
            ctx.shadowBlur = isFalling ? 8 : 6;
            ctx.shadowColor = COLOR;
            ctx.lineWidth = STROKE_WIDTH;
            ctx.strokeRect(px + 1, py + 1, blockWidth - 2, blockHeight - 2);
            ctx.shadowBlur = 0;
        }
        
        ctx.globalAlpha = 1;
    }
    
    // Draw a single block unit (1x1)
    function drawBlock(x, y, isActive = false, isFalling = false) {
        drawLegoBlock(ctx, x, y, 1, 1, 1, isActive, isFalling);
    }
    
    // Draw the game
    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw board (placed blocks) - each cell as individual block with recesses
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x]) {
                    drawBlock(x, y, false, false); // Not active, not falling
                }
            }
        }
        
        // Draw current piece (falling block) - each cell as individual block with studs and elevation
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        drawBlock(
                            currentPiece.x + x,
                            currentPiece.y + y,
                            true,  // Active
                            true   // Falling - has elevation and studs
                        );
                    }
                }
            }
        }
        
        // Draw clearing lines animation (minimal fade)
        if (clearingLines.length > 0) {
            ctx.strokeStyle = COLOR;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.2;
            clearingLines.forEach(row => {
                const y = BOARD_OFFSET_Y + row * BLOCK_SIZE;
                ctx.beginPath();
                ctx.moveTo(BOARD_OFFSET_X, y);
                ctx.lineTo(BOARD_OFFSET_X + BOARD_WIDTH, y);
                ctx.stroke();
            });
            ctx.globalAlpha = 1;
        }
    }
    
    // Check collision
    function checkCollision(piece, dx = 0, dy = 0, rotatedShape = null) {
        const shape = rotatedShape || piece.shape;
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return true;
                    }
                    if (boardY >= 0 && board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Rotate piece (horizontal ↔ vertical only)
    function rotatePiece(piece) {
        const currentHeight = piece.shape.length;
        const currentWidth = piece.shape[0].length;
        
        // Only rotate if it's not square (2x2 stays the same)
        if (currentWidth === currentHeight) {
            return; // Don't rotate square pieces
        }
        
        // Flip horizontal to vertical or vice versa
        const rotated = [];
        for (let x = 0; x < currentWidth; x++) {
            const newRow = [];
            for (let y = currentHeight - 1; y >= 0; y--) {
                newRow.push(piece.shape[y][x]);
            }
            rotated.push(newRow);
        }
        
        if (!checkCollision(piece, 0, 0, rotated)) {
            piece.shape = rotated;
        }
    }
    
    // Place piece on board
    function placePiece() {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    if (boardY >= 0) {
                        board[boardY][boardX] = 1;
                    }
                }
            }
        }
    }
    
    // Clear full lines (minimal animation)
    function clearLines() {
        clearingLines = [];
        for (let y = ROWS - 1; y >= 0; y--) {
            if (board[y].every(cell => cell === 1)) {
                clearingLines.push(y);
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                y++; // Check same row again
            }
        }
        if (clearingLines.length > 0) {
            setTimeout(() => {
                clearingLines = [];
            }, 200); // Quick, minimal animation
        }
    }
    
    // Calculate distance to landing (how many rows until piece hits something)
    function getDistanceToLanding(piece) {
        let distance = ROWS;
        for (let dy = 1; dy < ROWS; dy++) {
            if (checkCollision(piece, 0, dy)) {
                distance = dy - 1;
                break;
            }
        }
        return distance;
    }
    
    // Find best position for current piece (simple AI)
    function findBestPosition(piece) {
        let bestX = piece.x;
        let bestScore = -Infinity;
        const originalX = piece.x;
        const originalShape = piece.shape.map(row => [...row]);
        
        // Try different positions (only valid ones)
        for (let x = 0; x <= COLS; x++) {
            piece.x = x;
            if (!checkCollision(piece, 0, 0)) {
                const distance = getDistanceToLanding(piece);
                // Prefer positions that are close to landing
                let score = (ROWS - distance) * 10;
                
                // Check if this position would fill gaps or create good fits
                const landingY = piece.y + distance;
                if (landingY < ROWS && landingY >= 0) {
                    for (let py = 0; py < piece.shape.length; py++) {
                        for (let px = 0; px < piece.shape[py].length; px++) {
                            if (piece.shape[py][px]) {
                                const boardX = x + px;
                                const boardY = landingY + py;
                                if (boardY < ROWS && boardX >= 0 && boardX < COLS) {
                                    // Bonus for filling gaps (blocks on either side)
                                    if (boardX > 0 && board[boardY][boardX - 1]) score += 3;
                                    if (boardX < COLS - 1 && board[boardY][boardX + 1]) score += 3;
                                    // Bonus for landing on top of existing blocks
                                    if (boardY > 0 && board[boardY - 1][boardX]) score += 2;
                                }
                            }
                        }
                    }
                }
                
                // Prefer center positions slightly
                const centerDist = Math.abs(x - COLS / 2);
                score -= centerDist * 0.5;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestX = x;
                }
            }
        }
        
        // Restore original
        piece.x = originalX;
        piece.shape = originalShape;
        
        return bestX;
    }
    
    // Autoplay logic (smart - only moves when close to landing)
    function autoplayMode() {
        if (!currentPiece) return;
        
        const distanceToLanding = getDistanceToLanding(currentPiece);
        const isCloseToLanding = distanceToLanding <= 3; // Only move when within 3 rows
        
        autoplayMoveCounter++;
        autoplayRotateCounter++;
        
        // Only make decisions when close to landing
        if (isCloseToLanding) {
            // Try to rotate to fit better (only when close)
            if (autoplayRotateCounter > 8) {
                const originalShape = currentPiece.shape.map(row => [...row]);
                rotatePiece(currentPiece);
                const newDistance = getDistanceToLanding(currentPiece);
                // If rotation made it worse, rotate back
                if (newDistance > distanceToLanding) {
                    currentPiece.shape = originalShape;
                }
                autoplayRotateCounter = 0;
            }
            
            // Move towards best position (only when close)
            if (autoplayMoveCounter > 5) {
                const bestX = findBestPosition(currentPiece);
                const currentX = currentPiece.x;
                
                if (bestX !== currentX) {
                    const move = bestX > currentX ? 1 : -1;
                    if (!checkCollision(currentPiece, move, 0)) {
                        currentPiece.x += move;
                    }
                }
                autoplayMoveCounter = 0;
            }
        }
    }
    
    // Update game
    function updateGame(deltaTime) {
        if (!currentPiece) {
            currentPiece = createPiece();
            if (checkCollision(currentPiece)) {
                // Game over, reset
                initBoard();
                currentPiece = createPiece();
            }
        }
        
        dropCounter += deltaTime;
        
        if (gameMode === 'autoplay') {
            autoplayMode();
            currentDropInterval = dropInterval; // Constant slow speed in autoplay
        } else {
            // In play mode, use fast drop if down is pressed
            currentDropInterval = keys['ArrowDown'] ? fastDropInterval : dropInterval;
        }
        
        if (dropCounter > currentDropInterval) {
            if (!checkCollision(currentPiece, 0, 1)) {
                currentPiece.y++;
            } else {
                placePiece();
                clearLines();
                currentPiece = createPiece();
                if (checkCollision(currentPiece)) {
                    initBoard();
                    currentPiece = createPiece();
                }
            }
            dropCounter = 0;
        }
    }
    
    // Game loop
    function gameLoop(time) {
        const deltaTime = time - lastTime;
        lastTime = time;
        
        updateBoardDimensions();
        updateGame(deltaTime);
        drawGame();
        
        animationFrame = requestAnimationFrame(gameLoop);
    }
    
    // Handle input
    function handleInput(key) {
        if (!currentPiece || gameMode !== 'play') return;
        
        switch(key) {
            case 'left':
                if (!checkCollision(currentPiece, -1, 0)) {
                    currentPiece.x--;
                }
                break;
            case 'right':
                if (!checkCollision(currentPiece, 1, 0)) {
                    currentPiece.x++;
                }
                break;
            case 'down':
                if (!checkCollision(currentPiece, 0, 1)) {
                    currentPiece.y++;
                    dropCounter = 0;
                }
                break;
            case 'rotate':
                rotatePiece(currentPiece);
                break;
        }
    }
    
    // Keyboard controls
    const keys = {};
    document.addEventListener('keydown', (e) => {
        if (gameMode !== 'play') {
            // Allow Esc to work even in autoplay
            if (e.key === 'Escape') {
                e.preventDefault();
                switchToAutoplay();
            }
            return;
        }
        
        keys[e.key] = true;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                handleInput('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                handleInput('right');
                break;
            case 'ArrowDown':
                e.preventDefault();
                // Fast drop (handled in updateGame)
                break;
            case 'ArrowUp':
                e.preventDefault();
                handleInput('rotate');
                break;
            case 'Escape':
                e.preventDefault();
                switchToAutoplay();
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Touch controls (tap left/right/top)
    canvas.addEventListener('touchstart', (e) => {
        if (gameMode !== 'play') return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;
        
        // Tap top half = rotate
        if (y < canvasHeight / 2) {
            handleInput('rotate');
        }
        // Tap left side = move left
        else if (x < canvasWidth / 2) {
            handleInput('left');
        }
        // Tap right side = move right
        else {
            handleInput('right');
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (gameMode !== 'play') return;
        e.preventDefault();
    });
    
    // Play button and instructions modal
    const playBtn = document.getElementById('gamePlayBtn');
    const instructionsModal = document.getElementById('gameInstructionsModal');
    const confirmBtn = document.getElementById('instructionsConfirmBtn');
    
    // Click to switch modes (only if already in play mode)
    canvas.addEventListener('click', (e) => {
        if (gameMode === 'play') {
            // Already playing, do nothing on canvas click
            return;
        }
    });
    
    // Play button click - show instructions first
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (gameMode === 'autoplay') {
                // Show instructions modal
                if (instructionsModal) {
                    instructionsModal.classList.add('active');
                }
            } else {
                // Already playing, switch back to autoplay
                switchToAutoplay();
            }
        });
    }
    
    // Confirm button - start playing
    if (confirmBtn) {
        confirmBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (instructionsModal) {
                instructionsModal.classList.remove('active');
            }
            switchToPlay();
        });
    }
    
    // Close modal when clicking outside
    if (instructionsModal) {
        instructionsModal.addEventListener('click', (e) => {
            if (e.target === instructionsModal) {
                instructionsModal.classList.remove('active');
            }
        });
    }
    
    // Click outside to return to autoplay
    document.addEventListener('click', (e) => {
        if (gameMode === 'play' && !canvas.contains(e.target) && !playBtn?.contains(e.target)) {
            switchToAutoplay();
        }
    });
    
    function switchToPlay() {
        gameMode = 'play';
        container.classList.add('playing');
        if (playBtn) {
            playBtn.textContent = 'Playing';
            playBtn.classList.add('playing');
        }
        // Keep dropInterval constant for smooth descent
    }
    
    function switchToAutoplay() {
        gameMode = 'autoplay';
        container.classList.remove('playing');
        if (playBtn) {
            playBtn.textContent = 'Play';
            playBtn.classList.remove('playing');
        }
        // Reset keys
        Object.keys(keys).forEach(key => keys[key] = false);
    }
    
    // Initialize game
    function initGame() {
        initBoard();
        currentPiece = createPiece();
        lastTime = performance.now();
        gameLoop(lastTime);
    }
    
    // Start game when page loads
    initGame();
})();

// ========================================
// Performance: Debounce scroll handler
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handler if needed
// window.addEventListener('scroll', debounce(handleScroll, 10), { passive: true });


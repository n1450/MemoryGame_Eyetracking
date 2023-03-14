import 'regenerator-runtime/runtime';
import EasySeeSo from 'seeso/easy-seeso';
import { UserStatusOption } from 'seeso/dist/seeso';


function parseCalibrationDataInQueryString() {
    const href = window.location.href
    const decodedURI = decodeURI(href)
    const queryString = decodedURI.split('?')[1];

    if (!queryString) return undefined

    const jsonString = queryString.slice("calibrationData=".length, queryString.length)
    return jsonString
}

//after page loaded 
window.onload = async function () {

    const seeso = new EasySeeSo();
    const calibrationData = parseCalibrationDataInQueryString();
    if (calibrationData) {
        // Initialize calibration data if calibration process is finished
        seeso.setCalibrationData(calibrationData);
    }
    var button = document.getElementById("calibratebtn");
    button.addEventListener('click', () => {
        // Open calibration page and redirect back to localhost with calibration data 
        // http://localhost:8082/?calibrationData={%22vector%22:%22UhkpP4vlg74evSW6YbNJvVR1grpl+kc9ZXaPQYEUlkE=%22,%22vectorLength%22:32,%22isCameraOnTop%22:true,%22cameraX%22:750,%22monitorInch%22:%2213%22,%22faceDistance%22:40}
        EasySeeSo.openCalibrationPage('dev_wi1rlwnqw2i4zml13dbruyvzifhhmxcxs4jzx1tu', 'tenp919 ', window.location.href, 5);
    });

    var eyeX, eyeY;

    function onGaze(gazeInfo) {
        //console.log(gazeInfo);
        eyeX = gazeInfo.x;
        eyeY = gazeInfo.y;
        //console.log("onGaze(gazeInfo)", gazeInfo);
        onEyeMove(eyeX, eyeY);
    }

    function onDebug(FPS, latency_min, latency_max, latency_avg) {
    }

    function afterInitialized() {
        console.log('sdk init success!');
        // Here SeeSo starts tracking
        seeso.startTracking(onGaze, onDebug);
        seeso.setUserStatusCallback(onAttention, onBlink, true);
    }

    function onAttention() {
        console.log("(after 30s) attention on");
        checkCards();
    }

    function onBlink(timestamp, isBlinkLeft, isBlinkRight, isBlink) {
        if (isBlink) {
            checkCards();
        }
    }

    let gaze = {
        x: 0,
        y: 0,
    };
    
    let currentCard = -1;

    function checkCards() {
        let cs = document.getElementsByClassName("card");

        if (cs) {
            for (let i = 0; i < cs.length; i++) {
                let c = cs[i].getBoundingClientRect();
                if (c.x < gaze.x && c.x + 100 > gaze.x && c.y < gaze.y && c.y + 100 > gaze.y && i !== currentCard) {
                    console.log("Looking at card " + i);
                    flipCard(cs[i]);
                    currentCard = i;
                }
            }
        }

        checkBtn(document.getElementById("startbtnid"));
        checkBtn(document.getElementById("calibratebtn"));
        checkBtn(document.getElementById("restart-button"));
    }

    function checkBtn(btn) {
        if (btn) {
            const bounds = btn.getBoundingClientRect();
            //console.log(btn.getBoundingClientRect());
            if (bounds.x < gaze.x && bounds.x + bounds.width > gaze.x && bounds.y < gaze.y && bounds.y + bounds.height > gaze.y) {
                btn.click();
            }
        }
    }

    function afterFailed() {
        console.log('sdk init fail!')
    }
    seeso.setTrackingFps(0);

    await seeso.init('dev_9gdab849x17cig3fqurrap28u20yavrov89sdwz4', afterInitialized, afterFailed, new UserStatusOption(true, true, false));

    //moves the cursor
    function onEyeMove(eyeX, eyeY) {
        var pos = {
            px: eyeX,
            py: eyeY,
        };

        gaze = {
            x: eyeX,
            y: eyeY,
        };

        let cursor = document.getElementById("mouse-pointer-cursor");

        cursor.style.left = (pos.px) + "px";
        cursor.style.top = (pos.py) + "px";
    }

    const selectors = {
        boardContainer: document.querySelector('.board-container'),
        board: document.querySelector('.board'),
        moves: document.querySelector('.moves'),
        timer: document.querySelector('.timer'),
        start: document.querySelector('button'),
        win: document.querySelector('.win')
    }

    const state = {
        gameStarted: false,
        flippedCards: 0,
        totalFlips: 0,
        totalTime: 0,
        loop: null
    }

    const shuffle = array => {
        const clonedArray = [...array]

        for (let index = clonedArray.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1))
            const original = clonedArray[index]

            clonedArray[index] = clonedArray[randomIndex]
            clonedArray[randomIndex] = original
        }

        return clonedArray
    }

    const pickRandom = (array, items) => {
        const clonedArray = [...array]
        const randomPicks = []

        for (let index = 0; index < items; index++) {
            const randomIndex = Math.floor(Math.random() * clonedArray.length)

            randomPicks.push(clonedArray[randomIndex])
            clonedArray.splice(randomIndex, 1)
        }

        return randomPicks
    }

    const generateGame = () => {
        const dimensions = selectors.board.getAttribute('data-dimension')

        if (dimensions % 2 !== 0) {
            throw new Error("The dimension of the board must be an even number.")
        }

        const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍']
        const picks = pickRandom(emojis, (dimensions * dimensions) / 2)
        const items = shuffle([...picks, ...picks])
        const cards = `
            <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
                ${items.map(item => `
                    <div class="card">
                        <div class="card-front"></div>
                        <div class="card-back">${item}</div>
                    </div>
                `).join('')}
           </div>
        `

        const parser = new DOMParser().parseFromString(cards, 'text/html')

        selectors.board.replaceWith(parser.querySelector('.board'))
    }

    const startGame = () => {
        state.gameStarted = true
        selectors.start.classList.add('disabled')

        state.loop = setInterval(() => {
            state.totalTime++

            selectors.moves.innerText = `${state.totalFlips} moves`
            selectors.timer.innerText = `time: ${state.totalTime} sec`
        }, 1000)
    }

    const flipBackCards = () => {
        document.querySelectorAll('.card:not(.matched)').forEach(card => {
            card.classList.remove('flipped')
        })

        state.flippedCards = 0;
        currentCard = -1;
    }

    const flipCard = card => {
        state.flippedCards++
        state.totalFlips++

        if (!state.gameStarted) {
            return;
        }

        if (state.flippedCards <= 2) {
            card.classList.add('flipped')
        }

        if (state.flippedCards === 2) {
            const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

            if (flippedCards[0] && flippedCards[1] && flippedCards[0].innerText === flippedCards[1].innerText) {
                flippedCards[0].classList.add('matched')
                flippedCards[1].classList.add('matched')
            }

            setTimeout(() => {
                flipBackCards()
            }, 1000)
        }

        // If there are no more cards that we can flip, we won the game
        if (!document.querySelectorAll('.card:not(.flipped)').length) {
            setTimeout(() => {
                selectors.boardContainer.classList.add('flipped')
                selectors.win.innerHTML = `
                    <span class="win-text">
                        You won!<br />
                        with <span class="highlight">${state.totalFlips}</span> moves<br />
                        under <span class="highlight">${state.totalTime}</span> seconds
                    </span>
                `
                clearInterval(state.loop)
            }, 1000)
        }
    }

    const attachEventListeners = () => {

        document.addEventListener('click', event => {
            const eventTarget = event.target
            const eventParent = eventTarget.parentElement

            if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
                flipCard(eventParent)
            } else if (eventTarget.className.includes("startbtn") && !eventTarget.className.includes('disabled')) {
                startGame()
            }
        })
    }

    generateGame();
    attachEventListeners();

};


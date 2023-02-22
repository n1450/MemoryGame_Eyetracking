import 'regenerator-runtime/runtime';
import EasySeeSo from 'seeso/easy-seeso';
import { UserStatusOption } from 'seeso/dist/seeso';



//set calibration data from quickstart
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
        EasySeeSo.openCalibrationPage('dev_9gdab849x17cig3fqurrap28u20yavrov89sdwz4', 'hallobruto', window.location.href, 5);
    });
    var eyeX, eyeY;
    // Callback function for retrieving x y coordinates
    //takes the coordinates of eye movement
    function onGaze(gazeInfo) {
        //console.log(gazeInfo);
        eyeX = gazeInfo.x;
        eyeY = gazeInfo.y;
        //console.log("onGaze(gazeInfo)", gazeInfo);

        onEyeMove(eyeX,eyeY);
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
        console.log("test attention");
        /*const startButton = document.getElementById("startbtn");
        if (state.gameStarted== false) {
            let startbutton=document.getElementsByClassName("startbtn");
            startButton.click();

        }*/

    }

    function onBlink(timestamp, isBlinkLeft, isBlinkRight, isBlink) {
        if(isBlink==true){
            console.log("on blink");
        }
       
        /*if(isBlink==True){
           
            /*if(state.gameStarted==false){

            }

        }*/
        //console.log("on blink");


    
    }
    function afterFailed() {
        console.log('sdk init fail!')
    }
    seeso.setTrackingFps(1);
    
    await seeso.init('dev_9gdab849x17cig3fqurrap28u20yavrov89sdwz4', afterInitialized, afterFailed, new UserStatusOption(true, true, false));

//moves the cursor
    function onEyeMove(eyeX,eyeY) {
        var pos = {
            px: eyeX,
            py: eyeY,
        };

       


        //let px,py;
        //px=py=0;

        let cursor = document.getElementById("mouse-pointer-cursor");

        

        cursor.style.left = (pos.px ) + "px";
        cursor.style.top = (pos.py ) + "px";


       /* window.addEventListener("mousemove", function (e) {

            // Gets the x,y position of the mouse cursor
            let x = e.clientX;
            let y = e.clientY;

            // sets the image cursor to new relative position
            cursor.style.left = (pos.px + x) + "px";
            cursor.style.top = (pos.py + y) + "px";

        });*/







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

        state.flippedCards = 0
    }

    const flipCard = card => {
        state.flippedCards++
        state.totalFlips++

        if (!state.gameStarted) {
            startGame()
        }

        if (state.flippedCards <= 2) {
            card.classList.add('flipped')
        }

        if (state.flippedCards === 2) {
            const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

            if (flippedCards[0].innerText === flippedCards[1].innerText) {
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


    function getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY
        };
    }



    generateGame();
    attachEventListeners();




};


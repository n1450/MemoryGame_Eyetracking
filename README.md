# Eye-Tracking Memory Game for Children with Motoric Disabilities

This is a Bachelor's project that was aimed at developing a memory game in JavaScript with an eye-tracking method. The game is designed to help children with motoric disabilities who cannot move their hands, and can only play games with their eyes.

## Features
The memory game has the following features:

* The game is a traditional memory game with cards arranged face down.
* The user can choose to play with eye-movements or with mouse-clicks.
* The game can be played using either dwell or click method.
* The game is designed to work with an eye-tracking device or anyform of a camera
* The user can select cards by looking at them for a certain period of time (dwell method) or by blinking on them (click method).
* The game keeps track of the user's score and time taken to complete the game and gives feedback at end.

## Requirements
The game requires the following:

* A computer with a web browser that supports JavaScript.
* Either an eye-tracking device or a camera. 
* Works also with in-build-camera, which needs access to webbrowser.
* Seeso license-key, passwort, and username. 
* node version < 16.11 

## Installation and Usage
To use the game, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the directory where the repository was cloned to.
3. Open the `game.js` file in your web browser.
4. Initial SeeSo data are: <br>
\- license key: dev_9gdab849x17cig3fqurrap28u20yavrov89sdwz4 <br>
\- username: hallobruto
5. If the license key is not working, you may get a new one on seeso.io
6. On terminal install all node modules with `npm -i`
7. Then `npm run serve` to start the game locally. 
8. Calibrate your eye-tracking device.
9. Start playing the game!

## Credits
This project was developed by Nadia Ali, as part of their Bachelor's degree in Smart Homes and Assistive Technologies at FH Technikum. The project was supervised by Alija Sabic, MSc. The Memory Game was cloned from Ferenc Almasi from https://github.com/flowforfrank/memory-game. 

The following resources were used in the development of this project:

* [Memory Game](https://github.com/flowforfrank/memory-game)
* [SeeSo.io](https://seeso.io/)
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## License
This project is licensed under the [MIT License](https://opensource.org/license/mit/).

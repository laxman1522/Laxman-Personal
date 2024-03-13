let firstKeyPress = null;
let timeoutId = null;
let showAndDropInterval = null;

let isKeyPressed = false;
let heldKey = null;
let heldKeyInterval = null;
let accelerating = false;
let currentNumber = 1;
let engineOnTimeout = null;
let welcomeMessageTimeout = null;
let engineInstructionsTimeout = null;
let isEngineOnInProgress = false;
let isEngineOffInProgress = false;
let isEngineOn = false;
let isAccelerating = false;
let fuelInterval = null;
let nextCharacterTimeOut = null;

let steeringWheelPosition = 0;
let steeringWheelTurningPosition = 0;
let carMovingPosition = 0;

const engineSound = document.getElementById('engineSound');
const carAmbience = document.getElementById('carAmbience');
const carAccelerating = document.getElementById('carAccelerating');
const carEngineOff = document.getElementById('carEngineOff');
const brake = document.getElementById("brake");
const timeElem = document.getElementById("time");
let carAmbienceTimeOut = null;
const audioElement = document.getElementById("audioPlayer");
const hornElem = document.getElementById("carHorn");
const fuelDropElem = document.querySelector(".fuel-drop");
const progressElem = document.querySelector(".progress");
const carImageElem = document.querySelector(".car-image");
let isSongPlaying = false;

let fuelLevel = "normal";
let fuelCapacity = 21;


const songs = [  // Array to store your MP3 file paths
    "song1.mp3",
    "song2.mp3",
    "song3.mp3",
    "song4.mp3",
    "song5.mp3",
    // Add more song paths here
  ];


  const originalImage = document.getElementById("originalImage");
const cameraFeed = document.getElementById("cameraFeed");
const captureButton = document.getElementById("captureButton");

let isCameraActive = false;
let mediaStream;

function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        document.querySelector(".camera").classList.add("active");
        cameraFeed.classList.remove("d-none");
        mediaStream = stream;
        cameraFeed.srcObject = stream;
        cameraFeed.play();
        isCameraActive = true;
      })
      .catch(error => {
        console.error("Error accessing camera:", error);
        // Handle camera access error (e.g., permission denied)
      });
  } else {
    console.warn("Camera access not supported by your browser.");
  }
}

function stopCamera() {
  document.querySelector(".camera").classList.remove("active");
  cameraFeed.classList.add("d-none");
  mediaStream.getTracks().forEach(track => track.stop());
  isCameraActive = false;
}


  function playRandomSong() {
    const soundElem = document.getElementById("soundSystem");
    soundElem.classList.remove("d-none");
    const randomIndex = Math.floor(Math.random() * songs.length); // Get a random index
    const randomSong = songs[randomIndex]; // Get the song path at the random index
    audioElement.src = `/UIHeistChallenge/assets/audio/${randomSong}`; // Set the audio source
    audioElement.load(); // Load the audio file
    audioElement.play(); // Play the audio
    isSongPlaying = true;
  }

  function pauseSong() {
    document.getElementById("soundSystem").classList.add("d-none");
    audioElement.pause();
    isSongPlaying = false;
  }


function showTime() {
  const now = new Date(); // Get the current date and time

  // Format the time components
  const hour = now.getHours(); // Get hours in 24-hour format
  const hours = hour % 12 || 12; // Convert to 12-hour format (12 for midnight/noon)
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const amPm = hour < 12 ? 'AM' : 'PM'; // Set AM or PM based on hour

  // Build the time string in 12-hour format
  const timeString = `${hours}:${minutes} ${amPm}`;
  timeElem.innerText = timeString;
}

function blinkTime(element) {
  const isVisible = element.style.visibility === 'visible';
  element.style.visibility = isVisible ? 'hidden' : 'visible';
}

showTime();



setInterval(() => {
  if(fuelCapacity <= 20 && fuelLevel!=="low" && isEngineOn) {
    fuelDropElem && (fuelDropElem.style.backgroundColor = "orange");
    progressElem && (progressElem.style.backgroundColor = "orange");
    fuelLevel = "low"
  }

  if(isEngineOn) {
    progressElem.style.width = `${(fuelCapacity/60)*100}px`;
    carMovingPosition = 100 - (currentNumber/280 * 100);
    carImageElem.style.backgroundPosition = `${steeringWheelTurningPosition !==0 ? steeringWheelTurningPosition : 50}% ${carMovingPosition}%`;
  } else if (!isEngineOn) {
    carImageElem.style.backgroundPosition = `50% 90%`;
  }
  
  showTime();
},1000)

 setInterval(() => {
  blinkTime(timeElem);
},500)

function playEngineSound() {
  engineSound.currentTime = 0; // Reset playback time (optional for continuous sound)
  engineSound.play();
  carAmbienceTimeOut = setTimeout(() => {
    carAmbience.currentTime = 0;
    carAmbience.play();
  },3000)
}

function stopEngineSound() {
  carAmbience.pause();
  engineSound.pause();
}

function startAccelerating() {
  (carAccelerating.currentTime > carAccelerating.duration - 4) && (carAccelerating.currentTime = 0)
  if(!isAccelerating) {
    carAmbience.pause();
    carAccelerating.currentTime = 0;
    carAccelerating.loop = true;
    carAccelerating.play();
  }
  isAccelerating = true;
}

function stopAccelerating() {
  isAccelerating = false;
  carAccelerating.pause();
}

function engineOff() {
  carEngineOff.currentTime = 0;
  carEngineOff.play();
}

function applyBrake() {
  brake.currentTime = 0;
  brake.play();
}

function rotateSteeringWheel(angle,direction) {
    const targetPosition = steeringWheelPosition + angle; // Calculate target rotation
    document.getElementById("steeringWheel").classList.remove("animate-steering");
    const updatedSteeringWheelPosition = lerp(steeringWheelPosition, targetPosition, 0.1)
    if(updatedSteeringWheelPosition > -90 && updatedSteeringWheelPosition < 90) {
      steeringWheelTurningPosition =  (updatedSteeringWheelPosition/90 * 40 ) + 50;
    } else if (updatedSteeringWheelPosition < -90 ) {
      steeringWheelTurningPosition = 10;
    } else if (updatedSteeringWheelPosition > 90) {
      steeringWheelTurningPosition = 90;
    }
  
    carImageElem.style.backgroundPosition = `${steeringWheelTurningPosition}% ${carMovingPosition}%`;

    const animate = () => {
      steeringWheelPosition = lerp(steeringWheelPosition, targetPosition, 0.1); // Linear interpolation for smooth transition
      if(direction === "right") {
        
        steeringWheelPosition = steeringWheelPosition < 90 ? steeringWheelPosition : 90
      } else {
        steeringWheelPosition = steeringWheelPosition > -90 ? steeringWheelPosition : -90
      }
      document.getElementById("steeringWheel").style.transform = `rotate(${steeringWheelPosition}deg)`;
  
      if (Math.abs(steeringWheelPosition - targetPosition) > 0.1) {
        requestAnimationFrame(animate); // Request next animation frame for smooth update
      }
    };
  
    animate(); // Initiate animation loop
  }
  
  // Helper function for linear interpolation (lerp)
  function lerp(start, end, amount) {
    return (1 - amount) * start + amount * end;
  }

document.addEventListener('keydown', (event) => {
    const key = event.key;
    doubleKeyPressHandler(key);

    isKeyPressed = true;
    heldKey = event.key;

    if (key === 'ArrowRight' && isEngineOn) {
        document.querySelector(".right").classList.add("active");
        document.querySelector(".left").classList.remove("active");
        setTimeout(() => {
          document.querySelector(".right").classList.remove("active");
        },300)
        rotateSteeringWheel(45, "right");
    } else if (key === 'ArrowLeft' && isEngineOn) {
        document.querySelector(".right").classList.remove("active");
        document.querySelector(".left").classList.add("active");
        setTimeout(() => {
          document.querySelector(".left").classList.remove("active");
        },300)
        rotateSteeringWheel(-45,"left");
    } else if (key == "p" && !isEngineOnInProgress && isEngineOn ) {
      isSongPlaying ? pauseSong() : playRandomSong();
    } else if(key === "c" && !isEngineOffInProgress && isEngineOn) {
      !isCameraActive ? startCamera() : stopCamera();
    } else if(key === "h" && !isEngineOnInProgress && isEngineOn) {
      document.querySelector(".volume").classList.add("active");
      setTimeout(() => {
        document.querySelector(".volume").classList.remove("active");
      },2000)
      hornElem.currentTime = 0;
      hornElem.play();
    } else  if(key === "b" && !isEngineOnInProgress && isEngineOn) {
      currentNumber > 0 &&  applyBrake();
      const brakeElem = document.querySelector(".brake");
      brakeElem.classList.add("braking");
      setTimeout(() => {
          brakeElem.classList.remove("braking");
      },500)
      const speedElem = document.getElementById("speed");
      showAndDropNumbers(speedElem, 50, -1,currentNumber > 50 ? 30 : 0)
  } else if (key === "r") {
    fuelCapacity = 60;
    fuelDropElem.style.backgroundColor = "green";
    progressElem.style.backgroundColor = "green";
    fuelLevel = "normal";
  }
    
    heldKeyInterval = setInterval(() => {
        if (isKeyPressed && heldKey === "a" && isEngineOn) {
            startAccelerating();
            if(currentNumber > 80) {
                document.querySelector("#warningMessage").classList.remove("d-none");
            }
            document.querySelector(".accelerator").classList.add("accelerating");
            const speedElem = document.getElementById("speed");
            !accelerating && showAndDropNumbers(speedElem,50);
            accelerating = true;
        } else {
            clearInterval(heldKeyInterval);
            key !== "e" && carAmbience.play();
        }
    },2000)
});

document.addEventListener('keyup', (event) => {
    let key = event?.key;
    isKeyPressed = false;
    heldKey = null; // Optional: Reset the held key
    document.querySelector(".accelerator").classList.remove("accelerating");
    clearInterval(heldKeyInterval);
    const speedElem = document.getElementById("speed");
    accelerating && showAndDropNumbers(speedElem, 100, -1);
    accelerating = false;
    stopAccelerating();
});

function startFuelInterval() {
    fuelInterval = setInterval(() => {
      fuelCapacity = (fuelCapacity >= 0.2) ? fuelCapacity - 0.2 : fuelCapacity;
    }, 1000);
}

function classListHandler(selectorNames,type,className) {
  if(type === "add") {
    for(let selector of selectorNames) {
      document.querySelector(`.${selector}`).classList.add(className);
    }
  } else {
    for(let selector of selectorNames) {
      document.querySelector(`.${selector}`).classList.remove(className);
    }
  }
}

function startEngine() {
  const powerSwitch = document.getElementById("powerSwitch");
        powerSwitch.classList.add("power-on");
        const engineStatusElem = document.getElementById("engineStatus");
        engineStatusElem.innerText = "";
        showNextCharacter(0,engineStatusElem,"Engine On");
        const engineInstructionsElem = document.getElementById("engineInstructions");
        engineInstructionsElem.innerText = "";
        engineInstructionsTimeout = setTimeout(() => {
              showNextCharacter(0,engineInstructionsElem,"Let the game begins...! Have a safe drive !");
              powerSwitch.classList.add("engine-ready");
        },1000)
       welcomeMessageTimeout =  setTimeout(() => {
            const welcomeMessageElem = document.getElementById("welcomeMessage");
            engineInstructionsElem.innerText = "";
            engineStatusElem.innerText = "";
            showNextCharacter(0,welcomeMessageElem, isMorningInIST() ? "Good Morning...! Laxis" : "Good evening...! Laxis");
            welcomeMessageElem.classList.add("welcome-message");
            const speedElem = document.getElementById("speed");
            document.querySelector('.speed-meter').classList.remove("d-none");
            speedElem.classList.add("speed");
            showAndDropNumbers(speedElem,10);
            const engineReadyClassElem = ["steering","direction-control","volume-fuel"];
            const dNoneElem = ["accelerator","brake","direction-control","volume-fuel","fuel-container","camera","weather","audio","audio-instructions"];
            classListHandler(engineReadyClassElem,"add","engine-ready");
            classListHandler(dNoneElem,"remove","d-none");
            document.getElementById("steeringWheel").classList.add("animate-steering");
            timeElem.classList.remove("d-none");
            fuelDropElem && (fuelDropElem.style.backgroundColor = fuelCapacity > 20 ? "green" : "orange");
            isEngineOnInProgress = false;
            isEngineOn = true;
        },3500);
}

function stopEngine() {
  const powerSwitch = document.getElementById("powerSwitch");
        powerSwitch.classList.remove("power-on");
        powerSwitch.classList.remove("engine-ready");
        const engineStatusElem = document.getElementById("engineStatus");
        engineStatusElem.innerText = "";
        showNextCharacter(0,engineStatusElem,"Engine Off");
        const engineInstructionsElem = document.getElementById("engineInstructions");
        engineInstructionsElem.innerText = "";
        const welcomeMessageElem = document.getElementById("welcomeMessage");
        welcomeMessageElem.innerText = "";
        welcomeMessageElem.classList.remove("welcome-message");
        document.getElementById("speed").innerText = "";
        const speedElem = document.getElementById("speed");
        speedElem.classList.remove("speed");
        const engineReadyClassElem = ["steering","direction-control","volume-fuel"];
        const dNoneElem = ["accelerator","brake","direction-control","speed-meter","volume-fuel","fuel-container","camera","weather","audio","audio-instructions"];
        classListHandler(dNoneElem, "add", "d-none");
        classListHandler(engineReadyClassElem,"remove","engine-ready");
        timeElem.classList.add("d-none");
        document.getElementById("steeringWheel").style.transform = "none";
        setTimeout(() => {
            showNextCharacter(0,engineInstructionsElem,"Power on the engine...");
            isEngineOffInProgress = false;
            isEngineOn = false;
        },1000)
}


const doubleKeyPressHandler = (key) => {
    // Clear any existing timeout if a new key is pressed
    clearTimeout(timeoutId);
  
    if (key === firstKeyPress && !isEngineOffInProgress) {
      // Double key press detected!
      if(key === "s" && !isEngineOnInProgress && !isEngineOn) {
        clearIntervals();
        isEngineOnInProgress = true;
        startFuelInterval();
        playEngineSound();
        startEngine();
        firstKeyPress = null; // Reset for next double press
      }
    } else {
      // New key pressed, set timer for potential double press
      if(key === "e" && !isEngineOnInProgress && isEngineOn) {
        isEngineOffInProgress = true;
        stopEngineSound();
        pauseSong();
        engineOff();
        clearIntervals();
        stopEngine();
      }
      firstKeyPress = key;
      timeoutId = setTimeout(() => {
        firstKeyPress = null; // Reset if no second press within timeout
      }, 1000); // Adjust timeout value as needed (in milliseconds)
    }
}

function showNextCharacter(currentCharIndex,outputElement,text) {
  if (currentCharIndex < text?.length) {
   outputElement.textContent += text[currentCharIndex];
   currentCharIndex++;
   nextCharacterTimeOut = setTimeout(() => {
    showNextCharacter(currentCharIndex,outputElement, text)
   },50) // Adjust timeout for speed (in milliseconds)
  }
}

function isMorningInIST() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata', // Use IST time zone
      hour12: false, // Use 12-hour clock format
      hour: 'numeric', // Extract only the hour
    };
  
    const currentHour = parseInt(now.toLocaleTimeString('en-IN', options));
  
    // Define morning hours based on your preference (adjust if needed)
    const morningStart = 6;
    const morningEnd = 11;
  
    return currentHour >= morningStart && currentHour < morningEnd;
}

const clearIntervals = () => {
    clearInterval(showAndDropInterval);
    clearInterval(heldKeyInterval);
    clearTimeout(engineInstructionsTimeout);
    clearTimeout(welcomeMessageTimeout);
    clearInterval(fuelInterval);
    clearTimeout(nextCharacterTimeOut);
    clearTimeout(carAmbienceTimeOut);
}

function showAndDropNumbers(element,duration,directions = 1,dropBy = 0) { // Adjust duration in milliseconds (default 1 second)
    let direction = directions; // 1 for increasing, -1 for decreasing

    clearInterval(showAndDropInterval);

    currentNumber = dropBy ? currentNumber - dropBy : currentNumber
  
    showAndDropInterval = setInterval(() => {
        if(currentNumber < 80) {
            document.querySelector("#warningMessage").classList.add("d-none");
        }
        if(currentNumber >= 0) {
            element.textContent = currentNumber;
        }
  
      if (currentNumber >= 280 && direction === 1) {
        direction = 0;
        setTimeout(() => {
           !isAccelerating && (direction = -1);
        },1000)
      } else if (currentNumber <= 0 && direction === -1) {
        clearInterval(showAndDropInterval); // Stop the loop when reaching 0
      }
  
      currentNumber += direction;
    }, duration);
}
  
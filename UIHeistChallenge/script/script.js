let firstKeyPress = null;
let timeoutId = null;
let showAndDropInterval = null;

let isKeyPressed = false;
let heldKey = [];
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
let isSongPlaying = false;
let isDemoSpeedoMeter = false;
let fuelLevel = "normal";
let fuelCapacity = 60;
let isCameraActive = false;
let mediaStream;
const apiKey = "58b6f7c78582bffab3936dac99c31b25";

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
const maxSpeedElem = document.querySelector(".max-speed-warning");
const cameraFeed = document.getElementById("cameraFeed");

const isMobile = navigator.maxTouchPoints > 0;
isMobile && document.querySelector(".button-actions").classList.remove("d-none");
const songs = [  // Array to store your MP3 file paths
    "song1.mp3",
    "song2.mp3",
    "song3.mp3",
    "song4.mp3",
    "song5.mp3",
];

/**
 * Logic for fetching the weather data of chennai
 */
function getWeatherData() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Chennai,India&appid=${apiKey}&units=imperial`; // Using imperial units (Fahrenheit)

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const temp =roundNumber(Number(fahrenheitToCelsius(Math.round(data.main.temp))));
      const weatherInfo = `
        <div>${temp}<span>°</span>C</div>
        <div class="place">${data?.name}</div>
      `;

      document.querySelector(".weather").innerHTML = weatherInfo;
    })
    .catch(error => console.error(error));
}

/**
 * Method for converting the temperature from fahrenheit to Celsius
 * @param {*} fahrenheit 
 * @returns Temperature in Celsius
 */
function fahrenheitToCelsius(fahrenheit) {
  // Formula to convert Fahrenheit to Celsius: (°F - 32) * 5/9
  const celsius = (fahrenheit - 32) * 5 / 9;
  return celsius.toFixed(2); // Round to two decimal places (optional)
}

/**
 * Function to start the camera
 */
function startCamera() {
  try {
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
  } catch(err) {

  }
}

/**
 * Function to stop the camera
 */
function stopCamera() {
  try {
    document.querySelector(".camera").classList.remove("active");
    cameraFeed.classList.add("d-none");
    mediaStream.getTracks().forEach(track => track.stop());
    isCameraActive = false;
  } catch(err) {

  }
}

/**
 * Function to play the random song available in the local folder
 */
function playRandomSong() {
  const soundElem = document.getElementById("soundSystem");
  soundElem.classList.remove("d-none");
  const randomIndex = Math.floor(Math.random() * songs.length); // Get a random index
  const randomSong = songs[randomIndex]; // Get the song path at the random index
  audioElement.src = `assets/audio/${randomSong}`; // Set the audio source
  audioElement.load(); // Load the audio file
  audioElement.play(); // Play the audio
  isSongPlaying = true;
}

/**
 * Function to pause the song
 */
function pauseSong() {
  document.getElementById("soundSystem").classList.add("d-none");
  audioElement.pause();
  isSongPlaying = false;
}

/**
 * Function to show the current time
 */
function showTime() {
  try {
    const now = new Date(); // Get the current date and time

    // Format the time components
    const hour = now.getHours(); // Get hours in 24-hour format
    const hours = hour % 12 || 12; // Convert to 12-hour format (12 for midnight/noon)
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const amPm = hour < 12 ? 'AM' : 'PM'; // Set AM or PM based on hour

    // Build the time string in 12-hour format
    const timeString = `${hours}:${minutes} ${amPm}`;
    timeElem.innerText = timeString;
  } catch(err) {

  }
}

/**
 * Function to make the element blink between the given duration
 */
function blinkTime(element) {
  try {
    const isVisible = element.style.visibility === 'visible';
    element.style.visibility = isVisible ? 'hidden' : 'visible';
  } catch(err) {

  }
}

/**
 * Function to round off the numbers based on the decimal places
 */
function roundNumber(number, decimalPlaces = 0) {
  // Use the toFixed() method with the desired number of decimal places
  return number.toFixed(decimalPlaces);
}

/**
 * Function to start the engine sound and car ambience sound
 */
function playEngineSound() {
  engineSound.currentTime = 0; // Reset playback time (optional for continuous sound)
  engineSound.play();
  carAmbienceTimeOut = setTimeout(() => {
    carAmbience.currentTime = 0;
    carAmbience.play();
  },3000)
}

/**
 * Function to stop the engine sound
 */
function stopEngineSound() {
  carAmbience.pause();
  engineSound.pause();
}

/**
 * Function to handle the logic once the engine starts accelerating
 */
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

/**
 * Function to handle the logic once the engine stops accelerating
 */
function stopAccelerating() {
  maxSpeedElem.classList.add("d-none");
  isAccelerating = false;
  carAccelerating.pause();
}

/**
 * Function to handle the logic once the engine is turned off
 */
function engineOff() {
  carEngineOff.currentTime = 0;
  carEngineOff.play();
}

/**
 * Function to handle the logic once the user applies brake
 */
function applyBrake() {
  brake.currentTime = 0;
  brake.play();
}

/**
 * Function to handle the logic to rotate the steering based on the user input
 * @param {*} angle 
 * @param {*} direction 
 */
function rotateSteeringWheel(angle,direction) {
  try {
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
  
    };
  
    animate(); // Initiate animation loop
  } catch(err) {

    }
}
  
// Helper function for linear interpolation (lerp)
function lerp(start, end, amount) {
    return (1 - amount) * start + amount * end;
}

/**
 * Listner for keydown event
 */
document.addEventListener('keydown', (event) => {
  try {
    const key = event.key;
    doubleKeyPressHandler(key);

    isKeyPressed = true;

    if(key === "a" && !isMobile) {
      !heldKey.includes("a") && heldKey.push(event.key);
    }
    

    if (key === 'ArrowRight' && isEngineOn && !isDemoSpeedoMeter) {
        document.querySelector(".right").classList.add("active");
        document.querySelector(".left").classList.remove("active");
        setTimeout(() => {
          document.querySelector(".right").classList.remove("active");
        },300)
        rotateSteeringWheel(45, "right");
    } else if (key === 'ArrowLeft' && isEngineOn && !isDemoSpeedoMeter) {
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
      (currentNumber > 0 && !isDemoSpeedoMeter) &&  applyBrake();
      const brakeElem = document.querySelector(".brake");
      brakeElem.classList.add("braking");
      setTimeout(() => {
          brakeElem.classList.remove("braking");
      },500)
      const speedElem = document.getElementById("speed");
      if(accelerating) {
        if(currentNumber === 280) {
          showAndDropNumbers(speedElem, 50, 1, 30)
        } else {
          currentNumber = currentNumber > 50 ? currentNumber - 30 : currentNumber;
        }
      }
      (!isDemoSpeedoMeter && !accelerating) && showAndDropNumbers(speedElem, 50, -1,currentNumber > 50 ? 30 : 0)
  } else if (key === "r") {
    fuelCapacity = 60;
    fuelDropElem.style.backgroundColor = "green";
    progressElem.style.backgroundColor = "green";
    fuelLevel = "normal";
  }
    
    heldKeyInterval = setInterval(() => {
        if (isKeyPressed && heldKey.includes("a") && isEngineOn && !isDemoSpeedoMeter && !isEngineOffInProgress && !isMobile) {
          if(currentNumber > 80) {
            document.querySelector("#warningMessage").classList.remove("d-none");
          } 
          if(currentNumber === 280) {
            maxSpeedElem.classList.remove("d-none");
          }
            if(!accelerating) {
              startAccelerating();
              document.querySelector(".accelerator").classList.add("accelerating");
              const speedElem = document.getElementById("speed");
              !accelerating && showAndDropNumbers(speedElem,50);
              accelerating = true;
            }
        } else if(isEngineOn && !isMobile) {
            accelerating = false;
            clearInterval(heldKeyInterval);
            carAmbience.play();
        }

        if(isKeyPressed && key === "a" && isEngineOn && !isDemoSpeedoMeter && !isEngineOffInProgress && isMobile) {
          if(currentNumber > 80) {
            document.querySelector("#warningMessage").classList.remove("d-none");
          } 
          if(currentNumber === 280) {
            maxSpeedElem.classList.remove("d-none");
          }
            if(!accelerating) {
              startAccelerating();
              document.querySelector(".accelerator").classList.add("accelerating");
              const speedElem = document.getElementById("speed");
              !accelerating && showAndDropNumbers(speedElem,50);
              accelerating = true;
            }
        } else if (isEngineOn && isMobile) {
          accelerating = false;
          clearInterval(heldKeyInterval);
          carAmbience.play();
        }
    },2000)
  }catch(err) {

  }
});

/**
 * Listener for key up event
 */
document.addEventListener('keyup', (event) => {
  try {
    let key = event?.key;
    
    if(key === "a" && !isDemoSpeedoMeter && isEngineOn && !isEngineOffInProgress) {
      clearInterval(heldKeyInterval);
      isKeyPressed = false;
      heldKey = [];
      accelerating = false;
      document.querySelector(".accelerator").classList.remove("accelerating");
      const speedElem = document.getElementById("speed");
      showAndDropNumbers(speedElem, 100, -1);
      stopAccelerating();
    }

    if(key === "q" && !isDemoSpeedoMeter && isEngineOn && !isEngineOffInProgress && isMobile) {
      clearInterval(heldKeyInterval);
      isKeyPressed = false;
      heldKey = [];
      accelerating = false;
      document.querySelector(".accelerator").classList.remove("accelerating");
      const speedElem = document.getElementById("speed");
      showAndDropNumbers(speedElem, 100, -1);
      stopAccelerating();
      carAmbience.play();
    }
   
  } catch(err) {

  }
});

/**
 * Function to handle the logic of starting the fuel interval once the engine is turned on
 */
function startFuelInterval() {
    fuelInterval = setInterval(() => {
      fuelCapacity = (fuelCapacity >= 0.2) ? fuelCapacity - 0.2 : fuelCapacity;
    }, 1000);
}

/**
 * Function to handle the logic of adding and removing the classlist of the DOM element
 */
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

/**
 * Function to handle the logic of starting the engine
 */
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
            isDemoSpeedoMeter = true;
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

/**
 * Function to handle the logic of turning off the engine
 */
function stopEngine() {
        const powerSwitch = document.getElementById("powerSwitch");
        isDemoSpeedoMeter = false;
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
        const dNoneElem = ["accelerator","brake","direction-control","speed-meter","volume-fuel","fuel-container","camera","weather","audio","audio-instructions","max-speed-warning"];
        classListHandler(dNoneElem, "add", "d-none");
        classListHandler(engineReadyClassElem,"remove","engine-ready");
        timeElem.classList.add("d-none");
        document.querySelector("#warningMessage").classList.add("d-none");
        setTimeout(() => {
            showNextCharacter(0,engineInstructionsElem,"Power on the engine...");
            isEngineOffInProgress = false;
            isEngineOn = false;
            carAmbience.pause();
            document.getElementById("steeringWheel").style.transform = "none";
            steeringWheelTurningPosition = 0;
        },1000)
}

/**
 * Function to handle the logic when user double clicks any key
 */
const doubleKeyPressHandler = (key) => {
  try {
     // Clear any existing timeout if a new key is pressed
     clearTimeout(timeoutId);
  
     if (key === firstKeyPress && !isEngineOffInProgress && key === "s" && !isEngineOnInProgress && !isEngineOn) {
       // Double key press detected!
         clearIntervals();
         isEngineOnInProgress = true;
         startFuelInterval();
         playEngineSound();
         startEngine();
         firstKeyPress = null; // Reset for next double press
     } else {
       // New key pressed, set timer for potential double press
       if(key === "e" && !isEngineOnInProgress && isEngineOn && !isEngineOffInProgress) {
         isEngineOffInProgress = true;
         stopEngineSound();
         pauseSong();
         engineOff();
         clearIntervals();
         stopEngine();
         carAccelerating.pause();
         heldKey = [];
         currentNumber = 0;
         accelerating = false;
         isAccelerating = false;
       }
       firstKeyPress = key;
       timeoutId = setTimeout(() => {
         firstKeyPress = null; // Reset if no second press within timeout
       }, 1000); // Adjust timeout value as needed (in milliseconds)
     }
  } catch(err) {

  }
   
}

/**
 * Function to handle the logic of showing character by character of the particular text based on the duration
 */
function showNextCharacter(currentCharIndex,outputElement,text) {
  if (currentCharIndex < text?.length) {
   outputElement.textContent += text[currentCharIndex];
   currentCharIndex++;
   nextCharacterTimeOut = setTimeout(() => {
    showNextCharacter(currentCharIndex,outputElement, text)
   },50) // Adjust timeout for speed (in milliseconds)
  }
}

/**
 * Method to check whether it is a morning time or evening time
 */
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

/**
 * Function to handle the logic of increasing and decreasing a number (Speed meter functionality)
 */
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
      isDemoSpeedoMeter = isDemoSpeedoMeter ? !isDemoSpeedoMeter : isDemoSpeedoMeter;
      clearInterval(showAndDropInterval); // Stop the loop when reaching 0
    }

    currentNumber += direction;
  }, duration);
}

getWeatherData();
showTime();

setInterval(() => {
  try {
    if(fuelCapacity <= 20 && fuelLevel!=="low" && isEngineOn) {
      fuelDropElem && (fuelDropElem.style.backgroundColor = "orange");
      progressElem && (progressElem.style.backgroundColor = "orange");
      fuelLevel = "low"
    }

    if(fuelCapacity < 1 && !isEngineOffInProgress && isEngineOn) {
      const fuelAlert = "You are running out of fuel, Do you want to refill the fuel to continue driving ?"
      if(confirm(fuelAlert)) {
        fuelCapacity = 60;
        fuelDropElem.style.backgroundColor = "green";
        progressElem.style.backgroundColor = "green";
      } else {
        isEngineOffInProgress = true;
        stopEngineSound();
        pauseSong();
        engineOff();
        clearIntervals();
        stopEngine();
      }
    }
  
    if(isEngineOn) {
      document.getElementById("fuelCapacity").innerText = roundNumber(fuelCapacity);
      progressElem.style.width = `${(fuelCapacity/60)*100}px`;
      if(!isDemoSpeedoMeter) {
        carMovingPosition = 100 - (currentNumber/280 * 100);
        carImageElem.style.backgroundPosition = `${steeringWheelTurningPosition !==0 ? steeringWheelTurningPosition : 50}% ${carMovingPosition}%`;
      }
    } else if (!isEngineOn) {
      carImageElem.style.backgroundPosition = `50% 90%`;
    }
    
    showTime();
  } catch(err) {

  }
},1000)

setInterval(() => {
  blinkTime(timeElem);
  blinkTime(maxSpeedElem);
},500)

const clearIntervals = () => {
  clearInterval(showAndDropInterval);
  clearInterval(heldKeyInterval);
  clearTimeout(engineInstructionsTimeout);
  clearTimeout(welcomeMessageTimeout);
  clearInterval(fuelInterval);
  clearTimeout(nextCharacterTimeOut);
  clearTimeout(carAmbienceTimeOut);
}


function buttonClick(key) {

  const keydownEvent = new KeyboardEvent("keydown", { key: key }); // Replace "s" with the desired key
  document.dispatchEvent(keydownEvent);

  if(key !== "a") {
    // Simulate keyup event (optional, with a slight delay)
    setTimeout(() => {
      const keyupEvent = new KeyboardEvent("keyup", { key: key });
      document.dispatchEvent(keyupEvent);
    }, 10);
  }
  
}








  
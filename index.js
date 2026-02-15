// Qibla compass image
const compassCircle = document.querySelector(".qiblahCompassImg");
// Location button
const getLocationBtn = document.getElementById("getLocationBtn");
// location by Country and City output
const locationOutput = document.getElementById("locationOutput");
// Compass angle set to 0
let lastAngle = 0;
// Qibla offset andle set to 0
let qiblaOffset = 0;

const QiblaLat = 21.4225;
const QiblaLon = 39.8262;


// Event listener - Clicking button initiates the start compass funtction and also retrieves the users current location (long and lat coords) then calls the show position function.
getLocationBtn.addEventListener("click", () => {
    getLocationBtn.textContent = "Getting Location...";
    navigator.geolocation.getCurrentPosition(showPosition);
});

// This bit i doint fully understand the math. i just know degrees need to converted to radians so we can calculate bearings accurately
function calculateQiblaDirection(userLat, userLon) {
    // converts degrees to radians
    const lat1 = userLat * Math.PI / 180;
    const lat2 = QiblaLat * Math.PI / 180;
    const lon1 = userLon * Math.PI / 180;
    const lon2 = QiblaLon * Math.PI / 180;

    // comnverts 
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;

    bearing = (bearing + 360) % 360;

    return bearing;
}

// Function to show position. once long and lat positions are retrieved, they are stored in constants called long and lat. fed into an API. City and Country data displayed from API
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // direction of Qibla and store offset number
    qiblaOffset = calculateQiblaDirection(lat, lon);
    console.log(`Qibla direction: ${qiblaOffset.toFixed(1)}°`);

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(res => res.json())
        .then(data => {
            const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                "Unknown";

            const country = data.address.country || "Unknown";

            locationOutput.innerHTML = `City: ${city}<br>Country: ${country}`;

            startCompass();
        });
}


// Function that retrieves absolute device orientation. real magnetic north. calls update compass function repeatedly many times per second
function startCompass() {
    window.addEventListener("deviceorientationabsolute", updateCompass, true);
}

// Update compass function
function updateCompass(event) {
    // If no location information, then stops the function until we have the 
    if (event.alpha === null || event.absolute !== true) return;

    // Android true compass heading
    let heading = (360 - event.alpha) % 360;

    // Qiblah heading is true north minus the qibla offset
    let qiblaHeading = (heading - qiblaOffset + 360) % 360;

    // Smooth + unwrap rotation (prevents 360 → 0 snapping)
    let delta = qiblaHeading - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // Infinite rotation of image
    lastAngle += delta;

    compassCircle.style.transform = `rotate(${lastAngle}deg)`;
    getLocationBtn.textContent = `${Math.round(heading)}°`;

    const facingQibla = qiblaHeading <= 2 || qiblaHeading >= 358;

    if (facingQibla) {
        getLocationBtn.classList.add("qiblaDirection");
    } else {
        getLocationBtn.classList.remove("qiblaDirection");
    }
}
// Qibla compass image
const compassCircle = document.querySelector(".qiblahCompassImg");
// Location button
const getLocationBtn = document.getElementById("getLocationBtn");
// location by Country and City output
const locationOutput = document.getElementById("locationOutput");
// Compass angle set to 0
let compassAngle = 0;


// Event listener - Clicking button initiates the start compass funtction and also retrieves the users current location (long and lat coords) then calls the show position function.
getLocationBtn.addEventListener("click", () => {
    startCompass();
    navigator.geolocation.getCurrentPosition(showPosition);
});

// Function to show position. once long and lat positions are retrieved, they are stored in constants called long and lat. fed into an API. City and Country data displayed from API
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

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
        });
}


// Function that retrieves absolute device orientation. real magnetic north. calls update compass function repeatedly many times per second
function startCompass() {
    window.addEventListener("deviceorientationabsolute", updateCompass, true);
}

// Update compass function
function updateCompass(event) {
    if (event.alpha === null || event.absolute !== true) return;

    // Android true compass heading
    let heading = (360 - event.alpha) % 360;

    // Smooth + unwrap rotation (prevents 360 → 0 snapping)
    let delta = heading - compassAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    compassAngle += delta;

    compassCircle.style.transform = `rotate(${compassAngle}deg)`;
    getLocationBtn.textContent = `${Math.round(heading)}°`;
}

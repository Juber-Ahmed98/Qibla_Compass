// Qibla compass image
const compassCircle = document.querySelector(".qiblahCompassImg");
// Location button
const getLocationBtn = document.getElementById("getLocationBtn");
// Location by Country and City output
const locationOutput = document.getElementById("locationOutput");
// Compass angle set to 0
let lastAngle = 0;
// Qibla offset angle set to 0
let qiblaOffset = 0;

const QiblaLat = 21.4225;
const QiblaLon = 39.8262;

// Detect iOS (iPhone, iPad, iPod)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


// Event listener — on click, request compass permission first on iOS (MUST be
// triggered by a user gesture), then get geolocation
getLocationBtn.addEventListener("click", () => {
    getLocationBtn.textContent = "Getting Location...";

    // Fire geolocation immediately on the user gesture — iOS requires this
    // to be synchronous within the click handler, not inside a .then()
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(showPosition, handleLocationError, geoOptions);

    // Handle compass permission separately — runs in parallel, doesn't block geolocation
    if (isIOS && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response !== "granted") {
                    getLocationBtn.textContent = "Compass Permission Denied";
                }
            })
            .catch(err => {
                console.error("Compass permission error:", err);
                getLocationBtn.textContent = "Permission Error";
            });
    }
});


function handleLocationError(err) {
    const messages = {
        1: "Location denied. Check Settings → Privacy → Location Services.",
        2: "Location unavailable. Try moving to better signal.",
        3: "Location timed out. Please try again."
    };
    getLocationBtn.textContent = messages[err.code] || "Location Error";
    console.error("Geolocation error:", err);
}


// Degrees to radians bearing calculation
function calculateQiblaDirection(userLat, userLon) {
    const lat1 = userLat * Math.PI / 180;
    const lat2 = QiblaLat * Math.PI / 180;
    const lon1 = userLon * Math.PI / 180;
    const lon2 = QiblaLon * Math.PI / 180;

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;

    return bearing;
}


// Retrieve lat/lon, calculate qibla offset, reverse geocode for city/country
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

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
        })
        .catch(err => {
            locationOutput.textContent = "Location lookup failed";
            console.error("Geocoding error:", err);
            startCompass(); // Still start compass even if geocoding fails
        });
}


// iOS uses 'deviceorientation' + webkitCompassHeading
// Android uses 'deviceorientationabsolute' + alpha
function startCompass() {
    if (isIOS) {
        window.addEventListener("deviceorientation", updateCompass, true);
    } else {
        window.addEventListener("deviceorientationabsolute", updateCompass, true);
    }
}


function updateCompass(event) {
    let heading;

    if (isIOS) {
        // webkitCompassHeading: clockwise degrees from magnetic north (0–360)
        // Returns null if compass data is unavailable
        if (event.webkitCompassHeading == null) return;
        heading = event.webkitCompassHeading;
    } else {
        // Android: alpha is counterclockwise from north, so we invert it
        // event.absolute must be true to ensure it's relative to real north
        if (event.alpha === null || event.absolute !== true) return;
        heading = (360 - event.alpha) % 360;
    }

    // Angle between the direction the user is facing and the direction of Mecca
    let qiblaHeading = (qiblaOffset - heading + 360) % 360;

    // Smooth unwrapped rotation — prevents 359° → 1° snap jumping
    let delta = qiblaHeading - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    lastAngle += delta;

    compassCircle.style.transform = `rotate(${lastAngle}deg)`;
    getLocationBtn.textContent = `${Math.round(heading)}°`;

    // Highlight button if user is facing within ±2° of Qibla
    const facingQibla = qiblaHeading <= 2 || qiblaHeading >= 358;
    getLocationBtn.classList.toggle("qiblaDirection", facingQibla);
}
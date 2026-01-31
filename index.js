const compassCircle = document.querySelector(".qiblahCompassImg");
const getLocationBtn = document.getElementById("getLocationBtn");
const locationOutput = document.getElementById("locationOutput");

getLocationBtn.addEventListener("click", () => {
    // Start compass
    startCompass();

    // Get geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        locationOutput.innerText = "Geolocation is not supported by this browser.";
    }
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(response => response.json())
        .then(data => {
            const city = data.address.city || data.address.town || data.address.village || "Unknown";
            const country = data.address.country || "Unknown";
            locationOutput.innerHTML = `City: ${city} <br> Country: ${country}`;
        })
        .catch(() => {
            locationOutput.innerHTML += `<br>Could not fetch city/country`;
        });
}

function startCompass() {
    // Request permission for sensors (required in modern Android/iOS)
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", updateCompass, true);
                } else {
                    alert("Permission denied for device orientation");
                }
            })
            .catch(err => alert("Device orientation not supported"));
    } else {
        // Android: no permission needed
        window.addEventListener("deviceorientation", updateCompass, true);
    }
}

function updateCompass(event) {
    if (event.alpha !== null) {
        let heading = event.alpha;
        compassCircle.style.transform = `rotate(${-heading}deg)`;
    }
}

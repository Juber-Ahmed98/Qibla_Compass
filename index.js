const compassCircle = document.querySelector(".qiblahCompassImg");
const getLocationBtn = document.getElementById("getLocationBtn");
const locationOutput = document.getElementById("locationOutput");

getLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        locationOutput.innerText = "Geolocation is not supported by this browser.";
    }
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Start compass after getting location
    startCompass();

    // Reverse geocoding to get city and country
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(response => response.json())
        .then(data => {
            const city = data.address.city || data.address.town || data.address.village || "Unknown";
            const country = data.address.country || "Unknown";
            locationOutput.innerHTML += `City: ${city} <br> Country: ${country}`;
        })
        .catch(() => {
            locationOutput.innerHTML += `<br>Could not fetch city/country`;
        });
}

function startCompass() {
    window.addEventListener("deviceorientation", (event) => {
        if (event.absolute === true || event.alpha !== null) {
            // Get the heading in degrees (0-360)
            let heading = event.alpha;

            // Flip the direction so the compass points correctly
            compassCircle.style.transform = `rotate(${-heading}deg)`;
        }
    }, true);
}
const compassCircle = document.querySelector(".qiblahCompassImg");
const getLocationBtn = document.getElementById("getLocationBtn");
const locationOutput = document.getElementById("locationOutput");

getLocationBtn.addEventListener("click", () => {
    startCompass();

    navigator.geolocation.getCurrentPosition(showPosition);
});

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

function startCompass() {
    window.addEventListener("deviceorientation", updateCompass, true);
}

function updateCompass(event) {
    if (event.alpha == null) return;

    const heading = Math.round(event.alpha);

    compassCircle.style.transform = `rotate(${-heading}deg)`;
    getLocationBtn.textContent = `${heading}°`;
}
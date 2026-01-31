const locationOutput = document.getElementById("location")
const compassCircle = document.querySelector(".qiblahCompassImg");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        locationOutput.innerHTML = "Geolocation is not supported by this browser."
    }
}


function showPosition(position) {
    locationOutput.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;;
}

locationOutput.addEventListener("click" , () => {
    window.addEventListener("deviceorientationabsolute", updateCompass)
});

function updateCompass(event) {
    const heading = event.alpha;
    compassCircle.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`;
}
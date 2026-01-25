const locationOutput = document.getElementById("location")

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
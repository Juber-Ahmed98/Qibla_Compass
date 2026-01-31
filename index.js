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
  locationOutput.innerHTML = `Latitude: ${lat} <br> Longitude: ${lon}`;

  // Start compass after getting location
  startCompass();
}


function startCompass() {
  window.addEventListener("deviceorientationabsolute", (event) => {
    const heading = event.alpha; // 0-360 degrees
    compassCircle.style.transform = `rotate(${-heading}deg)`;
  });
}
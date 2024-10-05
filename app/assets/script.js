"use strict";

let b = document.createElement("button");
b.innerHTML = "Start App";
document.querySelector("body").appendChild(b)

b.onclick = () => {
    b.remove();

    geoFindMe();
}


// gps

function geoFindMe() {
    const trackPeriod = 5000; // ms

    const status = document.querySelector("#status");
    const mapLink = document.querySelector("#map-link");

    mapLink.href = "";
    mapLink.textContent = "";

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        fetch("/gpsLogger", {
            method: "POST",
            body: JSON.stringify({"latitude": latitude, "longitude": longitude})
        });
        //console.log(latitude, longitude);

        status.textContent = "";
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
        mapLink.classList.add("locationIndicator")

        setTimeout(() => navigator.geolocation.getCurrentPosition(success, error), trackPeriod);
    }

    function error() {
        status.textContent = "Unable to retrieve your location";
    }

    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
    } else {
        status.textContent = "Locating…";
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

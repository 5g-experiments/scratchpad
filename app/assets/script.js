"use strict";

let b = document.createElement("button");
b.innerHTML = "Start App";
document.querySelector("body").appendChild(b)

b.onclick = () => {
    b.remove();

    geoFindMe();

    landingPage();
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

// landingPage
function landingPage() {
    let b = document.createElement("button");
    b.innerHTML = "Sell Stuff";
    document.querySelector("body").appendChild(b)
    b.classList.add("buttonSell")

    let l = document.createElement("div");
    document.querySelector("body").appendChild(l);

    // items
    let itemData = [
        {
            "title": "Used bicycle",
            "lat": 49.262098693847655,
            "lon": -123.24851837158204,
            "price": "$5/hour"
        },
        {
            "title": "Washing machine rent",
            "lat": 49.262098693847655,
            "lon": -123.24851837158204,
            "price": "$1/hour"
        },
        {
            "title": "Soup",
            "lat": 49.262098693847655,
            "lon": -123.24851837158204,
            "price": "$8"
        },
    ]

    let itemTag;
    for (let item of itemData) {
        //console.log(itemData);
        itemTag = document.createElement("div");
        itemTag.innerHTML = `
<h2>${item.title} - ${item.price}</h2>
<div>Location: ${item.lat}, ${item.lon}</div>
<button class="buttonBuy">Buy Now</button>
`;
        l.appendChild(itemTag);
    };
}

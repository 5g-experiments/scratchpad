"use strict";

let b = document.createElement("button");
b.innerHTML = "Start App";
b.classList.add("startAppButton")
document.querySelector("body").appendChild(b)

b.onclick = () => {
    b.remove();

    geoFindMe();

    landingPage();
}

// gps

let myApp = {
    'lat': null,
    'lon': null
}

function geoFindMe() {
    const trackPeriod = 5000; // ms

    const status = document.querySelector("#status");
    const mapLink = document.querySelector("#map-link");

    mapLink.href = "";
    mapLink.textContent = "";

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        myApp['lat'] = latitude;
        myApp['lon'] = longitude;

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

        setTimeout(() => navigator.geolocation.getCurrentPosition(success, error), 2*trackPeriod);
    }

    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
    } else {
        status.textContent = "Locating…";
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

// landingPage
function updateProductsComponent(products) {
    let elId = "productsComponent";

    let oldProductsComponent = document.getElementById(elId);
    if (oldProductsComponent)
        oldProductsComponent.remove();

    let productsComponent = document.createElement("div");
    productsComponent.id = elId;
    document.querySelector("body").appendChild(productsComponent);

    let itemTag;
    for (let item of products) {
        //console.log(itemData);
        itemTag = document.createElement("div");
        itemTag.innerHTML = `
<h2>${item.title} - ${item.price}</h2>
<div>Location: ${item.lat}, ${item.lon}</div>
<button class="buttonBuy">Buy Now</button>
`;
        productsComponent.appendChild(itemTag);
    };
}

function landingPage() {
    let b = document.createElement("button");
    b.innerHTML = "Sell Stuff";
    document.querySelector("body").appendChild(b)
    b.classList.add("buttonSell")
    b.onclick = sellStuffForm;

    // items
    // let itemData = [
    //     {
    //         "title": "Used bicycle",
    //         "lat": 49.262098693847655,
    //         "lon": -123.24851837158204,
    //         "price": "$5/hour"
    //     },
    //     {
    //         "title": "Washing machine rent",
    //         "lat": 49.262098693847655,
    //         "lon": -123.24851837158204,
    //         "price": "$1/hour"
    //     },
    //     {
    //         "title": "Soup",
    //         "lat": 49.262098693847655,
    //         "lon": -123.24851837158204,
    //         "price": "$8"
    //     },
    // ]

    fetch("/product")
        .then((response) => response.json())
        .then(updateProductsComponent);
}

function sellStuffForm() {
    // one modal max
    if (!!document.querySelector(".modal"))
        return;

    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.querySelector("body").appendChild(modal);

    let modal_bg = document.createElement("div");
    modal_bg.classList.add("modalBg");
    document.querySelector("body").appendChild(modal_bg);

    // fill modal
    modal.innerHTML = `<div class="modalContent">
<div class="modelPanel">
  <form action="javascript:void(0);" id="productSubmitForm">
    <label for="title">Title:</label><br>
    <input type="text" id="title" name="title" placeholder="Soup"><br>
    <label for="price">Price:</label><br>
    <input type="text" id="price" name="price" placeholder="$8/L"><br><br>
    <input type="submit" value="Submit">
    <button id="productSubmitFormCancel">Cancel</button>
  </form>
</div>
</div>`;

    function closeForm() {
        modal.remove();
        modal_bg.remove();
    }

    document.querySelector("#productSubmitFormCancel").onclick = closeForm;

    document.querySelector("#productSubmitForm").onsubmit = (event) => {
        console.log("Sumbit form!");
        //console.log(event);
        let formData = new FormData(event.target);
        // output as an object
        let data = Object.fromEntries(formData);

        data['lat'] = myApp['lat'];
        data['lon'] = myApp['lon'];

        fetch("/product", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then(updateProductsComponent)
            .then(closeForm);
    }
}

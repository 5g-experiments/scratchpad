"use strict";

// program data
let myApp = {
    'user_id': null,
    'lat': null,
    'lon': null
}

// login component

function loginComponent() {
    let root = document.createElement("div");

    root.innerHTML = `
<form action="javascript:void(0);" id="loginForm">
    <label for="phone">Phone number:</label><br>
    <input type="text" id="phone" name="phone" placeholder="+1 (742) 893 1956"><br>
    <label for="email">Email:</label><br>
    <input type="text" id="email" name="email" placeholder="abra@radab.ca"><br><br>
    <input type="checkbox" id="newsletter" name="newsletter" />
    <label for="newsletter">Sign up for newsletter</label>
    <br />
    <input type="submit" id="startAppButton" value="Start App">
</form>
`;
    document.querySelector("body").appendChild(root)

    let b = document.getElementById("startAppButton");
    b.classList.add("startAppButton");

    document.querySelector("#loginForm").onsubmit = (event) => {
        //console.log("Sumbit form!");
        //console.log(event);
        let formData = new FormData(event.target);
        // output as an object
        let data = Object.fromEntries(formData);

        // if (!data['title'] || !data['price']) {
        //     alert("Please set title and price");
        //     return;
        // }

        fetch("/login", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) =>
                new Promise((ok, fail) => {
                    if (response['status'] == 'ok') {
                        myApp['user_id'] = response['user_id'];
                        root.remove();
                        geoFindMe();
                        landingPage();
                        // ... do stuff
                        ok();
                    } else {
                        fail();
                    }
                }))
    }
}

loginComponent();

// gps
function geoFindMe() {
    const trackPeriod = 1000; // ms

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
        //console.log("Sumbit form!");
        //console.log(event);
        let formData = new FormData(event.target);
        // output as an object
        let data = Object.fromEntries(formData);

        if (!data['title'] || !data['price']) {
            alert("Please set title and price");
            return;
        }

        data['user_id'] = myApp['user_id'];
        data['lat'] = myApp['lat'];
        data['lon'] = myApp['lon'];

        fetch("/product", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) =>
                new Promise((ok, fail) => {
                    if (response['status'] == 'ok') {
                        updateProductsComponent(response['products']);
                        ok();
                    } else {
                        fail();
                    }
                }))
            .then(closeForm);
    }
}

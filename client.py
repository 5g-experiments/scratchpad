#!/usr/bin/env python3

import requests
import os

TOKEN = os.environ["TOKEN"]
PHONE_NUMBER = os.environ["PHONE_NUMBER"]

def post(endpoint, body):
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Cache-Control": "no-cache",
        "accept": "application/json",
        "Content-Type": "application/json"
    }

    # FIXME: docs say v1, but only v0 works
    r = requests.post(f"https://pplx.azurewebsites.net/api/rapid/v0/{endpoint}/verify", json=body, headers=headers)

    #return r
    return r.json()

def number_verification():
    return post("numberVerification", {"phoneNumber": PHONE_NUMBER})

# Use number_verification()['phoneNumber] to get phone_number
def location_verification(radius, lat, lon):
    body = {
        "device": {
            "phoneNumber": PHONE_NUMBER
        },
        "area": {
            "areaType": "Circle", # CIRCLE creates server error
            "location": { # center creates server error
                "latitude": lat,
                "longitude": lon
            },
            "accuracy": radius
        },
        "maxAge": 0 # fresh calculation if 0, 120 in docs
    }
    print(body)

    # FIXME: why numberVerification uses camel case and this
    # uses hyphen?
    return post("location-verification", body)

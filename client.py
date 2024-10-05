#!/usr/bin/env python3

import requests
import os

debug = False
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
    r = requests.post(f"https://pplx.azurewebsites.net/api/rapid/v0/{endpoint}/verify", json=body, headers=headers, timeout=5)

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
        "maxAge": 120 # fresh calculation if 0, 120 in docs
    }

    # FIXME: why numberVerification uses camel case and this
    # uses hyphen?
    return post("location-verification", body)

def is_inside_circle(radius, lat, lon):
    return location_verification(radius, lat, lon)['verificationResult']

def is_lat_lt(lat):
    r = 10000000
    return is_inside_circle(r, lat - r, 0)

def is_lon_lt(lat):
    r = 10000000
    return is_inside_circle(r, 0, lat - r)

def find_lat(precision = 0.001):
    # values relevant for Vancouver (for faster search)
    lat_s = 48.9 #-90
    lat_b = 49.4 #90

    i = 1
    while (lat_b - lat_s > precision):
        m = (lat_s + lat_b)/2
        if is_lat_lt(m):
            lat_b = m
        else:
            lat_s = m

        if debug:
            print(i, lat_s, lat_b)
        i += 1

    return m

def find_lon(precision = 0.001):
    # values relevant for Vancouver (for faster search)
    lat_s = -123.4 # -180
    lat_b = -122.4 # 180

    i = 1
    while (lat_b - lat_s > precision):
        m = (lat_s + lat_b)/2
        if is_lon_lt(m):
            lat_b = m
        else:
            lat_s = m

        if debug:
            print(i, lat_s, lat_b)
        i += 1

    return m

def find_exact_location(precision=0.00001):
    if debug:
        print("Searching latitude")
    lat = find_lat(precision)
    if debug:
        print("Searching longitude")
    lon = find_lon(precision)
    return lat, lon

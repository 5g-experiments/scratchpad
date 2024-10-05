#!/usr/bin/env python3

import client
import pandas as pd
from datetime import datetime
import time

if __name__ == "__main__":
    data = []
    columns = ["Latitude", "Longitude", "Timestamp"]

    i = 0
    save_freq = 100
    while True:
        i += 1

        lat, lon = client.find_exact_location()
        timestamp = datetime.now()
        print(i, lat, lon, timestamp)
        data.append((lat, lon, timestamp))
        time.sleep(5)

        if i % save_freq:
            df = pd.DataFrame(data, columns=columns)
            df.to_csv(f"data/{timestamp}.csv.bz2")
            data.clear()

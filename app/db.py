#!/usr/bin/env python3

import sqlite3

class Cursor():
    def __enter__(self):
        self.con = sqlite3.connect("data/data.db")
        self.cur = self.con.cursor()

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.con.commit()

def migrate():
    with Cursor() as c:
        c.cur.execute("""CREATE TABLE IF NOT EXISTS product(
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          lat FLOAT NOT NULL,
          lon FLOAT NOT NULL,
          price TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )""")
        c.cur.execute("""CREATE TABLE IF NOT EXISTS migrations(
          id INTEGER PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )""")

    insert_product("Sports Bicycle", 49.262098693847655, -123.24851837158204, "$5/hour")
    insert_product("Washing machine", 49.262098693847655, -123.24851837158204, "$1/hour")
    insert_product("Soup", 49.262098693847655, -123.24851837158204, "$8")
    insert_product("Emperor Feast Kitchen Space", 49.262098693847655, -123.24851837158204, "$32")

def insert_product(title, lat, lon, price):
    # TODO: validation

    with Cursor() as c:
        return c.cur.execute("""
        INSERT INTO product(title, lat, lon, price) VALUES
        (?, ?, ?, ?)
        """, (title, lat, lon, price))

def index_products():
    with Cursor() as c:
        r = c.cur.execute("SELECT id, title, lat, lon, price, timestamp FROM product ORDER BY id DESC")
        return [{
            "id": id,
            "title": title,
            "lat": lat,
            "lon": lon,
            "price": price,
            "timestamp": timestamp
        } for (id, title, lat, lon, price, timestamp) in r]

if __name__ == "__main__":
    print("Migrating...")
    migrate()

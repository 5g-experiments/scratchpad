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
        c.cur.execute("""CREATE TABLE IF NOT EXISTS user(
          id INTEGER PRIMARY KEY,
          email TEXT,
          phone_number TEXT,
          newsletter INTEGER NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )""")

        c.cur.execute("""CREATE TABLE IF NOT EXISTS product(
          id INTEGER PRIMARY KEY,
          user_id INTEGER,
          title TEXT NOT NULL,
          lat FLOAT NOT NULL,
          lon FLOAT NOT NULL,
          price TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          FOREIGN KEY(user_id) REFERENCES user(id)
        )""")
        c.cur.execute("""CREATE TABLE IF NOT EXISTS migrations(
          id INTEGER PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )""")

    id = insert_user("admin@root.com", "1 123 421 8583", True)

    insert_product(id, "Sports Bicycle", 49.262098693847655, -123.24851837158204, "$5/hour")
    insert_product(id, "Washing machine", 49.262098693847655, -123.24851837158204, "$1/hour")
    insert_product(id, "Soup", 49.262098693847655, -123.24851837158204, "$8")
    insert_product(id, "Emperor Feast Kitchen Space", 49.262098693847655, -123.24851837158204, "$32")

def insert_user(email, phone_number, newsletter):
    # TODO: validation

    # FIXME: for some reason can't use Client() here idk why, but
    # doing it verbosely works
    con = sqlite3.connect("data/data.db")
    cur = con.cursor()

    cur.execute("""
        INSERT INTO user(email, phone_number, newsletter) VALUES
        (?, ?, ?)  RETURNING id
        """, (email, phone_number, newsletter))

    row = cur.fetchone()
    (id, ) = row if row else None

    con.commit()

    return id

def insert_product(user_id, title, lat, lon, price):
    # TODO: validation
    with Cursor() as c:
        return c.cur.execute("""
        INSERT INTO product(user_id, title, lat, lon, price) VALUES
        (?, ?, ?, ?, ?)
        """, (user_id, title, lat, lon, price))

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

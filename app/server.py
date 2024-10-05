#!/usr/bin/env python3

import argparse
import logging
import os
import ssl
import json
from aiohttp import web
from datetime import datetime
import pandas as pd

ROOT = os.path.dirname(__file__)

async def index(request):
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def assets(request):
    path = request.match_info['name']
    #print(path)
    content = open(os.path.join(ROOT, f"assets/{path}"), "r").read()
    return web.Response(content_type="text/html", text=content)


# TODO: move to class
gps_data = []
gps_data_chunk_size = 100
async def gps_logger(request):
    data = await request.json()
    print(data)
    timestamp = datetime.now()
    data["timestamp"] = timestamp
    gps_data.append(data)

    if len(gps_data) > gps_data_chunk_size:
        df = pd.DataFrame(gps_data)
        df.to_csv(f"data/{timestamp}.csv.bz2")
        gps_data.clear()

    return web.Response(
        content_type="application/json",
        text=json.dumps({"status": "ok"})
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Server demo"
    )
    parser.add_argument("--cert-file", help="SSL certificate file (for HTTPS)")
    parser.add_argument("--key-file", help="SSL key file (for HTTPS)")
    parser.add_argument(
        "--host", default="0.0.0.0", help="Host for HTTP server (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port", type=int, default=8070, help="Port for HTTP server (default: 8070)"
    )
    parser.add_argument("--verbose", "-v", action="count")
    args = parser.parse_args()

    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    if args.cert_file:
        ssl_context = ssl.SSLContext()
        ssl_context.load_cert_chain(args.cert_file, args.key_file)
    else:
        ssl_context = None

    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_post("/gpsLogger", gps_logger)
    app.router.add_get("/assets/{name:.*}", assets)
    web.run_app(
        app, access_log=None, host=args.host, port=args.port, ssl_context=ssl_context
    )

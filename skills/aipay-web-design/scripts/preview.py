#!/usr/bin/env python3
"""Serve the bundled component preview on the selected IPv4 address."""

from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from socketserver import TCPServer


class PreviewServer(ThreadingHTTPServer):
    def server_bind(self):
        # The preview advertises the bound address without a reverse DNS lookup.
        TCPServer.server_bind(self)
        self.server_name, self.server_port = self.server_address


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="127.0.0.1", help="IPv4 address to listen on (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    template = Path(__file__).resolve().parents[1] / "assets" / "frontend-template"
    handler = partial(PreviewHandler, directory=template)
    try:
        with PreviewServer((args.bind, args.port), handler) as server:
            print(f"http://{server.server_name}:{server.server_port}/", flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
    except OSError as error:
        parser.exit(1, f"Could not start the preview at {args.bind}:{args.port}: {error}\n")


if __name__ == "__main__":
    main()

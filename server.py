"""
MemVitals Local Server
Starts a local web server to serve the MemVitals Memory Allocation application.
"""
import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable caching-free live updates during development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    # Ensure port binding succeeds
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", port), Handler) as httpd:
            print(f"==================================================")
            print(f" MemVitals Memory Allocation Lab Server Running   ")
            print(f" URL: http://localhost:{port}/index.html        ")
            print(f" Press Ctrl+C to terminate the server             ")
            print(f"==================================================")
            sys.stdout.flush()
            httpd.serve_forever()
    except OSError as e:
        print(f"Error binding to port {port}: {e}")
        # Try alternate port
        port += 1
        with socketserver.TCPServer(("", port), Handler) as httpd:
            print(f"Running on alternate port http://localhost:{port}/index.html")
            sys.stdout.flush()
            httpd.serve_forever()

if __name__ == '__main__':
    main()

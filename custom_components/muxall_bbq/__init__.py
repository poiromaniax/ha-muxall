from .websocket_client import MuxallBBQWebSocketClient
from .coordinator import MuxallBBQCoordinator

DOMAIN = "muxall_bbq"

def build_ws_url(host):
    """
    Build a full ws:// URL from a hostname/IP (with optional port/path).
    Ensures ws:// prefix and trailing slash.
    """
    h = host.strip()
    if h.startswith("ws://"):
        h = h[5:]
    h = h.rstrip("/")
    url = f"ws://{h}/"
    return url

async def async_setup_entry(hass, entry):
    # Get the host from config and build the full ws:// URL
    host = entry.data["host"]
    url = build_ws_url(host)
    username = entry.data.get("username")
    password = entry.data.get("password")
    ws_client = MuxallBBQWebSocketClient(url, username, password)
    coordinator = MuxallBBQCoordinator(hass, ws_client)
    hass.data[DOMAIN] = coordinator
    await coordinator.async_start()
    return True 
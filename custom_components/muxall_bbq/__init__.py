from .websocket_client import MuxallBBQWebSocketClient
from .coordinator import MuxallBBQCoordinator

DOMAIN = "muxall_bbq"

async def async_setup_entry(hass, entry):
    url = entry.data["url"]
    username = entry.data.get("username")
    password = entry.data.get("password")
    ws_client = MuxallBBQWebSocketClient(url, username, password)
    coordinator = MuxallBBQCoordinator(hass, ws_client)
    hass.data[DOMAIN] = coordinator
    await coordinator.async_start()
    return True 
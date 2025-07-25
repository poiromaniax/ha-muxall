"""
MuxallBBQCoordinator manages all state received from the BBQ controller via WebSocket.
It maintains a structured state dictionary, routes incoming messages by type, and triggers Home Assistant updates.
This file is heavily commented for clarity and non-engineer readability.
"""

import logging
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
import re

_LOGGER = logging.getLogger(__name__)

# Helper to parse key-value pairs from 'OK: GET: ...' messages
# Example: 'OK: GET: key1=val1,key2=val2,...'
def parse_kvps_from_ok_get(message):
    # Extract the part after 'OK: GET:'
    try:
        kvp_str = message.split('OK: GET:')[1].strip()
    except IndexError:
        return {}
    # Split by commas, then by '='
    kvps = {}
    for pair in kvp_str.split(','):
        if '=' in pair:
            k, v = pair.split('=', 1)
            kvps[k.strip()] = v.strip()
    return kvps

class MuxallBBQCoordinator(DataUpdateCoordinator):
    """
    Coordinator for the Muxall BBQ integration.
    Receives and manages all state from the BBQ controller.
    """
    def __init__(self, hass, ws_client):
        super().__init__(
            hass,
            _LOGGER,
            name="Muxall BBQ Coordinator",
            update_interval=None,  # Push-based, not polling
        )
        self.ws_client = ws_client
        # Structured state for all BBQ controller data
        self.state = {
            "connection": {
                "connected": False,
                "authenticated": False,
                "last_error": None,
            },
            "config": {},
            "status": {},
            "history": [],
            "update": {},
            "errors": [],
        }
        # Register this coordinator as the message handler for the WebSocket client
        self.ws_client.set_message_callback(self.handle_message)

    async def async_start(self):
        """Start the WebSocket connection."""
        self.hass.loop.create_task(self.ws_client.connect())

    async def handle_message(self, data):
        """
        Handle incoming messages from the BBQ controller.
        Supports both JSON and plain text ('raw') messages.
        Updates only the relevant part of self.state and triggers entity refresh.
        """
        # Handle plain text messages (e.g., OK: GET: ...)
        if "raw" in data:
            msg = data["raw"]
            if msg.startswith("OK: GET:"):
                # Parse key-value pairs and update status/config
                kvps = parse_kvps_from_ok_get(msg)
                # Heuristically decide if this is status or config based on keys
                if "chamberTemp" in kvps or "bbqState" in kvps:
                    self.state["status"].update(kvps)
                else:
                    self.state["config"].update(kvps)
                await self.async_request_refresh()
            # Optionally handle other OK: ... or NOTIFY: ... messages here
            return
        # Handle JSON messages (if any)
        msg_type = data.get("type")
        if msg_type == "state_update":
            self.state["status"].update(data)
        elif msg_type == "config":
            self.state["config"] = data
        elif msg_type == "history":
            self.state["history"] = data.get("readings", [])
        elif msg_type == "update_status":
            self.state["update"].update(data)
        elif msg_type == "error":
            self.state["errors"].append(data)
            self.state["connection"]["last_error"] = data.get("message")
        elif msg_type == "login_response":
            self.state["connection"]["authenticated"] = data.get("success", False)
        elif msg_type == "pong":
            pass
        else:
            if msg_type is not None:
                _LOGGER.warning(f"Unknown message type received: {msg_type}")
        await self.async_request_refresh()

    async def request_full_state(self):
        """
        Request all relevant state from the BBQ controller after (re)connect.
        This should be called after reconnect to repopulate self.state.
        """
        # Example requests; adjust message types as per your controller's protocol
        await self.ws_client.send({"type": "get_status"})
        await self.ws_client.send({"type": "get_config"})
        await self.ws_client.send({"type": "get_history"})
        await self.ws_client.send({"type": "get_update_status"}) 
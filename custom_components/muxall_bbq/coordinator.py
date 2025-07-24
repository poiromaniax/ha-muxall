"""
MuxallBBQCoordinator manages all state received from the BBQ controller via WebSocket.
It maintains a structured state dictionary, routes incoming messages by type, and triggers Home Assistant updates.
This file is heavily commented for clarity and non-engineer readability.
"""

import logging
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

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
        Each message is a dict with a 'type' field indicating its purpose.
        Updates only the relevant part of self.state and triggers entity refresh.
        """
        msg_type = data.get("type")
        if msg_type == "state_update":
            # Update live status (e.g., temperatures, fan, etc.)
            self.state["status"].update(data)
        elif msg_type == "config":
            # Update device configuration
            self.state["config"] = data
        elif msg_type == "history":
            # Update historical readings for graphing
            self.state["history"] = data.get("readings", [])
        elif msg_type == "update_status":
            # Update firmware/software update info
            self.state["update"].update(data)
        elif msg_type == "error":
            # Log error and update error state
            self.state["errors"].append(data)
            self.state["connection"]["last_error"] = data.get("message")
        elif msg_type == "login_response":
            # Update authentication status
            self.state["connection"]["authenticated"] = data.get("success", False)
        elif msg_type == "pong":
            # Heartbeat/keepalive, no state update needed
            pass
        else:
            # Unknown message type, log for debugging
            _LOGGER.warning(f"Unknown message type received: {msg_type}")
        # Notify Home Assistant entities to refresh
        await self.async_request_refresh()

    async def request_full_state(self):
        """
        Request all relevant state from the BBQ controller after (re)connect.
        This should be called after reconnect to repopulate self.state.
        """
        # Example requests; adjust message types as per your controller's protocol
        await self.ws_client.send({"type": "get_config"})
        await self.ws_client.send({"type": "get_status"})
        await self.ws_client.send({"type": "get_history"})
        await self.ws_client.send({"type": "get_update_status"}) 
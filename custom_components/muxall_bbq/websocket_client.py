"""
MuxallBBQWebSocketClient manages the WebSocket connection to the BBQ controller.
It handles connection, login, reconnection, and message passing to the coordinator.
This file is heavily commented for clarity and non-engineer readability.
"""

import asyncio
import json
import logging
import websockets

_LOGGER = logging.getLogger(__name__)

class MuxallBBQWebSocketClient:
    """
    WebSocket client for the Muxall BBQ controller.
    Handles connection, login, reconnection, and message passing.
    """
    def __init__(self, url, username=None, password=None):
        # WebSocket server URL and optional credentials
        self._url = url
        self._username = username
        self._password = password
        self._ws = None
        self._connected = False
        self._authenticated = False
        self._message_callback = None
        self._coordinator = None  # Set externally if needed

    def set_message_callback(self, callback):
        # Register a callback to handle incoming messages
        self._message_callback = callback

    async def connect(self):
        # Main connection loop: try to connect, login, and listen for messages
        while True:
            try:
                _LOGGER.info("Connecting to %s", self._url)
                self._ws = await websockets.connect(self._url)
                self._connected = True
                # After connecting, perform handshake/login
                await self._handshake_and_login()
                # After login, request full state from the controller
                if self._message_callback and hasattr(self._message_callback, "__self__"):
                    coordinator = self._message_callback.__self__
                    if hasattr(coordinator, "request_full_state"):
                        await coordinator.request_full_state()
                # Listen for incoming messages
                await self._listen()
            except Exception as e:
                _LOGGER.error("WebSocket error: %s", e)
            # On error or disconnect, update state and try to reconnect after delay
            self._connected = False
            self._authenticated = False
            await asyncio.sleep(5)  # Reconnect after delay

    async def _handshake_and_login(self):
        # Send REGISTER message as a plain string if credentials are provided
        if self._username and self._password:
            # Build the REGISTER message
            login_msg = f"REGISTER: id={self._username},userPassword={self._password}"
            await self._ws.send(login_msg)
            resp = await self._ws.recv()
            if resp.startswith("OK: REGISTER"):
                self._authenticated = True
                _LOGGER.info("Login successful")
            else:
                _LOGGER.error("Login failed: %s", resp)
                raise Exception("Login failed")
        else:
            self._authenticated = True  # If no login required

    async def _listen(self):
        # Listen for messages from the server and handle each one
        async for message in self._ws:
            await self._handle_message(message)

    async def _handle_message(self, message):
        # Parse and route each incoming message
        _LOGGER.debug("Received message: %s", message)
        try:
            if message.strip().startswith("{"):
                # Parse as JSON if the message looks like JSON
                data = json.loads(message)
                if self._message_callback:
                    await self._message_callback(data)
            else:
                # Handle plain text messages (e.g., OK: REGISTER, OK: GET, etc.)
                if self._message_callback:
                    await self._message_callback({"raw": message})
        except Exception as e:
            _LOGGER.error("Failed to parse message: %s", e)

    async def send(self, data):
        # Send a message to the server (as JSON)
        if self._ws and self._connected:
            await self._ws.send(json.dumps(data)) 
import logging
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

class MuxallBBQCoordinator(DataUpdateCoordinator):
    def __init__(self, hass, ws_client):
        super().__init__(
            hass,
            _LOGGER,
            name="Muxall BBQ Coordinator",
            update_interval=None,  # Push-based, not polling
        )
        self.ws_client = ws_client

    async def async_start(self):
        self.hass.loop.create_task(self.ws_client.connect()) 
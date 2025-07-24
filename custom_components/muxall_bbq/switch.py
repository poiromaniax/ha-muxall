"""
This file defines Home Assistant switch entities for the Muxall BBQ integration.
It exposes the BBQ power control (on/off) as a switch, using the coordinator for state and ws_client for commands.
All code is commented for non-engineer readability.
"""

from homeassistant.components.switch import SwitchEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN

async def async_setup_entry(hass, entry, async_add_entities):
    """
    Set up switch entities for the Muxall BBQ integration.
    """
    coordinator = hass.data[DOMAIN]
    async_add_entities([MuxallBBQPowerSwitch(coordinator)])

class MuxallBBQPowerSwitch(CoordinatorEntity, SwitchEntity):
    """
    Switch entity for BBQ power (on/off).
    """
    def __init__(self, coordinator):
        super().__init__(coordinator)
        self._attr_name = "BBQ Power"
        self._attr_icon = "mdi:power"
        self._attr_unique_id = "muxall_bbq_power"

    @property
    def is_on(self):
        # Reflect the actual BBQ power state from coordinator
        return self.coordinator.state["status"].get("bbqOn") == 1

    async def async_turn_on(self, **kwargs):
        # Send command to turn BBQ on
        await self.coordinator.ws_client.send({"type": "set", "bbqOn": 1})

    async def async_turn_off(self, **kwargs):
        # Send command to turn BBQ off
        await self.coordinator.ws_client.send({"type": "set", "bbqOn": 0}) 
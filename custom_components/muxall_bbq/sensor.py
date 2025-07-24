"""
This file defines Home Assistant sensor entities for the Muxall BBQ integration.
It exposes live BBQ data (temperatures, status, profile, etc.) as sensors, using the coordinator for state updates.
All code is commented for non-engineer readability.
"""

from homeassistant.components.sensor import SensorEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN

SENSOR_DEFINITIONS = [
    # (key, name, unit, icon)
    ("chamberTemp", "Chamber Temperature", "°F", "mdi:thermometer"),
    ("targetTemp", "Target Chamber Temperature", "°F", "mdi:target"),
    ("probeTemp1", "Probe 1 Temperature", "°F", "mdi:thermometer"),
    ("probeTemp2", "Probe 2 Temperature", "°F", "mdi:thermometer"),
    ("probeTemp3", "Probe 3 Temperature", "°F", "mdi:thermometer"),
    ("OutsideTemp", "Outside Temperature", "°F", "mdi:weather-sunny"),
    ("targetProbeTemp", "Target Probe Temperature", "°F", "mdi:target"),
    ("currentProfile", "Current Profile", None, "mdi:chef-hat"),
    ("timeRemaining", "Time Remaining", "min", "mdi:timer"),
    ("bbqState", "BBQ State", None, "mdi:grill"),
    ("statusFanSpeed", "Fan Speed", "%", "mdi:fan"),
    ("PelletsLevel", "Pellet Hopper Level", "%", "mdi:barley"),
    ("rptcVer", "Firmware Version", None, "mdi:chip"),
    ("smokeProfile", "Smoke Profile", None, "mdi:smoke"),
]

async def async_setup_entry(hass, entry, async_add_entities):
    """
    Set up sensor entities for the Muxall BBQ integration.
    """
    coordinator = hass.data[DOMAIN]
    entities = []
    for key, name, unit, icon in SENSOR_DEFINITIONS:
        entities.append(MuxallBBQSensor(coordinator, key, name, unit, icon))
    async_add_entities(entities)

class MuxallBBQSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor entity for a single BBQ data point.
    """
    def __init__(self, coordinator, key, name, unit, icon):
        super().__init__(coordinator)
        self._key = key
        self._attr_name = name
        self._attr_native_unit_of_measurement = unit
        self._attr_icon = icon
        self._attr_unique_id = f"muxall_bbq_{key}"

    @property
    def state(self):
        # Get the latest value from the coordinator's state
        return self.coordinator.state["status"].get(self._key) or \
               self.coordinator.state["config"].get(self._key) or \
               self.coordinator.state["update"].get(self._key)

    @property
    def extra_state_attributes(self):
        # Expose smokeProfile as an attribute on all sensors
        attrs = {}
        smoke_profile = self.coordinator.state["status"].get("smokeProfile")
        if smoke_profile is not None:
            attrs["smoke_profile"] = smoke_profile
        return attrs 
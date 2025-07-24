# Muxall BBQ Home Assistant Integration

This integration connects your Muxall BBQ controller to Home Assistant, providing live monitoring and control of your BBQ from the Home Assistant UI.

## Overview
- **Live Data:** See real-time chamber, probe, and outside temperatures, pellet level, fan speed, and more.
- **Control:** Start/stop the BBQ directly from Home Assistant.
- **Profiles & Status:** Monitor current cooking profile, time remaining, and smoke profile.
- **Firmware & Diagnostics:** View firmware version and update status.

## How It Works
- The integration connects to your BBQ controller using a WebSocket connection.
- All live values are fetched directly from the controller—no caching is used.
- State is managed by a central coordinator, which updates Home Assistant entities whenever new data arrives.
- User actions (e.g., turning the BBQ on/off) are sent to the controller and reflected in the UI only after confirmation from the device.

## Setup Instructions
1. Copy the `muxall_bbq` directory into your Home Assistant `custom_components` folder.
2. Restart Home Assistant.
3. Add the "Muxall BBQ Controller" integration via the Home Assistant UI and enter your controller's WebSocket URL and credentials.
4. Entities will be automatically created for all supported sensors and controls.

## Entities

| Entity ID                        | Type         | Description                                      |
|----------------------------------|--------------|--------------------------------------------------|
| sensor.muxall_bbq_chamber_temp   | Sensor       | Current chamber temperature                       |
| sensor.muxall_bbq_target_temp    | Sensor       | Target chamber temperature                        |
| sensor.muxall_bbq_probe1_temp    | Sensor       | Probe 1 temperature                              |
| sensor.muxall_bbq_probe2_temp    | Sensor       | Probe 2 temperature                              |
| sensor.muxall_bbq_probe3_temp    | Sensor       | Probe 3 temperature                              |
| sensor.muxall_bbq_outside_temp   | Sensor       | Outside temperature                              |
| sensor.muxall_bbq_target_probe_temp | Sensor    | Target probe temperature (active probe)           |
| sensor.muxall_bbq_current_profile| Sensor       | Current cooking profile                           |
| sensor.muxall_bbq_time_remaining | Sensor       | Time remaining in current profile (minutes)       |
| sensor.muxall_bbq_state          | Sensor       | BBQ state (OFF, RUN, etc.)                        |
| sensor.muxall_bbq_fan_speed      | Sensor       | Fan speed (%)                                    |
| sensor.muxall_bbq_pellets_level  | Sensor       | Pellet hopper level (%)                           |
| sensor.muxall_bbq_firmware_version | Sensor     | Firmware version                                 |
| sensor.muxall_bbq_smoke_profile  | Sensor/Attr  | Current smoke profile (also as attribute)         |
| switch.muxall_bbq_power          | Switch       | Turn BBQ on/off                                   |

**Note:** Many sensors also expose extra attributes, such as `smoke_profile`, for richer automations.

## Project Flow
- The integration uses a coordinator pattern: all state is managed centrally and pushed to Home Assistant entities.
- Sensors and switches subscribe to the coordinator for updates.
- All code is commented for clarity and non-engineers.

## State Management
- The integration always shows live values from the controller.
- On reconnect, all state is re-fetched to ensure accuracy.
- No user changes are applied without confirmation from the controller.

## Reference
- This integration was reverse engineered from the official Muxall BBQ web UI and adheres to Home Assistant development guidelines: https://developers.home-assistant.io/

---

For more details or troubleshooting, see the code comments or contact the project maintainers. 
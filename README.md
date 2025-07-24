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

| Entity ID / Attribute                      | Type           | Description                                      |
|--------------------------------------------|----------------|--------------------------------------------------|
| sensor.muxall_bbq_chamber_temp             | Sensor         | Current chamber temperature                       |
| sensor.muxall_bbq_target_temp              | Sensor         | Target chamber temperature                        |
| sensor.muxall_bbq_probe1_temp              | Sensor         | Probe 1 temperature                              |
| sensor.muxall_bbq_probe2_temp              | Sensor         | Probe 2 temperature                              |
| sensor.muxall_bbq_probe3_temp              | Sensor         | Probe 3 temperature                              |
| sensor.muxall_bbq_outside_temp             | Sensor         | Outside temperature                              |
| sensor.muxall_bbq_target_probe_temp        | Sensor         | Target probe temperature (active probe)           |
| sensor.muxall_bbq_current_profile          | Sensor         | Current cooking profile                           |
| sensor.muxall_bbq_time_remaining           | Sensor         | Time remaining in current profile (minutes)       |
| sensor.muxall_bbq_state                    | Sensor         | BBQ state (OFF, RUN, etc.)                        |
| sensor.muxall_bbq_fan_speed                | Sensor         | Fan speed (%)                                    |
| sensor.muxall_bbq_pellets_level            | Sensor         | Pellet hopper level (%)                           |
| sensor.muxall_bbq_firmware_version         | Sensor         | Firmware version                                 |
| sensor.muxall_bbq_smoke_profile            | Sensor/Attr    | Current smoke profile (also as attribute)         |
| sensor.muxall_bbq_device_state             | Sensor/Diag    | Device state (READY, SYNC, etc.)                  |
| sensor.muxall_bbq_client_state             | Sensor/Diag    | Client state (OFFLINE, READY, etc.)               |
| sensor.muxall_bbq_rest_time                | Sensor/Attr    | Rest time after cook (minutes)                    |
| sensor.muxall_bbq_cook_by_probe_number     | Sensor/Attr    | Which probe is used for cook-by-probe             |
| sensor.muxall_bbq_total_auger_run_minutes  | Sensor         | Total auger run time (min)                        |
| sensor.muxall_bbq_full_to_empty_auger_minutes | Sensor/Attr | Full-to-empty auger run time (min)                |
| sensor.muxall_bbq_igniter_on_time          | Sensor/Attr    | Igniter on time (min)                             |
| sensor.muxall_bbq_ignite_fire_auger_on_time| Sensor/Attr    | Ignite fire auger DC (sec/min)                    |
| sensor.muxall_bbq_cool_down_time           | Sensor/Attr    | Cool down time (min)                              |
| sensor.muxall_bbq_patc_mode                | Sensor/Attr    | PATC mode                                         |
| sensor.muxall_bbq_slew_rate                | Sensor/Attr    | Slew rate                                         |
| sensor.muxall_bbq_temp_scale               | Sensor/Attr    | Temperature scale (F/C)                            |
| sensor.muxall_bbq_update_status            | Sensor         | Update status                                     |
| sensor.muxall_bbq_wifi_ssid                | Sensor/Diag    | WiFi SSID                                         |
| sensor.muxall_bbq_wifi_rssi                | Sensor/Diag    | WiFi signal strength                              |
| sensor.muxall_bbq_ip_address               | Sensor/Diag    | IP address                                        |
| sensor.muxall_bbq_host_name                | Sensor/Diag    | Controller name                                   |
| sensor.muxall_bbq_post_rate                | Sensor/Diag    | Post rate (seconds)                               |
| sensor.muxall_bbq_last_error               | Sensor/Diag    | Last error message                                |
| sensor.muxall_bbq_console_output           | Attribute/Diag | Debug console output                              |
| sensor.muxall_bbq_chamber_temp (attribute) | Attribute      | Temperature history (for graphing)                |
| switch.muxall_bbq_power                    | Switch         | Turn BBQ on/off                                   |
| switch.muxall_bbq_manual_fan               | Switch         | Manual fan override                               |
| switch.muxall_bbq_manual_auger             | Switch         | Manual auger override                             |
| switch.muxall_bbq_manual_phv               | Switch         | Manual PHV override                               |
| binary_sensor.muxall_bbq_auger_on          | Binary Sensor  | Auger ON status                                   |
| binary_sensor.muxall_bbq_pellets_tracking  | Binary Sensor  | Pellet level tracking enabled                     |
| binary_sensor.muxall_bbq_flame_out_detect  | Binary Sensor  | Flame-out detection enabled                       |
| binary_sensor.muxall_bbq_profile1_hold     | Binary Sensor  | Profile 1 hold flag                               |
| binary_sensor.muxall_bbq_profile2_hold     | Binary Sensor  | Profile 2 hold flag                               |
| binary_sensor.muxall_bbq_profile3_hold     | Binary Sensor  | Profile 3 hold flag                               |
| binary_sensor.muxall_bbq_profile4_hold     | Binary Sensor  | Profile 4 hold flag                               |
| binary_sensor.muxall_bbq_probe_cook        | Binary Sensor  | Cook by probe enabled                             |
| binary_sensor.muxall_bbq_smoke_when_done   | Binary Sensor  | Smoke when done                                   |
| binary_sensor.muxall_bbq_post_stats        | Binary Sensor  | Post stats enabled                                |
| binary_sensor.muxall_bbq_debug_console     | Binary Sensor  | Show debug console                                |
| binary_sensor.muxall_bbq_dhcp              | Binary Sensor  | DHCP enabled                                      |
| binary_sensor.muxall_bbq_mdns              | Binary Sensor  | mDNS enabled                                      |

**Note:** Many attributes (e.g., `smoke_profile`, probe types, network info) are exposed on main sensors for richer automations and diagnostics.

## Project Flow
- The integration uses a coordinator pattern: all state is managed centrally and pushed to Home Assistant entities.
- Sensors, switches, and binary sensors subscribe to the coordinator for updates.
- All code is commented for clarity and non-engineers.

## State Management
- The integration always shows live values from the controller.
- On reconnect, all state is re-fetched to ensure accuracy.
- No user changes are applied without confirmation from the controller.

## Reference
- This integration was reverse engineered from the official Muxall BBQ web UI and adheres to Home Assistant development guidelines: https://developers.home-assistant.io/

---

For more details or troubleshooting, see the code comments or contact the project maintainers. 
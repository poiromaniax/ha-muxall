import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from .const import DOMAIN
import re

# User now only enters hostname or IP (optionally with port/path)
DATA_SCHEMA = vol.Schema({
    vol.Required("host"): str,
    vol.Optional("username"): str,
    vol.Optional("password"): str,
})

# Simple regex for validating host:port/path (not exhaustive, but user-friendly)
HOST_REGEX = re.compile(r"^([a-zA-Z0-9_.-]+)(:[0-9]+)?(/[\w\-./]*)?$")

class MuxallBBQConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Muxall BBQ Controller. User enters only hostname or IP."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            host = user_input.get("host", "").strip()
            # Validate host using regex
            if not host:
                errors["host"] = "required"
            elif not HOST_REGEX.match(host):
                errors["host"] = "invalid_host"
            else:
                # Try to build the ws:// URL and check for obvious issues
                url = f"ws://{host.rstrip('/')}" + "/"
                if not url.startswith("ws://") or " " in url:
                    errors["host"] = "invalid_url"
            if not errors:
                return self.async_create_entry(title="Muxall BBQ Controller", data=user_input)
        return self.async_show_form(
            step_id="user",
            data_schema=DATA_SCHEMA,
            errors=errors,
            description_placeholders={
                "host": "Enter the BBQ controller's hostname or IP (optionally with port/path, e.g. 192.168.0.9 or 192.168.0.9:8080/abp/abp)"
            }
        ) 
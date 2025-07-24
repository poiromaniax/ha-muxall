import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from .const import DOMAIN

DATA_SCHEMA = vol.Schema({
    vol.Required("url"): str,
    vol.Optional("username"): str,
    vol.Optional("password"): str,
})

class MuxallBBQConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Muxall BBQ Controller."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            url = user_input.get("url", "").strip()
            if not url:
                errors["url"] = "required"
            if not errors:
                return self.async_create_entry(title="Muxall BBQ Controller", data=user_input)
        return self.async_show_form(
            step_id="user",
            data_schema=DATA_SCHEMA,
            errors=errors,
        ) 
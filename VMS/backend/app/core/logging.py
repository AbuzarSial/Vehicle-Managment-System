"""Logging configuration for the app."""

import logging


def configure_logging():
    """Configure basic logging for the app."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    )


configure_logging()

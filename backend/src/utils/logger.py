import logging
import colorlog
from pathlib import Path


def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)

    # ── Coloured console handler ──────────────────────────────────────
    console = colorlog.StreamHandler()
    console.setLevel(logging.DEBUG)
    console.setFormatter(colorlog.ColoredFormatter(
        "%(log_color)s[%(asctime)s] [%(levelname)-8s]%(reset)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
        log_colors={
            "DEBUG":    "cyan",
            "INFO":     "green",
            "WARNING":  "yellow",
            "ERROR":    "red",
            "CRITICAL": "bold_red",
        },
    ))
    logger.addHandler(console)

    # ── Plain file handler ────────────────────────────────────────────
    try:
        from src.config.settings import settings
        log_path = Path(settings.log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_path)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(logging.Formatter(
            "[%(asctime)s] [%(levelname)s] %(name)s: %(message)s"
        ))
        logger.addHandler(file_handler)
    except Exception:
        pass  # settings not yet available on very first import

    logger.propagate = False
    return logger
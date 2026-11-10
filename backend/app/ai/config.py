"""Secure configuration loader for NVIDIA AI API integration.

Stateless, Zero-Storage, never exposes keys or endpoints to the client.
"""

import os
import re
from typing import Optional, Tuple
from urllib.parse import urlparse

ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))


def load_nvidia_credentials() -> Tuple[Optional[str], Optional[str], str, str]:
    """Reads invoke_url, API key, model, and fallback_model from environment/.env.
    
    Supports:
      - NVIDIA_INVOKE_URL / invoke_url
      - NVIDIA_API_KEY
      - NVIDIA_MODEL / model
      - NVIDIA_FALLBACK_MODEL / fallback_model
    """
    invoke_url = os.environ.get("NVIDIA_INVOKE_URL") or os.environ.get("invoke_url")
    api_key = os.environ.get("NVIDIA_API_KEY")
    model = os.environ.get("NVIDIA_MODEL") or os.environ.get("model")
    fallback_model = os.environ.get("NVIDIA_FALLBACK_MODEL") or os.environ.get("fallback_model")

    if not invoke_url or not api_key:
        if os.path.exists(ENV_PATH):
            try:
                with open(ENV_PATH, "r", encoding="utf-8") as f:
                    content = f.read()

                if not invoke_url:
                    u_match = re.search(r"""invoke_url\s*=\s*["\x27]([^"\x27]+)["\x27]""", content)
                    if u_match:
                        invoke_url = u_match.group(1).strip()

                if not api_key:
                    k_match = re.search(r"""Bearer\s+([a-zA-Z0-9_\-\.]+)""", content)
                    if k_match:
                        api_key = k_match.group(1).strip()

                if not model:
                    m_match = re.search(r"""NVIDIA_MODEL\s*=\s*["\x27]([^"\x27]+)["\x27]""", content)
                    if not m_match:
                        m_match = re.search(r"""["\x27]model["\x27]\s*:\s*["\x27]([^"\x27]+)["\x27]""", content)
                    if not m_match:
                        m_match = re.search(r"""model\s*=\s*["\x27]([^"\x27]+)["\x27]""", content)
                    if m_match:
                        model = m_match.group(1).strip()

                if not fallback_model:
                    fb_match = re.search(r"""NVIDIA_FALLBACK_MODEL\s*=\s*["\x27]([^"\x27]+)["\x27]""", content)
                    if fb_match:
                        fallback_model = fb_match.group(1).strip()
            except Exception:
                pass

    if not model or model == "minimaxai/minimax-m3.1-flash":
        model = "nvidia/nemotron-3.5-bolt-e4b"

    if not fallback_model:
        fallback_model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"

    return invoke_url, api_key, model, fallback_model


def is_ai_configured() -> bool:
    """Returns True if valid URL and API key are configured."""
    url, key, _, _ = load_nvidia_credentials()
    return bool(url and key)

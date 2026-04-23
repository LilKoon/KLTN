import httpx
import re
from database import settings


def _clean_json(text: str) -> str:
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    return text.strip()


def qwen_chat(
    messages: list[dict],
    system_prompt: str = "",
    max_tokens: int = 1024,
    json_mode: bool = False,
) -> str:
    """
    Qwen3-8B via Ollama local or OpenAI-compatible API.
    Run: `ollama pull qwen3:8b && ollama serve`
    """
    base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')

    formatted_messages = []
    if system_prompt:
        formatted_messages.append({"role": "system", "content": system_prompt})
    formatted_messages.extend(messages)

    payload = {
        "model": "qwen3:8b",
        "messages": formatted_messages,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.3,
        }
    }

    try:
        response = httpx.post(
            f"{base_url}/api/chat",
            json=payload,
            timeout=120.0
        )
        response.raise_for_status()
        text = response.json()["message"]["content"]
        return _clean_json(text) if json_mode else text
    except httpx.ConnectError:
        raise RuntimeError("Qwen3 (Ollama) không khả dụng. Kiểm tra `ollama serve`.")
    except Exception as e:
        raise RuntimeError(f"Qwen3 error: {str(e)}")

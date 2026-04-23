from groq import Groq
import re
from database import settings

_client = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _clean_json(text: str) -> str:
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()


def groq_chat(
    messages: list[dict],
    system_prompt: str = "",
    model: str = "llama-3.3-70b-versatile",
    max_tokens: int = 2048,
    json_mode: bool = False,
) -> str:
    client = get_groq_client()

    formatted = [{"role": "system", "content": system_prompt}] if system_prompt else []
    for msg in messages:
        formatted.append({"role": msg["role"], "content": msg["content"]})

    kwargs = {
        "model": model,
        "messages": formatted,
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)
    text = response.choices[0].message.content
    return _clean_json(text) if json_mode else text

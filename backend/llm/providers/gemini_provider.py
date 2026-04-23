import google.generativeai as genai
import re
from database import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


def _clean_json(text: str) -> str:
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()


async def gemini_chat(
    messages: list[dict],
    system_prompt: str = "",
    model: str = "gemini-2.0-flash",
    max_tokens: int = 2048,
    json_mode: bool = False,
) -> str:
    """
    messages format: [{"role": "user"|"model", "content": str}]
    """
    model_obj = genai.GenerativeModel(
        model_name=model,
        **(dict(system_instruction=system_prompt) if system_prompt else {}),
        generation_config=genai.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.3,
            **({"response_mime_type": "application/json"} if json_mode else {})
        )
    )

    history = []
    last_user_msg = ""
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        content = msg["content"]
        if role == "user":
            last_user_msg = content
        history.append({"role": role, "parts": [content]})

    chat = model_obj.start_chat(history=history[:-1] if len(history) > 1 else [])
    response = await chat.send_message_async(last_user_msg)

    text = response.text
    return _clean_json(text) if json_mode else text

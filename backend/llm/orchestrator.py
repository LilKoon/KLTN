from enum import Enum
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class LLMTask(str, Enum):
    CHAT_RAG       = "chat_rag"
    QUIZ_EXTRACT   = "quiz_extract"
    FLASHCARD_GEN  = "flashcard_gen"
    CLASSIFY_LEVEL = "classify_level"
    SUMMARIZE      = "summarize"
    CHAT_GENERAL   = "chat_general"


# (primary_provider, primary_model, fallback_provider, fallback_model)
# Fallback uses llama-3.1-8b-instant (much smaller = lower TPM, different quota bucket)
ROUTING_TABLE = {
    LLMTask.CHAT_RAG:       ("groq", "llama-3.3-70b-versatile", "groq", "llama-3.1-8b-instant"),
    LLMTask.QUIZ_EXTRACT:   ("groq", "llama-3.3-70b-versatile", "groq", "llama-3.1-8b-instant"),
    LLMTask.FLASHCARD_GEN:  ("groq", "llama-3.3-70b-versatile", "groq", "llama-3.1-8b-instant"),
    LLMTask.CLASSIFY_LEVEL: ("groq", "gemma2-9b-it",            "groq", "llama-3.1-8b-instant"),
    LLMTask.SUMMARIZE:      ("groq", "llama-3.3-70b-versatile", "groq", "llama-3.1-8b-instant"),
    LLMTask.CHAT_GENERAL:   ("groq", "llama-3.3-70b-versatile", "groq", "llama-3.1-8b-instant"),
}


async def call_llm(
    task: LLMTask,
    messages: list[dict],
    system_prompt: str = "",
    max_tokens: int = 1500,
    json_mode: bool = False,
    force_provider: Optional[str] = None,
) -> dict:
    """
    Routes to the appropriate LLM provider with automatic fallback.
    Returns: {"text": str, "provider": str, "model": str, "used_fallback": bool}
    """
    from .providers.gemini_provider import gemini_chat
    from .providers.groq_provider import groq_chat
    from .providers.qwen_provider import qwen_chat

    primary_provider, primary_model, fallback_provider, fallback_model = ROUTING_TABLE[task]

    if force_provider:
        primary_provider = force_provider

    async def _call(provider: str, model: Optional[str]) -> str:
        if provider == "gemini":
            return await gemini_chat(messages, system_prompt,
                                     model or "gemini-2.0-flash",
                                     max_tokens, json_mode)
        elif provider == "groq":
            return groq_chat(messages, system_prompt,
                             model or "llama-3.3-70b-versatile",
                             max_tokens, json_mode)
        elif provider == "qwen":
            return qwen_chat(messages, system_prompt, max_tokens, json_mode)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    try:
        text = await _call(primary_provider, primary_model)
        return {
            "text": text,
            "provider": primary_provider,
            "model": primary_model or "default",
            "used_fallback": False,
        }
    except Exception as e:
        logger.warning(f"Primary LLM ({primary_provider}) failed: {e}. Trying fallback...")

    try:
        text = await _call(fallback_provider, fallback_model)
        return {
            "text": text,
            "provider": fallback_provider,
            "model": fallback_model or "default",
            "used_fallback": True,
        }
    except Exception as e:
        logger.error(f"Fallback LLM ({fallback_provider}) also failed: {e}")
        raise RuntimeError(f"All LLM providers failed. Task: {task}")

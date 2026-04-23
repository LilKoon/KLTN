import sys, asyncio
sys.path.insert(0, '.')

from llm.orchestrator import call_llm, LLMTask

async def main():
    try:
        result = await call_llm(
            task=LLMTask.FLASHCARD_GEN,
            messages=[{'role': 'user', 'content': 'Generate 1 English flashcard for food at A1 level. Return JSON array with one item.'}],
            system_prompt='You are an English teacher. Respond ONLY with a valid JSON array.',
            max_tokens=200,
            json_mode=True,
        )
        print('OK:', result)
    except Exception as e:
        print('FAIL:', type(e).__name__, e)

asyncio.run(main())

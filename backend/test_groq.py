import sys
sys.path.insert(0, '.')
from groq import Groq
from database import settings
client = Groq(api_key=settings.GROQ_API_KEY)
try:
    resp = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'user', 'content': 'say hi'}],
        max_tokens=10
    )
    print('OK:', resp.choices[0].message.content)
except Exception as e:
    print('FAIL:', e)

import os
import tempfile
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyMuPDFLoader, Docx2txtLoader
from schemas import FlashcardItemDetail
from database import settings

# Load API Key explicitly securely from settings based on .env
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.2, 
    api_key=settings.GEMINI_API_KEY
)

def normalize_topic(raw_topic: str) -> str:
    """Uses a cheap LLM call to normalize a topic string to a single English keyword."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Translate and normalize the user's topic to a single English noun keyword, lowercase. Do not add any extra text or punctuation. For example: 'bệnh viện' -> 'hospital', 'Trường Học ' -> 'school'."),
        ("user", "{topic}")
    ])
    chain = prompt | llm
    result = chain.invoke({"topic": raw_topic})
    return result.content.strip().lower()

class FlashcardList(FlashcardItemDetail):
    pass # Wait, list validation is better done explicitly

# Define Pydantic Schema wrapper for List
from pydantic import BaseModel
class FlashcardCollection(BaseModel):
    flashcards: List[FlashcardItemDetail]

def generate_flashcards(topic: str) -> List[FlashcardItemDetail]:
    """Generates a list of flashcards for a given topic using Structured Output."""
    list_llm = llm.with_structured_output(FlashcardCollection)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert English teacher. Generate exactly 10 useful vocabulary flashcards related to the topic '{topic}'. Provide the word, type of word (Noun, Verb, etc), pronunciation (IPA), meaning in Vietnamese, and an English example sentence."),
        ("user", "Topic: {topic}")
    ])
    
    chain = prompt | list_llm
    result = chain.invoke({"topic": topic})
    return result.flashcards

def extract_topics_from_file(file_content: bytes, filename: str) -> str:
    """Reads a PDF/DOCX and extracts the main topic in exactly one English word."""
    # Write to temp file to use loaders
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{filename.split('.')[-1]}") as temp_file:
        temp_file.write(file_content)
        temp_path = temp_file.name

    try:
        if filename.endswith(".pdf"):
            loader = PyMuPDFLoader(temp_path)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            loader = Docx2txtLoader(temp_path)
        else:
            raise ValueError("Unsupported file format")
            
        docs = loader.load()
        full_text = "\n".join([doc.page_content for doc in docs])
        
        # Summarize to 1 keyword using minimal tokens
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Read the following document text and identify the single most important thematic English noun that summarizes it. Reply ONLY with that one lowercase English noun (e.g. 'biology', 'economy', 'airport')."),
            ("user", "Document Text:\n{text}")
        ])
        chain = prompt | llm
        
        # truncate text to avoid token limits for simple extraction
        result = chain.invoke({"text": full_text[:12000]}) 
        return result.content.strip().lower()
    finally:
        os.unlink(temp_path)

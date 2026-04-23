import logging
import PyPDF2
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

_ocr_reader = None

MIN_TEXT_CHARS = 50  # below this per page -> treat as scanned


def _get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr
        logger.info("Loading EasyOCR model (first time may take a while)...")
        _ocr_reader = easyocr.Reader(['en', 'vi'], gpu=False, verbose=False)
        logger.info("EasyOCR ready.")
    return _ocr_reader


def _ocr_pdf(pdf_path: str) -> str:
    import fitz  # pymupdf
    reader = _get_ocr_reader()
    doc = fitz.open(pdf_path)
    pages_text = []
    for page_num, page in enumerate(doc):
        mat = fitz.Matrix(2.0, 2.0)  # 2x zoom -> ~144 dpi
        pix = page.get_pixmap(matrix=mat)
        img_bytes = pix.tobytes("png")
        results = reader.readtext(img_bytes, detail=0, paragraph=True)
        page_text = " ".join(results)
        pages_text.append(page_text)
        logger.info(f"OCR page {page_num + 1}/{len(doc)}: {len(page_text)} chars")
    doc.close()
    return "\n\n".join(pages_text).strip()


def extract_text_from_pdf(pdf_path: str, use_ocr_fallback: bool = True) -> str:
    """Extract text from PDF. Falls back to EasyOCR for scanned pages."""
    text_pages = []
    scanned_pages = []

    try:
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for i, page in enumerate(reader.pages):
                page_text = (page.extract_text() or "").strip()
                text_pages.append(page_text)
                if len(page_text) < MIN_TEXT_CHARS:
                    scanned_pages.append(i)
    except Exception as e:
        logger.warning(f"PyPDF2 failed: {e}, trying OCR directly")
        if use_ocr_fallback:
            return _ocr_pdf(pdf_path)
        raise

    total_text = "\n".join(text_pages).strip()

    # All pages are scanned -> full OCR
    if len(scanned_pages) == len(text_pages) and use_ocr_fallback:
        logger.info(f"All {len(text_pages)} pages appear scanned, running full OCR")
        return _ocr_pdf(pdf_path)

    # Some pages are scanned -> OCR those pages only
    if scanned_pages and use_ocr_fallback:
        logger.info(f"Pages {scanned_pages} appear scanned, running partial OCR")
        import fitz
        ocr_reader = _get_ocr_reader()
        doc = fitz.open(pdf_path)
        for i in scanned_pages:
            page = doc[i]
            pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
            results = ocr_reader.readtext(pix.tobytes("png"), detail=0, paragraph=True)
            text_pages[i] = " ".join(results)
        doc.close()
        total_text = "\n".join(text_pages).strip()

    return total_text


def split_into_chunks(text: str, chunk_size: int = 512, overlap: int = 64) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)
    return [
        {"text": chunk, "chunk_id": i, "char_start": text.find(chunk)}
        for i, chunk in enumerate(chunks)
        if chunk.strip()
    ]


def process_pdf(pdf_path: str) -> list[dict]:
    raw_text = extract_text_from_pdf(pdf_path)
    if not raw_text:
        raise ValueError("Kh\u00f4ng th\u1ec3 \u0111\u1ecdc n\u1ed9i dung PDF (c\u1ea3 PyPDF2 v\u00e0 OCR \u0111\u1ec1u th\u1ea5t b\u1ea1i)")
    return split_into_chunks(raw_text)

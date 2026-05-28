import os
import sys

def parse_pdf():
    try:
        import pypdf
    except ImportError:
        print("pypdf not found, installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
        import pypdf

    pdf_path = "hackathon_deck.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return

    print("Extracting text from PDF...")
    reader = pypdf.PdfReader(pdf_path)
    text_content = []
    
    for idx, page in enumerate(reader.pages):
        text = page.extract_text()
        text_content.append(f"## Slide {idx + 1}\n\n{text}\n")
        
    output_path = "scratch_pdf_text.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# Hackathon Deck Text Content\n\n")
        f.write("\n".join(text_content))
        
    print(f"Successfully extracted text to {output_path}")

if __name__ == "__main__":
    parse_pdf()

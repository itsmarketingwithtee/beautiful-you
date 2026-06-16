from PIL import Image
import requests
from io import BytesIO

images = {
    'hero-wellness.png': 'https://cdn.abacus.ai/images/3598b546-9474-4791-b601-9bab5147ea2f.png',
    'hero-community.png': 'https://cdn.abacus.ai/images/835e1ee2-0c47-44c9-9709-47d78dac16d7.png',
    'hero-affirmation.png': 'https://cdn.abacus.ai/images/2d888664-12b0-4b4e-abe0-4e0c25b04dfc.png',
    'hero-mood.png': 'https://cdn.abacus.ai/images/4b09150f-ff4b-4913-b617-0b35791a87a1.png',
    'hero-resources.png': 'https://cdn.abacus.ai/images/d2d6b431-5c1d-4ffa-93d1-23865274fe92.png'
}

for filename, url in images.items():
    print(f"Downloading and resizing {filename}...")
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    
    # Resize to 800x400
    img_resized = img.resize((800, 400), Image.Resampling.LANCZOS)
    
    # Save
    img_resized.save(filename)
    print(f"✓ Saved {filename} (800x400px)")

print("\nAll images saved successfully!")

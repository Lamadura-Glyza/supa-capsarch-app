from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure pytesseract path (update this for your system)
# For Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# For macOS: pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'
# For Linux: pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'OCR service is running'})

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
    """OCR endpoint to extract text from base64 image"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image']
        
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to OpenCV format (RGB to BGR)
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Preprocess image for better OCR
        # Convert to grayscale
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to preprocess the image
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Apply median blur to remove noise
        gray = cv2.medianBlur(gray, 3)
        
        # Perform OCR
        text = pytesseract.image_to_string(gray)
        
        # Clean up the extracted text
        text = text.strip()
        
        if not text:
            return jsonify({'error': 'No text found in image'}), 400
        
        return jsonify({
            'success': True,
            'text': text,
            'message': 'Text extracted successfully'
        })
        
    except Exception as e:
        print(f"Error processing OCR: {str(e)}")
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({'message': 'Flask OCR server is running!'})

if __name__ == '__main__':
    print("Starting Flask OCR Server...")
    print("Make sure you have installed the required dependencies:")
    print("pip install flask flask-cors opencv-python pytesseract pillow")
    print("\nAlso install Tesseract OCR:")
    print("Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
    print("macOS: brew install tesseract")
    print("Linux: sudo apt-get install tesseract-ocr")
    print("\nUpdate the tesseract path in the code if needed.")
    print("\nServer will start on http://localhost:5000")
    print("Update the FLASK_API_URL in your React Native app to match your IP address.")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 
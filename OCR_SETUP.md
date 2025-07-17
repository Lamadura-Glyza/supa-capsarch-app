# OCR Feature Setup Guide

This guide will help you set up the OCR (Optical Character Recognition) feature for your React Native app with a Flask backend.

## Prerequisites

- React Native/Expo app (already set up)
- Python 3.7+ installed
- Tesseract OCR installed on your system

## 1. Flask Backend Setup

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Install Tesseract OCR

**Windows:**
1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install and add to PATH
3. Update the path in `flask_ocr_server.py` if needed:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### Start Flask Server

```bash
python flask_ocr_server.py
```

The server will start on `http://localhost:5000`

## 2. React Native App Setup

### Dependencies Already Installed

The following dependencies have been added to your project:
- `expo-image-picker` - For image selection and camera capture
- `expo-file-system` - For file operations and base64 conversion

### Update IP Address

1. Find your computer's IP address:
   - Windows: `ipconfig`
   - macOS/Linux: `ifconfig` or `ip addr`

2. Update the IP address in `lib/ocrService.js`:
   ```javascript
   const FLASK_API_URL = 'http://YOUR_IP_ADDRESS:5000';
   ```

## 3. Supabase Database Setup

### Create the `scans` table

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    extracted_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own scans
CREATE POLICY "Users can view own scans" ON scans
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own scans
CREATE POLICY "Users can insert own scans" ON scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own scans
CREATE POLICY "Users can update own scans" ON scans
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own scans
CREATE POLICY "Users can delete own scans" ON scans
    FOR DELETE USING (auth.uid() = user_id);
```

### Optional: Create Storage Bucket

If you want to store images in Supabase Storage:

```sql
-- Create storage bucket for scans
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scans', 'scans', true);

-- Create policy for public access to scan images
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'scans');

-- Create policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'scans' AND auth.role() = 'authenticated');
```

## 4. Testing the Setup

### Test Flask Backend

1. Start the Flask server
2. Visit `http://localhost:5000/test` in your browser
3. You should see: `{"message": "Flask OCR server is running!"}`

### Test React Native App

1. Start your Expo app
2. Navigate to the Upload tab
3. Switch to the "OCR Scanner" tab
4. Check if the connection status shows "Connected to OCR Service"
5. Try selecting an image and processing it

## 5. Troubleshooting

### Common Issues

**Flask server not accessible from mobile:**
- Make sure your computer and phone are on the same network
- Check if your firewall is blocking port 5000
- Verify the IP address is correct

**OCR not working:**
- Ensure Tesseract is properly installed
- Check if the image contains readable text
- Verify the image quality (good lighting, clear text)

**Supabase connection issues:**
- Check your Supabase credentials in `constants/index.js`
- Verify the `scans` table exists and has proper RLS policies

**Image upload to Supabase Storage fails:**
- Check if the storage bucket exists
- Verify storage policies are set correctly
- The app will continue without image storage if this fails

### Debug Mode

To enable debug logging, add this to your React Native app:

```javascript
// In OCRUploader.jsx, add console.log statements
console.log('Processing image...');
console.log('OCR result:', data);
```

## 6. Features Implemented

✅ Image selection from gallery  
✅ Camera capture  
✅ Base64 image conversion  
✅ Flask OCR API integration  
✅ Text extraction and display  
✅ Supabase database storage  
✅ Connection status monitoring  
✅ Error handling and user feedback  
✅ Loading states and progress indicators  
✅ Tabbed interface in Upload screen  

## 7. File Structure

```
supa-capsarch-app/
├── app/(tabs)/upload.jsx          # Updated Upload screen with tabs
├── components/OCRUploader.jsx     # OCR component
├── lib/
│   ├── supabase.js               # Supabase client
│   └── ocrService.js             # OCR API service
├── flask_ocr_server.py           # Flask backend
├── requirements.txt              # Python dependencies
└── OCR_SETUP.md                 # This guide
```

## 8. Next Steps

- Customize the UI styling to match your app's theme
- Add image preprocessing options (brightness, contrast, etc.)
- Implement batch processing for multiple images
- Add text editing capabilities before saving
- Implement search functionality for saved scans
- Add export options (PDF, text file, etc.) 
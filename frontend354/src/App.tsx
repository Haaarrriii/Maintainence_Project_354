import { useState, useEffect } from 'react';
import './App.css';
import ImageUploadComponent from './ImageUploadComponent';

function App() {
  // All state logic remains the same
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'info' | 'error'>('info');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resize, setResize] = useState(false);
  const [resizeWidth, setResizeWidth] = useState('500');
  const [resizeHeight, setResizeHeight] = useState('500');
  const [crop, setCrop] = useState(false);
  const [cropWidth, setCropWidth] = useState('250');
  const [cropHeight, setCropHeight] = useState('250');
  const [cropX, setCropX] = useState('0');
  const [cropY, setCropY] = useState('0');
  const [rotate, setRotate] = useState(false);
  const [rotateAngle, setRotateAngle] = useState('90');
  const [flip, setFlip] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [quality, setQuality] = useState(false);
  const [qualityValue, setQualityValue] = useState('85');
  const [bc, setBc] = useState(false);
  const [brightness, setBrightness] = useState('0');
  const [contrast, setContrast] = useState('0');
  const [format, setFormat] = useState(false);
  const [formatValue, setFormatValue] = useState('jpeg');

  // All handler functions remain unchanged
  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedImage]);
  const setStatus = (message: string, type: 'info' | 'error' = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
  };
  const handleImageSelected = async (file: File) => {
    setSelectedImage(file);
    setProcessedImage(null);
    setIsProcessing(true);
    setStatus('Uploading image...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8080/api/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Upload failed');
      setStatus(result.message + " Ready to apply operations.");
    } catch (error: any) {
      setStatus(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  const fetchProcessedImagePreview = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/images/download', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch preview: ${response.status} ${errorText}`);
      }
      const blob = await response.blob();
      if (processedImage) URL.revokeObjectURL(processedImage);
      const url = window.URL.createObjectURL(blob);
      setProcessedImage(url);
      setStatus('Operations applied successfully. Preview updated.');
    } catch (error: any) {
      setStatus(`Error fetching preview: ${error.message}`, 'error');
    }
  };
  const handleApply = async () => {
    const operations = [];
    if (resize) operations.push({ type: 'resize', width: Number(resizeWidth), height: Number(resizeHeight) });
    if (crop) operations.push({ type: 'crop', width: Number(cropWidth), height: Number(cropHeight), x: Number(cropX), y: Number(cropY) });
    if (rotate) operations.push({ type: 'rotate', angle: Number(rotateAngle) });
    if (flip) operations.push({ type: 'flip', horizontal: flipH, vertical: flipV });
    if (quality) operations.push({ type: 'quality', quality: Number(qualityValue) });
    if (bc) operations.push({ type: 'brightness-contrast', brightness: Number(brightness), contrast: Number(contrast) });
    if (format) operations.push({ type: 'format', format: formatValue });
    if (operations.length === 0) {
      setStatus('Please select at least one operation to apply.', 'error');
      return;
    }
    setIsProcessing(true);
    setStatus('Applying operations...');
    try {
      const response = await fetch('http://localhost:8080/api/images/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operations),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      await response.json();
      await fetchProcessedImagePreview();
    } catch (error: any) {
      setStatus(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDownload = () => {
    if (!processedImage) {
        setStatus("No processed image to download. Please apply operations first.", 'error');
        return;
    }
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = `processed_image_${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus("Download started.");
  };
  const resetAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setProcessedImage(null);
    setStatusMessage('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ImageMagick Tool</h1>
        {selectedImage && <button onClick={resetAll} className="btn btn-reset">Start Over</button>}
      </header>

      {statusMessage && (
        <div className={`status-bar ${statusType === 'error' ? 'error' : ''}`}>
          {statusMessage}
        </div>
      )}

      <main className={`main-content ${!selectedImage ? 'centered' : ''}`}>
        {!selectedImage ? (
          <div className="upload-prompt-container">
            <ImageUploadComponent onImageUpload={handleImageSelected} />
          </div>
        ) : (
          <div className="editor-layout">
            <aside className="controls-panel">
              <h2>Operations</h2>

              <div className={`operation-group ${resize ? 'active' : ''}`}>
                <div className="operation-group-header" onClick={() => setResize(!resize)}>
                  Resize
                </div>
                {resize && <div className="operation-inputs">
                  <input placeholder="Width" value={resizeWidth} onChange={e => setResizeWidth(e.target.value)} type="number" />
                  <input placeholder="Height" value={resizeHeight} onChange={e => setResizeHeight(e.target.value)} type="number" />
                </div>}
              </div>

              <div className={`operation-group ${crop ? 'active' : ''}`}>
                 <div className="operation-group-header" onClick={() => setCrop(!crop)}>
                  Crop
                </div>
                {crop && <div className="operation-inputs">
                  <input placeholder="Width" value={cropWidth} onChange={e => setCropWidth(e.target.value)} type="number" />
                  <input placeholder="Height" value={cropHeight} onChange={e => setCropHeight(e.target.value)} type="number" />
                  <input placeholder="X offset" value={cropX} onChange={e => setCropX(e.target.value)} type="number" />
                  <input placeholder="Y offset" value={cropY} onChange={e => setCropY(e.target.value)} type="number" />
                </div>}
              </div>

              <div className={`operation-group ${rotate ? 'active' : ''}`}>
                 <div className="operation-group-header" onClick={() => setRotate(!rotate)}>
                  Rotate
                </div>
                {rotate && <div className="operation-inputs single-input">
                  <input placeholder="Angle" value={rotateAngle} onChange={e => setRotateAngle(e.target.value)} type="number" />
                </div>}
              </div>

              <div className={`operation-group ${flip ? 'active' : ''}`}>
                 <div className="operation-group-header" onClick={() => setFlip(!flip)}>
                  Flip
                </div>
                {flip && <div className="operation-inputs flip-options">
                  <label><input type="checkbox" checked={flipH} onChange={() => setFlipH(!flipH)} /> Horizontal</label>
                  <label><input type="checkbox" checked={flipV} onChange={() => setFlipV(!flipV)} /> Vertical</label>
                </div>}
              </div>

              <div className={`operation-group ${quality ? 'active' : ''}`}>
                 <div className="operation-group-header" onClick={() => setQuality(!quality)}>
                  Quality
                </div>
                {quality && <div className="operation-inputs single-input">
                  <input placeholder="1-100" value={qualityValue} onChange={e => setQualityValue(e.target.value)} type="number" min="1" max="100"/>
                </div>}
              </div>

              <div className={`operation-group ${bc ? 'active' : ''}`}>
                 <div className="operation-group-header" onClick={() => setBc(!bc)}>
                  Brightness/Contrast
                </div>
                {bc && <div className="operation-inputs">
                  <input placeholder="Brightness" value={brightness} onChange={e => setBrightness(e.target.value)} type="number" />
                  <input placeholder="Contrast" value={contrast} onChange={e => setContrast(e.target.value)} type="number" />
                </div>}
              </div>

              <div className={`operation-group ${format ? 'active' : ''}`}>
                 <div className="operation-group-header" onClick={() => setFormat(!format)}>
                  Format
                </div>
                {format && <div className="operation-inputs single-input">
                  <input placeholder="png, jpg, etc." value={formatValue} onChange={e => setFormatValue(e.target.value)} />
                </div>}
              </div>

              <div className="action-buttons">
                <button onClick={handleApply} disabled={isProcessing} className="btn btn-primary">
                  {isProcessing ? 'Processing...' : 'Apply & Preview'}
                </button>
                <button onClick={handleDownload} disabled={isProcessing || !processedImage} className="btn btn-secondary">
                  Download Image
                </button>
              </div>
            </aside>

            <section className="preview-panel">
              <div className="image-display-area">
                {imagePreview && (
                  <div className="image-container">
                    <h3>Original</h3>
                    <img src={imagePreview} alt="Original" />
                  </div>
                )}
                 {processedImage && (
                  <div className="image-container">
                    <h3>Processed</h3>
                    <img src={processedImage} alt="Processed" />
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
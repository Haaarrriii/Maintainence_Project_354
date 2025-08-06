import React from 'react';

// Define the type for the component's props
interface ImageUploadComponentProps {
  onImageUpload: (file: File) => void;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({ onImageUpload }) => {
  // Handler for the file input change event
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Check if files were selected and if the first file exists
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Call the callback function passed from the parent component
      onImageUpload(file);
    }
  };

  return (
    <div className="image-upload-container">
      <h2>Upload Your Image</h2>
      <p>Select a file from your computer to get started</p>

      {/* This structure allows for a custom-styled button */}
      <label htmlFor="file-upload" className="custom-file-upload">
        Choose Your Image
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/png, image/jpeg, image/gif"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploadComponent;
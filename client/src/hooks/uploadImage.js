import imageCompression from "browser-image-compression";

export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error("No file selected");

  try {
    // 1️⃣ Compress the image
    const options = {
      maxSizeMB: 2, // Target size in MB
      maxWidthOrHeight: 1920, // Optional: limit dimensions
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // 2️⃣ Prepare FormData for Cloudinary
    const data = new FormData();
    data.append("file", compressedFile);
    data.append("upload_preset", "retailer_uploads"); // from Cloudinary dashboard
    data.append("cloud_name", "dkb1moyqh"); // from Cloudinary dashboard

    // 3️⃣ Upload to Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dkb1moyqh/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    if (!res.ok) throw new Error("Failed to upload image");

    const json = await res.json();
    return json.secure_url; // Final image URL
  } catch (error) {
    console.error("Image compression or upload error:", error);
    throw error;
  }
};

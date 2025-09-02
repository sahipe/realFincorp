import React, { useState, useRef } from "react";
import axios from "axios";
import { uploadImageToCloudinary } from "../hooks/uploadImage"; // compress + upload

const PartnerForm = () => {
  const [form, setForm] = useState({
    name: "",

    arn: "",
    sip: "",
    health: "",
    visitingDateTime: "",
    motor: "",
    mf: "",
    life: "",
    customerImage: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCamera = () => {
    fileInputRef.current.click();
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setForm((prev) => ({ ...prev, customerImage: imageUrl }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed!");
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    // Required fields (excluding latitude & longitude)
    const requiredFields = [
      "name",
      "arn",
      "sip",
      "health",
      "motor",
      "mf",
      "life",
      "visitingDateTime",
      "customerImage",
    ];

    for (let field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === "") {
        alert(`Please fill the ${field.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const formWithLocation = {
            ...form,
            latitude,
            longitude,
          };

          await axios.post(
            "https://realfincorp.onrender.com/api/customers",
            formWithLocation
          );

          alert("Data saved successfully!");
          setForm({
            name: "",

            arn: "",
            sip: "",
            health: "",
            visitingDateTime: "",
            motor: "",
            mf: "",
            life: "",
            customerImage: "",
            latitude: "",
            longitude: "",
          });
        } catch (error) {
          console.error(error);
          alert("Failed to save data.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to fetch location. Please enable GPS.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Real fincorp Data Form
        </h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
          />

          {/* ARN */}
          <input
            name="arn"
            value={form.arn}
            onChange={handleChange}
            placeholder="ARN"
            className="border border-gray-300 rounded-lg p-3"
          />

          {/* SIP */}
          <input
            name="sip"
            value={form.sip}
            onChange={handleChange}
            placeholder="SIP"
            className="border border-gray-300 rounded-lg p-3"
          />

          {/* Health */}
          <input
            name="health"
            value={form.health}
            onChange={handleChange}
            placeholder="Health"
            className="border border-gray-300 rounded-lg p-3"
          />

          {/* Motor */}
          <input
            name="motor"
            value={form.motor}
            onChange={handleChange}
            placeholder="Motor"
            className="border border-gray-300 rounded-lg p-3"
          />

          {/* Mutual Fund */}
          <input
            name="mf"
            value={form.mf}
            onChange={handleChange}
            placeholder="Mutual Fund"
            className="border border-gray-300 rounded-lg p-3"
          />

          {/* Life */}
          <input
            name="life"
            value={form.life}
            onChange={handleChange}
            placeholder="Life"
            className="border border-gray-300 rounded-lg p-3"
          />

          {/* Visiting Date & Time */}
          <input
            type="datetime-local"
            name="visitingDateTime"
            value={form.visitingDateTime}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3"
          />
        </div>

        {/* Camera Capture */}
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleImageCapture}
          />
          <button
            type="button"
            onClick={openCamera}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow"
            disabled={imageUploading}
          >
            📷 {imageUploading ? "Uploading..." : "Capture Image"}
          </button>

          {form.customerImage && !imageUploading && (
            <img
              src={form.customerImage}
              alt="Customer"
              className="mt-2 w-32 h-32 object-cover rounded-lg shadow"
            />
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSave}
            disabled={loading || imageUploading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl shadow-lg flex items-center justify-center"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                ></path>
              </svg>
            )}
            {loading ? "Saving..." : "💾 Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerForm;

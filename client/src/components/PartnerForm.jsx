import React, { useState, useRef } from "react";
import axios from "axios";
import { uploadImageToCloudinary } from "../hooks/uploadImage"; // compress + upload

const PartnerForm = () => {
  const [form, setForm] = useState({
    employeeName: "",
    customerName: "",
    customerContact: "",
    customerEmail: "",
    cityVillage: "",
    tehsil: "",
    district: "",
    state: "",
    visitingDateTime: "",
    insurance: "",
    mfSif: "",
    statusOfConversation: "",
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
    const requiredFields = Object.keys(form).filter(
      (key) => key !== "tehsil" && key !== "latitude" && key !== "longitude"
    );

    for (let field of requiredFields) {
      if (!form[field] || form[field].trim() === "") {
        alert(`Please fill the ${field.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
    }

    if (!/^\d{10}$/.test(form.customerContact)) {
      alert("Customer Contact must be a valid 10-digit number");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      alert("Please enter a valid email address");
      return false;
    }

    const numberFields = ["insurance", "mfSif"];
    for (let field of numberFields) {
      if (isNaN(form[field]) || Number(form[field]) < 0) {
        alert(`${field.toUpperCase()} must be a valid positive number`);
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
            "https://retailors-data.onrender.com/api/customers",
            formWithLocation
          );

          alert("Data saved successfully!");
          setForm({
            employeeName: "",
            customerName: "",
            customerContact: "",
            customerEmail: "",
            cityVillage: "",
            tehsil: "",
            district: "",
            state: "",
            visitingDateTime: "",
            insurance: "",
            mfSif: "",
            statusOfConversation: "",
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
          Customer Data Form
        </h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { name: "employeeName", placeholder: "Employee Name" },
            { name: "customerName", placeholder: "Customer Name" },
            { name: "customerContact", placeholder: "Customer Contact Number" },
            { name: "customerEmail", placeholder: "Customer Email ID" },
            { name: "cityVillage", placeholder: "City/Village" },
            { name: "tehsil", placeholder: "Tehsil (Optional)" },
            { name: "district", placeholder: "District" },
            { name: "state", placeholder: "State" },
          ].map((field) => (
            <input
              key={field.name}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            />
          ))}

          <input
            type="datetime-local"
            name="visitingDateTime"
            value={form.visitingDateTime}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3"
          />
          <input
            name="insurance"
            value={form.insurance}
            onChange={handleChange}
            placeholder="Insurance / day"
            className="border border-gray-300 rounded-lg p-3"
          />
          <input
            name="mfSif"
            value={form.mfSif}
            onChange={handleChange}
            placeholder="MF / SIF"
            className="border border-gray-300 rounded-lg p-3"
          />
          <select
            name="statusOfConversation"
            value={form.statusOfConversation}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 bg-white"
          >
            <option value="">Status of Conversation</option>
            <option value="yes">Yes</option>
            <option value="No">No</option>
          </select>

          {/* Camera Capture */}
          <div>
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

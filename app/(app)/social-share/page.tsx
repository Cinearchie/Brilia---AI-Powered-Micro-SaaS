"use client";

import React, { useState, useEffect, useRef } from "react";
import { CldImage, getCldImageUrl } from "next-cloudinary";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const ecommerceFormats = {
  "Amazon Main Image": { width: 2000, height: 2000, aspectRatio: "1:1" },
  "Amazon Lifestyle Image": { width: 2000, height: 1600, aspectRatio: "5:4" },
  "Flipkart Product Image": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Flipkart Banner Image": { width: 1920, height: 500, aspectRatio: "192:50" },
  "Shopify Square Image": { width: 2048, height: 2048, aspectRatio: "1:1" },
  "Shopify Product Banner": { width: 2048, height: 1024, aspectRatio: "2:1" },
  "eBay Main Image": { width: 1600, height: 1600, aspectRatio: "1:1" },
  "eBay Gallery Image": { width: 800, height: 800, aspectRatio: "1:1" },
  "Etsy Listing Image": { width: 2000, height: 2000, aspectRatio: "1:1" },
  "Etsy Thumbnail": { width: 570, height: 456, aspectRatio: "5:4" },
  "Walmart Main Image": { width: 2000, height: 2000, aspectRatio: "1:1" },
  "Myntra Product Image": { width: 1500, height: 2000, aspectRatio: "3:4" },
  "Meesho Product Image": { width: 1024, height: 1365, aspectRatio: "3:4" },
} as const;

type FormatName = keyof typeof ecommerceFormats;

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [shadowedImage, setShadowedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatName>("Amazon Main Image");
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!uploadedImage) return;
    const { width, height } = ecommerceFormats[selectedFormat];
    const url = getCldImageUrl({
      src: uploadedImage,
      width,
      height,
      crop: "fill",
      gravity: "auto",
      format: "png",
      removeBackground: true,
      background: "white",
    });

    setFinalImage(url);
    setIsTransforming(true);
  }, [uploadedImage, selectedFormat]);

  useEffect(() => {
    if (!finalImage) return;
    const applyShadow = async () => {
      try {
        const response = await fetch("/api/add-shadow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: finalImage }),
        });
        if (!response.ok) throw new Error("Shadow API failed");
        const data = await response.json();
        setShadowedImage(data.finalImage);
      } catch (err) {
        console.error("Error applying shadow:", err);
      } finally {
        setIsTransforming(false);
      }
    };
    applyShadow();
  }, [finalImage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload image");
      const data = await response.json();
      setUploadedImage(data.publicId);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;
    fetch(imageRef.current.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedFormat.replace(/\s+/g, "_").toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-6xl font-bold mb-6 text-center">
        Look <span className="text-blue-400">pro</span>. Pay nothing
      </h1>
      <p>
        Remove backgrounds from product photos and make them marketplace-ready using AI — completely free. Brilia helps
        you turn raw product shots into clean, professional visuals in seconds. No design skills needed.
      </p>

      <div className="flex flex-col md:flex-row justify-center items-start gap-6 mt-8">

  <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-2xl p-6 w-full md:w-1/2 h-[300px]">
  
  <ReactCompareSlider
    itemOne={
      <ReactCompareSliderImage
        src="/sample-before.jpg"
        alt="Before"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    }
    itemTwo={
      <ReactCompareSliderImage
        src="/sample-after.jpg"
        alt="After"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    }
    className="w-full h-full"
  />
  </div>


  <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-2xl p-6 w-full md:w-1/2 h-[300px]">
    <label
      htmlFor="file-upload-2"
      className="flex items-center justify-center bg-blue-400 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full cursor-pointer text-lg"
    >
      + Upload image
    </label>
    <input id="file-upload-2" type="file" className="hidden" onChange={handleFileUpload} />
    <p className="mt-2 text-gray-500">
      or paste <span className="text-blue-300 underline cursor-pointer">URL</span>
    </p>
  </div>
</div>


      {isUploading && (
        <div className="mt-4">
          <progress className="progress progress-primary w-full"></progress>
        </div>
      )}

      {uploadedImage && (
        <>
          <h2 className="card-title mt-6 mb-4">Select Format</h2>
          <select
            className="select select-bordered w-full"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as FormatName)}
          >
            {Object.keys(ecommerceFormats).map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>

          <div className="mt-6 relative">
            <h3 className="text-lg font-semibold mb-2">Before vs After Preview:</h3>

            {isTransforming && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            <div className="aspect-square w-full max-w-2xl mx-auto rounded-xl overflow-hidden border shadow">
              
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button className="btn btn-primary" onClick={handleDownload}>
              Download for {selectedFormat}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { ImagesTable } from "@/components/features";
import { Input } from "@/components/ui/input";
import notification from "@/lib/notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE, DEFAULT_TOTAL_ITEMS } from "@/lib/constants";
import { fetchAllImages } from "@/actions";
import { Image } from "@/types";

export default function Images() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_TOTAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAllImages();
        console.log("Fetch response:", response);

        // Check if response has the expected structure
        if (!response || !response.data || !response.data.images) {
          throw new Error("Invalid response format");
        }

        const images = response.data.images;
        console.log("Fetched images:", images);
        
        if (!Array.isArray(images)) {
          throw new Error("Images data is not an array");
        }

        setAllImages(images);
        setFilteredImages(images);
      } catch (err) {
        console.error("Error loading images:", err);
        setError(err instanceof Error ? err.message : "Failed to load images");
        notification({
          type: "error",
          message: "Failed to load images. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredImages(allImages);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = allImages.filter(
        (image) =>
          image.title.toLowerCase().includes(searchLower) ||
          `${image.user.firstName} ${image.user.lastName}`.toLowerCase().includes(searchLower)
      );
      setFilteredImages(filtered);

      if (filtered.length === 0) {
        notification({
          type: "error",
          message: "No images found, please try again!",
        });
      }
    }
    setCurrentPage(1);
  }, [searchTerm, allImages]);

  const totalPages = Math.max(Math.ceil(filteredImages.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  if (error) {
    return <div className="m-10 text-red-500">Error loading images: {error}</div>;
  }

  return (
    <div className="mt-5 mx-10 flex flex-col gap-5">
      <div className="flex justify-between gap-3 w-full">
        <Input
          value={searchTerm}
          placeholder="Search by title or user"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[250px] bg-white dark:bg-dark text-black dark:text-white p-2"
        />
        <Select
          value={itemsPerPage.toString()}
          onValueChange={handleItemsPerPageChange}
          defaultValue="5"
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-dark text-black dark:text-white p-2">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((item) => (
              <SelectItem key={item} value={item.toString()}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ImagesTable
        images={currentImages}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
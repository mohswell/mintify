"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/views/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/views/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/views/ui/pagination";
import { Button } from "@/components/views/ui/button";
import { ChevronLeft, ChevronRight, X, Download, Palette } from "lucide-react";
import { formatDate } from "@/lib/helpers";

interface ImageType {
  id: string;
  imageUrl: string;
  title: string;
  user: {
    firstName: string;
    lastName: string;
  };
  size: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  artruumSubmission?: boolean;
}

interface ImagesTableProps {
  images: ImageType[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}
// Image Preview Modal Component
const ImagePreviewModal = ({ 
  image,
  isOpen, 
  onClose 
}: { 
  image: ImageType | null;
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (image?.imageUrl) {
      const imgElement = new window.Image();
      imgElement.src = image.imageUrl;
      imgElement.onload = () => {
        // Calculate modal size based on image dimensions and screen size
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.8;
        const ratio = Math.min(
          maxWidth / imgElement.width,
          maxHeight / imgElement.height,
          1 // Don't upscale images
        );
        setImageSize({
          width: Math.round(imgElement.width * ratio),
          height: Math.round(imgElement.height * ratio)
        });
      };
    }
  }, [image?.imageUrl]);

  if (!isOpen || !image) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.title || 'image';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div 
        className="relative bg-background rounded-lg overflow-hidden"
        style={{ 
          width: imageSize.width ? `${imageSize.width}px` : 'auto',
          maxWidth: '90vw'
        }}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="hover:bg-accent"
            >
              <Download className="h-5 w-5" />
            </Button>
            {image.artruumSubmission && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Palette className="h-5 w-5" />
                <span className="text-sm font-medium">Artruum Submitted</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div 
          className="relative bg-background"
          style={{ 
            height: imageSize.height ? `${imageSize.height}px` : '70vh'
          }}
        >
          <Image
            src={image.imageUrl}
            alt={image.title}
            fill
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
            className="object-contain"
            quality={90}
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced Images Table Component
const ImagesTable = ({
  images,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
}: ImagesTableProps) => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="p-3">
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <Table className="overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead>Image Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Work by:</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Upload Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell><div className="w-16 h-16 bg-gray-400/30 rounded-xl"></div></TableCell>
                    <TableCell><div className="p-5 bg-gray-400/30 rounded-xl"></div></TableCell>
                    <TableCell><div className="p-5 bg-gray-400/30 rounded-xl"></div></TableCell>
                    <TableCell className="hidden sm:table-cell"><div className="p-5 bg-gray-400/30 rounded-xl"></div></TableCell>
                    <TableCell className="hidden md:table-cell"><div className="p-5 bg-gray-400/30 rounded-xl"></div></TableCell>
                    <TableCell><div className="p-5 bg-gray-400/30 rounded-xl"></div></TableCell>
                  </TableRow>
                ))
              ) : images.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No images found
                  </TableCell>
                </TableRow>
              ) : (
                images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div 
                        className="relative w-16 h-16 cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={image.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{image.title}</TableCell>
                    <TableCell>
                      {image.user.firstName} {image.user.lastName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{image.size}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(image.uploadDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        image.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : image.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {image.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && images.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <Button
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      onClick={() => onPageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  </PaginationItem>
                ))}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <ImagePreviewModal
        image={selectedImage}
        // imageUrl={selectedImage?.imageUrl || ''}
        //title={selectedImage?.title || 'Untitled'}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default ImagesTable;
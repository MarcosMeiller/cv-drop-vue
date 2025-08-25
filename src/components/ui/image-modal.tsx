import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  altText?: string
}

export function ImageModal({ isOpen, onClose, imageUrl, altText = 'Image' }: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-[90vw] max-h-[90vh]">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:text-gray-300"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        
        {/* Image */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  )
}


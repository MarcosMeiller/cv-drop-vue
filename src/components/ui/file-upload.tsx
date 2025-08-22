import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Progress } from './progress'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  className?: string
  uploadProgress?: number
  isUploading?: boolean
  uploadedFile?: { name: string; url: string } | null
  onRemoveFile?: () => void
}

export const FileUpload = ({
  onFileSelect,
  accept = { 'application/pdf': ['.pdf'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className,
  uploadProgress,
  isUploading = false,
  uploadedFile,
  onRemoveFile,
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAcceptedTypes = () => {
    return Object.keys(accept).join(', ')
  }

  if (uploadedFile) {
    return (
      <div className={cn('p-6 border-2 border-dashed border-success rounded-lg bg-success/5', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <p className="font-medium text-success">File uploaded successfully</p>
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
            </div>
          </div>
          {onRemoveFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (isUploading) {
    return (
      <div className={cn('p-6 border-2 border-dashed border-primary rounded-lg bg-primary/5', className)}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="font-medium">Uploading file...</p>
            {uploadProgress !== undefined && (
              <div className="w-full max-w-sm mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">{uploadProgress}% complete</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
        isDragActive || dragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to select a file
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Accepted types: {getAcceptedTypes()}</p>
            <p>Maximum size: {formatFileSize(maxSize)}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm">
          <File className="mr-2 h-4 w-4" />
          Choose File
        </Button>
      </div>
    </div>
  )
}
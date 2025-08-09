
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload as UploadIcon, FileText, Image, Music } from 'lucide-react';

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Upload Files</h1>
            <p className="text-gray-600 dark:text-gray-400">Upload book covers, audio files, and other media</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <UploadIcon className="w-5 h-5" />
                  Upload New Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Drag and drop files here, or click to select</p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    accept="image/*,audio/*,.pdf,.epub,.txt"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: Images (JPG, PNG, GIF), Audio (MP3, WAV), Documents (PDF, EPUB, TXT)
                </p>
              </CardContent>
            </Card>

            {/* File List */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Uploaded Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No files uploaded yet</p>
                ) : (
                  <div className="space-y-3">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600 dark:text-gray-400">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600 dark:hover:text-white"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {files.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8">
                Upload All Files
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SpaceFormMediaProps {
  link: string;
  onInputChange: (field: string, value: string) => void;
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

const SpaceFormMedia = ({
  link,
  onInputChange,
  onImageUpload,
  isProcessing
}: SpaceFormMediaProps) => {
  const handleUrlChange = (value: string) => {
    onInputChange('link', value);
    if (value && !isValidUrl(value)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
    }
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-pixel mb-1">Link URL</label>
        <Input
          type="url"
          value={link}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="retro-input h-8"
          placeholder="https://"
          disabled={isProcessing}
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-pixel mb-1">Image</label>
        <Input
          type="file"
          onChange={(e) => e.target.files && onImageUpload(e.target.files[0])}
          className="retro-input h-8"
          accept="image/*"
          aria-label="Choose a file"
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};

export default SpaceFormMedia;
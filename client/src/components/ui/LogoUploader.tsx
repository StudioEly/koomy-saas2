import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface LogoUploaderProps {
  currentLogo?: string | null;
  communityName?: string;
  onUploadComplete: (logoUrl: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LogoUploader({ 
  currentLogo, 
  communityName = "C",
  onUploadComplete,
  disabled = false,
  size = "lg"
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const uploadUrlResponse = await fetch("/api/uploads/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!uploadUrlResponse.ok) {
        throw new Error("Impossible d'obtenir l'URL de téléchargement");
      }

      const { uploadURL } = await uploadUrlResponse.json();

      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Échec du téléchargement");
      }

      const finalizeResponse = await fetch("/api/uploads/logo/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadURL })
      });

      if (!finalizeResponse.ok) {
        throw new Error("Échec de la finalisation");
      }

      const { objectPath } = await finalizeResponse.json();
      onUploadComplete(objectPath);
      toast.success("Logo téléchargé avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors du téléchargement");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const displayUrl = previewUrl || currentLogo;
  const initials = communityName
    .split(" ")
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg`}>
          <AvatarImage src={displayUrl || undefined} alt={communityName} />
          <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--koomy-primary))] to-[hsl(var(--koomy-primary-dark))] text-white text-2xl font-bold">
            {initials || <ImageIcon className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {!disabled && !isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            data-testid="button-upload-logo-overlay"
          >
            <Upload className="h-8 w-8 text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
        data-testid="input-logo-file"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="gap-2"
        data-testid="button-upload-logo"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {currentLogo ? "Changer le logo" : "Télécharger un logo"}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Format JPG, PNG ou GIF. Max 5 Mo.
      </p>
    </div>
  );
}

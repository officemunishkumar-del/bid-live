import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Clock, DollarSign, Image, X, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuction } from "@/services/auctionService";

const durationOptions = [
    { label: "1 Hour", value: 1 },
    { label: "3 Hours", value: 3 },
    { label: "6 Hours", value: 6 },
    { label: "12 Hours", value: 12 },
    { label: "1 Day", value: 24 },
    { label: "3 Days", value: 72 },
    { label: "7 Days", value: 168 },
];

const categoryOptions = [
    "Art", "Jewelry", "Furniture", "Coins", "Fashion", "Watches", "Asian Antiques", "Collectibles", "Home & Décor", "Books"
];

const CreateAuctionPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        startingPrice: "",
        duration: 24,
    });
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            // Mock image upload - just use placeholder URLs
            const newImages = Array.from(files).map((_, i) =>
                `https://images.unsplash.com/photo-${Date.now() + i}?w=400`
            );
            setImages(prev => [...prev, ...newImages].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.startingPrice || !formData.category) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate endsAt from duration
            const endsAt = new Date();
            endsAt.setHours(endsAt.getHours() + formData.duration);

            await createAuction({
                title: formData.title,
                description: formData.description,
                startingPrice: parseFloat(formData.startingPrice),
                endsAt: endsAt.toISOString(),
            });

            toast({
                title: "Auction Created!",
                description: "Your auction has been successfully created and is now live.",
            });

            navigate("/search");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create auction",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + formData.duration);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-foreground">Create Auction</h1>
                <p className="text-muted-foreground mt-1">List your item for auction and reach thousands of collectors</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Title <span className="text-urgency">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Vintage Rolex Submariner 1967"
                                className="w-full h-11 px-4 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Category <span className="text-urgency">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full h-11 px-4 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Select a category</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={5}
                                placeholder="Describe your item in detail. Include condition, provenance, dimensions, and any notable features..."
                                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Images (up to 5)
                            </label>
                            <div className="grid grid-cols-5 gap-3">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="aspect-square rounded-md border-2 border-dashed border-input flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Tip: High-quality images help attract more bidders
                            </p>
                        </div>

                        {/* Price & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Starting Price <span className="text-urgency">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        name="startingPrice"
                                        value={formData.startingPrice}
                                        onChange={handleInputChange}
                                        min="1"
                                        step="1"
                                        placeholder="0.00"
                                        className="w-full h-11 pl-9 pr-4 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Duration
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full h-11 pl-9 pr-4 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                                    >
                                        {durationOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 border border-border rounded-lg p-5 bg-card">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Preview</h3>

                            {/* Preview Card */}
                            <div className="border border-border rounded-lg overflow-hidden mb-4">
                                <div className="aspect-square bg-muted flex items-center justify-center">
                                    {images.length > 0 ? (
                                        <img src={images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Image className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs text-success font-medium mb-1">New Auction</p>
                                    <h4 className="text-sm font-semibold text-card-foreground line-clamp-2">
                                        {formData.title || "Your auction title"}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formData.category || "Category"}
                                    </p>
                                    <p className="text-base font-bold text-card-foreground mt-2">
                                        ${formData.startingPrice || "0"}.00
                                    </p>
                                </div>
                            </div>

                            {/* Auction Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ends At</span>
                                    <span className="text-foreground">{endTime.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="text-foreground">{durationOptions.find(d => d.value === formData.duration)?.label}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 mt-6 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    "Creating..."
                                ) : (
                                    <>Create Auction <ChevronRight className="h-4 w-4" /></>
                                )}
                            </button>
                            <p className="text-xs text-center text-muted-foreground mt-3">
                                By creating an auction, you agree to our Terms of Service
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateAuctionPage;

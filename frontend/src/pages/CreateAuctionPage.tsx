import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, DollarSign, Image, ChevronRight, AlertCircle, Info } from "lucide-react";
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

interface FormErrors {
    title?: string;
    category?: string;
    startingPrice?: string;
    description?: string;
}

const validateForm = (formData: { title: string; description: string; category: string; startingPrice: string }): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
        errors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
        errors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
        errors.title = "Title must be under 100 characters";
    }

    if (!formData.category) {
        errors.category = "Please select a category";
    }

    if (!formData.startingPrice) {
        errors.startingPrice = "Starting price is required";
    } else if (parseFloat(formData.startingPrice) <= 0) {
        errors.startingPrice = "Price must be greater than $0";
    } else if (parseFloat(formData.startingPrice) > 10_000_000) {
        errors.startingPrice = "Price seems too high — please double-check";
    }

    if (formData.description.length > 2000) {
        errors.description = `Description too long (${formData.description.length}/2000)`;
    }

    return errors;
};

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        const fieldErrors = validateForm(formData);
        if (fieldErrors[fieldName as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName as keyof FormErrors] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateForm(formData);
        setErrors(validationErrors);
        setTouched({ title: true, category: true, startingPrice: true, description: true });

        if (Object.keys(validationErrors).length > 0) {
            toast({
                title: "Please fix the errors",
                description: "Some fields need your attention before submitting.",
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
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create auction",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + formData.duration);

    const renderFieldError = (field: keyof FormErrors) => {
        if (!touched[field] || !errors[field]) return null;
        return (
            <p className="text-xs text-urgency mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors[field]}
            </p>
        );
    };

    const fieldClass = (field: keyof FormErrors) =>
        touched[field] && errors[field] ? "border-urgency focus:ring-urgency/30" : "border-input";

    const descCharCount = formData.description.length;
    const descNearLimit = descCharCount > 1800;

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
                                onBlur={() => handleBlur("title")}
                                placeholder="e.g., Vintage Rolex Submariner 1967"
                                maxLength={100}
                                className={`w-full h-11 px-4 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${fieldClass("title")}`}
                            />
                            {renderFieldError("title")}
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
                                onBlur={() => handleBlur("category")}
                                className={`w-full h-11 px-4 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${fieldClass("category")}`}
                            >
                                <option value="">Select a category</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {renderFieldError("category")}
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
                                onBlur={() => handleBlur("description")}
                                rows={5}
                                maxLength={2000}
                                placeholder="Describe your item in detail. Include condition, provenance, dimensions, and any notable features..."
                                className={`w-full px-4 py-3 rounded-md border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring ${fieldClass("description")}`}
                            />
                            <div className="flex justify-between mt-1">
                                {renderFieldError("description") || <span />}
                                <span className={`text-xs ${descNearLimit ? "text-warning" : "text-muted-foreground"}`}>
                                    {descCharCount}/2000
                                </span>
                            </div>
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
                                        onBlur={() => handleBlur("startingPrice")}
                                        min="1"
                                        step="1"
                                        placeholder="0.00"
                                        className={`w-full h-11 pl-9 pr-4 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${fieldClass("startingPrice")}`}
                                    />
                                </div>
                                {renderFieldError("startingPrice")}
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
                                    <Image className="h-12 w-12 text-muted-foreground" />
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

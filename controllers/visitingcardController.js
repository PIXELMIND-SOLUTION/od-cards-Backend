const VisitingCardOrder = require("../models/VisitingCardOrder");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const UserSelectedCard = require("../models/visitingproduct");


// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Helper to convert dot notation to nested object
const dotNotationToNested = (obj) => {
    const result = {};
    
    for (const key in obj) {
        const keys = key.split('.');
        let current = result;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = obj[key];
    }
    
    return result;
};

// Helper to parse JSON strings
const parseJSON = (val) => {
    if (typeof val !== 'string') return val;
    
    try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'string') {
            return JSON.parse(parsed);
        }
        return parsed;
    } catch (e) {
        return val;
    }
};

// Helper to convert options array format
const parseOptionsArray = (optionsData) => {
    if (!optionsData) return [];
    
    // If it's already an array of objects, return as is
    if (Array.isArray(optionsData) && optionsData.length > 0 && typeof optionsData[0] === 'object') {
        return optionsData;
    }
    
    // Parse if it's a JSON string
    const parsed = parseJSON(optionsData);
    
    if (Array.isArray(parsed)) {
        return parsed.map(item => {
            if (typeof item === 'object' && item.label && item.price !== undefined) {
                return {
                    label: item.label,
                    price: Number(item.price)
                };
            }
            return item;
        });
    }
    
    return [];
};

// ===============================
// CREATE ORDER
// ===============================
const createVisitingcards = async (req, res) => {
    try {
        // Step 1: Convert dot notation to nested object
        const nestedData = dotNotationToNested(req.body);
        
        console.log('Step 1 - Nested Data:', JSON.stringify(nestedData, null, 2));
        
        // Create admin ID
        const adminId = new mongoose.Types.ObjectId();

        // -----------------------------
        // IMAGES UPLOAD
        // -----------------------------
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const imageFiles = req.files.filter(file => file.fieldname === 'images');
            
            for (const file of imageFiles) {
                try {
                    const result = await uploadToCloudinary(file.buffer, "visiting-cards/images");
                    imageUrls.push(result.secure_url);
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to upload images",
                        error: error.message
                    });
                }
            }
        }

        // -----------------------------
        // DESIGN FILE UPLOAD
        // -----------------------------
        let designFileUrl = null;
        if (req.files && req.files.length > 0) {
            const designFile = req.files.find(file => file.fieldname === 'design');
            
            if (designFile) {
                try {
                    const result = await uploadToCloudinary(
                        designFile.buffer,
                        "visiting-cards/designs"
                    );
                    designFileUrl = result.secure_url;
                } catch (error) {
                    console.error("Error uploading design file:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to upload design file",
                        error: error.message
                    });
                }
            }
        }

        // -----------------------------
        // PARSE AND STRUCTURE DATA
        // -----------------------------
        const orderData = {
            category: {
                values: nestedData.category?.values || ""
            },
            subCategory: {
                values: nestedData.subCategory?.values || ""
            },
            productName: {
                values: nestedData.productName?.values || ""
            },
            
            // Quantity - just values array (no price)
            quantity: {
                isEnabled: nestedData.quantity?.isEnabled === 'true' || nestedData.quantity?.isEnabled === true,
                values: parseJSON(nestedData.quantity?.values) || []
            },
            
            // Printing Type - options with individual prices
            printingType: {
                isEnabled: nestedData.printingType?.isEnabled === 'true' || nestedData.printingType?.isEnabled === true,
                options: parseOptionsArray(nestedData.printingType?.options)
            },
            
            // Lamination - options with individual prices
            laminationType: {
                isEnabled: nestedData.laminationType?.isEnabled === 'true' || nestedData.laminationType?.isEnabled === true,
                options: parseOptionsArray(nestedData.laminationType?.options)
            },
            
            // Features
            features: {
                boxPacking: {
                    isEnabled: nestedData.features?.boxPacking?.isEnabled === 'true' || nestedData.features?.boxPacking?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.boxPacking?.options)
                },
                roundCorners: {
                    isEnabled: nestedData.features?.roundCorners?.isEnabled === 'true' || nestedData.features?.roundCorners?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.roundCorners?.options)
                },
                bigSizeCard: {
                    isEnabled: nestedData.features?.bigSizeCard?.isEnabled === 'true' || nestedData.features?.bigSizeCard?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.bigSizeCard?.options)
                },
                padding: {
                    isEnabled: nestedData.features?.padding?.isEnabled === 'true' || nestedData.features?.padding?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.padding?.options)
                },
                creasing: {
                    isEnabled: nestedData.features?.creasing?.isEnabled === 'true' || nestedData.features?.creasing?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.creasing?.options)
                },
                scoring: {
                    isEnabled: nestedData.features?.scoring?.isEnabled === 'true' || nestedData.features?.scoring?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.scoring?.options)
                },
                shapeCutting: {
                    isEnabled: nestedData.features?.shapeCutting?.isEnabled === 'true' || nestedData.features?.shapeCutting?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.shapeCutting?.options)
                },
                dieCut: {
                    isEnabled: nestedData.features?.dieCut?.isEnabled === 'true' || nestedData.features?.dieCut?.isEnabled === true,
                    options: parseOptionsArray(nestedData.features?.dieCut?.options)
                }
            },
            
            // Card Size Multiplier
            cardSizeMultiplier: {
                isEnabled: nestedData.cardSizeMultiplier?.isEnabled === 'true' || nestedData.cardSizeMultiplier?.isEnabled === true,
                value: Number(nestedData.cardSizeMultiplier?.value) || 1,
                price: Number(nestedData.cardSizeMultiplier?.price) || 0
            },
            
            // Sizes
            size: {
                isEnabled: nestedData.size?.isEnabled === 'true' || nestedData.size?.isEnabled === true,
                options: parseOptionsArray(nestedData.size?.options)
            },
            
            demmySize: {
                isEnabled: nestedData.demmySize?.isEnabled === 'true' || nestedData.demmySize?.isEnabled === true,
                options: parseOptionsArray(nestedData.demmySize?.options)
            },
            
            // Materials
            boardType: {
                isEnabled: nestedData.boardType?.isEnabled === 'true' || nestedData.boardType?.isEnabled === true,
                options: parseOptionsArray(nestedData.boardType?.options)
            },
            
            boardThickness: {
                isEnabled: nestedData.boardThickness?.isEnabled === 'true' || nestedData.boardThickness?.isEnabled === true,
                options: parseOptionsArray(nestedData.boardThickness?.options)
            },
            
            paperType: {
                isEnabled: nestedData.paperType?.isEnabled === 'true' || nestedData.paperType?.isEnabled === true,
                options: parseOptionsArray(nestedData.paperType?.options)
            },
            
            gsm: {
                isEnabled: nestedData.gsm?.isEnabled === 'true' || nestedData.gsm?.isEnabled === true,
                options: parseOptionsArray(nestedData.gsm?.options)
            },
            
            specialOptions: {
                isEnabled: nestedData.specialOptions?.isEnabled === 'true' || nestedData.specialOptions?.isEnabled === true,
                options: parseOptionsArray(nestedData.specialOptions?.options)
            },
            
            // Special Notes
            specialNotes: {
                isEnabled: nestedData.specialNotes?.isEnabled === 'true' || nestedData.specialNotes?.isEnabled === true,
                value: nestedData.specialNotes?.value || "",
                price: Number(nestedData.specialNotes?.price) || 0
            },
            
            // Images and Design File
            images: { values: imageUrls },
            
            designFile: designFileUrl ? {
                isEnabled: nestedData.designFile?.isEnabled === 'true' || nestedData.designFile?.isEnabled === true,
                value: designFileUrl,
                price: Number(nestedData.designFile?.price) || 0
            } : undefined,
            
            // Total Price
            totalPrice: Number(nestedData.totalPrice) || 0,
            
            // Meta
            createdBy: adminId,
            status: nestedData.status || 'draft'
        };

        console.log('Step 2 - Final Order Data:', JSON.stringify(orderData, null, 2));

        // -----------------------------
        // SAVE ORDER
        // -----------------------------
        const newOrder = new VisitingCardOrder(orderData);
        await newOrder.save();

        return res.status(201).json({
            success: true,
            message: "Visiting card order created successfully",
            data: newOrder,
        });

    } catch (error) {
        console.error("Error creating visiting card order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create visiting card order",
            error: error.message
        });
    }
};


// ---------------------------------------------
// GET ALL ORDERS
// ---------------------------------------------
const getAllVisitingcards = async (req, res) => {
    try {
        const data = await VisitingCardOrder.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
    }
};

// ---------------------------------------------
// GET ORDER BY ID
// ---------------------------------------------
const getVisitingcardById = async (req, res) => {
    try {
        const data = await VisitingCardOrder.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch order", error: error.message });
    }
};

// ---------------------------------------------
// GET BY CATEGORY
// ---------------------------------------------
const getByCategoryName = async (req, res) => {
    try {
        const data = await VisitingCardOrder.find({
            "category.values": { $regex: req.params.name, $options: "i" }
        });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed", error: error.message });
    }
};

// ---------------------------------------------
// GET BY SUB-CATEGORY
// ---------------------------------------------
const getBySubCategoryName = async (req, res) => {
    try {
        const data = await VisitingCardOrder.find({
            "subCategory.values": { $regex: req.params.name, $options: "i" }
        });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed", error: error.message });
    }
};

// ---------------------------------------------
// GET BY PRODUCT NAME
// ---------------------------------------------
const getByProductName = async (req, res) => {
    try {
        const data = await VisitingCardOrder.find({
            "productName.values": { $regex: req.params.name, $options: "i" }
        });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed", error: error.message });
    }
};

// ---------------------------------------------
// UPDATE ORDER
// ---------------------------------------------
const updateVisitingcard = async (req, res) => {
    try {
        const existing = await VisitingCardOrder.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: "Order not found" });

        const updated = await VisitingCardOrder.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );

        return res.status(200).json({ success: true, message: "Order updated", data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update", error: error.message });
    }
};

// ---------------------------------------------
// DELETE ORDER
// ---------------------------------------------
const deleteVisitingcard = async (req, res) => {
    try {
        const deleted = await VisitingCardOrder.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Order not found" });

        return res.status(200).json({ success: true, message: "Order deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete", error: error.message });
    }
};


// -------------------------------
// USER CREATES A PRODUCT SELECTION
// -------------------------------
const createUserCard = async (req, res) => {
  try {
        const form = dotNotationToNested(req.body);

        const { userId,ProductId } = form;

        // Fetch the MASTER PRODUCT
        const master = await VisitingCardOrder.findById(ProductId);
        if (!master) {
            return res.status(404).json({ success: false, message: "Master product not found" });
        }

        // ---------------------------
        // UPLOAD USER IMAGES
        // ---------------------------
        let imageUrls = [];
        let designFileUrl = null;

        if (req.files && req.files.length > 0) {

            // Multiple images
            const images = req.files.filter(f => f.fieldname === "images");
            for (const img of images) {
                const uploaded = await uploadToCloudinary(img.buffer, "user-cards/images");
                imageUrls.push(uploaded.secure_url);
            }

            // Design file (single)
            const design = req.files.find(f => f.fieldname === "designFile");
            if (design) {
                const uploaded = await uploadToCloudinary(design.buffer, "user-cards/design-files");
                designFileUrl = uploaded.secure_url;
            }
        }

        // ---------------------------
        // PRICE HELPER
        // ---------------------------
        const findOption = (list, label) => {
            if (!label) return null;
            const found = list?.find(x => x.label === label);
            return found ? { label: found.label, price: found.price } : null;
        };

        // ---------------------------
        // SELECTED OPTIONS
       
        const selected = {
            printingType: findOption(master.printingType.options, form.printingType),
            laminationType: findOption(master.laminationType.options, form.laminationType),
            quantity: Number(form.quantity),

            size: findOption(master.size.options, form.size),
            demmySize: findOption(master.demmySize.options, form.demmySize),

            cardSizeMultiplier: master.cardSizeMultiplier
                ? {
                    value: master.cardSizeMultiplier.value,
                    price: master.cardSizeMultiplier.price
                }
                : null,

            boardType: findOption(master.boardType.options, form.boardType),
            boardThickness: findOption(master.boardThickness.options, form.boardThickness),
            paperType: findOption(master.paperType.options, form.paperType),
            gsm: findOption(master.gsm.options, form.gsm),
            specialOptions: findOption(master.specialOptions.options, form.specialOptions),

            features: {
                boxPacking: findOption(master.features.boxPacking.options, form.features?.boxPacking),
                roundCorners: findOption(master.features.roundCorners.options, form.features?.roundCorners),
                bigSizeCard: findOption(master.features.bigSizeCard.options, form.features?.bigSizeCard),
                padding: findOption(master.features.padding.options, form.features?.padding),
                creasing: findOption(master.features.creasing.options, form.features?.creasing),
                scoring: findOption(master.features.scoring.options, form.features?.scoring),
                shapeCutting: findOption(master.features.shapeCutting.options, form.features?.shapeCutting),
                dieCut: findOption(master.features.dieCut.options, form.features?.dieCut)
            }
        };

        // ---------------------------
        // TOTAL PRICE
        // ---------------------------
        let total = 0;
        const sum = obj => { if (obj?.price) total += obj.price };

        sum(selected.printingType);
        sum(selected.laminationType);
        sum(selected.size);
        sum(selected.demmySize);
        sum(selected.cardSizeMultiplier);
        sum(selected.boardType);
        sum(selected.boardThickness);
        sum(selected.paperType);
        sum(selected.gsm);
        sum(selected.specialOptions);

        Object.values(selected.features).forEach(sum);

        total = total * selected.quantity;

        // ---------------------------
        // SAVE USER ORDER
        // ---------------------------
        const newCard = await UserSelectedCard.create({
            userId,
            ProductId,
            selectedOptions: selected,
            images: imageUrls,
            designFile: designFileUrl,
            totalPrice: total
        });

        return res.status(201).json({
            success: true,
            message: "User product created successfully",
            data: newCard
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to create user card",
            error: err.message
        });
    }
};
// ----------------------------
// FINAL EXPORT
// ----------------------------
module.exports = {
    createVisitingcards,
    getAllVisitingcards,
    getVisitingcardById,
    getByCategoryName,
    getBySubCategoryName,
    getByProductName,
    updateVisitingcard,
    deleteVisitingcard,
    createUserCard
};

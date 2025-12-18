const VisitingCardOrder = require("../models/VisitingCardOrder");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const UserSelectedCard = require("../models/visitingproduct");

/* =====================================================
   🔒 SAFE NORMALIZERS (VERY IMPORTANT)
===================================================== */

// Normalize option fields (string ➜ object)
const normalizeOptionField = (field) => {
  if (field && typeof field === "object" && Array.isArray(field.options)) {
    return field;
  }

  if (typeof field === "string") {
    return {
      isEnabled: true,
      options: [{ label: field, price: 0 }]
    };
  }

  return { isEnabled: false, options: [] };
};

// Safe option finder
const findOption = (list, label) => {
  if (!label || !Array.isArray(list)) return null;
  const found = list.find(x => x.label === label);
  return found ? { label: found.label, price: found.price } : null;
};

const safePrice = (obj) => obj?.price ? Number(obj.price) : 0;

/* =====================================================
   ☁️ CLOUDINARY UPLOAD
===================================================== */

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/* =====================================================
   🧠 HELPERS
===================================================== */

const dotNotationToNested = (obj) => {
  const result = {};
  for (const key in obj) {
    const keys = key.split(".");
    let cur = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = obj[key];
  }
  return result;
};

const parseJSON = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

const parseOptionsArray = (data) => {
  const parsed = parseJSON(data);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(o => ({
    label: o.label,
    price: Number(o.price || 0)
  }));
};

/* =====================================================
   🟢 CREATE MASTER PRODUCT
===================================================== */

const createVisitingcards = async (req, res) => {
  try {
    const body = dotNotationToNested(req.body);
    const adminId = new mongoose.Types.ObjectId();

    let imageUrls = [];
    let designFileUrl = null;

    if (req.files?.length) {
      for (const file of req.files) {
        const upload = await uploadToCloudinary(
          file.buffer,
          file.fieldname === "design" ? "visiting/designs" : "visiting/images"
        );
        if (file.fieldname === "design") designFileUrl = upload.secure_url;
        else imageUrls.push(upload.secure_url);
      }
    }

    const order = await VisitingCardOrder.create({
      category: { values: body.category?.values || "" },
      subCategory: { values: body.subCategory?.values || "" },
      productName: { values: body.productName?.values || "" },

      quantity: {
        isEnabled: body.quantity?.isEnabled === "true",
        values: parseJSON(body.quantity?.values) || []
      },

      printingType: {
        isEnabled: true,
        options: parseOptionsArray(body.printingType?.options)
      },

      laminationType: {
        isEnabled: true,
        options: parseOptionsArray(body.laminationType?.options)
      },

      features: {
        boxPacking: { options: parseOptionsArray(body.features?.boxPacking?.options) },
        roundCorners: { options: parseOptionsArray(body.features?.roundCorners?.options) },
        bigSizeCard: { options: parseOptionsArray(body.features?.bigSizeCard?.options) },
        padding: { options: parseOptionsArray(body.features?.padding?.options) },
        creasing: { options: parseOptionsArray(body.features?.creasing?.options) },
        scoring: { options: parseOptionsArray(body.features?.scoring?.options) },
        shapeCutting: { options: parseOptionsArray(body.features?.shapeCutting?.options) },
        dieCut: { options: parseOptionsArray(body.features?.dieCut?.options) }
      },

      size: { options: parseOptionsArray(body.size?.options) },
      demmySize: { options: parseOptionsArray(body.demmySize?.options) },

      boardType: { options: parseOptionsArray(body.boardType?.options) },
      boardThickness: { options: parseOptionsArray(body.boardThickness?.options) },
      paperType: { options: parseOptionsArray(body.paperType?.options) },
      gsm: { options: parseOptionsArray(body.gsm?.options) },
      specialOptions: { options: parseOptionsArray(body.specialOptions?.options) },

      images: { values: imageUrls },

      designFile: designFileUrl
        ? { value: designFileUrl, price: Number(body.designFile?.price || 0) }
        : undefined,

      totalPrice: Number(body.totalPrice || 0),
      createdBy: adminId,
      status: body.status || "draft"
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =====================================================
   📦 GET ALL (SAFE)
===================================================== */

const getAllVisitingcards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find().lean();

    const safe = orders.map(o => ({
      ...o,
      printingType: normalizeOptionField(o.printingType),
      laminationType: normalizeOptionField(o.laminationType),
      size: normalizeOptionField(o.size),
      demmySize: normalizeOptionField(o.demmySize),
      boardType: normalizeOptionField(o.boardType),
      paperType: normalizeOptionField(o.paperType)
    }));

    res.json({ success: true, count: safe.length, data: safe });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

/* =====================================================
   🔍 GET BY ID / FILTERS
===================================================== */

const getVisitingcardById = async (req, res) => {
  const data = await VisitingCardOrder.findById(req.params.id);
  data ? res.json({ success: true, data }) :
    res.status(404).json({ success: false, message: "Not found" });
};

const getByCategoryName = async (req, res) =>
  res.json({ success: true, data: await VisitingCardOrder.find({ "category.values": new RegExp(req.params.name, "i") }) });

const getBySubCategoryName = async (req, res) =>
  res.json({ success: true, data: await VisitingCardOrder.find({ "subCategory.values": new RegExp(req.params.name, "i") }) });

const getByProductName = async (req, res) =>
  res.json({ success: true, data: await VisitingCardOrder.find({ "productName.values": new RegExp(req.params.name, "i") }) });

/* =====================================================
   ✏️ UPDATE / DELETE
===================================================== */

const updateVisitingcard = async (req, res) => {
  const updated = await VisitingCardOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  updated ? res.json({ success: true, data: updated }) :
    res.status(404).json({ success: false });
};

const deleteVisitingcard = async (req, res) => {
  const deleted = await VisitingCardOrder.findByIdAndDelete(req.params.id);
  deleted ? res.json({ success: true }) :
    res.status(404).json({ success: false });
};

/* =====================================================
   👤 USER SELECTS PRODUCT
===================================================== */

const createUserCard = async (req, res) => {
  try {
    const form = dotNotationToNested(req.body);
    const master = await VisitingCardOrder.findById(form.ProductId).lean();
    if (!master) return res.status(404).json({ success: false });

    const pt = normalizeOptionField(master.printingType);
    const lt = normalizeOptionField(master.laminationType);

    const selected = {
      quantity: Number(form.quantity || 1),
      printingType: findOption(pt.options, form.printingType),
      laminationType: findOption(lt.options, form.laminationType)
    };

    let total =
      safePrice(selected.printingType) +
      safePrice(selected.laminationType);

    total *= selected.quantity;

    const card = await UserSelectedCard.create({
      userId: form.userId,
      ProductId: form.ProductId,
      selectedOptions: selected,
      totalPrice: total
    });

    res.status(201).json({ success: true, data: card });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

/* =====================================================
   📤 EXPORTS
===================================================== */

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

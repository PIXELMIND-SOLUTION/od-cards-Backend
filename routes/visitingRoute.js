const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Controller
const {
    createVisitingcards,
    getAllVisitingcards,
    getVisitingcardById,
    getByCategoryName,
    getBySubCategoryName,
    getByProductName,
    updateVisitingcard,
    deleteVisitingcard,
    createUserCard
} = require("../controllers/visitingcardController");


// ========================= ROUTES =========================

// Create
router.post("/create-visitingcard", upload.any(), createVisitingcards);

// Get all
router.get("/all", getAllVisitingcards);

// ❗ Specific routes FIRST
router.get("/category/:name", getByCategoryName);
router.get("/subcategory/:name", getBySubCategoryName);
router.get("/product/:name", getByProductName);

// Get by ID — keep this LAST
router.get("/:id", getVisitingcardById);

// Update
router.patch("/update/:id", updateVisitingcard);

// Delete
router.delete("/delete/:id", deleteVisitingcard);


router.post(
    "/user/create-card",
    upload.any(),    // for images + designFile
    createUserCard
);

module.exports = router;

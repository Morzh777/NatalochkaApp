import {Router} from "express";
import {calculateCompatibilityHandler, numerologyController} from "./controllers/numerology.controller";


const router = Router();

router.post("/calculate", numerologyController.calculateWithImage.bind(numerologyController));
router.post("/calculate-json", numerologyController.calculateWithJson.bind(numerologyController));
router.post("/calculate-matrix", numerologyController.calculateMatrixJson.bind(numerologyController));

router.post("/matrix/compatibility/calculate", calculateCompatibilityHandler);

export default router;

import express from "express";
import {authenticate} from "../auth/jwt";

const router = express.Router();

router.get("/import", authenticate)
export default router;

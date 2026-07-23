import { Router, type IRouter } from "express";
import healthRouter from "./health";
import charactersRouter from "./characters";
import comicsRouter from "./comics";
import panelsByComicRouter from "./panels";
import panelByIdRouter from "./panelById";
import aiRouter from "./ai";
import communityRouter from "./community";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/characters", charactersRouter);
router.use("/comics", comicsRouter);
router.use("/comics/:comicId/panels", panelsByComicRouter);
router.use("/panels", panelByIdRouter);
router.use("/ai", aiRouter);
router.use("/community", communityRouter);
router.use("/dashboard", dashboardRouter);

export default router;

import { and, count, desc, eq, getTableColumns, ilike, or,sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema/index.js";
import { db } from "../db/db.js";

const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const currentPage = Math.max(1, +page);
    const limitPerpage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerpage;
    const filterConditions = [];

    // Filter by subject name or code
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }

    // Filter by department name
    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }

    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Count query using Drizzle's count() helper
    // Pass subjects.id directly into count()
   const countResult = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(subjects)
    .leftJoin(departments, eq(subjects.departmentId, departments.id))
    .where(whereClause);

   const totalCount = countResult[0]?.total ?? 0;

    // Data query
   const subjectsList = await db
     .select({
        ...getTableColumns(subjects),
        department: {
        id: departments.id,
        name: departments.name,
        code: departments.code,
        },
    })
    .from(subjects)
    .leftJoin(departments, eq(subjects.departmentId, departments.id))
    .where(whereClause)
    .orderBy(desc(subjects.createdAt))
    .limit(limitPerpage)
    .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        total: totalCount,
        page: currentPage,
        limitPerpage,
        totalPages: Math.ceil(totalCount / limitPerpage),
      },
    });
  } catch (error) {
    console.log(`GET /subjects error: `,error);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default router;
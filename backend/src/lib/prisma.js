import { PrismaClient } from "@prisma/client";

function createInMemoryPrisma() {
    console.warn("[AI Studio] DATABASE_URL not configured — using in-memory Prisma mock");

    let nextUserId = 1;
    let nextMessageId = 1;
    const users = [];
    const messages = [];

    const applySelect = (record, select) => {
        if (!record || !select) return record ? { ...record } : null;
        const result = {};
        for (const [key, include] of Object.entries(select)) {
            if (include) result[key] = record[key];
        }
        return result;
    };

    const matchesFilter = (value, filter) => {
        if (filter && typeof filter === "object" && !Array.isArray(filter)) {
            if ("not" in filter) {
                if (value === filter.not) return false;
            }
            if ("contains" in filter) {
                const hay = String(value ?? "");
                const needle = String(filter.contains ?? "");
                const ok =
                    filter.mode === "insensitive"
                        ? hay.toLowerCase().includes(needle.toLowerCase())
                        : hay.includes(needle);
                if (!ok) return false;
            }
            return true;
        }
        return value === filter;
    };

    const matchesWhere = (record, where = {}) => {
        for (const [key, condition] of Object.entries(where)) {
            if (key === "OR" && Array.isArray(condition)) {
                if (!condition.some((sub) => matchesWhere(record, sub))) return false;
            } else if (key === "AND" && Array.isArray(condition)) {
                if (!condition.every((sub) => matchesWhere(record, sub))) return false;
            } else {
                if (!matchesFilter(record[key], condition)) return false;
            }
        }
        return true;
    };

    const sortRecords = (list, orderBy) => {
        if (!orderBy) return list;
        const [[field, dir]] = Object.entries(orderBy);
        const factor = dir === "desc" ? -1 : 1;
        return [...list].sort((a, b) => {
            const av = a[field] instanceof Date ? a[field].getTime() : a[field];
            const bv = b[field] instanceof Date ? b[field].getTime() : b[field];
            if (av < bv) return -1 * factor;
            if (av > bv) return 1 * factor;
            return 0;
        });
    };

    return {
        user: {
            findUnique: async ({ where, select }) => {
                const found = users.find((u) => matchesWhere(u, where)) || null;
                return applySelect(found, select);
            },
            findMany: async ({ where, select, orderBy } = {}) => {
                const filtered = users.filter((u) => matchesWhere(u, where));
                const sorted = sortRecords(filtered, orderBy);
                return sorted.map((u) => applySelect(u, select));
            },
            create: async ({ data, select }) => {
                const now = new Date();
                const user = {
                    id: nextUserId++,
                    profile_pic: null,
                    bio: null,
                    createdAt: now,
                    updatedAt: now,
                    ...data,
                };
                users.push(user);
                return applySelect(user, select);
            },
            update: async ({ where, data, select }) => {
                const idx = users.findIndex((u) => matchesWhere(u, where));
                if (idx === -1) {
                    throw new Error("Record to update not found");
                }
                users[idx] = {
                    ...users[idx],
                    ...data,
                    updatedAt: new Date(),
                };
                return applySelect(users[idx], select);
            },
        },
        message: {
            findMany: async ({ where, select, orderBy } = {}) => {
                const filtered = messages.filter((m) => matchesWhere(m, where));
                const sorted = sortRecords(filtered, orderBy);
                return sorted.map((m) => applySelect(m, select));
            },
            create: async ({ data, select }) => {
                const msg = {
                    id: nextMessageId++,
                    isRead: false,
                    createdAt: new Date(),
                    ...data,
                };
                messages.push(msg);
                return applySelect(msg, select);
            },
            count: async ({ where } = {}) => {
                return messages.filter((m) => matchesWhere(m, where)).length;
            },
            updateMany: async ({ where, data }) => {
                let count = 0;
                for (let i = 0; i < messages.length; i++) {
                    if (matchesWhere(messages[i], where)) {
                        messages[i] = { ...messages[i], ...data };
                        count++;
                    }
                }
                return { count };
            },
        },
    };
}

let prisma;
if (process.env.DATABASE_URL) {
    try {
        prisma = new PrismaClient();
    } catch (err) {
        console.warn("[AI Studio] Database initialization failed — using in-memory mock:", err.message);
        prisma = createInMemoryPrisma();
    }
} else {
    prisma = createInMemoryPrisma();
}

export default prisma;

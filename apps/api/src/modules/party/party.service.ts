import { db, party } from "#/db/index.js";
import { escapeLike } from "#/lib/utils.js";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import {
  type PartyInsert,
  type PartyParams,
  type PartyUpdate,
} from "./party.schema.js";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { problems } from "#/lib/problem.js";

const sortColumns: Record<PartyParams["sort"], AnyPgColumn> = {
  name: party.name,
  phone: party.phone,
  createdAt: party.createdAt,
};

export async function findParties(organizationId: string, params: PartyParams) {
  const { page, perPage, order, sort, q, type, id } = params;

  const ids = id === undefined ? undefined : Array.isArray(id) ? id : [id];
  const pattern = q ? `%${escapeLike(q)}%` : undefined;

  const filters: (SQL | undefined)[] = [
    eq(party.organizationId, organizationId),
    isNull(party.deletedAt),
    ids ? inArray(party.id, ids) : undefined,
    type
      ? type === "both"
        ? eq(party.type, "both")
        : inArray(party.type, [type, "both"])
      : undefined,
    pattern
      ? or(ilike(party.name, pattern), ilike(party.phone, pattern))
      : undefined,
  ];

  const where = and(...filters);

  const orderBy = [
    (order.toUpperCase() === "DESC" ? desc : asc)(sortColumns[sort]),
    asc(party.id),
  ];

  const rowsQuery = db
    .select()
    .from(party)
    .where(where)
    .orderBy(...orderBy)
    .$dynamic();

  const [data, [{ total }]] = await Promise.all([
    ids ? rowsQuery : rowsQuery.limit(perPage).offset((page - 1) * perPage),
    db.select({ total: count() }).from(party).where(where),
  ]);

  return { data, total };
}

export async function findPartyById(organizationId: string, id: string) {
  const [row] = await db
    .select()
    .from(party)
    .where(
      and(
        eq(party.id, id),
        eq(party.organizationId, organizationId),
        isNull(party.deletedAt),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function createParty(
  organizationId: string,
  partyData: PartyInsert,
) {
  const [existing] = await db
    .select({ id: party.id })
    .from(party)
    .where(
      and(
        eq(party.organizationId, organizationId),
        eq(party.phone, partyData.phone),
        isNull(party.deletedAt),
      ),
    )
    .limit(1);

  if (existing) {
    throw problems.create("CONFLICT", {
      detail: "A party with that phone already exists.",
    });
  }

  const [row] = await db
    .insert(party)
    .values({ ...partyData, organizationId })
    .returning();

  return row;
}

export async function updateParty(
  organizationId: string,
  partyId: string,
  partyData: PartyUpdate,
) {
  // 1. If updating phone, ensure no other ACTIVE party has it
  if (partyData.phone) {
    const [existing] = await db
      .select({ id: party.id })
      .from(party)
      .where(
        and(
          eq(party.organizationId, organizationId),
          eq(party.phone, partyData.phone),
          ne(party.id, partyId),
          isNull(party.deletedAt),
        ),
      )
      .limit(1);
    if (existing) {
      throw problems.create("CONFLICT", {
        detail: "A party with that phone already exists.",
      });
    }
  }
  // 2. Perform update
  const [updated] = await db
    .update(party)
    .set(partyData)
    .where(
      and(
        eq(party.id, partyId),
        eq(party.organizationId, organizationId),
        isNull(party.deletedAt),
      ),
    )
    .returning();

  return updated ?? null;
}

export async function deleteParty(organizationId: string, id: string) {
  const [deleted] = await db
    .update(party)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(party.id, id),
        eq(party.organizationId, organizationId),
        isNull(party.deletedAt),
      ),
    )
    .returning();
  return deleted ?? null;
}

export async function deleteParties(organizationId: string, ids: string[]) {
  if (ids.length === 0) return [];
  const deleted = await db
    .update(party)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(party.organizationId, organizationId),
        inArray(party.id, ids),
        isNull(party.deletedAt),
      ),
    )
    .returning({ id: party.id });
  return deleted.map((r) => r.id);
}

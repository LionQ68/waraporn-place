import { requireSupabase } from "@/lib/supabase";

const entityTables = {
  Room: "rooms",
  Tenant: "tenants",
  Booking: "bookings",
  Invoice: "invoices",
};

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

function createEntityApi(entityName) {
  const table = entityTables[entityName];

  return {
    async list(sortBy) {
      let query = requireSupabase().from(table).select("*");
      if (sortBy) {
        const descending = sortBy.startsWith("-");
        const column = descending ? sortBy.slice(1) : sortBy;
        query = query.order(column, { ascending: !descending });
      }
      return unwrap(await query);
    },

    async filter(filters = {}, sortBy) {
      let query = requireSupabase().from(table).select("*");
      Object.entries(filters).forEach(([column, value]) => {
        if (Array.isArray(value)) query = query.in(column, value);
        else if (value === null) query = query.is(column, null);
        else query = query.eq(column, value);
      });
      if (sortBy) {
        const descending = sortBy.startsWith("-");
        const column = descending ? sortBy.slice(1) : sortBy;
        query = query.order(column, { ascending: !descending });
      }
      return unwrap(await query);
    },

    async get(id) {
      return unwrap(await requireSupabase().from(table).select("*").eq("id", id).maybeSingle());
    },

    async create(values) {
      return unwrap(await requireSupabase().from(table).insert(values).select().single());
    },

    async bulkCreate(records) {
      if (!records.length) return [];
      return unwrap(await requireSupabase().from(table).insert(records).select());
    },

    async update(id, values) {
      return unwrap(await requireSupabase().from(table).update(values).eq("id", id).select().single());
    },

    async delete(id) {
      unwrap(await requireSupabase().from(table).delete().eq("id", id));
      return { id, deleted: true };
    },
  };
}

export const base44 = {
  entities: {
    Room: createEntityApi("Room"),
    Tenant: createEntityApi("Tenant"),
    Booking: createEntityApi("Booking"),
    Invoice: createEntityApi("Invoice"),
  },
  auth: {
    async me() {
      const client = requireSupabase();
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      if (!data.user) return null;
      const profile = unwrap(await client.from("profiles").select("*").eq("user_id", data.user.id).maybeSingle());
      return { ...data.user, ...profile };
    },
    async logout() {
      const { error } = await requireSupabase().auth.signOut();
      if (error) throw error;
      return true;
    },
  },
};

export async function uploadRoomImage(file, roomId) {
  const client = requireSupabase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${roomId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("room-images").upload(path, file, { upsert: false });
  if (error) throw error;
  return client.storage.from("room-images").getPublicUrl(path).data.publicUrl;
}

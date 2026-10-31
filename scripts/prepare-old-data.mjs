import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(projectDir, "old-data");
const outputDir = path.join(projectDir, "imports");
const outputPath = path.join(outputDir, "old-data-import.json");
const sqlOutputPath = path.join(outputDir, "supabase-import.sql");
const migrationPath = path.join(projectDir, "supabase", "migrations", "202610310001_initial_schema.sql");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const headers = rows.shift()?.map((header) => header.replace(/^\uFEFF/, "")) || [];
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function readCsv(filename) {
  return parseCsv(await readFile(path.join(sourceDir, filename), "utf8"));
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function integerOrZero(value) {
  return Math.trunc(numberOrZero(value));
}

function booleanValue(value) {
  return String(value).trim().toLowerCase() === "true";
}

function withoutEmptyValues(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== "" && value !== null));
}

function sqlText(value) {
  if (value === undefined || value === null || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "0";
}

function sqlBoolean(value) {
  return value ? "true" : "false";
}

function metadataFor(record, knownFields) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !knownFields.includes(key)));
}

function insertStatement(table, columns, records, valuesForRecord) {
  if (!records.length) return "";
  const updateColumns = columns.filter((column) => column !== "id");
  const values = records.map((record) => `  (${valuesForRecord(record).join(", ")})`).join(",\n");
  return `insert into public.${table} (${columns.join(", ")})\nvalues\n${values}\non conflict (id) do update set\n${updateColumns.map((column) => `  ${column} = excluded.${column}`).join(",\n")};`;
}

const roomRows = await readCsv("Room_export.csv");
const tenantRows = await readCsv("Tenant_export.csv");
const invoiceRows = await readCsv("Invoice_export.csv");

const rooms = roomRows.map((row) => withoutEmptyValues({
  ...row,
  floor: integerOrZero(row.floor),
  max_occupants: integerOrZero(row.max_occupants),
  rent_price: numberOrZero(row.rent_price),
}));

const tenants = tenantRows.map((row) => withoutEmptyValues({
  ...row,
  is_active: booleanValue(row.is_active),
}));

const invoices = invoiceRows.map((row) => withoutEmptyValues({
  ...row,
  rent_amount: numberOrZero(row.rent_amount),
  water_amount: numberOrZero(row.water_amount),
  occupant_count: integerOrZero(row.occupant_count),
  electricity_start: numberOrZero(row.electricity_start),
  electricity_end: numberOrZero(row.electricity_end),
  electricity_units: numberOrZero(row.electricity_units),
  electricity_amount: numberOrZero(row.electricity_amount),
  total_amount: numberOrZero(row.total_amount),
}));

const roomIds = new Set(rooms.map((room) => room.id));
const duplicateIds = (records) => records.length - new Set(records.map((record) => record.id)).size;
const unmatchedTenantRooms = tenants.filter((tenant) => !roomIds.has(tenant.room_id)).length;
const unmatchedInvoiceRooms = invoices.filter((invoice) => !roomIds.has(invoice.room_id)).length;

if (duplicateIds(rooms) || duplicateIds(tenants) || duplicateIds(invoices)) {
  throw new Error("พบ ID ซ้ำในไฟล์ export");
}
if (unmatchedTenantRooms || unmatchedInvoiceRooms) {
  throw new Error(`พบ room_id ที่ไม่ตรงกับห้อง: tenants=${unmatchedTenantRooms}, invoices=${unmatchedInvoiceRooms}`);
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ rooms, tenants, bookings: [], invoices }, null, 2)}\n`, "utf8");

const roomFields = ["id", "room_number", "floor", "status", "room_type", "max_occupants", "rent_price", "image_url", "created_date", "updated_date"];
const tenantFields = ["id", "room_id", "name", "phone", "is_active", "move_in_date", "created_date", "updated_date"];
const invoiceFields = ["id", "room_id", "billing_month", "rent_amount", "water_amount", "occupant_count", "electricity_start", "electricity_end", "electricity_units", "electricity_amount", "total_amount", "status", "room_number", "created_date", "updated_date"];

const roomSql = insertStatement(
  "rooms",
  [...roomFields, "metadata"],
  rooms,
  (room) => [
    sqlText(room.id), sqlText(room.room_number), sqlNumber(room.floor), sqlText(room.status), sqlText(room.room_type),
    sqlNumber(room.max_occupants), sqlNumber(room.rent_price), sqlText(room.image_url), sqlText(room.created_date),
    sqlText(room.updated_date), `${sqlText(JSON.stringify(metadataFor(room, roomFields)))}::jsonb`,
  ],
);

const tenantSql = insertStatement(
  "tenants",
  [...tenantFields, "metadata"],
  tenants,
  (tenant) => [
    sqlText(tenant.id), sqlText(tenant.room_id), sqlText(tenant.name), sqlText(tenant.phone), sqlBoolean(tenant.is_active),
    sqlText(tenant.move_in_date), sqlText(tenant.created_date), sqlText(tenant.updated_date),
    `${sqlText(JSON.stringify(metadataFor(tenant, tenantFields)))}::jsonb`,
  ],
);

const invoiceSql = insertStatement(
  "invoices",
  [...invoiceFields, "metadata"],
  invoices,
  (invoice) => [
    sqlText(invoice.id), sqlText(invoice.room_id), sqlText(invoice.billing_month), sqlNumber(invoice.rent_amount),
    sqlNumber(invoice.water_amount), sqlNumber(invoice.occupant_count), sqlNumber(invoice.electricity_start),
    sqlNumber(invoice.electricity_end), sqlNumber(invoice.electricity_units), sqlNumber(invoice.electricity_amount),
    sqlNumber(invoice.total_amount), sqlText(invoice.status), sqlText(invoice.room_number), sqlText(invoice.created_date),
    sqlText(invoice.updated_date), `${sqlText(JSON.stringify(metadataFor(invoice, invoiceFields)))}::jsonb`,
  ],
);

const migrationSql = await readFile(migrationPath, "utf8");
const combinedSql = `${migrationSql.trim()}\n\nbegin;\n\n${roomSql}\n\n${tenantSql}\n\n${invoiceSql}\n\ncommit;\n`;
await writeFile(sqlOutputPath, combinedSql, "utf8");

console.log(JSON.stringify({
  output: outputPath,
  sqlOutput: sqlOutputPath,
  rooms: rooms.length,
  tenants: tenants.length,
  bookings: 0,
  invoices: invoices.length,
  unmatchedTenantRooms,
  unmatchedInvoiceRooms,
}, null, 2));

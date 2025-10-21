import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250908093813 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ticket_product_variant" drop constraint if exists "ticket_product_variant_venue_row_id_foreign";`);

    this.addSql(`drop index if exists "IDX_ticket_product_variant_venue_row_id";`);
    this.addSql(`drop index if exists "IDX_ticket_product_variant_ticket_product_id_venue_row_id";`);
    this.addSql(`alter table if exists "ticket_product_variant" drop column if exists "venue_row_id";`);

    this.addSql(`alter table if exists "ticket_product_variant" add column if not exists "row_type" text check ("row_type" in ('premium', 'balcony', 'standard', 'vip')) not null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_ticket_product_id_row_type" ON "ticket_product_variant" (ticket_product_id, row_type) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_ticket_product_variant_ticket_product_id_row_type";`);
    this.addSql(`alter table if exists "ticket_product_variant" drop column if exists "row_type";`);

    this.addSql(`alter table if exists "ticket_product_variant" add column if not exists "venue_row_id" text not null;`);
    this.addSql(`alter table if exists "ticket_product_variant" add constraint "ticket_product_variant_venue_row_id_foreign" foreign key ("venue_row_id") references "venue_row" ("id") on update cascade;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_venue_row_id" ON "ticket_product_variant" (venue_row_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_ticket_product_id_venue_row_id" ON "ticket_product_variant" (ticket_product_id, venue_row_id) WHERE deleted_at IS NULL;`);
  }

}

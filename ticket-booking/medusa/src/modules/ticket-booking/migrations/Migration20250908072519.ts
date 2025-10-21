import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250908072519 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ticket_purchase" drop constraint if exists "ticket_purchase_ticket_product_id_venue_row_id_seat_number_show_date_unique";`);
    this.addSql(`alter table if exists "ticket_product_variant" drop constraint if exists "ticket_product_variant_product_variant_id_unique";`);
    this.addSql(`alter table if exists "venue_row" drop constraint if exists "venue_row_venue_id_row_number_unique";`);
    this.addSql(`alter table if exists "ticket_product" drop constraint if exists "ticket_product_product_id_unique";`);
    this.addSql(`create table if not exists "venue" ("id" text not null, "name" text not null, "address" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "venue_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_venue_deleted_at" ON "venue" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "ticket_product" ("id" text not null, "product_id" text not null, "venue_id" text not null, "dates" text[] not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ticket_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ticket_product_product_id_unique" ON "ticket_product" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_venue_id" ON "ticket_product" (venue_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_deleted_at" ON "ticket_product" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_venue_id_dates" ON "ticket_product" (venue_id, dates) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "venue_row" ("id" text not null, "row_number" text not null, "row_type" text check ("row_type" in ('premium', 'balcony', 'standard', 'vip')) not null, "seat_count" integer not null, "venue_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "venue_row_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_venue_row_venue_id" ON "venue_row" (venue_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_venue_row_deleted_at" ON "venue_row" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_venue_row_venue_id_row_number_unique" ON "venue_row" (venue_id, row_number) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "ticket_product_variant" ("id" text not null, "product_variant_id" text not null, "ticket_product_id" text not null, "venue_row_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ticket_product_variant_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ticket_product_variant_product_variant_id_unique" ON "ticket_product_variant" (product_variant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_ticket_product_id" ON "ticket_product_variant" (ticket_product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_venue_row_id" ON "ticket_product_variant" (venue_row_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_deleted_at" ON "ticket_product_variant" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_product_variant_ticket_product_id_venue_row_id" ON "ticket_product_variant" (ticket_product_id, venue_row_id) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "ticket_purchase" ("id" text not null, "order_id" text not null, "ticket_product_id" text not null, "ticket_variant_id" text not null, "venue_row_id" text not null, "seat_number" text not null, "show_date" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ticket_purchase_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_purchase_ticket_product_id" ON "ticket_purchase" (ticket_product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_purchase_ticket_variant_id" ON "ticket_purchase" (ticket_variant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_purchase_venue_row_id" ON "ticket_purchase" (venue_row_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_purchase_deleted_at" ON "ticket_purchase" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ticket_purchase_order_id" ON "ticket_purchase" (order_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ticket_purchase_ticket_product_id_venue_row_id_seat_number_show_date_unique" ON "ticket_purchase" (ticket_product_id, venue_row_id, seat_number, show_date) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "ticket_product" add constraint "ticket_product_venue_id_foreign" foreign key ("venue_id") references "venue" ("id") on update cascade;`);

    this.addSql(`alter table if exists "venue_row" add constraint "venue_row_venue_id_foreign" foreign key ("venue_id") references "venue" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "ticket_product_variant" add constraint "ticket_product_variant_ticket_product_id_foreign" foreign key ("ticket_product_id") references "ticket_product" ("id") on update cascade;`);
    this.addSql(`alter table if exists "ticket_product_variant" add constraint "ticket_product_variant_venue_row_id_foreign" foreign key ("venue_row_id") references "venue_row" ("id") on update cascade;`);

    this.addSql(`alter table if exists "ticket_purchase" add constraint "ticket_purchase_ticket_product_id_foreign" foreign key ("ticket_product_id") references "ticket_product" ("id") on update cascade;`);
    this.addSql(`alter table if exists "ticket_purchase" add constraint "ticket_purchase_ticket_variant_id_foreign" foreign key ("ticket_variant_id") references "ticket_product_variant" ("id") on update cascade;`);
    this.addSql(`alter table if exists "ticket_purchase" add constraint "ticket_purchase_venue_row_id_foreign" foreign key ("venue_row_id") references "venue_row" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "ticket_product" drop constraint if exists "ticket_product_venue_id_foreign";`);

    this.addSql(`alter table if exists "venue_row" drop constraint if exists "venue_row_venue_id_foreign";`);

    this.addSql(`alter table if exists "ticket_product_variant" drop constraint if exists "ticket_product_variant_ticket_product_id_foreign";`);

    this.addSql(`alter table if exists "ticket_purchase" drop constraint if exists "ticket_purchase_ticket_product_id_foreign";`);

    this.addSql(`alter table if exists "ticket_product_variant" drop constraint if exists "ticket_product_variant_venue_row_id_foreign";`);

    this.addSql(`alter table if exists "ticket_purchase" drop constraint if exists "ticket_purchase_venue_row_id_foreign";`);

    this.addSql(`alter table if exists "ticket_purchase" drop constraint if exists "ticket_purchase_ticket_variant_id_foreign";`);

    this.addSql(`drop table if exists "venue" cascade;`);

    this.addSql(`drop table if exists "ticket_product" cascade;`);

    this.addSql(`drop table if exists "venue_row" cascade;`);

    this.addSql(`drop table if exists "ticket_product_variant" cascade;`);

    this.addSql(`drop table if exists "ticket_purchase" cascade;`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250407153111 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "loyalty_point" ("id" text not null, "points" integer not null default 0, "customer_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_point_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_LOYALTY_CUSTOMER_ID" ON "loyalty_point" (customer_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_point_deleted_at" ON "loyalty_point" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "loyalty_point" cascade;`);
  }

}

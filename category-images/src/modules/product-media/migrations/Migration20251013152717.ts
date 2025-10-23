import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251013152717 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_category_image" ("id" text not null, "url" text not null, "file_id" text not null, "type" text check ("type" in ('thumbnail', 'image')) not null, "category_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_category_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_category_image_deleted_at" ON "product_category_image" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "unique_thumbnail_per_category" ON "product_category_image" (category_id, type) WHERE type = 'thumbnail' AND deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_category_image" cascade;`);
  }

}

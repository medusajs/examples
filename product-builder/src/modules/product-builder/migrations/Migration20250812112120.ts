import { Migration } from '@mikro-orm/migrations';

export class Migration20250812112120 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_builder" drop constraint if exists "product_builder_product_id_unique";`);
    this.addSql(`create table if not exists "product_builder" ("id" text not null, "product_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_builder_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_builder_product_id_unique" ON "product_builder" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_deleted_at" ON "product_builder" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_builder_addon" ("id" text not null, "product_id" text not null, "product_builder_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_builder_addon_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_addon_product_builder_id" ON "product_builder_addon" (product_builder_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_addon_deleted_at" ON "product_builder_addon" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_builder_complementary" ("id" text not null, "product_id" text not null, "product_builder_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_builder_complementary_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_complementary_product_builder_id" ON "product_builder_complementary" (product_builder_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_complementary_deleted_at" ON "product_builder_complementary" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_builder_custom_field" ("id" text not null, "name" text not null, "type" text not null, "is_required" boolean not null default false, "sort_order" integer not null default 0, "product_builder_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_builder_custom_field_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_custom_field_product_builder_id" ON "product_builder_custom_field" (product_builder_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_builder_custom_field_deleted_at" ON "product_builder_custom_field" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "product_builder_addon" add constraint "product_builder_addon_product_builder_id_foreign" foreign key ("product_builder_id") references "product_builder" ("id") on update cascade;`);

    this.addSql(`alter table if exists "product_builder_complementary" add constraint "product_builder_complementary_product_builder_id_foreign" foreign key ("product_builder_id") references "product_builder" ("id") on update cascade;`);

    this.addSql(`alter table if exists "product_builder_custom_field" add constraint "product_builder_custom_field_product_builder_id_foreign" foreign key ("product_builder_id") references "product_builder" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_builder_addon" drop constraint if exists "product_builder_addon_product_builder_id_foreign";`);

    this.addSql(`alter table if exists "product_builder_complementary" drop constraint if exists "product_builder_complementary_product_builder_id_foreign";`);

    this.addSql(`alter table if exists "product_builder_custom_field" drop constraint if exists "product_builder_custom_field_product_builder_id_foreign";`);

    this.addSql(`drop table if exists "product_builder" cascade;`);

    this.addSql(`drop table if exists "product_builder_addon" cascade;`);

    this.addSql(`drop table if exists "product_builder_complementary" cascade;`);

    this.addSql(`drop table if exists "product_builder_custom_field" cascade;`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20250716065356 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "preorder_variant" drop constraint if exists "preorder_variant_variant_id_unique";`);
    this.addSql(`create table if not exists "preorder_variant" ("id" text not null, "variant_id" text not null, "available_date" timestamptz not null, "status" text check ("status" in ('enabled', 'disabled')) not null default 'enabled', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "preorder_variant_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_preorder_variant_variant_id_unique" ON "preorder_variant" (variant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_preorder_variant_available_date" ON "preorder_variant" (available_date) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_preorder_variant_deleted_at" ON "preorder_variant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "preorder" ("id" text not null, "order_id" text not null, "item_id" text not null, "status" text check ("status" in ('pending', 'fulfilled')) not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "preorder_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_preorder_order_id" ON "preorder" (order_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_preorder_item_id" ON "preorder" (item_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_preorder_deleted_at" ON "preorder" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "preorder" add constraint "preorder_item_id_foreign" foreign key ("item_id") references "preorder_variant" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "preorder" drop constraint if exists "preorder_item_id_foreign";`);

    this.addSql(`drop table if exists "preorder_variant" cascade;`);

    this.addSql(`drop table if exists "preorder" cascade;`);
  }

}

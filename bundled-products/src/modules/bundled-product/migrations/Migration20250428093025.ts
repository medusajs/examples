import { Migration } from '@mikro-orm/migrations';

export class Migration20250428093025 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bundle" ("id" text not null, "title" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bundle_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_deleted_at" ON "bundle" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "bundle_item" ("id" text not null, "quantity" integer not null default 1, "bundle_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bundle_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_item_bundle_id" ON "bundle_item" (bundle_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bundle_item_deleted_at" ON "bundle_item" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "bundle_item" add constraint "bundle_item_bundle_id_foreign" foreign key ("bundle_id") references "bundle" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "bundle_item" drop constraint if exists "bundle_item_bundle_id_foreign";`);

    this.addSql(`drop table if exists "bundle" cascade;`);

    this.addSql(`drop table if exists "bundle_item" cascade;`);
  }

}

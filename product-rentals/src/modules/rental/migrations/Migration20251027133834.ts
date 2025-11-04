import { Migration } from '@mikro-orm/migrations';

export class Migration20251027133834 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "rental_configuration" ("id" text not null, "product_id" text not null, "min_rental_days" integer not null default 1, "max_rental_days" integer null, "status" text check ("status" in ('active', 'inactive')) not null default 'active', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rental_configuration_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rental_configuration_deleted_at" ON "rental_configuration" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "rental" ("id" text not null, "variant_id" text not null, "customer_id" text not null, "order_id" text null, "line_item_id" text null, "rental_start_date" timestamptz not null, "rental_end_date" timestamptz not null, "actual_return_date" timestamptz null, "rental_days" integer not null, "status" text check ("status" in ('pending', 'active', 'returned', 'cancelled')) not null default 'pending', "rental_configuration_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rental_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rental_rental_configuration_id" ON "rental" (rental_configuration_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rental_deleted_at" ON "rental" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "rental" add constraint "rental_rental_configuration_id_foreign" foreign key ("rental_configuration_id") references "rental_configuration" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "rental" drop constraint if exists "rental_rental_configuration_id_foreign";`);

    this.addSql(`drop table if exists "rental_configuration" cascade;`);

    this.addSql(`drop table if exists "rental" cascade;`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251124085515 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "tier" ("id" text not null, "name" text not null, "promo_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tier_deleted_at" ON "tier" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "tier_rule" ("id" text not null, "min_purchase_value" integer not null, "currency_code" text not null, "tier_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tier_rule_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tier_rule_tier_id" ON "tier_rule" ("tier_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tier_rule_deleted_at" ON "tier_rule" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "tier_rule" add constraint "tier_rule_tier_id_foreign" foreign key ("tier_id") references "tier" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "tier_rule" drop constraint if exists "tier_rule_tier_id_foreign";`);

    this.addSql(`drop table if exists "tier" cascade;`);

    this.addSql(`drop table if exists "tier_rule" cascade;`);
  }

}

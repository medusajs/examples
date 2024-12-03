import { Migration } from '@mikro-orm/migrations';

export class Migration20241202125239 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "restock_subscriber" ("email" text not null, "customer_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_subscriber_pkey" primary key ("email"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_restock_subscriber_deleted_at" ON "restock_subscriber" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "restock_subscription" ("id" text not null, "variant_id" text not null, "sales_channel_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "restock_subscription_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_restock_subscription_deleted_at" ON "restock_subscription" (deleted_at) WHERE deleted_at IS NULL;');
    this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_restock_subscription_variant_id_sales_channel_id_unique" ON "restock_subscription" (variant_id, sales_channel_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "restock_subscription_subscriber" ("subscription_id" text not null, "subscriber_email" text not null, constraint "restock_subscription_subscriber_pkey" primary key ("subscription_id", "subscriber_email"));');

    this.addSql('alter table if exists "restock_subscription_subscriber" add constraint "restock_subscription_subscriber_subscription_id_foreign" foreign key ("subscription_id") references "restock_subscription" ("id") on update cascade on delete cascade;');
    this.addSql('alter table if exists "restock_subscription_subscriber" add constraint "restock_subscription_subscriber_subscriber_email_foreign" foreign key ("subscriber_email") references "restock_subscriber" ("email") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "restock_subscription_subscriber" drop constraint if exists "restock_subscription_subscriber_subscriber_email_foreign";');

    this.addSql('alter table if exists "restock_subscription_subscriber" drop constraint if exists "restock_subscription_subscriber_subscription_id_foreign";');

    this.addSql('drop table if exists "restock_subscriber" cascade;');

    this.addSql('drop table if exists "restock_subscription" cascade;');

    this.addSql('drop table if exists "restock_subscription_subscriber" cascade;');
  }

}

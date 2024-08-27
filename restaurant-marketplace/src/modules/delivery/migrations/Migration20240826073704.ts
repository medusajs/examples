import { Migration } from '@mikro-orm/migrations';

export class Migration20240826073704 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "driver" ("id" text not null, "first_name" text not null, "last_name" text not null, "email" text not null, "phone" text not null, "avatar_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "driver_pkey" primary key ("id"));');

    this.addSql('create table if not exists "delivery" ("id" text not null, "transaction_id" text null, "delivery_status" text check ("delivery_status" in (\'pending\', \'restaurant_declined\', \'restaurant_accepted\', \'pickup_claimed\', \'restaurant_preparing\', \'ready_for_pickup\', \'in_transit\', \'delivered\')) not null default \'pending\', "eta" timestamptz null, "delivered_at" timestamptz null, "driver_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_delivery_driver_id" ON "delivery" (driver_id) WHERE deleted_at IS NULL;');

    this.addSql('alter table if exists "delivery" add constraint "delivery_driver_id_foreign" foreign key ("driver_id") references "driver" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "delivery" drop constraint if exists "delivery_driver_id_foreign";');

    this.addSql('drop table if exists "driver" cascade;');

    this.addSql('drop table if exists "delivery" cascade;');
  }

}

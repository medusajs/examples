import { Migration } from '@mikro-orm/migrations';

export class Migration20240718112104 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "digital_product" ("id" text not null, "name" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "digital_product_pkey" primary key ("id"));');

    this.addSql('create table if not exists "digital_product_media" ("id" text not null, "type" text check ("type" in (\'main\', \'preview\')) not null, "file_id" text not null, "mime_type" text not null, "digital_product_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "digital_product_media_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_digital_product_media_digital_product_id" ON "digital_product_media" (digital_product_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "digital_product_order" ("id" text not null, "status" text check ("status" in (\'pending\', \'sent\')) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "digital_product_order_pkey" primary key ("id"));');

    this.addSql('create table if not exists "digitalproduct_digitalproductorders" ("digital_product_id" text not null, "digital_product_order_id" text not null, constraint "digitalproduct_digitalproductorders_pkey" primary key ("digital_product_id", "digital_product_order_id"));');

    this.addSql('alter table if exists "digital_product_media" add constraint "digital_product_media_digital_product_id_foreign" foreign key ("digital_product_id") references "digital_product" ("id") on update cascade on delete cascade;');

    this.addSql('alter table if exists "digitalproduct_digitalproductorders" add constraint "digitalproduct_digitalproductorders_digital_product_id_foreign" foreign key ("digital_product_id") references "digital_product" ("id") on update cascade on delete cascade;');
    this.addSql('alter table if exists "digitalproduct_digitalproductorders" add constraint "digitalproduct_digitalproductorders_digital_produ_c0c21_foreign" foreign key ("digital_product_order_id") references "digital_product_order" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "digital_product_media" drop constraint if exists "digital_product_media_digital_product_id_foreign";');

    this.addSql('alter table if exists "digitalproduct_digitalproductorders" drop constraint if exists "digitalproduct_digitalproductorders_digital_product_id_foreign";');

    this.addSql('alter table if exists "digitalproduct_digitalproductorders" drop constraint if exists "digitalproduct_digitalproductorders_digital_produ_c0c21_foreign";');

    this.addSql('drop table if exists "digital_product" cascade;');

    this.addSql('drop table if exists "digital_product_media" cascade;');

    this.addSql('drop table if exists "digital_product_order" cascade;');

    this.addSql('drop table if exists "digitalproduct_digitalproductorders" cascade;');
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20241213160023 extends Migration {

  async up(): Promise<void> {
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_digital_product_deleted_at" ON "digital_product" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_digital_product_media_deleted_at" ON "digital_product_media" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_digital_product_order_deleted_at" ON "digital_product_order" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('alter table if exists "digitalproduct_digitalproductorders" drop constraint if exists "digitalproduct_digitalproductorders_pkey";');
    this.addSql('alter table if exists "digitalproduct_digitalproductorders" add constraint "digitalproduct_digitalproductorders_pkey" primary key ("digital_product_order_id", "digital_product_id");');
  }

  async down(): Promise<void> {
    this.addSql('drop index if exists "IDX_digital_product_deleted_at";');

    this.addSql('drop index if exists "IDX_digital_product_media_deleted_at";');

    this.addSql('drop index if exists "IDX_digital_product_order_deleted_at";');

    this.addSql('alter table if exists "digitalproduct_digitalproductorders" drop constraint if exists "digitalproduct_digitalproductorders_pkey";');
    this.addSql('alter table if exists "digitalproduct_digitalproductorders" add constraint "digitalproduct_digitalproductorders_pkey" primary key ("digital_product_id", "digital_product_order_id");');
  }

}

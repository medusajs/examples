import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250813075829 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_builder_custom_field" drop column if exists "sort_order";`);

    this.addSql(`alter table if exists "product_builder_custom_field" add column if not exists "description" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_builder_custom_field" drop column if exists "description";`);

    this.addSql(`alter table if exists "product_builder_custom_field" add column if not exists "sort_order" integer not null default 0;`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250910121312 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ticket_purchase" add column if not exists "status" text check ("status" in ('pending', 'scanned')) not null default 'pending';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "ticket_purchase" drop column if exists "status";`);
  }

}

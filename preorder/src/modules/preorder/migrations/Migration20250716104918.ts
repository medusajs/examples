import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250716104918 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "preorder" drop constraint if exists "preorder_status_check";`);

    this.addSql(`alter table if exists "preorder" add constraint "preorder_status_check" check("status" in ('pending', 'fulfilled', 'cancelled'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "preorder" drop constraint if exists "preorder_status_check";`);

    this.addSql(`alter table if exists "preorder" add constraint "preorder_status_check" check("status" in ('pending', 'fulfilled'));`);
  }

}

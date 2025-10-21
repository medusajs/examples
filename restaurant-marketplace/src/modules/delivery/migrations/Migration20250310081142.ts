import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20250310081142 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_driver_deleted_at" ON "driver" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_deleted_at" ON "delivery" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_driver_deleted_at";`);

    this.addSql(`drop index if exists "IDX_delivery_deleted_at";`);
  }

}

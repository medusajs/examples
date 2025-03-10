import { Migration } from '@mikro-orm/migrations';

export class Migration20250310080729 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_deleted_at" ON "vendor" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_admin_deleted_at" ON "vendor_admin" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_vendor_deleted_at";`);

    this.addSql(`drop index if exists "IDX_vendor_admin_deleted_at";`);
  }

}

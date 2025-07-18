import { Migration } from '@mikro-orm/migrations';

export class Migration20250716074058 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_preorder_item_id_status" ON "preorder" (item_id, status) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_preorder_item_id_status";`);
  }

}
